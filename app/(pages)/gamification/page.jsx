"use client";

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  getUserGamificationData,
  calculateRankInfo,
  RANK_THRESHOLDS,
  SPECIALTY_BADGES as BADGES,
  STREAK_MILESTONES,
} from '@/lib/qpService';
import { getCurrentUserData } from '@/lib/authService';
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Flame,
  Shield,
  Trophy,
  XCircle,
  Clock,
  ArrowLeft,
  Zap,
  Crown,
  TrendingUp,
  Users,
  Star,
  Eye,
  Map,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/LeftSideNav';
import Footer from '@/components/phoneComponents/Footer';
import useResponsive from '@/hooks/useResponsive';

const DESKTOP_MAIN_WIDTH = 50;
const LEFT_NAV_WIDTH = 300;
const SIDEBAR_GAP = 5;

const DesktopGamification = ({ user, userData, gamificationData, rankInfo, onSignOut }) => {
  const router = useRouter();

  const totalGroupWidthExpression = `${LEFT_NAV_WIDTH}px + ${SIDEBAR_GAP}px + ${DESKTOP_MAIN_WIDTH}vw`;
  const containerStartExpression = `calc((100vw - (${totalGroupWidthExpression})) / 2)`;

  const navLeftStyle = {
    left: containerStartExpression,
    right: 'auto',
    width: `${LEFT_NAV_WIDTH}px`
  };

  const mainLeftExpression = `calc(${containerStartExpression} + ${LEFT_NAV_WIDTH}px + ${SIDEBAR_GAP}px)`;

  const mainWidthStyle = {
    width: `${DESKTOP_MAIN_WIDTH}vw`,
    marginLeft: mainLeftExpression,
    marginRight: 'auto',
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      <NavBar
        user={user}
        onSignOut={onSignOut}
        style={navLeftStyle}
      />

      <main className="relative min-h-screen pl-2 bg-black pb-8" style={mainWidthStyle}>
        <div className='px-4 pt-8 pb-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-4xl font-bold text-white'>
                Quest <span className='text-[#EA6100]'>Hub</span>
              </h1>
              <p className='text-gray-400 text-lg mt-2'>
                Track your progress, climb the ranks, and become a legend.
              </p>
            </div>
            <button
              onClick={() => router.push('/account')}
              className='text-gray-400 hover:text-[#EA6100] transition-colors flex items-center gap-2'
            >
              <span>Back to Profile</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className='space-y-8'>
          {/* Row 1: Profile and Streak side-by-side */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <ProfileRankCard userData={userData} rankInfo={rankInfo} gamificationData={gamificationData} />
            <StreakCard streak={gamificationData.streak} />
          </div>

          {/* Row 2: Next Rank */}
          <div>
            <NextRankCard rankInfo={rankInfo} badgeStatus={gamificationData.badgeStatus} />
          </div>

          {/* Row 3: Badges */}
          <div>
            <BadgesCard badgeStatus={gamificationData.badgeStatus} />
          </div>
        </div>
      </main>
    </div>
  );
};

const MobileGamification = ({ user, userData, gamificationData, rankInfo }) => {
  const router = useRouter();
  const [activeView, setActiveView] = useState('overview');

  return (
    <div className='min-h-screen bg-black text-white pb-20'>
      {/* Mobile Header */}
      <div className='sticky top-0 z-10 bg-black border-b border-gray-800 p-4'>
        <div className='flex items-center gap-4'>
          <button
            onClick={() => router.back()}
            className='text-gray-400 hover:text-[#EA6100] transition-colors'
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className='text-xl font-bold text-white'>Quest Hub</h1>
            <p className='text-gray-400 text-sm'>Level up your journey</p>
          </div>
        </div>
      </div>

      {/* Mobile View Toggle */}
      <div className='px-4 border-b border-gray-800'>
        <div className='flex gap-4 overflow-x-auto scrollbar-hide py-2'>
          {[
            { id: 'overview', label: 'Overview', icon: Trophy },
            { id: 'badges', label: 'Badges', icon: Award },
            { id: 'leaderboard', label: 'Top Players', icon: TrendingUp },
            { id: 'activity', label: 'Activity', icon: Clock },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex items-center gap-2 py-2 px-3 rounded-lg font-medium whitespace-nowrap transition-colors ${activeView === item.id
                ? 'bg-[#EA6100] text-black'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className='p-4 space-y-6'>
        {activeView === 'overview' && (
          <>
            <ProfileRankCard userData={userData} rankInfo={rankInfo} gamificationData={gamificationData} />
            <StreakCard streak={gamificationData.streak} />
            <NextRankCard rankInfo={rankInfo} badgeStatus={gamificationData.badgeStatus} />
          </>
        )}

        {activeView === 'badges' && (
          <BadgesCard badgeStatus={gamificationData.badgeStatus} />
        )}
      </div>

      <Footer />
    </div>
  );
};

const GamificationHub = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [gamificationData, setGamificationData] = useState(null);
  const [rankInfo, setRankInfo] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);

  const isDesktop = useResponsive(1024);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          setLoading(true);
          console.log('Fetching gamification data for user:', currentUser.uid);

          const [mainData, gData] = await Promise.all([
            getCurrentUserData(),
            getUserGamificationData(currentUser.uid),
          ]);

          console.log('gData object:', gData); // <-- 🎯 ADD THIS LINE
          console.log('Total QPs in gData:', gData ? gData.totalQPs : 'N/A'); // <-- 🎯 ADD THIS LINE

          console.log('Data fetched successfully:', {
            mainData: !!mainData,
            gData: !!gData
          });

          setUserData(mainData);
          setGamificationData(gData);
          setRankInfo(calculateRankInfo(gData));
          setLeaderboard([]);
          setActivityLog([]);
        } catch (error) {
          console.error('Error fetching gamification hub data:', error);
          setGamificationData(null);
          setRankInfo(null);
          setUserData(null);
        } finally {
          setLoading(false);
        }
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-[#EA6100] border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-400'>Loading your quest progress...</p>
        </div>
      </div>
    );
  }

  if (!gamificationData || !rankInfo || !userData) {
    return (
      <div className='min-h-screen bg-black text-white flex items-center justify-center p-4'>
        <div className='text-center max-w-md'>
          <XCircle size={48} className='text-red-500 mx-auto mb-4' />
          <h2 className='text-xl font-bold mb-2'>Couldn't Load Your Stats</h2>
          <p className='text-gray-400 mb-6'>We're having trouble loading your gamification data.</p>
          <div className='flex gap-3 justify-center'>
            <button
              onClick={() => window.location.reload()}
              className='bg-[#EA6100] hover:bg-[#ff7b2d] text-black px-6 py-2 rounded-lg font-medium transition-colors'
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/account')}
              className='bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors'
            >
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isDesktop) {
    return (
      <DesktopGamification
        user={user}
        userData={userData}
        gamificationData={gamificationData}
        rankInfo={rankInfo}
        onSignOut={() => { }}
      />
    );
  }

  return (
    <MobileGamification
      user={user}
      userData={userData}
      gamificationData={gamificationData}
      rankInfo={rankInfo}
    />
  );
};

// Sub-components
const ProfileRankCard = ({ userData, rankInfo, gamificationData }) => (
  <div className='bg-gray-900 rounded-2xl p-6 border border-gray-800 h-full transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:border-gray-700'>
    <div className='flex items-center gap-4'>
      <img
        src={userData.photoURL || '/default-avatar.png'}
        alt='Profile'
        className='w-16 h-16 lg:w-20 lg:h-20 rounded-full border-2 border-[#EA6100] object-cover'
      />
      <div className='flex-1'>
        <h2 className='text-xl lg:text-2xl font-bold text-white'>{userData.displayName}</h2>
        <p className='text-[#EA6100] font-semibold text-lg'>{gamificationData.rankTitle}</p>
        <div className='flex items-center gap-2 mt-2 bg-gray-800 rounded-full px-3 py-1.5 w-fit'>
          <Award size={16} className='text-[#EA6100]' />
          <span className='font-bold text-white'>{gamificationData.totalQPs.toLocaleString()} QP</span>
        </div>
      </div>
    </div>
  </div>
);

const StreakCard = ({ streak }) => {
  const { currentStreakDays, hasStreakFreeze, milestonesClaimed } = streak;

  let nextMilestone = null;
  const sortedMilestones = Object.keys(STREAK_MILESTONES)
    .map(Number)
    .sort((a, b) => a - b);

  for (const ms of sortedMilestones) {
    if (!milestonesClaimed.includes(ms)) {
      nextMilestone = ms;
      break;
    }
  }

  return (
    <div className='bg-gradient-to-br from-[#EA6100] to-[#ff9a50] rounded-2xl p-6 text-black h-full transition-all duration-300 hover:scale-[1.01] hover:shadow-xl'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-xl font-bold text-black'>Daily Streak</h3>
        {hasStreakFreeze && (
          <div className='flex items-center gap-1 bg-black/20 rounded-full px-3 py-1 text-white text-xs font-medium'>
            <Shield size={14} />
            <span>Freeze Active</span>
          </div>
        )}
      </div>

      <div className='flex items-center gap-4'>
        <Flame className='w-12 h-12 lg:w-16 lg:h-16' />
        <div>
          <div className='flex items-baseline gap-2'>
            <span className='text-4xl lg:text-5xl font-bold'>{currentStreakDays}</span>
            <span className='text-lg font-medium'>days</span>
          </div>
          {nextMilestone ? (
            <p className='text-black/80 text-sm mt-2'>
              <span className='font-semibold'>{STREAK_MILESTONES[nextMilestone].qp} QP</span> at {nextMilestone} days
            </p>
          ) : (
            <p className='text-black/80 text-sm mt-2'>All bonuses claimed! 🎉</p>
          )}
        </div>
      </div>
    </div>
  );
};

const NextRankCard = ({ rankInfo, badgeStatus }) => {
  if (rankInfo.nextRankTitle === 'Max Rank') {
    return (
      <div className='bg-gray-900 rounded-2xl p-6 border border-gray-800 text-center transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:border-gray-700'>
        <Crown size={48} className='mx-auto text-[#EA6100] mb-4' />
        <h3 className='text-2xl font-bold text-white mb-2'>Legend Status!</h3>
        <p className='text-gray-400'>You've reached the pinnacle. Time to mentor others!</p>
      </div>
    );
  }

  // Find recommended badge (first unachieved)
  let recommendedBadge = null;
  if (badgeStatus) {
    const allBadges = Object.values(BADGES);
    recommendedBadge = allBadges.find(b => !badgeStatus[b.id]?.isAchieved);
  }

  return (
    <div className='bg-gray-900 rounded-2xl p-6 border border-gray-800 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:border-gray-700'>
      <div className='flex items-center gap-3 mb-6'>
        <Zap size={24} className='text-[#EA6100]' />
        <div>
          <h3 className='text-xl font-bold text-white'>Next: {rankInfo.nextRank?.title || 'Max Rank'}</h3>
          <p className='text-gray-400 text-sm'>Complete objectives to rank up</p>
        </div>
      </div>

      <div className='space-y-6'>
        <ProgressItem
          title='Quest Points'
          current={gamificationData.totalQPs}
          target={rankInfo.nextRank?.qpRequired || 0}
          progress={rankInfo.qpProgress}
          icon={Award}
        />

        {rankInfo.nextRank?.questsRequired > 0 && (
          <ProgressItem
            title='Published Quests'
            current={gamificationData.publishedQuests}
            target={rankInfo.nextRank?.questsRequired || 0}
            progress={rankInfo.questProgress}
            icon={Map}
          />
        )}

        {rankInfo.specialCriteria && (
          <div>
            <h4 className='text-sm font-semibold text-gray-400 mb-3'>Special Requirements</h4>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
              {rankInfo.specialCriteria.map((crit) => (
                <div
                  key={crit.name}
                  className='bg-gray-800 rounded-lg p-3 flex items-center gap-3'
                >
                  {crit.isMet ? (
                    <CheckCircle2 size={18} className='text-green-500 flex-shrink-0' />
                  ) : (
                    <XCircle size={18} className='text-gray-500 flex-shrink-0' />
                  )}
                  <span className={crit.isMet ? 'text-white text-sm' : 'text-gray-500 text-sm'}>
                    {crit.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {recommendedBadge && (
          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-400">Recommended Badge</h4>
              <span className="text-xs text-[#EA6100] font-medium">Next Goal</span>
            </div>
            <div className="bg-gray-800/40 rounded-xl p-4 flex items-center gap-4 border border-gray-700/50 hover:bg-gray-800/60 transition-colors">
              <div className="p-2 bg-gray-900 rounded-lg border border-gray-700">
                <img src={recommendedBadge.iconUrl || 'https://placehold.co/80'} alt={recommendedBadge.name} className="w-10 h-10 object-contain grayscale opacity-80" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">{recommendedBadge.name}</p>
                <p className="text-xs text-gray-400 line-clamp-1">{recommendedBadge.description}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#EA6100] rounded-full"
                      style={{ width: `${Math.min((badgeStatus[recommendedBadge.id].progressCount / recommendedBadge.criteria.count) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {badgeStatus[recommendedBadge.id].progressCount}/{recommendedBadge.criteria.count}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ProgressItem = ({ title, current, target, progress, icon: Icon }) => (
  <div>
    <div className='flex items-center justify-between mb-3'>
      <div className='flex items-center gap-2'>
        <Icon size={16} className='text-[#EA6100]' />
        <span className='font-semibold text-white'>{title}</span>
      </div>
      <span className='text-sm text-gray-400'>
        {current.toLocaleString()}/{target.toLocaleString()}
      </span>
    </div>
    <div className='w-full bg-gray-800 rounded-full h-3'>
      <div
        className='bg-gradient-to-r from-[#EA6100] to-[#ff9a50] h-3 rounded-full transition-all duration-500'
        style={{ width: `${progress * 100}%` }}
      ></div>
    </div>
  </div>
);

const BadgesCard = ({ badgeStatus }) => {
  const allBadges = Object.values(BADGES);

  return (
    <div className='bg-gray-900 rounded-2xl p-6 border border-gray-800 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:border-gray-700'>
      <div className='flex items-center gap-3 mb-6'>
        <Award size={24} className='text-[#EA6100]' />
        <div>
          <h3 className='text-xl font-bold text-white'>Specialty Badges</h3>
          <p className='text-gray-400 text-sm'>Earn rewards for your achievements</p>
        </div>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
        {allBadges.map((badge) => {
          const status = badgeStatus[badge.id];
          const isAchieved = status.isAchieved;

          return (
            <div
              key={badge.id}
              className={`group relative bg-gray-800 rounded-xl p-4 flex flex-col items-center text-center transition-all duration-300 ${isAchieved
                ? 'border border-[#EA6100] transform hover:scale-105'
                : 'border border-gray-700 opacity-60'
                }`}
            >
              {/* Eye Icon Trigger - Placed before tooltip for peer selector */}
              <div className="peer absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Eye size={16} className="text-gray-400 hover:text-white transition-colors" />
              </div>

              {/* Tooltip - Shows on peer (eye) hover */}
              <div className="bg-black absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 text-white text-xs rounded-lg p-3 opacity-0 peer-hover:opacity-100 transition-opacity pointer-events-none border border-gray-800 shadow-xl z-30">
                {badge.description}
                {/* <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0a0a0a]"></div> */}
              </div>

              <img
                src={badge.iconUrl || 'https://placehold.co/80'}
                alt={badge.name}
                className={`w-12 h-12 lg:w-14 lg:h-14 object-contain mb-3 ${isAchieved ? '' : 'grayscale'
                  }`}
              />
              <span className='text-white font-medium text-sm mb-1'>{badge.name}</span>
              {!isAchieved && (
                <span className='text-gray-400 text-xs'>
                  {status.progressCount}/{badge.criteria.count}
                </span>
              )}
              {isAchieved && (
                <div className='w-2 h-2 bg-[#EA6100] rounded-full mt-1'></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GamificationHub;