'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check, Users, Gift, TrendingUp } from 'lucide-react';
import { getUserReferralStats } from '@/lib/qpService';
import { useAuth } from '@/hooks/useAuth';

interface ReferralStats {
    referralCode: string;
    referralsCompleted: number;
    totalQPEarned: number;
}

export const ReferralSection = () => {
    const { user } = useAuth();
    const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadReferralStats = async () => {
            if (!user?.uid) return;

            try {
                const stats = await getUserReferralStats(user.uid);
                setReferralStats(stats);
            } catch (error) {
                console.error('Error loading referral stats:', error);
            } finally {
                setLoading(false);
            }
        };

        loadReferralStats();
    }, [user]);

    const handleCopyReferralLink = async () => {
        if (!referralStats?.referralCode) return;

        const referralUrl = `${window.location.origin}/?ref=${referralStats.referralCode}`;

        try {
            await navigator.clipboard.writeText(referralUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const handleCopyCode = async () => {
        if (!referralStats?.referralCode) return;

        try {
            await navigator.clipboard.writeText(referralStats.referralCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
                <div className="h-12 bg-gray-200 rounded mb-4"></div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl shadow-md p-6 border border-orange-100">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-[#EA6100] rounded-lg">
                    <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Invite Friends</h3>
                    <p className="text-sm text-gray-600">Earn QP together when they join!</p>
                </div>
            </div>

            {/* Rewards Info */}
            <div className="bg-white rounded-lg p-4 mb-4 border border-orange-200">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🎁</span>
                        <div>
                            <p className="font-semibold text-gray-900">You Get: <span className="text-[#EA6100]">+10 QP</span></p>
                            <p className="text-gray-600">They Get: <span className="text-[#EA6100]">+5 QP</span></p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500">Per successful referral</p>
                    </div>
                </div>
            </div>

            {/* Referral Code */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Referral Code
                </label>
                <div className="flex gap-2">
                    <div className="flex-1 bg-white border-2 border-[#EA6100] rounded-lg px-4 py-3 font-mono text-lg font-bold text-[#EA6100] text-center">
                        {referralStats?.referralCode || 'Loading...'}
                    </div>
                    <button
                        onClick={handleCopyCode}
                        className="px-4 py-3 bg-[#EA6100] text-white rounded-lg hover:bg-[#d45700] transition-colors flex items-center gap-2"
                    >
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                </div>
            </div>

            {/* Referral Link */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shareable Link
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        readOnly
                        value={referralStats?.referralCode ? `${window.location.origin}/?ref=${referralStats.referralCode}` : ''}
                        className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700"
                    />
                    <button
                        onClick={handleCopyReferralLink}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                        <span className="hidden sm:inline">Copy</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-[#EA6100]" />
                        <p className="text-xs font-medium text-gray-600">Successful Referrals</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {referralStats?.referralsCompleted || 0}
                    </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-[#EA6100]" />
                        <p className="text-xs font-medium text-gray-600">Total QP Earned</p>
                    </div>
                    <p className="text-2xl font-bold text-[#EA6100]">
                        {referralStats?.totalQPEarned || 0}
                    </p>
                </div>
            </div>

            {/* Progress to Badge */}
            {referralStats && referralStats.referralsCompleted < 5 && (
                <div className="mt-4 bg-white rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-700">
                            Community Champion Badge
                        </p>
                        <p className="text-xs text-gray-600">
                            {referralStats.referralsCompleted}/5
                        </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-[#EA6100] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(referralStats.referralsCompleted / 5) * 100}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                        Earn +30 QP by referring 5 friends!
                    </p>
                </div>
            )}
        </div>
    );
};

export default ReferralSection;
