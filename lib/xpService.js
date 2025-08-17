import { db } from './firebase.js';
import { doc, updateDoc, increment, arrayUnion, serverTimestamp, getDoc , setDoc } from 'firebase/firestore';

// XP values for different actions
const XP_VALUES = {
  CREATE_POST: 10,
  COMPLETE_QUEST: 20,
  REFERRAL: 15,
  LIKE_POST: 2,
  COMMENT_POST: 5
};

// Add XP to user and log the action
const addXP = async (uid, actionType, details = {}) => {
  try {
    const userRef = doc(db, 'users', uid);
    const xpLogRef = doc(db, 'user_xp_logs', uid);
    
    const xpToAdd = XP_VALUES[actionType] || 0;
    const clientTimestamp = Date.now(); // Use client-side timestamp for log
    
    // Create the log object first
    const logEntry = {
      actionType,
      xp: xpToAdd,
      timestamp: clientTimestamp, // Client-side timestamp
      details
    };
    
    // Update user's total XP
  await setDoc(xpLogRef, {
  logs: arrayUnion(logEntry),
  updatedAt: serverTimestamp()
}, { merge: true });
    
    // Log the XP action
    await updateDoc(xpLogRef, {
      logs: arrayUnion(logEntry),
      updatedAt: serverTimestamp() // Also update the log's updatedAt field
    }, { merge: true });
    
    return { success: true, xpAdded: xpToAdd };
  } catch (error) {
    console.error("Error adding XP:", error);
    throw error;
  }
};

// Get user's XP logs
const getXPLogs = async (uid) => {
  try {
    const xpLogRef = doc(db, 'user_xp_logs', uid);
    const xpLogDoc = await getDoc(xpLogRef);
    
    if (xpLogDoc.exists()) {
      return xpLogDoc.data().logs || [];
    }
    return [];
  } catch (error) {
    console.error("Error getting XP logs:", error);
    throw error;
  }
};

export {
  addXP,
  getXPLogs,
  XP_VALUES
};
