// lib/onQuestPeopleService.ts
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
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  runTransaction,
  limit,
  addDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { OnQuestPerson } from '@/app/types';

export interface OnQuestPersonReview {
  id: string;
  personId: string;
  questId: string;
  userId: string;
  userName: string;
  userProfilePic: string;
  rating: number; // 1-5
  reviewText: string;
  photos?: string[];
  helpfulCount: number;
  createdAt: any;
  updatedAt: any;
}

export interface CreateOnQuestPersonData {
  questId: string;
  userId: string;
  name: string;
  serviceType: 'food' | 'accommodation' | 'transport' | 'fun' | 'emergency' | 'police' | 'guide' | 'other';
  category: string;
  location: {
    name: string;
    coordinates: { lat: number; lng: number };
    placeId?: string;
  };
  contact: {
    phone: string;
    email?: string;
    website?: string;
    whatsapp?: string;
  };
  description: string;
  priceRange?: '$' | '$$' | '$$$' | '$$$$';
  tags?: string[];
  operatingHours?: {
    [day: string]: { open: string; close: string } | 'closed';
  };
  personalNotes?: string; // Private notes for the user
}

const onQuestPeopleService = {
  /**
   * Add a new OnQuest person/service to a quest
   */
  async addOnQuestPerson(data: CreateOnQuestPersonData): Promise<{ success: boolean; personId?: string; error?: string }> {
    try {
      const personRef = collection(db, 'onQuestPeople');
      
      const newPerson: any = {
        name: data.name,
        serviceType: data.serviceType,
        category: data.category,
        location: data.location,
        contact: data.contact,
        rating: 0,
        reviewCount: 0,
        priceRange: data.priceRange,
        description: data.description,
        photos: [],
        verified: false,
        featured: false,
        commissionRate: 0,
        tags: data.tags || [],
        operatingHours: data.operatingHours,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(personRef, newPerson);
      
      // Link to quest
      const questPersonRef = doc(db, 'questContacts', `${data.questId}_${docRef.id}`);
      await setDoc(questPersonRef, {
        questId: data.questId,
        personId: docRef.id,
        addedBy: data.userId,
        personalNotes: data.personalNotes || '',
        addedAt: serverTimestamp(),
      });

      return { success: true, personId: docRef.id };
    } catch (error) {
      console.error('Error adding OnQuest person:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add contact' 
      };
    }
  },

  /**
   * Get all OnQuest people for a specific quest
   */
  async getQuestContacts(questId: string): Promise<(OnQuestPerson & { personalNotes?: string })[]> {
    try {
      // Get all contact links for this quest
      const questContactsRef = collection(db, 'questContacts');
      const q = query(questContactsRef, where('questId', '==', questId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return [];
      }

      // Fetch full person details
      const contacts: (OnQuestPerson & { personalNotes?: string })[] = [];
      
      for (const docSnap of snapshot.docs) {
        const linkData = docSnap.data();
        const personRef = doc(db, 'onQuestPeople', linkData.personId);
        const personSnap = await getDoc(personRef);
        
        if (personSnap.exists()) {
          contacts.push({
            id: personSnap.id,
            ...personSnap.data(),
            personalNotes: linkData.personalNotes,
          } as OnQuestPerson & { personalNotes?: string });
        }
      }
      
      return contacts;
    } catch (error) {
      console.error('Error fetching quest contacts:', error);
      return [];
    }
  },

  /**
   * Get a single OnQuest person by ID
   */
  async getOnQuestPerson(personId: string): Promise<OnQuestPerson | null> {
    try {
      const personRef = doc(db, 'onQuestPeople', personId);
      const personSnap = await getDoc(personRef);
      
      if (personSnap.exists()) {
        return { id: personSnap.id, ...personSnap.data() } as OnQuestPerson;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching OnQuest person:', error);
      return null;
    }
  },

  /**
   * Update an OnQuest person
   */
  async updateOnQuestPerson(
    personId: string,
    updates: Partial<OnQuestPerson>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const personRef = doc(db, 'onQuestPeople', personId);
      
      await updateDoc(personRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating OnQuest person:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update contact' 
      };
    }
  },

  /**
   * Delete an OnQuest person from a quest
   */
  async removeFromQuest(questId: string, personId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const questPersonRef = doc(db, 'questContacts', `${questId}_${personId}`);
      await deleteDoc(questPersonRef);
      
      return { success: true };
    } catch (error) {
      console.error('Error removing contact from quest:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to remove contact' 
      };
    }
  },

  /**
   * Add a review for an OnQuest person
   */
  async addReview(
    personId: string,
    questId: string,
    userId: string,
    userName: string,
    userProfilePic: string,
    rating: number,
    reviewText: string,
    photos?: string[]
  ): Promise<{ success: boolean; reviewId?: string; error?: string }> {
    try {
      return await runTransaction(db, async (transaction) => {
        const personRef = doc(db, 'onQuestPeople', personId);
        const personSnap = await transaction.get(personRef);
        
        if (!personSnap.exists()) {
          throw new Error('Contact not found');
        }

        const personData = personSnap.data();
        const currentRating = personData.rating || 0;
        const currentReviewCount = personData.reviewCount || 0;
        
        // Calculate new average rating
        const newReviewCount = currentReviewCount + 1;
        const newRating = ((currentRating * currentReviewCount) + rating) / newReviewCount;

        // Create review document
        const reviewRef = doc(collection(db, 'onQuestPeopleReviews'));
        const reviewData: Partial<OnQuestPersonReview> = {
          personId,
          questId,
          userId,
          userName,
          userProfilePic,
          rating,
          reviewText,
          photos: photos || [],
          helpfulCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        transaction.set(reviewRef, reviewData);

        // Update person's rating and review count
        transaction.update(personRef, {
          rating: newRating,
          reviewCount: newReviewCount,
          updatedAt: serverTimestamp(),
        });

        return { success: true, reviewId: reviewRef.id };
      });
    } catch (error) {
      console.error('Error adding review:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add review' 
      };
    }
  },

  /**
   * Get reviews for an OnQuest person
   */
  async getReviews(personId: string, limitCount: number = 10): Promise<OnQuestPersonReview[]> {
    try {
      const reviewsRef = collection(db, 'onQuestPeopleReviews');
      const q = query(
        reviewsRef,
        where('personId', '==', personId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      const reviews: OnQuestPersonReview[] = [];
      
      snapshot.forEach((doc) => {
        reviews.push({ id: doc.id, ...doc.data() } as OnQuestPersonReview);
      });
      
      return reviews;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  },

  /**
   * Search OnQuest people by service type and location
   */
  async searchByServiceType(
    serviceType: string,
    limitCount: number = 20
  ): Promise<OnQuestPerson[]> {
    try {
      const peopleRef = collection(db, 'onQuestPeople');
      const q = query(
        peopleRef,
        where('serviceType', '==', serviceType),
        orderBy('rating', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      const people: OnQuestPerson[] = [];
      
      snapshot.forEach((doc) => {
        people.push({ id: doc.id, ...doc.data() } as OnQuestPerson);
      });
      
      return people;
    } catch (error) {
      console.error('Error searching OnQuest people:', error);
      return [];
    }
  },

  /**
   * Update personal notes for a contact in a quest
   */
  async updatePersonalNotes(
    questId: string,
    personId: string,
    notes: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const questPersonRef = doc(db, 'questContacts', `${questId}_${personId}`);
      await updateDoc(questPersonRef, {
        personalNotes: notes,
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating personal notes:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update notes' 
      };
    }
  },
};

export default onQuestPeopleService;