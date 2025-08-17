import { db } from './firebase.cjs';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

// Collection reference
const messagesCollection = collection(db, 'messages');

// Send a new message
export const sendMessage = async (messageData) => {
  try {
    const docRef = await addDoc(messagesCollection, {
      ...messageData,
      createdAt: serverTimestamp()
    });
    
    return { id: docRef.id, ...messageData };
  } catch (error) {
    console.error("Error sending message: ", error);
    throw error;
  }
};

// Get messages for a group
export const getGroupMessages = (groupId, callback) => {
  const q = query(
    messagesCollection,
    where('groupId', '==', groupId),
    orderBy('timestamp', 'asc')
  );
  
  if (callback) {
    // Real-time updates
    return onSnapshot(q, (snapshot) => {
      const messages = [];
      snapshot.forEach(doc => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      callback(messages);
    });
  } else {
    // One-time fetch
    return getDocs(q).then(snapshot => {
      const messages = [];
      snapshot.forEach(doc => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      return messages;
    });
  }
};

// Delete a message
export const deleteMessage = async (messageId) => {
  try {
    await deleteDoc(doc(db, 'messages', messageId));
    return true;
  } catch (error) {
    console.error("Error deleting message: ", error);
    throw error;
  }
};