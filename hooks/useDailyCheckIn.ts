'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { performDailyCheckIn, hasCheckedInToday } from '@/lib/dailyCheckInService';

interface CheckInResult {
    success: boolean;
    alreadyCheckedIn?: boolean;
    qpAwarded?: number;
    streakDays?: number;
    streakBroken?: boolean;
    freezeUsed?: boolean;
    milestoneReached?: { milestone: number; bonus: number } | null;
    message?: string;
    error?: string;
}

export const useDailyCheckIn = () => {
    const { user } = useAuth();
    const [checkInResult, setCheckInResult] = useState<CheckInResult | null>(null);
    const [isChecking, setIsChecking] = useState(false);
    const [hasCheckedToday, setHasCheckedToday] = useState(false);

    // Check if user has already checked in today
    useEffect(() => {
        const checkStatus = async () => {
            if (!user?.uid) return;

            try {
                const alreadyChecked = await hasCheckedInToday(user.uid);
                setHasCheckedToday(alreadyChecked);
            } catch (error) {
                console.error('Error checking check-in status:', error);
            }
        };

        checkStatus();
    }, [user]);

    // Perform check-in
    const doCheckIn = useCallback(async (): Promise<CheckInResult> => {
        if (!user?.uid || isChecking || hasCheckedToday) {
            return {
                success: false,
                alreadyCheckedIn: hasCheckedToday,
                message: 'Already checked in'
            };
        }

        setIsChecking(true);

        try {
            const result = await performDailyCheckIn(user.uid) as CheckInResult;
            setCheckInResult(result);

            if (result.success) {
                setHasCheckedToday(true);
            }

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to check in';
            console.error('Error performing check-in:', error);
            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setIsChecking(false);
        }
    }, [user, isChecking, hasCheckedToday]);

    return {
        checkInResult,
        isChecking,
        hasCheckedToday,
        doCheckIn
    };
};
