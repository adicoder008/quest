// app/api/generate-video/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// For production, you'll use Remotion Lambda
// For development, we'll simulate the process
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

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

    // Update status to processing
    await updateDoc(requestRef, {
      status: 'processing',
      progress: 10,
      updatedAt: serverTimestamp()
    });

    if (IS_PRODUCTION) {
      // PRODUCTION: Use Remotion Lambda
      // You'll need to set up Remotion Lambda and get credentials
      // https://www.remotion.dev/docs/lambda/setup
      
      const { renderMediaOnLambda, getRenderProgress } = await import('@remotion/lambda');
      
      try {
        // Start render on Lambda
        const renderResponse = await renderMediaOnLambda({
          region: process.env.REMOTION_AWS_REGION as any,
          functionName: process.env.REMOTION_LAMBDA_FUNCTION_NAME!,
          composition: 'QuestVideo',
          serveUrl: process.env.REMOTION_SERVE_URL!,
          codec: 'h264',
          inputProps: requestData.questData,
          privacy: 'public'
        });

        // Poll for progress
        const checkProgress = async () => {
          try {
            const progress = await getRenderProgress({
              renderId: renderResponse.renderId,
              bucketName: renderResponse.bucketName,
              functionName: process.env.REMOTION_LAMBDA_FUNCTION_NAME!,
              region: process.env.REMOTION_AWS_REGION as any
            });

            // Update progress in Firestore
            if (progress.overallProgress < 1) {
              await updateDoc(requestRef, {
                progress: Math.round(progress.overallProgress * 100),
                updatedAt: serverTimestamp()
              });

              // Continue polling
              setTimeout(checkProgress, 2000);
            } else if (progress.done && progress.outputFile) {
              // Video is complete
              // Upload to Firebase Storage
              const videoBuffer = await fetch(progress.outputFile).then(r => r.arrayBuffer());
              const videoRef = ref(storage, `quest-videos/${requestData.questId}/${Date.now()}.mp4`);
              await uploadBytes(videoRef, videoBuffer);
              const videoUrl = await getDownloadURL(videoRef);

              // Update request with completed video
              await updateDoc(requestRef, {
                status: 'completed',
                videoUrl,
                progress: 100,
                completedAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              });

              // Update quest with video URL
              const questRef = doc(db, 'quest', requestData.questId);
              await updateDoc(questRef, {
                videoUrl,
                videoStatus: 'completed',
                updatedAt: serverTimestamp()
              });
            } else if (progress.fatalErrorEncountered) {
              throw new Error(progress.errors?.[0]?.message || 'Video rendering failed');
            }
          } catch (error) {
            console.error('Error checking progress:', error);
            throw error;
          }
        };

        // Start progress polling
        checkProgress();

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
      // DEVELOPMENT: Simulate video generation
      console.log('🎬 Simulating video generation for development...');
      console.log('Quest Data:', requestData.questData);

      // Simulate progress updates
      for (let progress = 20; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await updateDoc(requestRef, {
          progress,
          updatedAt: serverTimestamp()
        });
      }

      // In development, use a placeholder video URL
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
    console.error('Error in video generation API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Check video status
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

    return NextResponse.json({
      success: true,
      status: data.status,
      videoUrl: data.videoUrl,
      progress: data.progress || 0,
      error: data.error,
      createdAt: data.createdAt?.toDate().toISOString(),
      completedAt: data.completedAt?.toDate().toISOString()
    });

  } catch (error: any) {
    console.error('Error checking video status:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}