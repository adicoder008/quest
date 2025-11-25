'use client';

import { ToastContainer } from '@/hooks/use-toast';
import { DailyCheckInHandler } from './DailyCheckInHandler';
import { useToast } from '@/hooks/use-toast';

export const GamificationProvider = ({ children }: { children: React.ReactNode }) => {
    const { toasts, removeToast } = useToast();

    return (
        <>
            {children}
            <DailyCheckInHandler />
            <ToastContainer toasts={toasts} onClose={removeToast} />
        </>
    );
};
