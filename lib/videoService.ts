// lib/videoService.ts
import { db, storage } from './firebase';
import { doc, getDoc, updateDoc, increment, serverTimestamp, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface VideoGenerationStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  error?: string;
  progress?: number;
  createdAt: Date;
  completedAt?: Date;
}

export const videoService = {
  /**
   * Check if user has remaining video generation credits for today
   */
  async checkVideoCredits(uid: string): Promise<{ canGenerate: boolean; remaining: number; resetAt: Date }> {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const today = new Date().toDateString();
      const lastReset = userData.videoCredits?.lastReset 
        ? new Date(userData.videoCredits.lastReset).toDateString() 
        : null;

      // Reset credits if it's a new day
      if (lastReset !== today) {
        await updateDoc(userRef, {
          'videoCredits.count': 6,
          'videoCredits.lastReset': new Date().toISOString()
        });
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        return {
          canGenerate: true,
          remaining: 6,
          resetAt: tomorrow
        };
      }

      const remaining = userData.videoCredits?.count || 0;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      return {
        canGenerate: remaining > 0,
        remaining,
        resetAt: tomorrow
      };
    } catch (error) {
      console.error('Error checking video credits:', error);
      throw error;
    }
  },

  /**
   * Deduct one video credit from user's daily allowance
   */
  async deductVideoCredit(uid: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        'videoCredits.count': increment(-1)
      });
    } catch (error) {
      console.error('Error deducting video credit:', error);
      throw error;
    }
  },

  /**
   * Create a video generation request
   */
  async createVideoRequest(
    uid: string,
    questId: string,
    questData: any
  ): Promise<string> {
    try {
      // Check credits first
      const credits = await this.checkVideoCredits(uid);
      if (!credits.canGenerate) {
        throw new Error(`No video generation credits remaining. Resets at ${credits.resetAt.toLocaleTimeString()}`);
      }

      // Create video request document
      const videoRequestRef = doc(db, 'videoRequests', `${questId}_${Date.now()}`);
      const requestId = videoRequestRef.id;

      await setDoc(videoRequestRef, {
        uid,
        questId,
        questData: {
          destination: questData.destination,
          userName: questData.userName || 'Traveler',
          userProfilePic: questData.userProfilePic || '',
          coverImageUrl: questData.coverImageUrl || '',
          days: questData.itinerary?.days || [],
          questTitle: questData.title || `Quest to ${questData.destination}`
        },
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Deduct credit
      await this.deductVideoCredit(uid);

      // Update quest with video request
      const questRef = doc(db, 'quest', questId);
      await updateDoc(questRef, {
        videoRequestId: requestId,
        videoStatus: 'pending',
        updatedAt: serverTimestamp()
      });

      return requestId;
    } catch (error) {
      console.error('Error creating video request:', error);
      throw error;
    }
  },

  /**
   * Get video generation status
   */
  async getVideoStatus(requestId: string): Promise<VideoGenerationStatus | null> {
    try {
      const requestRef = doc(db, 'videoRequests', requestId);
      const requestDoc = await getDoc(requestRef);

      if (!requestDoc.exists()) {
        return null;
      }

      const data = requestDoc.data();
      return {
        status: data.status,
        videoUrl: data.videoUrl,
        error: data.error,
        progress: data.progress,
        createdAt: data.createdAt?.toDate() || new Date(),
        completedAt: data.completedAt?.toDate()
      };
    } catch (error) {
      console.error('Error getting video status:', error);
      throw error;
    }
  },

  /**
   * Get quest video URL if available
   */
  async getQuestVideo(questId: string): Promise<string | null> {
    try {
      const questRef = doc(db, 'quest', questId);
      const questDoc = await getDoc(questRef);

      if (!questDoc.exists()) {
        return null;
      }

      const data = questDoc.data();
      return data.videoUrl || null;
    } catch (error) {
      console.error('Error getting quest video:', error);
      return null;
    }
  },

  /**
   * Delete a video request (cancel generation)
   */
  async cancelVideoRequest(requestId: string, uid: string): Promise<void> {
    try {
      const requestRef = doc(db, 'videoRequests', requestId);
      const requestDoc = await getDoc(requestRef);

      if (!requestDoc.exists()) {
        throw new Error('Video request not found');
      }

      const data = requestDoc.data();
      if (data.uid !== uid) {
        throw new Error('Unauthorized');
      }

      if (data.status === 'completed') {
        throw new Error('Cannot cancel completed video');
      }

      await updateDoc(requestRef, {
        status: 'failed',
        error: 'Cancelled by user',
        updatedAt: serverTimestamp()
      });

      // Refund credit if still pending
      if (data.status === 'pending') {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
          'videoCredits.count': increment(1)
        });
      }
    } catch (error) {
      console.error('Error cancelling video request:', error);
      throw error;
    }
  }
};

export default videoService;