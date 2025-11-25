// lib/streakService.js
import { db } from './firebase';
import { doc, updateDoc, getDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { getGamificationData, updateUserQPs, QP_VALUES, STREAK_BUYBACK_COSTS } from './qpService';

/**
 * Process daily check-in
 */
export const processDailyCheckIn = async (uid) => {
  try {
    const userData = await getGamificationData(uid);
    const gamificationRef = doc(db, 'gamification', uid);
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Get last check-in date
    let lastCheckInDate = null;
    if (userData.streak.lastCheckInDate) {
      const timestamp = userData.streak.lastCheckInDate.toDate ? 
        userData.streak.lastCheckInDate.toDate() : 
        new Date(userData.streak.lastCheckInDate.seconds * 1000);
      lastCheckInDate = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate());
    }
    
    // Check if already checked in today
    if (lastCheckInDate && lastCheckInDate.getTime() === today.getTime()) {
      return {
        success: false,
        message: 'Already checked in today',
        streak: userData.streak.currentStreakDays
      };
    }
    
    // Calculate time difference
    const timeDelta = lastCheckInDate ? (today - lastCheckInDate) / (1000 * 60 * 60) : 999;
    
    let newStreakDays = userData.streak.currentStreakDays;
    let streakBroken = false;
    let freezeUsed = false;
    
    // Check if streak is broken
    if (timeDelta > 48) {
      if (userData.streak.hasStreakFreeze) {
        // Use streak freeze automatically
        freezeUsed = true;
        await updateDoc(gamificationRef, {
          'streak.hasStreakFreeze': false,
          updatedAt: serverTimestamp()
        });
      } else {
        // Hard break - reset streak
        streakBroken = true;
        newStreakDays = 0;
      }
    }
    
    // Increment streak if not broken
    if (!streakBroken) {
      newStreakDays += 1;
    }
    
    // Update streak data
    await updateDoc(gamificationRef, {
      'streak.currentStreakDays': newStreakDays,
      'streak.lastCheckInDate': serverTimestamp(),
      'streak.longestStreak': Math.max(newStreakDays, userData.streak.longestStreak || 0),
      updatedAt: serverTimestamp()
    });
    
    // Award 1 QP for check-in
    await updateUserQPs(uid, QP_VALUES.DAILY_CHECKIN, 'QP_DAILY_CHECKIN', {
      streakDays: newStreakDays,
      freezeUsed
    });
    
    // Check for milestone bonuses
    const milestoneRewards = await checkStreakMilestones(uid, newStreakDays, userData.streak.milestonesClaimed);
    
    // Check for streak freeze unlock/reactivation
    if (newStreakDays >= 14 && !userData.streak.hasStreakFreeze) {
      await updateDoc(gamificationRef, {
        'streak.hasStreakFreeze': true,
        updatedAt: serverTimestamp()
      });
    }
    
    // Track 30-day streaks for Consistency Master badge
    if (newStreakDays === 30) {
      await updateDoc(gamificationRef, {
        'streak.threeThirtyDayStreaks': (userData.streak.threeThirtyDayStreaks || 0) + 1,
        updatedAt: serverTimestamp()
      });
      
      // Check for Consistency Master badge
      await checkConsistencyMasterBadge(uid);
    }
    
    return {
      success: true,
      streak: newStreakDays,
      milestoneRewards,
      freezeUsed,
      streakBroken,
      qpEarned: QP_VALUES.DAILY_CHECKIN + (milestoneRewards.reduce((sum, r) => sum + r.qp, 0))
    };
  } catch (error) {
    console.error('Error processing daily check-in:', error);
    throw error;
  }
};

/**
 * Check and award streak milestone bonuses
 */
const checkStreakMilestones = async (uid, currentStreak, milestonesClaimed = []) => {
  const milestones = [
    { days: 7, qp: QP_VALUES.STREAK_7_DAY },
    { days: 14, qp: QP_VALUES.STREAK_14_DAY },
    { days: 30, qp: QP_VALUES.STREAK_30_DAY },
    { days: 100, qp: QP_VALUES.STREAK_100_DAY }
  ];
  
  const rewards = [];
  const gamificationRef = doc(db, 'gamification', uid);
  
  for (const milestone of milestones) {
    if (currentStreak >= milestone.days && !milestonesClaimed.includes(milestone.days)) {
      await updateUserQPs(uid, milestone.qp, 'QP_STREAK_BONUS', {
        milestone: milestone.days
      });
      
      await updateDoc(gamificationRef, {
        'streak.milestonesClaimed': arrayUnion(milestone.days),
        updatedAt: serverTimestamp()
      });
      
      rewards.push({
        days: milestone.days,
        qp: milestone.qp
      });
    }
  }
  
  return rewards;
};

/**
 * Buy back a broken streak
 */
export const buybackStreak = async (uid, streakLength) => {
  try {
    const userData = await getGamificationData(uid);
    
    // Determine cost based on streak length
    let cost;
    if (streakLength <= 7) cost = STREAK_BUYBACK_COSTS['0-7'];
    else if (streakLength <= 14) cost = STREAK_BUYBACK_COSTS['7-14'];
    else if (streakLength <= 30) cost = STREAK_BUYBACK_COSTS['14-30'];
    else if (streakLength <= 100) cost = STREAK_BUYBACK_COSTS['30-100'];
    else cost = STREAK_BUYBACK_COSTS['100+'];
    
    // Check if user has enough QPs
    if (userData.totalQPs < cost) {
      throw new Error('Insufficient QPs for buyback');
    }
    
    // Deduct QPs
    await updateUserQPs(uid, -cost, 'STREAK_BUYBACK', {
      streakLength,
      cost
    });
    
    // Restore streak
    const gamificationRef = doc(db, 'gamification', uid);
    await updateDoc(gamificationRef, {
      'streak.currentStreakDays': streakLength,
      'streak.lastCheckInDate': serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      cost,
      restoredStreak: streakLength
    };
  } catch (error) {
    console.error('Error buying back streak:', error);
    throw error;
  }
};

/**
 * Complete daily engagement game
 */
export const completeDailyGame = async (uid) => {
  try {
    const userData = await getGamificationData(uid);
    const gamificationRef = doc(db, 'gamification', uid);
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // Check if already completed today
    const lastGameDate = userData.lastDailyGameDate?.toDate ? 
      new Date(
        userData.lastDailyGameDate.toDate().getFullYear(),
        userData.lastDailyGameDate.toDate().getMonth(),
        userData.lastDailyGameDate.toDate().getDate()
      ).getTime() :
      null;
    
    if (lastGameDate === today) {
      return {
        success: false,
        message: 'Daily game already completed today'
      };
    }
    
    // Award QP
    await updateUserQPs(uid, QP_VALUES.DAILY_GAME_WIN, 'QP_DAILY_GAME_WIN');
    
    // Update last game date
    await updateDoc(gamificationRef, {
      lastDailyGameDate: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      qpEarned: QP_VALUES.DAILY_GAME_WIN
    };
  } catch (error) {
    console.error('Error completing daily game:', error);
    throw error;
  }
};

/**
 * Check for Consistency Master badge
 */
const checkConsistencyMasterBadge = async (uid) => {
  try {
    const userData = await getGamificationData(uid);
    const gamificationRef = doc(db, 'gamification', uid);
    
    // Check if already achieved
    if (userData.badgeStatus.CONSISTENCY_MASTER.isAchieved) {
      return;
    }
    
    // Check criteria: 100-day streak OR three 30-day streaks
    const hasHundredDayStreak = userData.streak.longestStreak >= 100;
    const hasThreeThirtyDay = (userData.streak.threeThirtyDayStreaks || 0) >= 3;
    
    if (hasHundredDayStreak || hasThreeThirtyDay) {
      await updateDoc(gamificationRef, {
        'badgeStatus.CONSISTENCY_MASTER.isAchieved': true,
        'badgeStatus.CONSISTENCY_MASTER.achievedOn': serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Award badge QP
      await updateUserQPs(uid, QP_VALUES.SPECIALTY_BADGE, 'QP_BADGE_EARNED', {
        badgeName: 'CONSISTENCY_MASTER'
      });
      
      console.log(`Consistency Master badge awarded to user ${uid}`);
    }
  } catch (error) {
    console.error('Error checking Consistency Master badge:', error);
  }
};

/**
 * Get streak buyback cost for a given streak length
 */
export const getStreakBuybackCost = (streakLength) => {
  if (streakLength <= 7) return STREAK_BUYBACK_COSTS['0-7'];
  if (streakLength <= 14) return STREAK_BUYBACK_COSTS['7-14'];
  if (streakLength <= 30) return STREAK_BUYBACK_COSTS['14-30'];
  if (streakLength <= 100) return STREAK_BUYBACK_COSTS['30-100'];
  return STREAK_BUYBACK_COSTS['100+'];
};

export default {
  processDailyCheckIn,
  buybackStreak,
  completeDailyGame,
  getStreakBuybackCost
};