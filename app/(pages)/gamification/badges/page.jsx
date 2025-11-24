"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserBadgeProgress } from '@/lib/badgeService';
import { ArrowLeft, Award, Lock, CheckCircle, TrendingUp } from 'lucide-react';
import NavBar from '@/components/Nav';
import Footer from '@/components/phoneComponents/Footer';

const BadgesPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unlocked, locked

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        await loadBadges(currentUser.uid);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadBadges = async (uid) => {
    try {
      const badgeData = await getUserBadgeProgress(uid);
      setBadges(badgeData);
    } catch (error) {
      console.error('Error loading badges:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#EA6100] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const filteredBadges = badges.filter(badge => {
    if (filter === 'unlocked') return badge.isAchieved;
    if (filter === 'locked') return !badge.isAchieved;
    return true;
  });

  const achievedCount = badges.filter(b => b.isAchieved).length;
  const totalCount = badges.length;

  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="hidden lg:block">
        <NavBar user={user} onSignOut={() => auth.signOut()} />
      </div>

      <div className="lg:ml-[280px]">
        <div className="max-w-6xl mx-auto px-4 py-6 lg:px-8 pb-20 lg:pb-8">
          
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  <Award className="text-[#EA6100]" size={36} />
                  Badge Collection
                </h1>
                <p className="text-gray-400">
                  {achievedCount} of {totalCount} badges unlocked
                </p>
              </div>
              
              <div className="hidden lg:block bg-[#1a1a1a] rounded-full px-6 py-3">
                <div className="text-3xl font-bold text-[#EA6100]">
                  {Math.round((achievedCount / totalCount) * 100)}%
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-[#1a1a1a] rounded-2xl p-6 mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Overall Progress</span>
              <span>{achievedCount}/{totalCount}</span>
            </div>
            <div className="bg-[#292929] rounded-full h-4 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#EA6100] to-yellow-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(achievedCount / totalCount) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <FilterButton 
              active={filter === 'all'} 
              onClick={() => setFilter('all')}
              label="All Badges"
              count={totalCount}
            />
            <FilterButton 
              active={filter === 'unlocked'} 
              onClick={() => setFilter('unlocked')}
              label="Unlocked"
              count={achievedCount}
            />
            <FilterButton 
              active={filter === 'locked'} 
              onClick={() => setFilter('locked')}
              label="Locked"
              count={totalCount - achievedCount}
            />
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>

          {filteredBadges.length === 0 && (
            <div className="text-center py-16">
              <div className="text-gray-400 text-lg">No badges found</div>
            </div>
          )}
        </div>

        <div className="lg:hidden">
          <Footer />
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

const FilterButton = ({ active, onClick, label, count }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
      active 
        ? 'bg-[#EA6100] text-black'
        : 'bg-[#292929] text-gray-400 hover:bg-[#3a3a3a]'
    }`}
  >
    {label} ({count})
  </button>
);

const BadgeCard = ({ badge }) => {
  const isLocked = !badge.isAchieved;

  return (
    <div className={`bg-[#1a1a1a] rounded-2xl p-6 border-2 transition-all hover:scale-105 ${
      isLocked 
        ? 'border-gray-800 opacity-75' 
        : 'border-[#EA6100] shadow-lg shadow-[#EA6100]/20'
    }`}>
      
      {/* Badge Icon */}
      <div className="text-center mb-4">
        <div className={`text-7xl mb-3 ${isLocked ? 'opacity-30 grayscale' : ''}`}>
          {badge.icon}
        </div>
        
        {isLocked && (
          <div className="inline-flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full">
            <Lock size={14} className="text-gray-400" />
            <span className="text-gray-400 text-xs font-semibold">Locked</span>
          </div>
        )}
        
        {!isLocked && (
          <div className="inline-flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full">
            <CheckCircle size={14} className="text-green-500" />
            <span className="text-green-500 text-xs font-semibold">Unlocked</span>
          </div>
        )}
      </div>

      {/* Badge Info */}
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-white mb-2">{badge.name}</h3>
        <p className="text-gray-400 text-sm">{badge.description}</p>
      </div>

      {/* Progress Bar */}
      {isLocked && badge.progress > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Progress</span>
            <span>{badge.progressCount} / {badge.criteria}</span>
          </div>
          <div className="bg-[#292929] rounded-full h-2 overflow-hidden">
            <div 
              className="bg-[#EA6100] h-full rounded-full transition-all duration-500"
              style={{ width: `${badge.progress * 100}%` }}
            ></div>
          </div>
          <div className="text-center mt-2 text-xs text-gray-500">
            {Math.round(badge.progress * 100)}% Complete
          </div>
        </div>
      )}

      {/* Reward */}
      <div className={`text-center py-3 rounded-lg ${
        isLocked ? 'bg-[#292929]' : 'bg-[#EA6100]/10'
      }`}>
        <div className="text-sm text-gray-400 mb-1">Reward</div>
        <div className={`text-xl font-bold ${isLocked ? 'text-gray-400' : 'text-[#EA6100]'}`}>
          +30 QP
        </div>
      </div>

      {/* Achievement Date */}
      {!isLocked && badge.achievedOn && (
        <div className="mt-4 text-center text-xs text-gray-500">
          Unlocked {new Date(badge.achievedOn).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export default BadgesPage;