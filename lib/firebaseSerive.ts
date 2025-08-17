import { db } from './firebase.js';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export const getUserData = async (uid: string) => {
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);
  return userDoc.exists() ? userDoc.data() : null;
};

export const getUserPosts = async (uid: string) => {
  const postsRef = collection(db, 'posts');
  const q = query(postsRef, where('uid', '==', uid));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getUserBadges = async (uid: string) => {
  const badgesRef = collection(db, 'user_badges');
  const q = query(badgesRef, where('uid', '==', uid));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getLevelInfo = (xp: number) => {
  const levels = [
    { name: "Scout", minXp: 0, badgeIcon: "scout_badge_url" },
    { name: "Explorer", minXp: 100, badgeIcon: "explorer_badge_url" },
    { name: "Adventurer", minXp: 300, badgeIcon: "adventurer_badge_url" },
    { name: "Voyager", minXp: 600, badgeIcon: "voyager_badge_url" },
    { name: "Pioneer", minXp: 1000, badgeIcon: "pioneer_badge_url" },
    { name: "Legend", minXp: 1500, badgeIcon: "legend_badge_url" }
  ];
  
  let currentLevel = levels[0];
  let nextLevel = levels[1];
  
  for (let i = 0; i < levels.length; i++) {
    if (xp >= levels[i].minXp) {
      currentLevel = levels[i];
      nextLevel = levels[i+1] || null;
    }
  }
  
  return {
    currentLevel,
    nextLevel,
    progress: nextLevel ? (xp - currentLevel.minXp) / (nextLevel.minXp - currentLevel.minXp) : 1,
    xpToNext: nextLevel ? nextLevel.minXp - xp : 0
  };
};