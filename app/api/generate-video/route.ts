import { NextRequest, NextResponse } from 'next/server';
import { db, storage, admin } from '@/lib/firebaseAdmin';
import { renderMediaOnLambda, getRenderProgress } from '@remotion/lambda/client';
const IS_PRODUCTION = true; 

const REMOTION_FUNCTION_NAME = process.env.REMOTION_LAMBDA_FUNCTION_NAME!;
const REMOTION_REGION = process.env.REMOTION_AWS_REGION as any;

const serverTimestamp = admin.firestore.FieldValue.serverTimestamp;
export async function POST(request: NextRequest) {
  try {
    const { requestId } = await request.json();

    if (!requestId) {
      return NextResponse.json(
        { success: false, error: 'Request ID is required' },
        { status: 400 }
      );
    }

    // Admin SDK Firestore syntax
    const requestRef = db.collection('videoRequests').doc(requestId);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Video request not found' },
        { status: 404 }
      );
    }

    const requestData = requestDoc.data();
    if (!requestData) {
        return NextResponse.json(
            { success: false, error: 'Video request data is empty' },
            { status: 404 }
        );
    }

    if (IS_PRODUCTION) {
      // --- PRODUCTION: Start Remotion Lambda Render ---
      try {
        const renderResponse = await renderMediaOnLambda({
          region: REMOTION_REGION,
          functionName: REMOTION_FUNCTION_NAME,
          composition: 'QuestVideo',
          serveUrl: process.env.REMOTION_SERVE_URL!,
          codec: 'h264',
          inputProps: requestData.questData,
          privacy: 'public',
          concurrency: 8 
        });

        // Admin SDK Firestore syntax
        await requestRef.update({
          status: 'processing',
          progress: 10,
          updatedAt: serverTimestamp(),
          renderId: renderResponse.renderId,
          bucketName: renderResponse.bucketName
        });

        return NextResponse.json({
          success: true,
          requestId,
          message: 'Video generation started'
        });

      } catch (error: any) {
        console.error('Remotion Lambda error:', error);
        // Admin SDK Firestore syntax
        await requestRef.update({
          status: 'failed',
          error: error.message || 'Video generation failed',
          updatedAt: serverTimestamp()
        });

        return NextResponse.json(
          { success: false, error: error.message || 'Video generation failed' },
          { status: 500 }
        );
      }

    } else {
      // --- DEVELOPMENT: Simulate video generation ---
      console.log('🎬 Simulating video generation for development...');
      console.log('Quest Data:', requestData.questData);
      
      for (let progress = 20; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      const placeholderVideoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
      
      // Admin SDK Firestore syntax
      await requestRef.update({
        status: 'completed',
        videoUrl: placeholderVideoUrl,
        progress: 100,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const questRef = db.collection('quest').doc(requestData.questId);
      await questRef.update({
        videoUrl: placeholderVideoUrl,
        videoStatus: 'completed',
        updatedAt: serverTimestamp()
      });

      return NextResponse.json({
        success: true,
        videoUrl: placeholderVideoUrl,
        requestId,
        note: 'Development mode - using placeholder video'
      });
    }

  } catch (error: any) {
    console.error('Error in POST /api/generate-video:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// ========================================================================
// GET: Check Video Status
// ========================================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json(
        { success: false, error: 'Request ID is required' },
        { status: 400 }
      );
    }

    // Admin SDK Firestore syntax
    const requestRef = db.collection('videoRequests').doc(requestId);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Video request not found' },
        { status: 404 }
      );
    }

    const data = requestDoc.data();
    if (!data) {
        return NextResponse.json(
            { success: false, error: 'Video request data is empty' },
            { status: 404 }
        );
    }
    
    // Convert Timestamps to ISO strings for JSON serialization
    const createdAt = (data.createdAt as admin.firestore.Timestamp)?.toDate().toISOString();
    const completedAt = (data.completedAt as admin.firestore.Timestamp)?.toDate().toISOString();

    // If status is NOT processing, just return the data from Firestore
    if (data.status !== 'processing') {
      return NextResponse.json({
        success: true,
        status: data.status,
        videoUrl: data.videoUrl,
        progress: data.progress || 0,
        error: data.error,
        createdAt: createdAt,
        completedAt: completedAt
      });
    }

    // --- Status is 'processing', so we must check Remotion ---
    if (!IS_PRODUCTION) {
        // This 'else' block will not be reached if IS_PRODUCTION is true
        return NextResponse.json({ success: true, status: 'processing', progress: data.progress });
    }

    // --- Production: Check progress with Remotion Lambda ---
    try {
      if (!data.renderId || !data.bucketName) {
        throw new Error('Missing renderId or bucketName in Firestore document');
      }

      const progress = await getRenderProgress({
        renderId: data.renderId,
        bucketName: data.bucketName,
        functionName: REMOTION_FUNCTION_NAME,
        region: REMOTION_REGION
      });

      // 1. Still Rendering
      if (progress.overallProgress < 1 && !progress.fatalErrorEncountered) {
        const newProgress = Math.round(progress.overallProgress * 100);
        if (data.progress !== newProgress) {
          // Admin SDK Firestore syntax
          await requestRef.update({
            progress: newProgress,
            updatedAt: serverTimestamp()
          });
        }
        return NextResponse.json({ success: true, status: 'processing', progress: newProgress });
      }

      // 2. Render is Done!
      if (progress.done && progress.outputFile) {
        const videoBuffer = await fetch(progress.outputFile).then(r => r.arrayBuffer());
        
        // Admin SDK Storage syntax
        const videoRef = storage.file(`quest-videos/${data.questId}/${requestId}.mp4`);
        
        // Save the file
        await videoRef.save(Buffer.from(videoBuffer));
        
        // Make the file public so it's viewable
        await videoRef.makePublic();
        const videoUrl = videoRef.publicUrl(); // Get the public URL

        // Admin SDK Firestore syntax
        await requestRef.update({
          status: 'completed',
          videoUrl,
          progress: 100,
          completedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        const questRef = db.collection('quest').doc(data.questId);
        await questRef.update({
          videoUrl,
          videoStatus: 'completed',
          updatedAt: serverTimestamp()
        });

        return NextResponse.json({ success: true, status: 'completed', videoUrl, progress: 100 });
      }
      
      // 3. Render Failed
      if (progress.fatalErrorEncountered) {
        const errorMsg = progress.errors?.[0]?.message || 'Video rendering failed';
        // Admin SDK Firestore syntax
        await requestRef.update({
          status: 'failed',
          error: errorMsg,
          updatedAt: serverTimestamp()
        });
        return NextResponse.json({ success: true, status: 'failed', error: errorMsg });
      }

      // Fallback
      return NextResponse.json({ success: true, status: 'processing', progress: data.progress });

    } catch (error: any) {
      console.error('Error checking progress:', error);
      return NextResponse.json({
        success: true,
        status: data.status,
        progress: data.progress,
        error: 'Failed to check render progress: ' + error.message
      });
    }

  } catch (error: any) {
    console.error('Error in GET /api/generate-video:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}