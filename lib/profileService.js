import { db, storage } from './firebase.js';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { serverTimestamp } from 'firebase/firestore';

// Update user profile information
const updateProfileInfo = async (uid, updates) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating profile info:", error);
    throw error;
  }
};

// Upload profile picture
const uploadProfilePicture = async (uid, file) => {
  try {
    // Create storage reference
    const storageRef = ref(storage, `profile_pictures/${uid}/${file.name}`);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Update user document with new photoURL
    await updateProfileInfo(uid, { photoURL: downloadURL });
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
};

const updateBio = async (uid, bio) => {
  try {
    await updateProfileInfo(uid, { bio });
    return { success: true };
  } catch (error) {
    console.error("Error updating bio:", error);
    throw error;
  }
};

// Upload background picture
const uploadBackgroundPicture = async (uid, file) => {
  try {
    // Create storage reference
    const storageRef = ref(storage, `background_pictures/${uid}/${file.name}`);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Update user document with new backgroundURL
    await updateProfileInfo(uid, { backgroundURL: downloadURL });
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading background picture:", error);
    throw error;
  }
};

// Get user profile by ID
const getUserProfile = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

export {
  updateProfileInfo,
  uploadProfilePicture,
  uploadBackgroundPicture,
  getUserProfile
  , updateBio
};