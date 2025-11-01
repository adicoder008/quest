// lib/questService.ts - UPDATED with simplified cover image handling

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  writeBatch,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  runTransaction,
  limit
} from 'firebase/firestore';
import { db } from './firebase';
import { Quest } from '@/app/types';
import { compressAndUploadImage } from '@/lib/imageService';
import { createPost } from './postService';

// Define types for clarity
type QuestRole = 'owner' | 'editor' | 'viewer';

export interface TripData {
  source: string;
  destination: string;
  startDate: string;
  endDate: string;
  transportMode: string[];
  tripType: string;
  preferences: string[];
  budget: number;
  sourceData?: any;
  destinationData?: any;
  uid: string;
}

export interface GenerateQuestResponse {
  success: boolean;
  itinerary?: any;
  questId?: string;
  error?: string;
}

export interface FlowCardState {
  id: string;
  type: string;
  content?: any;
}

const questService = {

  /**
   * Generates a new quest using AI
   */
  async generateQuest(questData: TripData): Promise<GenerateQuestResponse> {
    console.log('generateQuest called with:', questData);
    
    try {
      const { uid, ...questDataWithoutUid } = questData;
      
      if (!uid) {
        throw new Error('User UID is required');
      }

      const response = await fetch('/api/generate-quest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questData),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to generate itinerary. Status: ${response.status}. Body: ${errorBody}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to generate itinerary from API');
      }

      return {
        success: true,
        itinerary: result.itinerary,
        questId: result.questId
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error in generateQuest:', error);
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  /**
   * Get AI-generated destination suggestions for interests
   */
  async getDestinationSuggestions(destination: string): Promise<string[]> {
    try {
      const response = await fetch(`/api/destination-suggestions/${encodeURIComponent(destination)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch destination suggestions');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get suggestions');
      }
      
      return result.suggestions || [];
    } catch (error) {
      console.error('Error fetching destination suggestions:', error);
      return [];
    }
  },

  /**
   * Core quest creation with transaction
   * FIXED: Now uses single compressed image URL (same as posts)
   */
  async createQuest(uid: string, questData: any, itineraryData?: any, coverImageFile?: File, flowCards?: FlowCardState[]) {
    console.log('createQuest called with:', { uid, questData });
    
    const questCollectionRef = collection(db, 'quest');
    const newQuestRef = doc(questCollectionRef);
    const questId = newQuestRef.id;

    const chatCollectionRef = collection(db, 'chats');
    const newChatRef = doc(chatCollectionRef);
    const chatId = newChatRef.id;

    const userRef = doc(db, 'users', uid);

    try {
      // FIXED: Upload cover image using the same compression as posts
      let coverImageUrl: string | null = null;
      if (coverImageFile) {
        try {
          // This returns a single compressed URL (same as posts)
          const imageUrls = await compressAndUploadImage(
            coverImageFile, 
            'quest-covers', 
            uid
          );
          coverImageUrl = imageUrls.compressedUrl;
          console.log('Cover image uploaded:', coverImageUrl);
        } catch (error) {
          console.error('Error uploading cover image:', error);
          // Decide if you want to fail the whole quest creation or just proceed without an image
        }
      }

      await runTransaction(db, async (transaction) => {
        // 1. Create the Quest document
        const questDocument = {
          ...questData,
          itinerary: itineraryData || null,
          coverImageUrl: coverImageUrl || null, // Single URL, same as posts
          flowCards: flowCards || [],
          owner: uid,
          id: questId,
          chatId: chatId,
          members: {
            [uid]: 'owner'
          },
          isPublic: false,
          isPostedToFeed: false,
          associatedPostId: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        
        console.log('Creating quest document:', questDocument);
        transaction.set(newQuestRef, questDocument);

        // 2. Create the associated Chat document
        const chatDocument = {
          questId: questId,
          questTitle: questData.title || `Quest to ${questData.destination}`,
          members: [uid],
          createdAt: serverTimestamp(),
          lastMessage: null,
        };
        console.log('Creating chat document:', chatDocument);
        transaction.set(newChatRef, chatDocument);

        // 3. Add the new questId to the user's profile
        console.log('Updating user document with questId:', questId);
        transaction.update(userRef, {
          questIds: arrayUnion(questId)
        });
      });

      console.log('Transaction completed successfully');
      return { success: true, questId, chatId };
    } catch (error) {
      console.error('Transaction failed: Error creating quest:', error);
      throw error;
    }
  },

  /**
   * Fetches a single quest document for a user (permission-based)
   */
  async getQuest(uid: string, questId: string): Promise<Quest> {
    try {
      const questRef = doc(db, 'quest', questId);
      const questSnap = await getDoc(questRef);

      if (!questSnap.exists()) {
        throw new Error('Quest not found');
      }
      
      const questData = questSnap.data();
      if (!questData.isPublic && (!questData.members || !questData.members[uid])) {
        throw new Error('You do not have permission to view this quest.');
      }

      return { id: questSnap.id, ...questData } as Quest;
    } catch (error) {
      console.error('Error fetching quest:', error);
      throw error;
    }
  },
    
  /**
   * Fetches a single quest document by its ID, without user permission checks
   */
  async getQuestById(questId: string): Promise<Quest | null> {
    try {
      const questRef = doc(db, 'quest', questId);
      const questSnap = await getDoc(questRef);
      if (questSnap.exists()) {
        return { id: questSnap.id, ...questSnap.data() } as Quest;
      }
      return null;
    } catch (error) {
      console.error('Error fetching quest by ID:', error);
      throw error;
    }
  },

  /**
   * Fetches all quests a user is a member of
   */
  async getUserQuests(uid: string): Promise<Quest[]> {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        return [];
      }
      const questIds = userSnap.data().questIds || [];

      if (questIds.length === 0) {
        return [];
      }

      const questsToFetch = questIds.slice(0, 30);
      const questsRef = collection(db, 'quest');
      const q = query(
        questsRef, 
        where('__name__', 'in', questsToFetch),
      );
      
      const querySnapshot = await getDocs(q);
      let quests: Quest[] = [];
      
      querySnapshot.forEach((doc) => {
        quests.push({ id: doc.id, ...doc.data() } as Quest);
      });
      
      quests.sort((a, b) => {
        const aTimestamp =
          a.createdAt && typeof a.createdAt === 'object' && 'seconds' in a.createdAt
            ? (a.createdAt as { seconds: number }).seconds
            : (typeof a.createdAt === 'string' ? Date.parse(a.createdAt) / 1000 : 0);
        const bTimestamp =
          b.createdAt && typeof b.createdAt === 'object' && 'seconds' in b.createdAt
            ? (b.createdAt as { seconds: number }).seconds
            : (typeof b.createdAt === 'string' ? Date.parse(b.createdAt) / 1000 : 0);
        return bTimestamp - aTimestamp;
      });
      
      return quests;
    } catch (error) {
      console.error('Error fetching user quests:', error);
      throw error;
    }
  },

  /**
   * Get user's saved quests
   */
  getUserSavedQuests: async function (uid: string): Promise<Quest[]> {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        return [];
      }
      const savedQuestIds = userSnap.data().savedQuestIds || [];

      if (savedQuestIds.length === 0) {
        return [];
      }

      const questsToFetch = savedQuestIds.slice(0, 30);
      const questsRef = collection(db, 'quest');
      const q = query(
        questsRef, 
        where('__name__', 'in', questsToFetch),
      );
      
      const querySnapshot = await getDocs(q);
      let quests: Quest[] = [];
      
      querySnapshot.forEach((doc) => {
        quests.push({ id: doc.id, ...doc.data() } as Quest);
      });
      
      return quests;
    } catch (error) {
      console.error('Error fetching user saved quests:', error);
      throw error;
    }
  },

  /**
   * Posts a quest to the public feed
   * FIXED: Now handles single compressed image URL (same as posts)
   */
  async postQuestToFeed(
    questId: string, 
    uid: string, 
    visibility: 'public' | 'private',
    coverImageFile?: File | null
  ): Promise<{ success: boolean; error?: string; postId?: string }> {
    try {
      const questRef = doc(db, 'quest', questId);
      const questSnap = await getDoc(questRef);

      if (!questSnap.exists()) {
        throw new Error('Quest not found');
      }

      const questData = questSnap.data();

      // 1. Check permissions
      if (questData.members?.[uid] !== 'owner') {
        throw new Error('Only the quest owner can post to the feed.');
      }

      // 2. Prevent duplicate posting for public quests
      if (visibility === 'public' && questData.isPostedToFeed) {
        return { 
          success: false, 
          error: 'This quest has already been posted to the feed.' 
        };
      }

      // 3. Fetch user data
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error('User not found');
      }

      const userData = userSnap.data();
      const userName = userData.displayName || 'Anonymous';
      const userProfilePic = userData.photoURL || '';

      let finalCoverImageUrl = questData.coverImageUrl || null;

      // 4. Handle new cover image upload (if provided)
      if (coverImageFile) {
        try {
          // FIXED: Upload using same compression as posts
          finalCoverImageUrl = await compressAndUploadImage(
            coverImageFile, 
            'quest-covers', 
            uid
          );
          console.log('New cover image uploaded:', finalCoverImageUrl);
        } catch (error) {
          console.error('Error uploading new cover image:', error);
          throw new Error('Failed to upload cover image');
        }
      }

      // 5. Enforce image for public posts
      if (visibility === 'public' && !finalCoverImageUrl) {
        return {
          success: false,
          error: 'A cover image is required to post a quest publicly.'
        };
      }

      let postId: string | undefined;

      // 6. Create the feed post if public
      if (visibility === 'public') {
        const activityCount = questData.itinerary?.days?.flatMap((d: any) => d.activities || []).length || 0;
        const dayCount = questData.itinerary?.days?.length || 0;

        const postResult = await createPost({
          uid: uid,
          userName: userName,
          userProfilePic: userProfilePic,
          text: `🗺️ Quest to ${questData.destination}\n\n${questData.title || 'An amazing adventure awaits!'}\n\n📍 ${dayCount} days · ${activityCount} activities`,
          photoUrl: finalCoverImageUrl!, // Single compressed URL
          postType: 'quest_completion',
          questContext: {
            questId: questId,
            questTitle: questData.title || `Quest to ${questData.destination}`,
            description: questData.description || '',
          }
        });

        postId = postResult.id;
      }

      // 7. Update the quest document
      await updateDoc(questRef, {
        coverImageUrl: finalCoverImageUrl, // Single URL
        isPublic: visibility === 'public',
        isPostedToFeed: visibility === 'public' ? true : questData.isPostedToFeed,
        associatedPostId: postId || questData.associatedPostId || null,
        updatedAt: serverTimestamp()
      });

      return { success: true, postId };
    } catch (error) {
      console.error('Error posting quest to feed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to post quest' 
      };
    }
  },

  /**
   * Get public quests for feed
   */
  async getPublicQuests(limitCount: number = 12): Promise<Quest[]> {
    try {
      const questsRef = collection(db, 'quest');
      const q = query(
        questsRef,
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const quests: Quest[] = [];
      
      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        
        let ownerName = 'Anonymous';
        let ownerPhoto = '';
        
        if (data.owner) {
          try {
            const userDoc = await getDoc(doc(db, 'users', data.owner));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              ownerName = userData.displayName || 'Anonymous';
              ownerPhoto = userData.photoURL || '';
            }
          } catch (error) {
            console.error(`Error fetching owner data for quest ${docSnap.id}:`, error);
          }
        }
        
        quests.push({
          id: docSnap.id,
          ...data,
          ownerName,
          ownerPhoto
        } as unknown as Quest);
      }
      
      return quests;
    } catch (error) {
      console.error('Error fetching public quests:', error);
      throw error;
    }
  },

  /**
   * Updates the itinerary of a quest
   */
  async updateQuest(questId: string, uid: string, updatedData: object) {
    try {
      const questRef = doc(db, 'quest', questId);
      const questSnap = await getDoc(questRef);

      if (!questSnap.exists()) throw new Error('Quest not found.');
      
      const questData = questSnap.data();
      const userRole = questData.members?.[uid];

      if (userRole !== 'owner' && userRole !== 'editor') {
        throw new Error('You do not have permission to edit this quest.');
      }

      await updateDoc(questRef, {
        ...updatedData,
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating quest:', error);
      throw error;
    }
  },
  
  /**
   * AI Itinerary Generation (Placeholder)
   */
  async generateAItinerary(questData: TripData): Promise<any> {
    console.log('Generating AI itinerary for:', questData);
    return { days: [], generated: true };
  },
  
  /**
   * Create blank itinerary structure for manual creation
   */
  createBlankItinerary(questData: any): any {
    const startDate = new Date(questData.startDate);
    const endDate = new Date(questData.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const blankDays = Array.from({ length: days }, (_, i) => {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      return {
        day: i + 1,
        date: currentDate.toISOString().split('T')[0],
        title: `Day ${i + 1}`,
        activities: []
      };
    });
    
    return {
      days: blankDays,
      generated: false,
      tripData: questData
    };
  }
};

export default questService;