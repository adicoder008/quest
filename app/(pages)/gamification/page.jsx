"use client";

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  getUserGamificationData,
  calculateRankInfo,
  getMasterGuideLeaderboard,
  getUserQPHistory,
  RANKS,
  BADGES,
  STREAK_MILESTONES,
} from '@/lib/gamificationService';
import { getCurrentUserData } from '@/lib/authService';
import {
  Award,
  Badge,
  CheckCircle2,
  ChevronRight,
  Flame,
  Shield,
  Star,
  Target,
  Trophy,
  Users,
  XCircle,
  Clock,
  ArrowLeft,
  Zap,
  Crown,
  TrendingUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/LeftSideNav';
import Footer from '@/components/phoneComponents/Footer';

const GamificationHub = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [gamificationData, setGamificationData] = useState(null);
  const [rankInfo, setRankInfo] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          setLoading(true);
          console.log('Fetching gamification data for user:', currentUser.uid);
          
          const [mainData, gData, board, history] = await Promise.all([
            getCurrentUserData(),
            getUserGamificationData(currentUser.uid),
            getMasterGuideLeaderboard(),
            getUserQPHistory(currentUser.uid, 10),
          ]);

          console.log('Data fetched successfully:', { 
            mainData: !!mainData, 
            gData: !!gData, 
            board: board.length,
            history: history.length 
          });

          setUserData(mainData);
          setGamificationData(gData);
          setRankInfo(getRankInfo(gData));
          setLeaderboard(board);
          setActivityLog(history);
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

  return (
    <div className='min-h-screen bg-black text-white'>
      {/* Desktop Nav */}
      <div className='hidden lg:block'>
        <NavBar user={user} onSignOut={() => {}} />
      </div>

      <div className='lg:ml-[280px]'>
        <div className='max-w-7xl mx-auto'>
          {/* Mobile Header */}
          <div className='lg:hidden sticky top-0 z-10 bg-black border-b border-gray-800 p-4'>
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

          {/* Desktop Header */}
          <div className='hidden lg:block px-8 pt-8 pb-6'>
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

          {/* Mobile View Toggle */}
          <div className='lg:hidden px-4 border-b border-gray-800'>
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
                  className={`flex items-center gap-2 py-2 px-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    activeView === item.id
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
          <div className='p-4 lg:p-8 pb-20 lg:pb-8'>
            {/* Mobile View */}
            <div className='lg:hidden space-y-6'>
              {activeView === 'overview' && (
                <>
                  <ProfileRankCard userData={userData} rankInfo={rankInfo} gamificationData={gamificationData} />
                  <StreakCard streak={gamificationData.streak} />
                  <NextRankCard rankInfo={rankInfo} />
                </>
              )}
              
              {activeView === 'badges' && (
                <BadgesCard badgeStatus={gamificationData.badgeStatus} />
              )}
              
              {/* {activeView === 'leaderboard' && (
                <LeaderboardCard leaderboard={leaderboard} />
              )}
              
              {activeView === 'activity' && (
                <ActivityLogCard log={activityLog} />
              )} */}
            </div>

            {/* Desktop Grid */}
            <div className='hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-6'>
              {/* Left Column */}
              <div className='space-y-6'>
                <ProfileRankCard userData={userData} rankInfo={rankInfo} gamificationData={gamificationData} />
                <StreakCard streak={gamificationData.streak} />
                {/* <LeaderboardCard leaderboard={leaderboard} /> */}
              </div>

              {/* Middle Column */}
              <div className='space-y-6'>
                <NextRankCard rankInfo={rankInfo} />
                {/* <ActivityLogCard log={activityLog} /> */}
              </div>

              {/* Right Column */}
              <div className='space-y-6'>
                <BadgesCard badgeStatus={gamificationData.badgeStatus} />
              </div>
            </div>
          </div>

          <div className='lg:hidden'>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components
const ProfileRankCard = ({ userData, rankInfo, gamificationData }) => (
  <div className='bg-gray-900 rounded-2xl p-6 border border-gray-800'>
    <div className='flex items-center gap-4'>
      <img
        src={userData.photoURL || '/default-avatar.png'}
        alt='Profile'
        className='w-16 h-16 lg:w-20 lg:h-20 rounded-full border-2 border-[#EA6100] object-cover'
      />
      <div className='flex-1'>
        <h2 className='text-xl lg:text-2xl font-bold text-white'>{userData.displayName}</h2>
        <p className='text-[#EA6100] font-semibold text-lg'>{rankInfo.rankTitle}</p>
        <div className='flex items-center gap-2 mt-2 bg-gray-800 rounded-full px-3 py-1.5'>
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
    <div className='bg-gradient-to-br from-[#EA6100] to-[#ff9a50] rounded-2xl p-6 text-black'>
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

const NextRankCard = ({ rankInfo }) => {
  if (rankInfo.nextRankTitle === 'Max Rank') {
    return (
      <div className='bg-gray-900 rounded-2xl p-6 border border-gray-800 text-center'>
        <Crown size={48} className='mx-auto text-[#EA6100] mb-4' />
        <h3 className='text-2xl font-bold text-white mb-2'>Legend Status!</h3>
        <p className='text-gray-400'>You've reached the pinnacle. Time to mentor others!</p>
      </div>
    );
  }

  return (
    <div className='bg-gray-900 rounded-2xl p-6 border border-gray-800'>
      <div className='flex items-center gap-3 mb-6'>
        <Zap size={24} className='text-[#EA6100]' />
        <div>
          <h3 className='text-xl font-bold text-white'>Next: {rankInfo.nextRankTitle}</h3>
          <p className='text-gray-400 text-sm'>Complete objectives to rank up</p>
        </div>
      </div>

      <div className='space-y-6'>
        <ProgressItem
          title='Quest Points'
          current={rankInfo.totalQPs}
          target={RANKS.find((r) => r.title === rankInfo.nextRankTitle).qp}
          progress={rankInfo.qpProgress}
          icon={Award}
        />

        {/* <ProgressItem
          title='Published Quests'
          current={rankInfo.publishedQuests}
          target={RANKS.find((r) => r.title === rankInfo.nextRankTitle).quests}
          progress={rankInfo.questProgress}
          icon={Target}
        /> */}

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
    <div className='bg-gray-900 rounded-2xl p-6 border border-gray-800'>
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
              className={`bg-gray-800 rounded-xl p-4 flex flex-col items-center text-center transition-all duration-300 ${
                isAchieved 
                  ? 'border border-[#EA6100] transform hover:scale-105' 
                  : 'border border-gray-700 opacity-60'
              }`}
              title={badge.description}
            >
              <img
                src={badge.iconUrl || 'https://placehold.co/80'}
                alt={badge.name}
                className={`w-12 h-12 lg:w-14 lg:h-14 object-contain mb-3 ${
                  isAchieved ? '' : 'grayscale'
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

// const LeaderboardCard = ({ leaderboard }) => {
//   return (
//     <div className='bg-gray-900 rounded-2xl p-6 border border-gray-800'>
//       <div className='flex items-center gap-3 mb-6'>
//         <TrendingUp size={24} className='text-[#EA6100]' />
//         <div>
//           <h3 className='text-xl font-bold text-white'>Master Guides</h3>
//           <p className='text-gray-400 text-sm'>Top quest creators</p>
//         </div>
//       </div>

//       <div className='space-y-3'>
//         {leaderboard.length === 0 ? (
//           <div className='text-center py-8'>
//             <Users size={48} className='text-gray-600 mx-auto mb-3' />
//             <p className='text-gray-500'>No Master Guides yet</p>
//             <p className='text-gray-400 text-sm mt-1'>Be the first to reach the top!</p>
//           </div>
//         ) : (
//           leaderboard.map((guide, index) => (
//             <div key={guide.userId} className='flex items-center gap-4 p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors'>
//               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
//                 index === 0 ? 'bg-yellow-500 text-black' :
//                 index === 1 ? 'bg-gray-400 text-black' :
//                 index === 2 ? 'bg-yellow-700 text-white' :
//                 'bg-gray-700 text-gray-300'
//               }`}>
//                 {index + 1}
//               </div>
//               <div className='flex-1'>
//                 <span className='text-white font-medium block'>Master Guide</span>
//                 <span className='text-gray-400 text-sm'>{guide.publishedQuests} quests</span>
//               </div>
//               <div className='text-[#EA6100] font-bold'>{guide.totalQPs} QP</div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// const ActivityLogCard = ({ log }) => {
//   const formatTime = (timestamp) => {
//     if (!timestamp) return '';
//     const date = new Date(timestamp);
//     const now = new Date();
//     const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

//     if (diffInSeconds < 60) return 'Just now';
//     if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
//     if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
//     return `${Math.floor(diffInSeconds / 86400)}d ago`;
//   };

//   return (
//     <div className='bg-gray-900 rounded-2xl p-6 border border-gray-800'>
//       <div className='flex items-center gap-3 mb-6'>
//         <Clock size={24} className='text-[#EA6100]' />
//         <div>
//           <h3 className='text-xl font-bold text-white'>Recent Activity</h3>
//           <p className='text-gray-400 text-sm'>Your latest achievements</p>
//         </div>
//       </div>

//       <div className='space-y-4'>
//         {log.length === 0 ? (
//           <div className='text-center py-8'>
//             <Star size={48} className='text-gray-600 mx-auto mb-3' />
//             <p className='text-gray-500'>No activity yet</p>
//             <p className='text-gray-400 text-sm mt-1'>Complete quests to see your progress!</p>
//           </div>
//         ) : (
//           log.map((item) => (
//             <div key={item.id} className='flex items-center gap-4 p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors'>
//               <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
//                 item.qpEarned > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
//               }`}>
//                 {item.qpEarned > 0 ? '+' : ''}{item.qpEarned}
//               </div>
//               <div className='flex-1'>
//                 <span className='text-white block capitalize'>{item.action.replace(/_/g, ' ')}</span>
//                 <span className='text-gray-400 text-sm'>{item.qpEarned} QP</span>
//               </div>
//               <span className='text-gray-500 text-sm'>{formatTime(item.timestamp)}</span>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

export default GamificationHub;