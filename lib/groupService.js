import { db } from './firebase.cjs';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  query, 
  where 
} from 'firebase/firestore';
import { nanoid } from 'nanoid';

// Collection reference
const groupsCollection = collection(db, 'groups');

// Generate a unique invite code
const generateInviteCode = () => {
  return nanoid(8).toUpperCase();
};

// Create a new group
export const createGroup = async (groupData) => {
  // Generate a unique document ID
  const groupRef = doc(collection(db, 'groups'));
  
  // Generate invite code
  const inviteCode = generateInviteCode();
  
  // Prepare group data
  const newGroup = {
    ...groupData,
    id: groupRef.id,
    inviteCode,
    createdAt: new Date().toISOString(),
    trips: []
  };
  
  // Save to Firestore
  await setDoc(groupRef, newGroup);
  
  return newGroup;
};

// Get all groups for a user
export const getGroups = async (uid) => {
  const q = query(groupsCollection);
  const snapshot = await getDocs(q);
  
  const groups = [];
  snapshot.forEach(doc => {
    const group = doc.data();
    // Check if user is a member
    const isMember = group.members.some(member => member.uid === uid);
    if (isMember) {
      groups.push(group);
    }
  });
  
  return groups;
};

// Join an existing group using invite code
export const joinGroup = async (inviteCode, userData) => {
  const q = query(
    groupsCollection,
    where('inviteCode', '==', inviteCode)
  );
  
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    throw new Error('Invalid invite code');
  }
  
  const groupDoc = snapshot.docs[0];
  const groupData = groupDoc.data();
  
  // Check if user is already a member
  const isMember = groupData.members.some(member => member.uid === userData.uid);
  
  if (isMember) {
    throw new Error('You are already a member of this group');
  }
  
  // Add user to group
  const groupRef = doc(db, 'groups', groupDoc.id);
  await updateDoc(groupRef, {
    members: arrayUnion(userData)
  });
  
  return { ...groupData, id: groupDoc.id };
};

// Leave a group
export const leaveGroup = async (groupId, uid) => {
  const groupRef = doc(db, 'groups', groupId);
  const groupSnap = await getDoc(groupRef);
  
  if (!groupSnap.exists()) {
    throw new Error('Group not found');
  }
  
  const groupData = groupSnap.data();
  
  // Find the user's member object
  const memberToRemove = groupData.members.find(member => member.uid === uid);
  
  if (!memberToRemove) {
    throw new Error('You are not a member of this group');
  }
  
  // Check if user is the creator and there are other members
  if (groupData.createdBy === uid && groupData.members.length > 1) {
    // Transfer ownership to another member
    const newOwner = groupData.members.find(member => member.uid !== uid);
    await updateDoc(groupRef, {
      createdBy: newOwner.uid,
      members: arrayRemove(memberToRemove)
    });
  } else {
    // Just remove the member
    await updateDoc(groupRef, {
      members: arrayRemove(memberToRemove)
    });
  }
  
  return true;
};

// Get a single group by ID
export const getGroupById = async (groupId) => {
  const groupRef = doc(db, 'groups', groupId);
  const groupSnap = await getDoc(groupRef);
  
  if (!groupSnap.exists()) {
    throw new Error('Group not found');
  }
  
  return { id: groupSnap.id, ...groupSnap.data() };
};

// Add a trip to a group
export const addTripToGroup = async (groupId, tripId) => {
  const groupRef = doc(db, 'groups', groupId);
  
  await updateDoc(groupRef, {
    trips: arrayUnion(tripId)
  });
  
  return true;
};