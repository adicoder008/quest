// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBwvrGmFmVwjmXS8B7WXyoBHBLPv5eGnng",
  authDomain: "onquest-bdc27.firebaseapp.com",
  projectId: "onquest-bdc27",
  storageBucket: "onquest-bdc27.firebasestorage.app",
  messagingSenderId: "903211586009",
  appId: "1:903211586009:web:5917214d0a1d7c081ec9c8",
  measurementId: "G-47YDKS1VHH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


export { app,auth, storage, db};