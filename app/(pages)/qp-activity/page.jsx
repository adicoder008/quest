"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getQPHistory } from '@/lib/qpService';
import { 
  TrendingUp, 
  TrendingDown, 
  Award,
  Users,
  Clock,
  Zap,
  Gift,
  Target,
  Star,
  Flame
} from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const QPActivityPage = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('history'); // history, leaderboard
  const [qpHistory, setQpHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'history') {
        const history = await getQPHistory(userId, 50);
        setQpHistory(history);
      } else {
        await loadLeaderboard();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const gamificationRef = collection(db, 'gamification');
      const q = query(
        gamificationRef,
        orderBy('totalQPs', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      const leaders = snapshot.docs.map((doc, index) => ({
        id: doc.id,
        rank: index + 1,
        ...doc.data()
      }));
      
      setLeaderboard(leaders);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const getEventIcon = (eventType) => {
    const iconMap = {
      'QP_PROFILE_COMPLETE': <Star className="text-blue-400" size={20} />,
      'QP_QUEST_SUBMIT': <Target className="text-[#EA6100]" size={20} />,
      'QP_DAILY_CHECKIN': <Clock className="text-green-400" size={20} />,
      'QP_DAILY_GAME_WIN': <Zap className="text-yellow-400" size={20} />,
      'QP_STREAK_BONUS': <Flame className="text-orange-400" size={20} />,
      'QP_BADGE_EARNED': <Award className="text-purple-400" size={20} />,
      'QP_REFERRAL_SUCCESS': <Users className="text-pink-400" size={20} />,
      'KUDOS_SENT': <Gift className="text-red-400" size={20} />,
      'STREAK_BUYBACK': <TrendingDown className="text-gray-400" size={20} />
    };
    
    return iconMap[eventType] || <Zap className="text-gray-400" size={20} />;
  };

  const getEventLabel = (eventType) => {
    const labelMap = {
      'QP_PROFILE_COMPLETE': 'Profile Completed',
      'QP_QUEST_SUBMIT': 'Quest Published',
      'QP_DAILY_CHECKIN': 'Daily Check-in',
      'QP_DAILY_GAME_WIN': 'Daily Game Won',
      'QP_STREAK_BONUS': 'Streak Milestone',
      'QP_BADGE_EARNED': 'Badge Earned',
      'QP_REFERRAL_SUCCESS': 'Referral Success',
      'QP_REFERRED_BONUS': 'Referral Bonus',
      'KUDOS_SENT': 'Kudos Sent',
      'STREAK_BUYBACK': 'Streak Restored'
    };
    
    return labelMap[eventType] || eventType;
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-20">
      {/* Header */}
      <div className="px-5 py-8">
        <h1 className="text-3xl font-black bg-gradient-to-r from-[#EA6100] to-[#FF8C42] bg-clip-text text-transparent mb-6">
          QP Activity
        </h1>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-[#EA6100] to-[#FF8C42] text-black'
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            Your History
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-gradient-to-r from-[#EA6100] to-[#FF8C42] text-black'
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            Leaderboard
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-5">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#EA6100] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTab === 'history' ? (
          <div className="space-y-3">
            {qpHistory.length === 0 ? (
              <div className="text-center py-20">
                <Zap className="mx-auto text-gray-600 mb-4" size={48} />
                <p className="text-gray-500">No activity yet</p>
                <p className="text-gray-600 text-sm mt-2">
                  Start earning QPs by completing quests!
                </p>
              </div>
            ) : (
              qpHistory.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border border-gray-800 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                        {getEventIcon(entry.eventType)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white">
                          {getEventLabel(entry.eventType)}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {formatTimeAgo(entry.timestamp)}
                        </p>
                      </div>
                    </div>
                    
                    <div className={`text-lg font-bold ${
                      entry.amount >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {entry.amount >= 0 ? '+' : ''}{entry.amount} QP
                    </div>
                  </div>

                  {/* Metadata */}
                  {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-800">
                      <div className="flex flex-wrap gap-2">
                        {entry.metadata.milestone && (
                          <div className="px-2 py-1 bg-[#EA6100]/20 text-[#EA6100] text-xs rounded-full">
                            {entry.metadata.milestone}-day milestone
                          </div>
                        )}
                        {entry.metadata.badgeId && (
                          <div className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                            Badge unlocked
                          </div>
                        )}
                        {entry.metadata.tierBonus > 0 && (
                          <div className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                            +{entry.metadata.tierBonus} tier bonus
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.length === 0 ? (
              <div className="text-center py-20">
                <Users className="mx-auto text-gray-600 mb-4" size={48} />
                <p className="text-gray-500">No leaderboard data</p>
              </div>
            ) : (
              leaderboard.map((leader, index) => {
                const isCurrentUser = leader.userId === userId;
                const medalEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;
                
                return (
                  <motion.div
                    key={leader.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-xl p-4 border-2 ${
                      isCurrentUser
                        ? 'border-[#EA6100]'
                        : 'border-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl ${
                        index < 3
                          ? 'bg-gradient-to-br from-[#EA6100] to-[#FF8C42] text-white'
                          : 'bg-gray-800 text-gray-400'
                      }`}>
                        {medalEmoji || leader.rank}
                      </div>

                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white">
                            User #{leader.userId.slice(0, 8)}
                          </h4>
                          {isCurrentUser && (
                            <span className="px-2 py-1 bg-[#EA6100] text-black text-xs font-bold rounded-full">
                              YOU
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">
                          {leader.rankTitle || 'Novice'} • {leader.publishedQuests} Quests
                        </p>
                      </div>

                      {/* QP Score */}
                      <div className="text-right">
                        <div className="text-2xl font-black bg-gradient-to-r from-[#EA6100] to-[#FF8C42] bg-clip-text text-transparent">
                          {leader.totalQPs}
                        </div>
                        <p className="text-xs text-gray-500">QPs</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QPActivityPage;