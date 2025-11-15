// lib/chatService.ts
import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDoc,
  where,
  getDocs,
  updateDoc,
  setDoc
} from 'firebase/firestore';
import { notifyNewMessage } from './notificationService';

export const chatService = {
  /**
   * Listens for real-time messages in a specific chat room.
   */
  getMessages(chatId: string, callback: (messages: any[]) => void) {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const messages: any[] = [];
        querySnapshot.forEach((docSnap) => {
          messages.push({ id: docSnap.id, ...docSnap.data() });
        });
        callback(messages);
      },
      (error) => {
        console.error('Error listening to messages:', error);
        callback([]);
      }
    );

    return unsubscribe;
  },

  /**
   * Sends a message to a specific chat room.
   */
  async sendMessage(
    chatId: string,
    messageData: {
      uid: string;
      text: string;
      authorName: string;
      authorPhoto?: string;
      replyTo?: string;
      mentions?: string[];
    }
  ) {
    try {
      if (!messageData.text.trim()) {
        throw new Error("Message text cannot be empty.");
      }

      // Verify chat exists and user is member
      const chatRef = doc(db, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        throw new Error("Chat does not exist");
      }

      const chatData = chatSnap.data();
      if (!chatData.members.includes(messageData.uid)) {
        throw new Error("You are not a member of this chat");
      }

      // Add message
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const newMessage: any = {
        uid: messageData.uid,
        text: messageData.text,
        authorName: messageData.authorName,
        authorPhoto: messageData.authorPhoto || '',
        createdAt: serverTimestamp(),
      };

      // Add reply data if replying
      if (messageData.replyTo) {
        newMessage.replyTo = messageData.replyTo;
      }

      // Add mentions if any
      if (messageData.mentions && messageData.mentions.length > 0) {
        newMessage.mentions = messageData.mentions;
      }

      await addDoc(messagesRef, newMessage);

      // Update lastMessage on chat
      await updateDoc(chatRef, {
        lastMessage: {
          text: messageData.text,
          sender: messageData.authorName,
          senderId: messageData.uid,
          timestamp: serverTimestamp()
        },
        updatedAt: serverTimestamp()
      });

      // Increment unread count for other members
      await this.incrementUnreadCount(chatId, messageData.uid, chatData.members);

      // Send notifications to other members
      try {
        const otherMembers = chatData.members.filter((id: string) => id !== messageData.uid);
        if (otherMembers.length > 0) {
          await notifyNewMessage(
            chatId,
            chatData.name || 'Chat',
            messageData.uid,
            messageData.authorName,
            messageData.authorPhoto || '',
            messageData.text,
            otherMembers
          );
        }
      } catch (notifError) {
        console.error('Error sending notification:', notifError);
        // Don't fail the message if notification fails
      }

      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  /**
   * Creates or gets a one-on-one chat between two users.
   * IMPORTANT: This uses setDoc with a predictable ID based on user IDs
   */
  async getOrCreateOneOnOneChat(
    currentUser: { uid: string; name: string; photoURL?: string },
    otherUser: { uid: string; name: string; photoURL?: string }
  ): Promise<string> {
    try {
      // Create consistent chat ID (alphabetically sorted UIDs)
      const chatId =
        currentUser.uid < otherUser.uid
          ? `${currentUser.uid}_${otherUser.uid}`
          : `${otherUser.uid}_${currentUser.uid}`;

      const chatRef = doc(db, 'chats', chatId);
      
      // Check if chat already exists
      const chatSnap = await getDoc(chatRef);
      
      if (chatSnap.exists()) {
        console.log('Chat already exists:', chatId);
        return chatId;
      }

      // Create new chat with proper structure
      // CRITICAL: members must be an array, not a map
      const chatData = {
        id: chatId,
        type: 'one_on_one',
        members: [currentUser.uid, otherUser.uid], // ✅ Array format
        memberInfo: {
          [currentUser.uid]: {
            name: currentUser.name,
            photoURL: currentUser.photoURL || '',
          },
          [otherUser.uid]: {
            name: otherUser.name,
            photoURL: otherUser.photoURL || '',
          },
        },
        name: `${currentUser.name} & ${otherUser.name}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: null,
      };

      console.log('Creating chat with data:', chatData);
      
      // Use setDoc instead of addDoc for predictable ID
      await setDoc(chatRef, chatData);

      console.log('One-on-one chat created successfully:', chatId);
      return chatId;
    } catch (error) {
      console.error('Error creating one-on-one chat:', error);
      throw error;
    }
  },

  /**
   * Sends a 1-on-1 direct message.
   */
  async sendOneOnOneMessage(
    currentUser: { uid: string; name: string; photoURL?: string },
    otherUser: { uid: string; name: string; photoURL?: string },
    messageText: string
  ) {
    try {
      // Get or create the chat
      const chatId = await this.getOrCreateOneOnOneChat(currentUser, otherUser);

      // Send the message
      await this.sendMessage(chatId, {
        uid: currentUser.uid,
        text: messageText,
        authorName: currentUser.name,
        authorPhoto: currentUser.photoURL,
      });

      return chatId;
    } catch (error) {
      console.error('Error sending one-on-one message:', error);
      throw error;
    }
  },

  /**
   * Gets all chats for a user.
   */
  async getUserChats(userId: string) {
    try {
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('members', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
    } catch (error) {
      console.error('Error getting user chats:', error);
      return [];
    }
  },

  /**
   * Subscribes to user's chats in real-time.
   */
  subscribeToUserChats(userId: string, callback: (chats: any[]) => void) {
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('members', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const chats = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        callback(chats);
      },
      (error) => {
        console.error('Error listening to chats:', error);
        callback([]);
      }
    );
  },

  /**
   * Creates a group chat.
   */
  async createGroupChat(
    creatorId: string,
    creatorName: string,
    creatorPhoto: string,
    groupName: string,
    memberIds: string[],
    memberInfoMap: { [uid: string]: { name: string; photoURL: string } }
  ) {
    try {
      // Make sure creator is in members
      const allMembers = Array.from(new Set([creatorId, ...memberIds]));

      const groupData = {
        type: 'group',
        name: groupName,
        members: allMembers, // ✅ Array format
        memberInfo: memberInfoMap,
        createdBy: creatorId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: null,
      };

      const groupRef = await addDoc(collection(db, 'chats'), groupData);

      console.log('Group chat created:', groupRef.id);
      return groupRef.id;
    } catch (error) {
      console.error('Error creating group chat:', error);
      throw error;
    }
  },

  /**
   * Deletes a message (soft delete).
   */
  async deleteMessage(chatId: string, messageId: string) {
    try {
      const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
      await updateDoc(messageRef, {
        isDeleted: true,
        deletedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  /**
   * Marks messages as read for a user in a chat.
   */
  async markMessagesAsRead(chatId: string, userId: string) {
    try {
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        [`readBy.${userId}`]: serverTimestamp(),
        [`unreadCount.${userId}`]: 0,
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      // Don't throw - this is not critical
    }
  },

  /**
   * Sets typing status for a user in a chat.
   */
  async setTypingStatus(chatId: string, userId: string, isTyping: boolean) {
    try {
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        [`typing.${userId}`]: isTyping ? serverTimestamp() : null,
      });
    } catch (error) {
      console.error('Error setting typing status:', error);
    }
  },

  /**
   * Adds a reaction to a message.
   */
  async addReaction(chatId: string, messageId: string, userId: string, emoji: string) {
    try {
      const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
      const messageSnap = await getDoc(messageRef);

      if (!messageSnap.exists()) {
        throw new Error("Message does not exist");
      }

      const messageData = messageSnap.data();
      const reactions = messageData.reactions || {};

      if (!reactions[emoji]) {
        reactions[emoji] = [];
      }

      if (!reactions[emoji].includes(userId)) {
        reactions[emoji].push(userId);
      }

      await updateDoc(messageRef, { reactions });
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  },

  /**
   * Removes a reaction from a message.
   */
  async removeReaction(chatId: string, messageId: string, userId: string, emoji: string) {
    try {
      const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
      const messageSnap = await getDoc(messageRef);

      if (!messageSnap.exists()) {
        throw new Error("Message does not exist");
      }

      const messageData = messageSnap.data();
      const reactions = messageData.reactions || {};

      if (reactions[emoji]) {
        reactions[emoji] = reactions[emoji].filter((id: string) => id !== userId);
        if (reactions[emoji].length === 0) {
          delete reactions[emoji];
        }
      }

      await updateDoc(messageRef, { reactions });
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  },

  /**
   * Pins a message in a chat.
   */
  async pinMessage(chatId: string, messageId: string) {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        throw new Error("Chat does not exist");
      }

      const chatData = chatSnap.data();
      const pinnedMessages = chatData.pinnedMessages || [];

      if (!pinnedMessages.includes(messageId)) {
        pinnedMessages.push(messageId);
        await updateDoc(chatRef, { pinnedMessages });
      }
    } catch (error) {
      console.error('Error pinning message:', error);
      throw error;
    }
  },

  /**
   * Unpins a message in a chat.
   */
  async unpinMessage(chatId: string, messageId: string) {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        throw new Error("Chat does not exist");
      }

      const chatData = chatSnap.data();
      const pinnedMessages = chatData.pinnedMessages || [];

      const updatedPinnedMessages = pinnedMessages.filter((id: string) => id !== messageId);
      await updateDoc(chatRef, { pinnedMessages: updatedPinnedMessages });
    } catch (error) {
      console.error('Error unpinning message:', error);
      throw error;
    }
  },

  /**
   * Increments unread count for users in a chat (except sender).
   */
  async incrementUnreadCount(chatId: string, senderId: string, members: string[]) {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) return;

      const chatData = chatSnap.data();
      const unreadCount = chatData.unreadCount || {};

      members.forEach((memberId: string) => {
        if (memberId !== senderId) {
          unreadCount[memberId] = (unreadCount[memberId] || 0) + 1;
        }
      });

      await updateDoc(chatRef, { unreadCount });
    } catch (error) {
      console.error('Error incrementing unread count:', error);
    }
  },
};

export default chatService;