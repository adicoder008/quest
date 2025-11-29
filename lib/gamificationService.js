/**
 * OnQuest Gamification Service
 *
 * This service implements the new gamification logic based on Quest Points (QP),
 * Ranks, Streaks, and Badges as defined in the OnQuest Gamification Rulebook
 * and Developer Handbook.
 *
 * It manages:
 * - QP allocation and transaction logging.
 * - Rank progression (based on QP, published quests, badges, streaks).
 * - Daily streak logic (check-in, milestones, freeze, auto-consumption).
 * - Badge achievement and QP rewards.
 * - QP sink mechanisms (Kudos).
 * - Leaderboard data queries.
 *
 * This replaces the old xpService.js.
 */
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  collection,
  addDoc,
  writeBatch,
  arrayUnion,
  query,
  where,
  getDocs,
  collectionGroup,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './firebase'; // Assuming firebase.js is in lib/

// --- 1. CORE CONSTANTS (from Handbooks) ---

/**
 * Defines the QP value for each gamified action.
 */
export const QP_EVENTS = {
  PROFILE_COMPLETE: { event: 'QP_PROFILE_COMPLETE', qp: 10 },
  QUEST_SUBMIT: { event: 'QP_QUEST_SUBMIT', qp: 25 },
  BADGE_EARNED: { event: 'QP_BADGE_EARNED', qp: 30 },
  REFERRAL_SUCCESS: { event: 'QP_REFERRAL_SUCCESS', qp: 10 }, // For referrer
  REFERRED_BONUS: { event: 'QP_REFERRED_BONUS', qp: 5 }, // For referred user
  DAILY_CHECKIN: { event: 'QP_DAILY_CHECKIN', qp: 1 },
  DAILY_GAME_WIN: { event: 'QP_DAILY_GAME_WIN', qp: 1 },
  // Sinks (negative QP)
  KUDOS_SENT: { event: 'QP_SINK_KUDOS', qp: -1 },
  STREAK_BUYBACK_7: { event: 'QP_SINK_BUYBACK_7', qp: -5 },
  STREAK_BUYBACK_14: { event: 'QP_SINK_BUYBACK_14', qp: -10 },
  STREAK_BUYBACK_30: { event: 'QP_SINK_BUYBACK_30', qp: -20 },
  STREAK_BUYBACK_100: { event: 'QP_SINK_BUYBACK_100', qp: -35 },
  STREAK_BUYBACK_MAX: { event: 'QP_SINK_BUYBACK_MAX', qp: -50 },
};

/**
 * Rank progression thresholds.
 * Both qp and quests must be met.
 * Special criteria (streaks, badges) are checked separately.
 */
export const RANKS = [
  { tier: 0, title: 'Wanderer', qp: 0, quests: 0 },
  { tier: 1, title: 'Wayfinder', qp: 50, quests: 0 },
  { tier: 2, title: 'Cartographer', qp: 250, quests: 5 },
  { tier: 3, title: 'Explorer', qp: 500, quests: 15, requires7DayStreak: true },
  { tier: 4, title: 'Questsmith', qp: 1000, quests: 25, requiresBadge: true },
  { tier: 5, title: 'Voyage Master', qp: 1500, quests: 40, requiresBadge: true },
  { tier: 6, title: 'Master Guide', qp: 2000, quests: 50, requiresBadge: true },
];

/**
 * One-time QP bonuses for hitting streak milestones.
 */
export const STREAK_MILESTONES = {
  7: { event: 'QP_STREAK_BONUS_7', qp: 5 },
  14: { event: 'QP_STREAK_BONUS_14', qp: 8 },
  30: { event: 'QP_STREAK_BONUS_30', qp: 12 },
  100: { event: 'QP_STREAK_BONUS_100', qp: 20 },
};

/**
 * Definitions for all achievable specialty badges.
 */
export const BADGES = {
  FOODIE_ADVENTURER: {
    id: 'FOODIE_ADVENTURER',
    name: 'Foodie Adventurer',
    description: '50+ contributions related to local cuisine in Quests.',
    iconUrl: './Foodie.svg', // Placeholder icon
    criteria: { type: 'contributions', category: 'food', count: 50 },
  },
  COASTAL_VOYAGER: {
    id: 'COASTAL_VOYAGER',
    name: 'Coastal Voyager',
    description: '5+ Quests created focused on beach or coastal destinations.',
    iconUrl: './CoastalVoyager.svg',
    criteria: { type: 'quests', category: 'coastal', count: 5 },
  },
  PEAK_CONQUEROR: {
    id: 'PEAK_CONQUEROR',
    name: 'Peak Conqueror',
    description: '5+ Quests created focused on mountainous or high-altitude terrain.',
    iconUrl: './PeakConqueror.svg',
    criteria: { type: 'quests', category: 'mountain', count: 5 },
  },
  CONSISTENCY_MASTER: {
    id: 'CONSISTENCY_MASTER',
    name: 'Consistency Master',
    description: 'Achieve a 100-day streak OR three separate 30-day streaks.',
    iconUrl: './ConsistencyMaster.svg',
    criteria: { type: 'streak', days: 100, or30DayStreaks: 3 },
  },
  COMMUNITY_CHAMPION: {
    id: 'COMMUNITY_CHAMPION',
    name: 'Community Champion',
    description: 'Successfully refer 5 new users who complete their profile and first Quest.',
    iconUrl: './CommunityChampion.svg',
    criteria: { type: 'referrals', count: 5 },
  },
};

// --- 2. FIRESTORE PATH HELPERS ---

/**
 * Gets the reference to the main user document.
 * We store simple, frequently read data here (totalQPs, rankTitle) for performance.
 * @param {string} uid - User ID
 * @returns {DocumentReference}
 */
const getUserDocRef = (uid) => doc(db, 'users', uid);

/**
 * Gets the reference to the user's detailed gamification document.
 * This lives in a subcollection and stores complex state (streaks, badges).
 * @param {string} uid - User ID
 * @returns {DocumentReference}
 */
const getGamificationDocRef = (uid) => doc(db, 'users', uid, 'gamification', 'data');

/**
 * Gets the reference to the QP transaction log collection.
 * @returns {CollectionReference}
 */
const getQPLogCollectionRef = () => collection(db, 'qp_transactions');

// --- 3. CORE DATA FUNCTIONS ---

/**
 * Creates the initial gamification documents for a new user.
 * @param {string} uid - The new user's ID.
 * @param {object} [initialData={}] - Optional initial data.
 */
export const initializeGamificationData = async (uid, initialData = {}) => {
  try {
    const batch = writeBatch(db);

    // 1. Main user doc (for quick reads)
    const userRef = getUserDocRef(uid);
    batch.update(userRef, {
      totalQPs: initialData.totalQPs || 0,
      rankTitle: RANKS[0].title,
      publishedQuests: 0,
    });

    // 2. Detailed gamification subcollection doc
    const gamificationRef = getGamificationDocRef(uid);

    // Create the initial badgeStatus object
    const initialBadgeStatus = {};
    for (const badgeId in BADGES) {
      initialBadgeStatus[badgeId] = {
        isAchieved: false,
        achievedOn: null,
        progressCount: 0,
      };
    }

    const defaultGamificationData = {
      userId: uid,
      totalQPs: 0,
      currentRankTier: 0,
      rankTitle: RANKS[0].title,
      publishedQuests: 0,
      referralsCompleted: 0,
      badgeStatus: initialBadgeStatus,
      streak: {
        currentStreakDays: 0,
        lastCheckInDate: null,
        hasStreakFreeze: false,
        threeThirtyDayStreaks: 0,
        milestonesClaimed: [], // Stores [7, 14, 30, 100]
      },
      ...initialData,
    };
    batch.set(gamificationRef, defaultGamificationData);

    await batch.commit();
    console.log(`Initialized gamification data for user ${uid}`);
    return defaultGamificationData;
  } catch (error) {
    console.error('Error initializing gamification data:', error);
    throw error;
  }
};

/**
 * Fetches the user's detailed gamification data.
 * Initializes it if it doesn't exist.
 * @param {string} uid - User ID
 * @returns {Promise<object>} The user's gamification data.
 */
export const getUserGamificationData = async (uid) => {
  if (!uid) {
    throw new Error('No UID provided to getUserGamificationData');
  }
  const gamificationRef = getGamificationDocRef(uid);
  const docSnap = await getDoc(gamificationRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    // User exists but has no gamification doc, let's create it.
    console.warn(`No gamification data for ${uid}, initializing...`);
    // We need their main user data to seed it
    const userSnap = await getDoc(getUserDocRef(uid));
    const userData = userSnap.data();
    return await initializeGamificationData(uid, {
      publishedQuests: userData?.postsCount || 0, // Sync with existing postsCount
    });
  }
};

/**
 * The primary function for adding or removing Quest Points (QP).
 * This handles all QP transactions, logs them, and triggers rank updates.
 *
 * @param {string} uid - User ID
 * @param {object} qpEvent - A QP_EVENT object (e.g., QP_EVENTS.PROFILE_COMPLETE)
 * @param {object} [metadata={}] - Optional metadata for the transaction log (e.g., { questId: '...' })
 */
export const addQP = async (uid, qpEvent, metadata = {}) => {
  if (!uid) throw new Error('UID is required to add QP');
  if (!qpEvent || typeof qpEvent.qp !== 'number') {
    throw new Error('Invalid QP Event object');
  }

  const { qp: qpAmount, event: eventName } = qpEvent;
  if (qpAmount === 0) return; // No action needed

  const userRef = getUserDocRef(uid);
  const gamificationRef = getGamificationDocRef(uid);
  const qpLogRef = addDoc(getQPLogCollectionRef(), {
    uid: uid,
    action: eventName,
    qpEarned: qpAmount,
    metadata: metadata,
    timestamp: serverTimestamp(),
  });

  try {
    // For sinks, we must check balance first.
    if (qpAmount < 0) {
      const gamificationData = await getUserGamificationData(uid);
      if (gamificationData.totalQPs + qpAmount < 0) {
        throw new Error(`Insufficient QPs for action: ${eventName}`);
      }
    }

    // Update both docs atomically
    const batch = writeBatch(db);

    // 1. Update main user doc
    batch.update(userRef, {
      totalQPs: increment(qpAmount),
    });

    // 2. Update gamification doc
    batch.update(gamificationRef, {
      totalQPs: increment(qpAmount),
    });

    // 3. Commit batch and log
    await Promise.all([batch.commit(), qpLogRef]);

    console.log(`Added ${qpAmount} QP to user ${uid} for action: ${eventName}`);

    // 4. After QP is added, check for rank updates
    // We must re-fetch the data to ensure we have the latest total
    const updatedGamificationData = await getUserGamificationData(uid);
    await checkAndUpdateRank(uid, updatedGamificationData);

    return { success: true, qpEarned: qpAmount };
  } catch (error) {
    console.error(`Error adding QP for ${eventName}:`, error);
    throw error;
  }
};

// --- 4. RANK & PROGRESSION LOGIC ---

/**
 * Checks and updates the user's rank based on their current gamification data.
 * This is the core promotion/demotion logic.
 * @param {string} uid - User ID
 * @param {object} gamificationData - The user's current gamification data.
 */
export const checkAndUpdateRank = async (uid, gamificationData) => {
  const { totalQPs, publishedQuests, badgeStatus, streak, currentRankTier } =
    gamificationData;

  let newTier = 0;

  // Helper functions to check special criteria
  const has7DayStreak =
    streak.currentStreakDays >= 7 || streak.milestonesClaimed.includes(7);
  const hasAchievedBadge = Object.values(badgeStatus).some(
    (b) => b.isAchieved
  );

  // Loop *down* from the highest rank to find the highest achievable rank
  for (let i = RANKS.length - 1; i >= 0; i--) {
    const rank = RANKS[i];

    // Check base criteria
    if (totalQPs >= rank.qp && publishedQuests >= rank.quests) {
      // Check special criteria
      if (rank.requires7DayStreak && !has7DayStreak) continue;
      if (rank.requiresBadge && !hasAchievedBadge) continue;

      // All criteria met
      newTier = rank.tier;
      break;
    }
  }

  // If rank has changed, update the database
  if (newTier !== currentRankTier) {
    const newRankTitle = RANKS.find((r) => r.tier === newTier).title;
    const batch = writeBatch(db);

    // Update main user doc
    batch.update(getUserDocRef(uid), {
      rankTitle: newRankTitle,
    });

    // Update gamification doc
    batch.update(getGamificationDocRef(uid), {
      currentRankTier: newTier,
      rankTitle: newRankTitle,
    });

    await batch.commit();

    // Log the promotion/demotion
    await addDoc(getQPLogCollectionRef(), {
      uid: uid,
      action:
        newTier > currentRankTier ? 'RANK_PROMOTION' : 'RANK_DEMOTION',
      qpEarned: 0,
      metadata: { newRank: newRankTitle, oldRank: RANKS[currentRankTier].title },
      timestamp: serverTimestamp(),
    });

    console.log(`User ${uid} rank changed to: ${newRankTitle}`);
  }
};

/**
 * Calculates QP bonus for a new quest submission based on rank.
 * @param {number} rankTier - The user's current rank tier.
 * @returns {number} The bonus QP.
 */
const getQuestBonus = (rankTier) => {
  if (rankTier >= 4) return 5; // Questsmith+
  if (rankTier === 3) return 2; // Explorer
  if (rankTier === 2) return 1; // Cartographer
  return 0; // Wayfinder
};

/**
 * Call this when a user successfully publishes a new quest.
 * It adds the base QP + rank bonus QP.
 * @param {string} uid - User ID
 * @param {string} questId - The ID of the new quest
 * @param {string} [category] - Optional category (e.g., 'food', 'coastal')
 */
export const onQuestPublished = async (uid, questId, category) => {
  const gamificationData = await getUserGamificationData(uid);

  const baseQpEvent = QP_EVENTS.QUEST_SUBMIT;
  const bonusQp = getQuestBonus(gamificationData.currentRankTier);
  const totalQp = baseQpEvent.qp + bonusQp;

  // 1. Add QP in a single transaction
  await addQP(
    uid,
    { event: 'QP_QUEST_SUBMIT_WITH_BONUS', qp: totalQp },
    { questId, base: baseQpEvent.qp, bonus: bonusQp }
  );

  // 2. Increment published quests count
  const batch = writeBatch(db);
  batch.update(getUserDocRef(uid), {
    publishedQuests: increment(1),
  });
  batch.update(getGamificationDocRef(uid), {
    publishedQuests: increment(1),
  });
  await batch.commit();

  // 3. Check for quest-related badges
  // This needs to re-fetch data to include the incremented quest count
  const updatedData = await getUserGamificationData(uid);
  await checkQuestBadges(uid, updatedData, category);

  // 4. Rank check is already handled by addQP, but we need to run it
  // again in case the new quest count pushed them over a tier.
  await checkAndUpdateRank(uid, updatedData);
};

// --- 5. STREAK LOGIC ---

/**
 * Processes a user's daily check-in.
 * This should be called *once* per day on their first active session.
 * @param {string} uid - User ID
 */
export const processDailyCheckIn = async (uid) => {
  const gamificationRef = getGamificationDocRef(uid);
  const gamificationData = await getUserGamificationData(uid);
  const streak = gamificationData.streak;

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day

  const lastCheckIn = streak.lastCheckInDate?.toDate();
  if (lastCheckIn) {
    lastCheckIn.setHours(0, 0, 0, 0); // Normalize
  }

  // 1. Check if already checked in today
  if (lastCheckIn && lastCheckIn.getTime() === today.getTime()) {
    console.log(`User ${uid} already checked in today.`);
    return { status: 'already_checked_in', streak: streak.currentStreakDays };
  }

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const batch = writeBatch(db);
  let status = '';
  let logAction = '';
  let logMetadata = {};

  // 2. Check if streak is broken
  if (lastCheckIn && lastCheckIn.getTime() < yesterday.getTime()) {
    // Missed one or more days
    if (streak.hasStreakFreeze) {
      // 3. Consume Streak Freeze
      batch.update(gamificationRef, {
        'streak.hasStreakFreeze': false,
        'streak.currentStreakDays': increment(1), // Streak continues
        'streak.lastCheckInDate': serverTimestamp(),
      });
      status = 'streak_saved_by_freeze';
      logAction = 'STREAK_FREEZE_CONSUMED';
      logMetadata = { savedStreak: streak.currentStreakDays };
      streak.currentStreakDays += 1; // Manually update for milestone check
    } else {
      // 4. Hard Break
      const oldStreak = streak.currentStreakDays;
      batch.update(gamificationRef, {
        'streak.currentStreakDays': 1, // Reset to 1 for today's check-in
        'streak.hasStreakFreeze': false,
        'streak.lastCheckInDate': serverTimestamp(),
      });
      status = 'streak_broken';
      logAction = 'STREAK_BROKEN';
      logMetadata = { brokenStreak: oldStreak };
      streak.currentStreakDays = 1; // Reset for milestone check
    }
  } else {
    // 5. Streak Maintained (it's yesterday or their first ever check-in)
    batch.update(gamificationRef, {
      'streak.currentStreakDays': increment(1),
      'streak.lastCheckInDate': serverTimestamp(),
    });
    status = 'streak_maintained';
    streak.currentStreakDays += 1; // Manually update for milestone check
  }

  // 6. Add 1 QP for the daily check-in (regardless of break/maintain)
  // We don't use addQP to avoid recursive loops and to keep this atomic
  batch.update(getUserDocRef(uid), { totalQPs: increment(1) });
  batch.update(gamificationRef, { totalQPs: increment(1) });

  // 7. Check for Milestone Bonuses
  const milestone = streak.currentStreakDays;
  if (
    STREAK_MILESTONES[milestone] &&
    !streak.milestonesClaimed.includes(milestone)
  ) {
    const bonus = STREAK_MILESTONES[milestone];
    // Add bonus QP
    batch.update(getUserDocRef(uid), { totalQPs: increment(bonus.qp) });
    batch.update(gamificationRef, {
      totalQPs: increment(bonus.qp),
      'streak.milestonesClaimed': arrayUnion(milestone), // Mark as claimed
    });

    // Log the bonus
    await addDoc(getQPLogCollectionRef(), {
      uid: uid,
      action: bonus.event,
      qpEarned: bonus.qp,
      metadata: { streak: milestone },
      timestamp: serverTimestamp(),
    });
  }

  // 8. Check for Streak Freeze Unlock (if not already held)
  if (streak.currentStreakDays >= 14 && !streak.hasStreakFreeze) {
    if (status !== 'streak_saved_by_freeze') { // Don't re-award if just consumed
      batch.update(gamificationRef, {
        'streak.hasStreakFreeze': true,
      });
      logAction = 'STREAK_FREEZE_UNLOCKED';
    }
  }

  // 9. Check for 30-Day Streak (for Consistency Master)
  if (milestone === 30) {
    batch.update(gamificationRef, {
      'streak.threeThirtyDayStreaks': increment(1),
    });
    // Check badge (will be slightly delayed, but acceptable)
    // We pass the incremented value manually
    const newData = {
      ...gamificationData,
      streak: {
        ...streak,
        threeThirtyDayStreaks: streak.threeThirtyDayStreaks + 1,
      },
    };
    await checkBadgeCompletion(uid, BADGES.CONSISTENCY_MASTER.id, newData);
  }

  // 10. Check for 100-Day Streak (for Consistency Master)
  if (milestone === 100) {
    await checkBadgeCompletion(uid, BADGES.CONSISTENCY_MASTER.id, gamificationData);
  }

  // Commit all streak changes
  await batch.commit();

  // Log the primary streak action
  if (logAction) {
    await addDoc(getQPLogCollectionRef(), {
      uid: uid,
      action: logAction,
      qpEarned: 0,
      metadata: logMetadata,
      timestamp: serverTimestamp(),
    });
  }

  console.log(`User ${uid} check-in processed: ${status}`);
  return { status, streak: streak.currentStreakDays };
};

// --- 6. BADGE LOGIC ---

/**
 * A general-purpose function to check if a badge's criteria are met.
 * @param {string} uid - User ID
 *a * @param {string} badgeId - The ID of the badge to check (from BADGES constant)
 * @param {object} gamificationData - The user's current gamification data.
 */
export const checkBadgeCompletion = async (uid, badgeId, gamificationData) => {
  const badge = BADGES[badgeId];
  const badgeStatus = gamificationData.badgeStatus[badgeId];

  if (!badge || badgeStatus.isAchieved) {
    return; // Badge doesn't exist or is already achieved
  }

  let criteriaMet = false;
  const criteria = badge.criteria;

  try {
    switch (criteria.type) {
      case 'referrals':
        if (gamificationData.referralsCompleted >= criteria.count) {
          criteriaMet = true;
        }
        break;
      case 'streak':
        if (
          gamificationData.streak.currentStreakDays >= criteria.days ||
          gamificationData.streak.threeThirtyDayStreaks >= criteria.or30DayStreaks
        ) {
          criteriaMet = true;
        }
        break;
      case 'quests':
      case 'contributions':
        // This is more complex. We need to check the progressCount
        // which is updated by a separate process (e.g., onQuestPublished)
        if (badgeStatus.progressCount >= criteria.count) {
          criteriaMet = true;
        }
        break;
      default:
        console.warn(`Unknown badge criteria type: ${criteria.type}`);
    }

    if (criteriaMet) {
      // Award the badge
      const batch = writeBatch(db);
      const gamificationRef = getGamificationDocRef(uid);

      // Update badge status
      batch.update(gamificationRef, {
        [`badgeStatus.${badgeId}.isAchieved`]: true,
        [`badgeStatus.${badgeId}.achievedOn`]: serverTimestamp(),
      });

      await batch.commit();

      // Add QP for earning the badge
      await addQP(uid, QP_EVENTS.BADGE_EARNED, { badgeId: badgeId });
      console.log(`User ${uid} earned badge: ${badge.name}`);
    }
  } catch (error) {
    console.error(`Error checking badge ${badgeId} for user ${uid}:`, error);
  }
};

/**
 * Updates progress for quest/contribution-based badges.
 * This should be called *after* a quest is published.
 * @param {string} uid - User ID
 * @param {object} gamificationData - User's gamification data
 * @param {string} [category] - The category of the quest (e.g., 'food', 'coastal')
 */
export const checkQuestBadges = async (uid, gamificationData, category) => {
  const batch = writeBatch(db);
  const gamificationRef = getGamificationDocRef(uid);
  let badgeWasChecked = false;

  const checkAndUpdateProgress = (badgeId) => {
    if (!gamificationData.badgeStatus[badgeId].isAchieved) {
      batch.update(gamificationRef, {
        [`badgeStatus.${badgeId}.progressCount`]: increment(1),
      });
      // Check for completion
      // We add 1 to the current count to check against the new value
      const newProgress = gamificationData.badgeStatus[badgeId].progressCount + 1;
      if (newProgress >= BADGES[badgeId].criteria.count) {
        checkBadgeCompletion(uid, badgeId, gamificationData);
      }
      badgeWasChecked = true;
    }
  };

  // Check relevant badges
  if (category === 'food') {
    checkAndUpdateProgress(BADGES.FOODIE_ADVENTURER.id);
  } else if (category === 'coastal') {
    checkAndUpdateProgress(BADGES.COASTAL_VOYAGER.id);
  } else if (category === 'mountain') {
    checkAndUpdateProgress(BADGES.PEAK_CONQUEROR.id);
  }

  if (badgeWasChecked) {
    await batch.commit();
  }
};

// --- 7. QP SINK MECHANISMS ---

/**
 * Allows a user to send Kudos to a quest creator.
 * This costs the sender 1 QP.
 * @param {string} senderUid - The ID of the user sending kudos
 * @param {string} receiverUid - The ID of the user receiving kudos
 * @param {string} questId - The ID of the quest
 */
export const sendKudos = async (senderUid, receiverUid, questId) => {
  if (senderUid === receiverUid) {
    throw new Error('Cannot send kudos to yourself');
  }

  const senderData = await getUserGamificationData(senderUid);

  // 1. Check if sender is eligible (T1+)
  if (senderData.currentRankTier < 1) {
    throw new Error('Must be at least Rank T1 (Wayfinder) to send Kudos.');
  }

  // 2. addQP will handle the balance check and removal
  await addQP(senderUid, QP_EVENTS.KUDOS_SENT, {
    receiverUid,
    questId,
  });

  // 3. Log the kudos for the receiver (no QP gained)
  // This could be an update to the quest doc or a separate collection
  const kudosLogRef = collection(db, 'kudos');
  await addDoc(kudosLogRef, {
    senderUid,
    receiverUid,
    questId,
    timestamp: serverTimestamp(),
  });

  console.log(`Kudos sent from ${senderUid} to ${receiverUid} for quest ${questId}`);
  return { success: true };
};

// --- 8. HELPER & LEADERBOARD FUNCTIONS ---

/**
 * Gets the "Master Guide Legend Board"
 * @param {number} [count=10] - Number of users to fetch
 * @returns {Promise<Array<object>>}
 */
export const getMasterGuideLeaderboard = async (count = 10) => {
  // This query looks for all 'data' docs inside 'gamification' subcollections
  const q = query(
    collectionGroup(db, 'gamification'),
    where('rankTitle', '==', 'Master Guide'),
    orderBy('publishedQuests', 'desc'),
    limit(count)
  );

  const querySnapshot = await getDocs(q);
  const leaderboard = [];
  querySnapshot.forEach((doc) => {
    leaderboard.push(doc.data());
  });
  return leaderboard;
};

/**
 * A client-side helper to calculate progress to the next rank.
 * Replaces the old `calculateLevel`.
 * @param {object} gamificationData - The user's *full* gamification doc.
 * @returns {object} Info about current rank, next rank, and progress.
 */
export const getRankInfo = (gamificationData) => {
  if (!gamificationData) {
    return {
      rankTitle: 'Wanderer',
      totalQPs: 0,
      publishedQuests: 0,
      nextRankTitle: RANKS[1].title,
      qpProgress: 0,
      qpToNextRank: RANKS[1].qp,
      questProgress: 0,
      questsToNextRank: RANKS[1].quests,
      specialCriteria: null,
    };
  }

  const { totalQPs, publishedQuests, currentRankTier } = gamificationData;
  const currentRank = RANKS[currentRankTier] || RANKS[0];
  const nextRank = RANKS[currentRankTier + 1] || null;

  if (!nextRank) {
    // User is max rank
    return {
      rankTitle: currentRank.title,
      totalQPs,
      publishedQuests,
      nextRankTitle: 'Max Rank',
      qpProgress: 1,
      qpToNextRank: 0,
      questProgress: 1,
      questsToNextRank: 0,
      specialCriteria: null,
    };
  }

  const qpProgress = Math.min(
    (totalQPs - currentRank.qp) / (nextRank.qp - currentRank.qp),
    1
  );
  const qpToNextRank = Math.max(0, nextRank.qp - totalQPs);

  const questProgress =
    nextRank.quests > 0 ? Math.min(publishedQuests / nextRank.quests, 1) : 1;
  const questsToNextRank = Math.max(0, nextRank.quests - publishedQuests);

  let specialCriteria = [];
  if (nextRank.requires7DayStreak) {
    const has7Day =
      gamificationData.streak.currentStreakDays >= 7 ||
      gamificationData.streak.milestonesClaimed.includes(7);
    specialCriteria.push({
      name: 'Achieve 7-Day Streak',
      isMet: has7Day,
    });
  }
  if (nextRank.requiresBadge) {
    const hasBadge = Object.values(gamificationData.badgeStatus).some(
      (b) => b.isAchieved
    );
    specialCriteria.push({
      name: 'Earn 1+ Specialty Badge',
      isMet: hasBadge,
    });
  }

  return {
    rankTitle: currentRank.title,
    totalQPs,
    publishedQuests,
    nextRankTitle: nextRank.title,
    qpProgress,
    qpToNextRank,
    questProgress,
    questsToNextRank,
    specialCriteria: specialCriteria.length > 0 ? specialCriteria : null,
  };
};

/**
 * Fetches recent QP activity for the user.
 * @param {string} uid - User ID
 * @param {number} [count=10] - Number of logs to fetch
 * @returns {Promise<Array<object>>}
 */
export const getUserQPHistory = async (uid, count = 10) => {
  try {
    const q = query(
      getQPLogCollectionRef(),
      where('uid', '==', uid),
      orderBy('timestamp', 'desc'), // CHANGED: 'asc' to 'desc' to get newest first
      limit(count)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate(),
    }));
  } catch (error) {
    console.error('Error getting QP history:', error);
    throw error;
  }
};