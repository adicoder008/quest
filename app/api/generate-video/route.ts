import { NextRequest, NextResponse } from 'next/server';
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { renderMediaOnLambda, getRenderProgress } from '@remotion/lambda/client';

// For production, you'll use Remotion Lambda
// For development, we'll simulate the process
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const REMOTION_FUNCTION_NAME = process.env.REMOTION_LAMBDA_FUNCTION_NAME!;
const REMOTION_REGION = process.env.REMOTION_AWS_REGION as any;

// ========================================================================
// POST: Start Video Generation
// ========================================================================
export async function POST(request: NextRequest) {
  try {
    const { requestId } = await request.json();

    if (!requestId) {
      return NextResponse.json(
        { success: false, error: 'Request ID is required' },
        { status: 400 }
      );
    }

    // Get video request data
    const requestRef = doc(db, 'videoRequests', requestId);
    const requestDoc = await getDoc(requestRef);

    if (!requestDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'Video request not found' },
        { status: 404 }
      );
    }

    const requestData = requestDoc.data();

    if (IS_PRODUCTION) {
      // --- PRODUCTION: Start Remotion Lambda Render ---
      try {
        // Start render on Lambda
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

        // Update status to processing and SAVE RENDER ID
        await updateDoc(requestRef, {
          status: 'processing',
          progress: 10,
          updatedAt: serverTimestamp(),
          renderId: renderResponse.renderId, // Save this
          bucketName: renderResponse.bucketName // Save this
        });

        // Return immediately. The frontend will now poll the GET route.
        return NextResponse.json({
          success: true,
          requestId,
          message: 'Video generation started'
        });

      } catch (error: any) {
        console.error('Remotion Lambda error:', error);
        await updateDoc(requestRef, {
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
      
      // No need to poll in dev, just simulate the whole process
      // (Your original dev logic was fine)
      for (let progress = 20; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      const placeholderVideoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
      
      await updateDoc(requestRef, {
        status: 'completed',
        videoUrl: placeholderVideoUrl,
        progress: 100,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const questRef = doc(db, 'quest', requestData.questId);
      await updateDoc(questRef, {
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

    const requestRef = doc(db, 'videoRequests', requestId);
    const requestDoc = await getDoc(requestRef);

    if (!requestDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'Video request not found' },
        { status: 404 }
      );
    }

    const data = requestDoc.data();

    // If status is NOT processing, just return the data from Firestore
    if (data.status !== 'processing') {
      return NextResponse.json({
        success: true,
        status: data.status,
        videoUrl: data.videoUrl,
        progress: data.progress || 0,
        error: data.error,
        createdAt: data.createdAt?.toDate().toISOString(),
        completedAt: data.completedAt?.toDate().toISOString()
      });
    }

    // --- Status is 'processing', so we must check Remotion ---
    
    // Check if we are in development
    if (!IS_PRODUCTION) {
        // In development, the POST route handles everything,
        // so we just return the 'processing' status from the DB
        // (This route won't be hit in your dev flow anyway)
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
          await updateDoc(requestRef, {
            progress: newProgress,
            updatedAt: serverTimestamp()
          });
        }
        return NextResponse.json({ success: true, status: 'processing', progress: newProgress });
      }

      // 2. Render is Done!
      if (progress.done && progress.outputFile) {
        // Upload final video from S3 to Firebase Storage
        const videoBuffer = await fetch(progress.outputFile).then(r => r.arrayBuffer());
        const videoRef = ref(storage, `quest-videos/${data.questId}/${requestId}.mp4`);
        await uploadBytes(videoRef, videoBuffer);
        const videoUrl = await getDownloadURL(videoRef);

        // Update request document
        await updateDoc(requestRef, {
          status: 'completed',
          videoUrl,
          progress: 100,
          completedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // Update quest document
        const questRef = doc(db, 'quest', data.questId);
        await updateDoc(questRef, {
          videoUrl,
          videoStatus: 'completed',
          updatedAt: serverTimestamp()
        });

        return NextResponse.json({ success: true, status: 'completed', videoUrl, progress: 100 });
      }
      
      // 3. Render Failed
      if (progress.fatalErrorEncountered) {
        const errorMsg = progress.errors?.[0]?.message || 'Video rendering failed';
        await updateDoc(requestRef, {
          status: 'failed',
          error: errorMsg,
          updatedAt: serverTimestamp()
        });
        return NextResponse.json({ success: true, status: 'failed', error: errorMsg });
      }

      // Fallback (shouldn't really be hit)
      return NextResponse.json({ success: true, status: 'processing', progress: data.progress });

    } catch (error: any) {
      console.error('Error checking progress:', error);
      // Don't kill the whole process, just return the last known status
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