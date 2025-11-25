// lib/dailyCheckInService.js
import { doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { processDailyCheckIn } from './qpService';

/**
 * Check if user has checked in today
 * @param {string} uid - User ID
 * @returns {Promise<boolean>} - True if already checked in today
 */
export const hasCheckedInToday = async (uid) => {
    try {
        const gamificationRef = doc(db, 'gamification', uid);
        const gamificationDoc = await getDoc(gamificationRef);

        if (!gamificationDoc.exists()) {
            return false;
        }

        const userData = gamificationDoc.data();
        const lastCheckIn = userData.streak?.lastCheckInDate?.toDate();

        if (!lastCheckIn) {
            return false;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastCheckInDate = new Date(lastCheckIn);
        lastCheckInDate.setHours(0, 0, 0, 0);

        return today.getTime() === lastCheckInDate.getTime();
    } catch (error) {
        console.error('Error checking daily check-in status:', error);
        return false;
    }
};

/**
 * Perform daily check-in and award QP
 * @param {string} uid - User ID
 * @returns {Promise<object>} - Check-in result with status and rewards
 */
export const performDailyCheckIn = async (uid) => {
    try {
        // Check if already checked in
        const alreadyCheckedIn = await hasCheckedInToday(uid);

        if (alreadyCheckedIn) {
            return {
                success: false,
                alreadyCheckedIn: true,
                message: 'Already checked in today'
            };
        }

        // Process check-in using existing qpService function
        const result = await processDailyCheckIn(uid);

        // Format result for toast display
        return {
            success: result.success,
            alreadyCheckedIn: false,
            qpAwarded: 1, // Base QP for check-in
            streakDays: result.streakDays || 0,
            streakBroken: result.streakBroken || false,
            freezeUsed: result.freezeUsed || false,
            milestoneReached: result.milestoneReached || null,
            message: result.message || 'Daily check-in complete!'
        };
    } catch (error) {
        console.error('Error performing daily check-in:', error);
        return {
            success: false,
            error: error.message || 'Failed to process check-in'
        };
    }
};

/**
 * Get user's current streak info
 * @param {string} uid - User ID
 * @returns {Promise<object>} - Streak information
 */
export const getUserStreakInfo = async (uid) => {
    try {
        const gamificationRef = doc(db, 'gamification', uid);
        const gamificationDoc = await getDoc(gamificationRef);

        if (!gamificationDoc.exists()) {
            return {
                currentStreakDays: 0,
                hasStreakFreeze: false,
                lastCheckInDate: null
            };
        }

        const userData = gamificationDoc.data();
        return {
            currentStreakDays: userData.streak?.currentStreakDays || 0,
            hasStreakFreeze: userData.streak?.hasStreakFreeze || false,
            lastCheckInDate: userData.streak?.lastCheckInDate?.toDate() || null
        };
    } catch (error) {
        console.error('Error getting streak info:', error);
        throw error;
    }
};
