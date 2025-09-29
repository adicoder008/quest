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
  addDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase'; // Your firebase config file

/**
 * Uploads an image file to Firebase Storage and returns the download URL.
 * @param {File} imageFile The image file to upload.
 * @param {string} path The path in Storage to upload the file to.
 * @returns {Promise<string>} The permanent download URL of the uploaded image.
 */
const uploadImageAndGetURL = async (imageFile: Blob | ArrayBuffer | Uint8Array<ArrayBufferLike>, path: string | undefined) => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, imageFile);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};

export const questService = {
  // Create a new quest
  async createQuest(uid: string, questData: { title: string; description: string; privacy: string; tags: never[]; }) {
    try {
      const questId = `quest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const questRef = doc(db, 'users', uid, 'quests', questId);
      
      const questDocument = {
        ...questData,
        uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'draft',
        type: 'quest',
        isPrivate: true,
        likes: [],
        likesCount: 0,
        savesCount: 0,
        viewsCount: 0,
        duplicationsCount: 0
      };
      
      await setDoc(questRef, questDocument);
      return { success: true, questId };
    } catch (error) {
      console.error('Error creating quest:', error);
      throw error;
    }
  },

  // Get quest by ID
  async getQuest(uid: string, questId: string) {
    try {
      const questRef = doc(db, 'users', uid, 'quests', questId);
      const questSnap = await getDoc(questRef);
      
      if (!questSnap.exists()) {
        throw new Error('Quest not found');
      }
      
      return { id: questSnap.id, ...questSnap.data() };
    } catch (error) {
      console.error('Error fetching quest:', error);
      throw error;
    }
  },

  // Update quest
  // Update itinerary for a quest
async updateQuest(uid: string, questId: string, updatedDays: any[]) {
  try {
    const questRef = doc(db, 'users', uid, 'quests', questId);
    
    await updateDoc(questRef, {
      'itinerary.days': updatedDays,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating itinerary:', error);
    throw error;
  }
},
   async getUserQuests(uid: string) {
  try {
    const questsRef = collection(db, 'users', uid, 'quests');
    const q = query(questsRef, orderBy('updatedAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const quests: { id: string; }[] = [];
    querySnapshot.forEach((doc) => {
      quests.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return quests;
  } catch (error) {
    console.error('Error fetching user quests:', error);
    throw error;
  }
},


  // Add activity to a day
  async addActivity(uid: string, questId: string, dayIndex: string | number, activity: any) {
    try {
      const questRef = doc(db, 'users', uid, 'quests', questId);
      const questSnap = await getDoc(questRef);
      
      if (!questSnap.exists()) {
        throw new Error('Quest not found');
      }
      
      const questData = questSnap.data();
      const updatedItinerary = { ...questData.itinerary };
      
      if (!updatedItinerary.days[dayIndex]) {
        throw new Error('Day not found');
      }
      
      updatedItinerary.days[dayIndex].activities.push({
        ...activity,
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
      });
      
      await updateDoc(questRef, {
        itinerary: updatedItinerary,
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error adding activity:', error);
      throw error;
    }
  }
};

// API helper functions for quest management
export const questAPI = {
  // Generate quest with AI
  async generateQuest(questData) {
    try {
      const response = await fetch('/api/generate-quest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error generating quest:', error);
      throw error;
    }
  },
 
  // Get destination suggestions
  async getDestinationSuggestions(destination: string | number | boolean) {
    try {
      const response = await fetch(`/api/destination-suggestions/${encodeURIComponent(destination)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.suggestions || [];
    } catch (error) {
      console.error('Error getting destination suggestions:', error);
      return [];
    }
  }
};