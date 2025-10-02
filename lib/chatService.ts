import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  runTransaction,
  getDoc,
  where,
  limit,
  getDocs,
  updateDoc
} from 'firebase/firestore';

export const chatService = {
  /**
   * Listens for real-time messages in a specific chat room (quest group or 1-on-1).
   * @param chatId The ID of the chat document.
   * @param callback A function that is called with the array of messages whenever updates occur.
   * @returns An unsubscribe function to stop listening to updates.
   */
  getMessages(chatId: string, callback: (messages: any[]) => void) {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages: any[] = [];
      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      callback(messages);
    });

    return unsubscribe;
  },

  /**
   * Sends a message to a specific chat room (quest group or 1-on-1).
   * @param chatId The ID of the chat.
   * @param messageData An object containing the message content, uid of the sender, etc.
   * @returns {Promise<void>}
   */
  async sendMessage(chatId: string, messageData: { uid: string; text: string; authorName: string; }) {
    if (!messageData.text.trim()) {
      throw new Error("Message text cannot be empty.");
    }
    
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const chatRef = doc(db, 'chats', chatId);

    await addDoc(messagesRef, {
      ...messageData,
      createdAt: serverTimestamp(),
    });

    // Also update the 'lastMessage' on the parent chat document for previews.
    await updateDoc(chatRef, {
        lastMessage: {
            text: messageData.text,
            sender: messageData.authorName,
            timestamp: serverTimestamp()
        }
    });
  },

  /**
   * Sends a 1-on-1 direct message. Creates the chat room if it doesn't exist.
   * @param currentUser An object with the current user's { uid, name }.
   * @param otherUser An object with the other user's { uid, name }.
   * @param messageText The text of the message.
   */
  async sendOneOnOneMessage(
    currentUser: { uid: string; name: string; },
    otherUser: { uid: string; name: string; },
    messageText: string
  ) {
    // Create a consistent, unique chat ID for any pair of users.
    const chatId = currentUser.uid < otherUser.uid
      ? `${currentUser.uid}_${otherUser.uid}`
      : `${otherUser.uid}_${currentUser.uid}`;

    const chatRef = doc(db, 'chats', chatId);

    // Use a transaction to safely create the chat if it's the first message.
    await runTransaction(db, async (transaction) => {
      const chatSnap = await transaction.get(chatRef);
      
      // If the chat doesn't exist, create it.
      if (!chatSnap.exists()) {
        transaction.set(chatRef, {
          members: [currentUser.uid, otherUser.uid],
          memberInfo: {
            [currentUser.uid]: { name: currentUser.name },
            [otherUser.uid]: { name: otherUser.name },
          },
          type: 'one_on_one',
          createdAt: serverTimestamp(),
        });
      }
    });
    
    // Now that the chat is guaranteed to exist, send the message.
    await this.sendMessage(chatId, {
      uid: currentUser.uid,
      text: messageText,
      authorName: currentUser.name
    });
  },
};
