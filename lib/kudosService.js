// lib/kudosService.js
import { db } from './firebase';
import { doc, updateDoc, getDoc, serverTimestamp, increment, collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { getGamificationData, updateUserQPs } from './qpService';

/**
 * Send kudos to a quest creator
 */
export const sendKudos = async (senderUid, recipientUid, questId, amount = 1) => {
  try {
    // Get sender's gamification data
    const senderData = await getGamificationData(senderUid);
    
    // Check if sender has reached Tier 1 (Wayfinder)
    if (senderData.currentRankTier < 1) {
      throw new Error('You must reach Wayfinder rank (Tier 1) to send Kudos');
    }
    
    // Check if sender has enough QPs
    const cost = amount; // 1 QP = 1 Kudos
    if (senderData.totalQPs < cost) {
      throw new Error('Insufficient QPs to send Kudos');
    }
    
    // Deduct QPs from sender
    await updateUserQPs(senderUid, -cost, 'KUDOS_SENT', {
      recipientUid,
      questId,
      kudosAmount: amount
    });
    
    // Update sender's kudosGiven count
    const senderGamificationRef = doc(db, 'gamification', senderUid);
    await updateDoc(senderGamificationRef, {
      kudosGiven: increment(amount),
      updatedAt: serverTimestamp()
    });
    
    // Update recipient's kudosReceived count (but not QPs)
    const recipientGamificationRef = doc(db, 'gamification', recipientUid);
    const recipientData = await getGamificationData(recipientUid);
    
    await updateDoc(recipientGamificationRef, {
      kudosReceived: increment(amount),
      updatedAt: serverTimestamp()
    });
    
    // Log the kudos transaction
    const kudosLogRef = collection(db, 'kudos_transactions');
    await addDoc(kudosLogRef, {
      senderUid,
      recipientUid,
      questId,
      amount,
      timestamp: serverTimestamp()
    });
    
    // Update quest kudos count
    if (questId) {
      const questRef = doc(db, 'quests', questId);
      await updateDoc(questRef, {
        kudosCount: increment(amount),
        updatedAt: serverTimestamp()
      });
    }
    
    console.log(`${amount} Kudos sent from ${senderUid} to ${recipientUid}`);
    
    return {
      success: true,
      kudosSent: amount,
      qpCost: cost,
      remainingQPs: senderData.totalQPs - cost
    };
  } catch (error) {
    console.error('Error sending kudos:', error);
    throw error;
  }
};

/**
 * Get kudos history for a user
 */
export const getUserKudosHistory = async (uid, type = 'all', limitCount = 50) => {
  try {
    const kudosLogRef = collection(db, 'kudos_transactions');
    let q;
    
    if (type === 'sent') {
      q = query(
        kudosLogRef,
        where('senderUid', '==', uid),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
    } else if (type === 'received') {
      q = query(
        kudosLogRef,
        where('recipientUid', '==', uid),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
    } else {
      // Get both sent and received
      const sentQuery = query(
        kudosLogRef,
        where('senderUid', '==', uid),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const receivedQuery = query(
        kudosLogRef,
        where('recipientUid', '==', uid),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const [sentSnapshot, receivedSnapshot] = await Promise.all([
        getDocs(sentQuery),
        getDocs(receivedQuery)
      ]);
      
      const sent = sentSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'sent',
        timestamp: doc.data().timestamp?.toDate()
      }));
      
      const received = receivedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'received',
        timestamp: doc.data().timestamp?.toDate()
      }));
      
      return [...sent, ...received].sort((a, b) => b.timestamp - a.timestamp);
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      type: type === 'sent' ? 'sent' : 'received',
      timestamp: doc.data().timestamp?.toDate()
    }));
  } catch (error) {
    console.error('Error getting kudos history:', error);
    throw error;
  }
};

/**
 * Get kudos stats for a user
 */
export const getUserKudosStats = async (uid) => {
  try {
    const userData = await getGamificationData(uid);
    
    return {
      kudosGiven: userData.kudosGiven || 0,
      kudosReceived: userData.kudosReceived || 0,
      canSendKudos: userData.currentRankTier >= 1,
      qpBalance: userData.totalQPs,
      conversionRate: '1 QP = 1 Kudos'
    };
  } catch (error) {
    console.error('Error getting kudos stats:', error);
    throw error;
  }
};

/**
 * Get quest kudos leaderboard
 */
export const getQuestKudosLeaderboard = async (limitCount = 10) => {
  try {
    const questsRef = collection(db, 'quests');
    const q = query(
      questsRef,
      where('isPublic', '==', true),
      orderBy('kudosCount', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      kudosCount: doc.data().kudosCount || 0
    }));
  } catch (error) {
    console.error('Error getting quest kudos leaderboard:', error);
    throw error;
  }
};

/**
 * Get user kudos leaderboard
 */
export const getUserKudosLeaderboard = async (limitCount = 10) => {
  try {
    const gamificationRef = collection(db, 'gamification');
    const q = query(
      gamificationRef,
      orderBy('kudosReceived', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
      kudosReceived: doc.data().kudosReceived || 0
    }));
  } catch (error) {
    console.error('Error getting user kudos leaderboard:', error);
    throw error;
  }
};

export default {
  sendKudos,
  getUserKudosHistory,
  getUserKudosStats,
  getQuestKudosLeaderboard,
  getUserKudosLeaderboard
};