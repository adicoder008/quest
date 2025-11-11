import * as admin from 'firebase-admin';

// This is the variable name for your service account key in .env.local
const SERVICE_ACCOUNT_KEY = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!SERVICE_ACCOUNT_KEY) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set in .env');
}

// Check if app is already initialized to prevent re-initialization
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(SERVICE_ACCOUNT_KEY);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    });
  } catch (e: any) {
    console.error('Firebase admin initialization error', e.message);
  }
}

const db = admin.firestore();
const storage = admin.storage().bucket();

export { db, storage, admin };