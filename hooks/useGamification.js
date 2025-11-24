// hooks/useGamification.js
import { useState, useEffect } from 'react';
import { 
  getUserGamificationData, 
  calculateRankInfo,
  processDailyCheckIn,
  awardQuestSubmissionQPs,
  sendKudos,
  processReferralCompletion,
  checkForBadgeCompletion
} from '@/lib/qpService';

export const useGamification = (userId) => {
  const [gamificationData, setGamificationData] = useState(null);
  const [rankInfo, setRankInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getUserGamificationData(userId);
      setGamificationData(data);
      
      const info = calculateRankInfo(data);
      setRankInfo(info);
      
      setError(null);
    } catch (err) {
      console.error('Error loading gamification data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const refresh = () => {
    loadData();
  };

  const checkIn = async () => {
    try {
      const result = await processDailyCheckIn(userId);
      await loadData(); // Refresh data
      return result;
    } catch (err) {
      console.error('Error checking in:', err);
      throw err;
    }
  };

  const awardQuestQP = async (questId) => {
    try {
      const result = await awardQuestSubmissionQPs(userId, questId);
      await loadData(); // Refresh data
      return result;
    } catch (err) {
      console.error('Error awarding quest QP:', err);
      throw err;
    }
  };

  const giveKudos = async (recipientUid, questId = null) => {
    try {
      const result = await sendKudos(userId, recipientUid, questId);
      await loadData(); // Refresh data
      return result;
    } catch (err) {
      console.error('Error sending kudos:', err);
      throw err;
    }
  };

  return {
    gamificationData,
    rankInfo,
    loading,
    error,
    refresh,
    checkIn,
    awardQuestQP,
    giveKudos
  };
};

// Hook for checking daily check-in eligibility
export const useCheckInEligibility = (gamificationData) => {
  const [canCheckIn, setCanCheckIn] = useState(false);

  useEffect(() => {
    if (!gamificationData) {
      setCanCheckIn(false);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastCheckIn = gamificationData.streak?.lastCheckInDate?.toDate();
    
    if (!lastCheckIn) {
      setCanCheckIn(true);
      return;
    }

    const lastCheckInDate = new Date(lastCheckIn);
    lastCheckInDate.setHours(0, 0, 0, 0);

    setCanCheckIn(today.getTime() !== lastCheckInDate.getTime());
  }, [gamificationData]);

  return canCheckIn;
};

// Hook for streak status
export const useStreakStatus = (gamificationData) => {
  const [streakStatus, setStreakStatus] = useState({
    isAtRisk: false,
    hoursUntilBreak: 0,
    hasFreeze: false,
    currentDays: 0
  });

  useEffect(() => {
    if (!gamificationData?.streak) {
      return;
    }

    const lastCheckIn = gamificationData.streak.lastCheckInDate?.toDate();
    if (!lastCheckIn) {
      setStreakStatus({
        isAtRisk: false,
        hoursUntilBreak: 48,
        hasFreeze: gamificationData.streak.hasStreakFreeze || false,
        currentDays: 0
      });
      return;
    }

    const now = new Date();
    const hoursElapsed = (now - lastCheckIn) / (1000 * 60 * 60);
    const hoursUntilBreak = Math.max(0, 48 - hoursElapsed);
    const isAtRisk = hoursUntilBreak <= 12;

    setStreakStatus({
      isAtRisk,
      hoursUntilBreak,
      hasFreeze: gamificationData.streak.hasStreakFreeze || false,
      currentDays: gamificationData.streak.currentStreakDays || 0
    });
  }, [gamificationData]);

  return streakStatus;
};

// Hook for badge progress
export const useBadgeProgress = (gamificationData) => {
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    if (!gamificationData?.badgeStatus) {
      return;
    }

    const badgeList = Object.entries(gamificationData.badgeStatus).map(([id, status]) => ({
      id,
      ...status
    }));

    setBadges(badgeList);
  }, [gamificationData]);

  const getAchievedBadges = () => badges.filter(b => b.isAchieved);
  const getInProgressBadges = () => badges.filter(b => !b.isAchieved && b.progressCount > 0);
  const getLockedBadges = () => badges.filter(b => !b.isAchieved && !b.progressCount);

  return {
    badges,
    achievedBadges: getAchievedBadges(),
    inProgressBadges: getInProgressBadges(),
    lockedBadges: getLockedBadges()
  };
};