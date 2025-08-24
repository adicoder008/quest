// services/xpService.js
import { db } from './firebase.js';
import { doc, updateDoc, increment, serverTimestamp, collection, addDoc } from 'firebase/firestore';

// XP values for different actions
export const XP_VALUES = {
  CREATE_POST: 10,
  CREATE_EVENT: 15,
  COMPLETE_QUEST: 25,
  LIKE_POST: 2,
  COMMENT_POST: 5,
  JOIN_EVENT: 8,
  SHARE_POST: 3,
  FOLLOW_USER: 5,
  DAILY_LOGIN: 5
};

// Add XP to user
export const addXP = async (uid, action, metadata = {}) => {
  try {
    const xpToAdd = XP_VALUES[action] || 0;
    
    if (xpToAdd === 0) {
      console.warn(`No XP value defined for action: ${action}`);
      return;
    }

    // Update user's total XP
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      totalXP: increment(xpToAdd),
      updatedAt: serverTimestamp()
    });

    // Log the XP transaction
    const xpLogRef = collection(db, 'xp_transactions');
    await addDoc(xpLogRef, {
      uid: uid,
      action: action,
      xpEarned: xpToAdd,
      metadata: metadata,
      timestamp: serverTimestamp()
    });

    console.log(`Added ${xpToAdd} XP to user ${uid} for action: ${action}`);
    return { success: true, xpEarned: xpToAdd };
  } catch (error) {
    console.error('Error adding XP:', error);
    throw error;
  }
};

// Calculate level from XP
export const calculateLevel = (totalXP) => {
  const levels = [
    { level: 1, minXP: 0, title: 'Scout' },
    { level: 2, minXP: 100, title: 'Explorer' },
    { level: 3, minXP: 300, title: 'Adventurer' },
    { level: 4, minXP: 600, title: 'Voyager' },
    { level: 5, minXP: 1000, title: 'Pioneer' },
    { level: 6, minXP: 1500, title: 'Legend' }
  ];

  let currentLevel = levels[0];
  let nextLevel = levels[1];

  for (let i = levels.length - 1; i >= 0; i--) {
    if (totalXP >= levels[i].minXP) {
      currentLevel = levels[i];
      nextLevel = levels[i + 1] || null;
      break;
    }
  }

  const progress = nextLevel ? 
    (totalXP - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP) : 1;

  return {
    currentLevel,
    nextLevel,
    progress: Math.min(progress, 1),
    xpToNext: nextLevel ? nextLevel.minXP - totalXP : 0
  };
};

// Get user's XP history
export const getUserXPHistory = async (uid, limit = 20) => {
  try {
    const xpLogRef = collection(db, 'xp_transactions');
    const q = query(
      xpLogRef, 
      where('uid', '==', uid),
      orderBy('timestamp', 'desc'),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    }));
  } catch (error) {
    console.error('Error getting XP history:', error);
    throw error;
  }
};