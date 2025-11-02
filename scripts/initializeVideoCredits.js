// scripts/initializeVideoCredits.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

// Your Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function initializeVideoCredits() {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  
  const batch = [];
  snapshot.forEach((docSnap) => {
    const userRef = doc(db, 'users', docSnap.id);
    batch.push(
      updateDoc(userRef, {
        videoCredits: {
          count: 2,
          lastReset: new Date().toISOString(),
          totalGenerated: 0
        }
      })
    );
  });
  
  await Promise.all(batch);
  console.log(`✅ Initialized video credits for ${batch.length} users`);
}

initializeVideoCredits();