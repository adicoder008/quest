'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useDailyCheckIn } from '@/hooks/useDailyCheckIn';

export const DailyCheckInHandler = () => {
    const { user, loading: authLoading } = useAuth();
    const { showToast } = useToast();
    const { hasCheckedToday, doCheckIn } = useDailyCheckIn();
    const [hasAttemptedCheckIn, setHasAttemptedCheckIn] = useState(false);

    useEffect(() => {
        const handleAutoCheckIn = async () => {
            // Wait for auth to load
            if (authLoading) return;

            // User must be authenticated
            if (!user?.uid) return;

            // Only check in once per session
            if (hasAttemptedCheckIn) return;

            // Don't check in if already done today
            if (hasCheckedToday) return;

            // Mark as attempted to prevent duplicates
            setHasAttemptedCheckIn(true);

            // Small delay to ensure app is ready
            setTimeout(async () => {
                try {
                    const result = await doCheckIn();

                    if (result && result.success) {
                        // Show stylish QP toast
                        const message = result.milestoneReached
                            ? `🔥 ${result.streakDays} day streak! +${(result.qpAwarded ?? 0) + result.milestoneReached.bonus} QP`
                            : `+${result.qpAwarded ?? 0} QP for daily login`;

                        showToast(message, 'qp');

                        // Show additional info for milestone
                        if (result.milestoneReached) {
                            setTimeout(() => {
                                if (result.milestoneReached) {
                                    showToast(
                                        `Milestone bonus: +${result.milestoneReached.bonus} QP! 🎉`,
                                        'success'
                                    );
                                }
                            }, 1500);
                        }
                    } else if (result && result.streakBroken) {
                        showToast('Streak broken! Starting fresh today.', 'info');
                    }
                } catch (error) {
                    console.error('Auto check-in error:', error);
                }
            }, 1000);
        };

        handleAutoCheckIn();
    }, [user, authLoading, hasCheckedToday, hasAttemptedCheckIn, doCheckIn, showToast]);

    // This is a logic-only component, renders nothing
    return null;
};
