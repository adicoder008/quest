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
  runTransaction
} from 'firebase/firestore';
import { db } from './firebase';

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

// Add FlowCardState interface
export interface FlowCardState {
  id: string;
  type: string;
  content?: any;
  // Add other properties as needed
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

      // Call the AI generation API first
      const response = await fetch('/api/generate-quest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate itinerary');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to generate itinerary');
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
   */
  async createQuest(uid: string, questData: any, coverImageFile?: File, flowCards?: FlowCardState[]) {
    console.log('createQuest called with:', { uid, questData });
    
    const questCollectionRef = collection(db, 'quest');
    const newQuestRef = doc(questCollectionRef);
    const questId = newQuestRef.id;

    const chatCollectionRef = collection(db, 'chats');
    const newChatRef = doc(chatCollectionRef);
    const chatId = newChatRef.id;

    const userRef = doc(db, 'users', uid);

    try {
      await runTransaction(db, async (transaction) => {
        // 1. Create the Quest document
        const questDocument = {
          ...questData,
          id: questId,
          chatId: chatId,
          members: {
            [uid]: 'owner'
          },
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
   * Fetches a single quest document if the user is a member
   */
  async getQuest(uid: string, questId: string) {
    try {
      const questRef = doc(db, 'quest', questId);
      const questSnap = await getDoc(questRef);

      if (!questSnap.exists()) {
        throw new Error('Quest not found');
      }
      
      const questData = questSnap.data();
      if (!questData.members || !questData.members[uid]) {
        throw new Error('You do not have permission to view this quest.');
      }

      return { id: questSnap.id, ...questData };
    } catch (error) {
      console.error('Error fetching quest:', error);
      throw error;
    }
  },

  /**
   * Fetches all quests a user is a member of
   */
  async getUserQuests(uid: string) {
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
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const quests: any[] = [];
      
      querySnapshot.forEach((doc) => {
        quests.push({ id: doc.id, ...doc.data() });
      });
      
      return quests;
    } catch (error) {
      console.error('Error fetching user quests:', error);
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
   * AI Itinerary Generation
   */
  async generateAItinerary(questData: TripData): Promise<any> {
    console.log('Generating AI itinerary for:', questData);
    
    // Calculate number of days
    const startDate = new Date(questData.startDate);
    const endDate = new Date(questData.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Create AI-generated days structure
    const aiDays = [];
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      aiDays.push({
        day: i + 1,
        date: currentDate.toISOString().split('T')[0],
        title: `Day ${i + 1} in ${questData.destination}`,
        activities: [
          {
            type: 'ai_generated',
            time: 'Morning',
            title: `Morning in ${questData.destination}`,
            description: `AI-generated morning activity based on your preferences: ${questData.preferences.join(', ')}`,
            location: questData.destination,
            duration: '3 hours',
            cost: Math.floor(questData.budget / days / 4 * 0.3)
          },
          {
            type: 'ai_generated',
            time: 'Afternoon',
            title: `Afternoon Exploration`,
            description: `AI-generated afternoon activity based on your interests`,
            location: questData.destination,
            duration: '4 hours',
            cost: Math.floor(questData.budget / days / 4 * 0.4)
          },
          {
            type: 'ai_generated',
            time: 'Evening',
            title: `Evening Experience`,
            description: `AI-generated evening plans`,
            location: questData.destination,
            duration: '3 hours',
            cost: Math.floor(questData.budget / days / 4 * 0.2)
          },
          {
            type: 'ai_generated',
            time: 'Night',
            title: `Night Activities`,
            description: `AI-generated night suggestions`,
            location: questData.destination,
            duration: '2 hours',
            cost: Math.floor(questData.budget / days / 4 * 0.1)
          }
        ]
      });
    }
    
    return {
      days: aiDays,
      generated: true,
      aiNotes: `AI-generated itinerary for ${questData.destination} focusing on: ${questData.preferences.join(', ')}`,
      estimatedCost: questData.budget,
      destination: questData.destination,
      transportModes: questData.transportMode,
      tripType: questData.tripType
    };
  },
  
  /**
   * Create blank itinerary structure for manual creation
   */
  createBlankItinerary(questData: any): any {
    const startDate = new Date(questData.startDate);
    const endDate = new Date(questData.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const blankDays = [];
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      blankDays.push({
        day: i + 1,
        date: currentDate.toISOString().split('T')[0],
        title: `Day ${i + 1}`,
        activities: [
          {
            type: 'text',
            time: 'Morning',
            title: 'Morning Activity',
            description: 'Add your morning plans here'
          },
          {
            type: 'text',
            time: 'Afternoon',
            title: 'Afternoon Activity',
            description: 'Add your afternoon plans here'
          },
          {
            type: 'text',
            time: 'Evening',
            title: 'Evening Activity',
            description: 'Add your evening plans here'
          },
          {
            type: 'text',
            time: 'Night',
            title: 'Night Activity',
            description: 'Add your night plans here'
          }
        ]
      });
    }
    
    return {
      days: blankDays,
      generated: false,
      tripData: questData
    };
  }
};

export default questService;