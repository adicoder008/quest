// lib/badgeService.js
import { db } from './firebase';
import { doc, updateDoc, getDoc, serverTimestamp, increment } from 'firebase/firestore';
import { getUserGamificationData, updateUserQPs, QP_VALUES } from './qpService';

// Badge definitions
export const BADGES = {
  FOODIE_ADVENTURER: {
    id: 'FOODIE_ADVENTURER',
    name: 'Foodie Adventurer',
    description: '50+ contributions related to local cuisine/restaurants in Quests',
    icon: '🍽️',
    color: '#F59E0B',
    criteria: 50,
    type: 'cuisine'
  },
  COASTAL_VOYAGER: {
    id: 'COASTAL_VOYAGER',
    name: 'Coastal Voyager',
    description: '5+ Quests focused on beach, island, or coastal destinations',
    icon: '🏖️',
    color: '#06B6D4',
    criteria: 5,
    type: 'coastal'
  },
  PEAK_CONQUEROR: {
    id: 'PEAK_CONQUEROR',
    name: 'Peak Conqueror',
    description: '5+ Quests focused on mountainous, high-altitude, or rugged terrain',
    icon: '⛰️',
    color: '#84CC16',
    criteria: 5,
    type: 'mountain'
  },
  CONSISTENCY_MASTER: {
    id: 'CONSISTENCY_MASTER',
    name: 'Consistency Master',
    description: '100-day streak OR three 30-day streaks',
    icon: '🔥',
    color: '#EF4444',
    criteria: 'auto',
    type: 'streak'
  },
  COMMUNITY_CHAMPION: {
    id: 'COMMUNITY_CHAMPION',
    name: 'Community Champion',
    description: 'Successfully refer 5 new users who completed their profile and first Quest',
    icon: '👥',
    color: '#8B5CF6',
    criteria: 5,
    type: 'referral'
  }
};

/**
 * Check and award badge if criteria met
 */
export const checkAndAwardBadge = async (uid, badgeId) => {
  try {
    const userData = await getUserGamificationData(uid);
    const badgeStatus = userData.badgeStatus[badgeId];
    
    if (!badgeStatus) {
      console.error(`Badge ${badgeId} not found`);
      return { awarded: false };
    }
    
    // Already achieved
    if (badgeStatus.isAchieved) {
      return { awarded: false, alreadyHas: true };
    }
    
    const badge = BADGES[badgeId];
    let criteriaMetboolean = false;
    
    // Check criteria based on badge type
    switch (badge.type) {
      case 'cuisine':
        criteriaMet = badgeStatus.progressCount >= badge.criteria;
        break;
      case 'coastal':
        criteriaMet = badgeStatus.progressCount >= badge.criteria;
        break;
      case 'mountain':
        criteriaMet = badgeStatus.progressCount >= badge.criteria;
        break;
      case 'streak':
        // Handled by streak service
        criteriaMet = false;
        break;
      case 'referral':
        criteriaMet = userData.referralsCompleted >= badge.criteria;
        break;
      default:
        criteriaMet = false;
    }
    
    if (criteriaMet) {
      const gamificationRef = doc(db, 'gamification', uid);
      
      // Award badge
      await updateDoc(gamificationRef, {
        [`badgeStatus.${badgeId}.isAchieved`]: true,
        [`badgeStatus.${badgeId}.achievedOn`]: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Award QP
      await updateUserQPs(uid, QP_VALUES.SPECIALTY_BADGE, 'QP_BADGE_EARNED', {
        badgeName: badgeId,
        badgeTitle: badge.name
      });
      
      console.log(`Badge ${badgeId} awarded to user ${uid}`);
      
      return {
        awarded: true,
        badge: badge,
        qpEarned: QP_VALUES.SPECIALTY_BADGE
      };
    }
    
    return { awarded: false };
  } catch (error) {
    console.error('Error checking badge:', error);
    throw error;
  }
};

/**
 * Update quest-related badge progress
 */
export const updateQuestBadgeProgress = async (uid, questData) => {
  try {
    const gamificationRef = doc(db, 'gamification', uid);
    const userData = await getUserGamificationData(uid);
    
    const updates = {};
    let badgesToCheck = [];
    
    // Check for cuisine-related content
    const hasCuisineContent = questData.tags?.some(tag => 
      ['food', 'cuisine', 'restaurant', 'dining', 'culinary'].includes(tag.toLowerCase())
    ) || questData.description?.toLowerCase().includes('food') ||
       questData.description?.toLowerCase().includes('restaurant');
    
    if (hasCuisineContent) {
      updates['badgeStatus.FOODIE_ADVENTURER.progressCount'] = increment(1);
      badgesToCheck.push('FOODIE_ADVENTURER');
    }
    
    // Check for coastal destinations
    const isCoastal = questData.tags?.some(tag => 
      ['beach', 'island', 'coastal', 'ocean', 'sea'].includes(tag.toLowerCase())
    ) || questData.destination?.toLowerCase().includes('beach') ||
       questData.destination?.toLowerCase().includes('island') ||
       questData.destination?.toLowerCase().includes('coast');
    
    if (isCoastal) {
      updates['badgeStatus.COASTAL_VOYAGER.progressCount'] = increment(1);
      badgesToCheck.push('COASTAL_VOYAGER');
    }
    
    // Check for mountainous destinations
    const isMountain = questData.tags?.some(tag => 
      ['mountain', 'peak', 'hiking', 'trekking', 'summit'].includes(tag.toLowerCase())
    ) || questData.destination?.toLowerCase().includes('mountain') ||
       questData.destination?.toLowerCase().includes('peak') ||
       questData.destination?.toLowerCase().includes('hill');
    
    if (isMountain) {
      updates['badgeStatus.PEAK_CONQUEROR.progressCount'] = increment(1);
      badgesToCheck.push('PEAK_CONQUEROR');
    }
    
    // Update progress
    if (Object.keys(updates).length > 0) {
      updates.updatedAt = serverTimestamp();
      await updateDoc(gamificationRef, updates);
      
      // Check if any badges are now complete
      for (const badgeId of badgesToCheck) {
        await checkAndAwardBadge(uid, badgeId);
      }
    }
    
    return { updated: Object.keys(updates).length > 0, badgesChecked: badgesToCheck };
  } catch (error) {
    console.error('Error updating quest badge progress:', error);
    throw error;
  }
};

/**
 * Track referral completion
 */
export const trackReferralCompletion = async (uid) => {
  try {
    const gamificationRef = doc(db, 'gamification', uid);
    
    await updateDoc(gamificationRef, {
      referralsCompleted: increment(1),
      updatedAt: serverTimestamp()
    });
    
    // Check for Community Champion badge
    await checkAndAwardBadge(uid, 'COMMUNITY_CHAMPION');
    
    return { success: true };
  } catch (error) {
    console.error('Error tracking referral:', error);
    throw error;
  }
};

/**
 * Get user's badge progress
 */
export const getUserBadgeProgress = async (uid) => {
  try {
    const userData = await getUserGamificationData(uid);
    const badgeProgress = [];
    
    for (const [badgeId, badgeInfo] of Object.entries(BADGES)) {
      const status = userData.badgeStatus[badgeId];
      const badge = {
        ...badgeInfo,
        isAchieved: status?.isAchieved || false,
        achievedOn: status?.achievedOn?.toDate ? status.achievedOn.toDate() : null,
        progress: 0,
        progressCount: status?.progressCount || 0
      };
      
      // Calculate progress percentage
      if (!badge.isAchieved) {
        switch (badge.type) {
          case 'cuisine':
          case 'coastal':
          case 'mountain':
            badge.progress = Math.min((status?.progressCount || 0) / badge.criteria, 1);
            break;
          case 'referral':
            badge.progress = Math.min((userData.referralsCompleted || 0) / badge.criteria, 1);
            badge.progressCount = userData.referralsCompleted || 0;
            break;
          case 'streak':
            const hasHundredDay = (userData.streak?.longestStreak || 0) >= 100;
            const threeThirtyDay = (userData.streak?.threeThirtyDayStreaks || 0) >= 3;
            if (hasHundredDay) {
              badge.progress = 1;
            } else {
              badge.progress = Math.min((userData.streak?.threeThirtyDayStreaks || 0) / 3, 1);
            }
            badge.progressCount = userData.streak?.threeThirtyDayStreaks || 0;
            break;
        }
      } else {
        badge.progress = 1;
      }
      
      badgeProgress.push(badge);
    }
    
    return badgeProgress;
  } catch (error) {
    console.error('Error getting badge progress:', error);
    throw error;
  }
};

export default {
  checkAndAwardBadge,
  updateQuestBadgeProgress,
  trackReferralCompletion,
  getUserBadgeProgress,
  BADGES
};