// lib/notificationService.ts

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

export type NotificationType =
  | 'message'           // New message in chat
  | 'like'              // Someone liked your post
  | 'comment'           // Someone commented on your post
  | 'reply'             // Someone replied to your comment
  | 'follow'            // Someone followed you
  | 'mention'           // Someone mentioned you
  | 'quest_invite'      // Invited to a quest
  | 'group_add'         // Added to a group
  | 'event_reminder';   // Event starting soon

export interface NotificationData {
  recipientId: string;
  type: NotificationType;
  senderId: string;
  senderName: string;
  senderPhoto: string;
  title: string;
  message: string;
  // Optional contextual data
  postId?: string;
  commentId?: string;
  chatId?: string;
  questId?: string;
  eventId?: string;
  // Action URL
  actionUrl?: string;
}

// =================================================================
// CREATE NOTIFICATION
// =================================================================
export const createNotification = async (data: NotificationData) => {
  try {
    // Don't notify if sender = recipient
    if (data.senderId === data.recipientId) {
      return;
    }

    // Check for duplicate recent notification (within 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const duplicateQuery = query(
      collection(db, 'notifications'),
      where('recipientId', '==', data.recipientId),
      where('senderId', '==', data.senderId),
      where('type', '==', data.type),
      where('createdAt', '>', fiveMinutesAgo)
    );

    const duplicates = await getDocs(duplicateQuery);
    if (!duplicates.empty) {
      console.log('Duplicate notification prevented');
      return;
    }

    // Create notification
    const notificationRef = await addDoc(collection(db, 'notifications'), {
      ...data,
      read: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('Notification created:', notificationRef.id);
    return notificationRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// =================================================================
// SUBSCRIBE TO NOTIFICATIONS (Real-time)
// =================================================================
export const subscribeToNotifications = (
  userId: string,
  callback: (notifications: any[]) => void
) => {
  const q = query(
    collection(db, 'notifications'),
    where('recipientId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }));

    callback(notifications);
  });
};

// =================================================================
// MARK NOTIFICATION AS READ
// =================================================================
export const markAsRead = async (notificationId: string) => {
  try {
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, {
      read: true,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

// =================================================================
// MARK ALL AS READ
// =================================================================
export const markAllAsRead = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        read: true,
        updatedAt: serverTimestamp()
      });
    });

    await batch.commit();
    console.log(`Marked ${snapshot.size} notifications as read`);
  } catch (error) {
    console.error('Error marking all as read:', error);
  }
};

// =================================================================
// DELETE NOTIFICATION
// =================================================================
export const deleteNotification = async (notificationId: string) => {
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
  } catch (error) {
    console.error('Error deleting notification:', error);
  }
};

// =================================================================
// DELETE ALL NOTIFICATIONS
// =================================================================
export const deleteAllNotifications = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Deleted ${snapshot.size} notifications`);
  } catch (error) {
    console.error('Error deleting all notifications:', error);
  }
};

// =================================================================
// GET UNREAD COUNT
// =================================================================
export const getUnreadCount = async (userId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

// =================================================================
// HELPER FUNCTIONS FOR SPECIFIC NOTIFICATIONS
// =================================================================

export const notifyNewMessage = async (
  chatId: string,
  chatName: string,
  senderId: string,
  senderName: string,
  senderPhoto: string,
  messageText: string,
  recipientIds: string[]
) => {
  const promises = recipientIds
    .filter(id => id !== senderId)
    .map(recipientId =>
      createNotification({
        recipientId,
        type: 'message',
        senderId,
        senderName,
        senderPhoto,
        title: chatName,
        message: messageText || '📷 Photo',
        chatId,
        actionUrl: `/chats?chatId=${chatId}`
      })
    );

  await Promise.all(promises);
};

export const notifyPostLike = async (
  postId: string,
  postAuthorId: string,
  likerId: string,
  likerName: string,
  likerPhoto: string
) => {
  await createNotification({
    recipientId: postAuthorId,
    type: 'like',
    senderId: likerId,
    senderName: likerName,
    senderPhoto: likerPhoto,
    title: 'New Like',
    message: `${likerName} liked your post`,
    postId,
    actionUrl: `/post/${postId}`
  });
};

export const notifyPostComment = async (
  postId: string,
  postAuthorId: string,
  commenterId: string,
  commenterName: string,
  commenterPhoto: string,
  commentText: string
) => {
  await createNotification({
    recipientId: postAuthorId,
    type: 'comment',
    senderId: commenterId,
    senderName: commenterName,
    senderPhoto: commenterPhoto,
    title: 'New Comment',
    message: `${commenterName} commented: ${commentText.substring(0, 50)}${commentText.length > 50 ? '...' : ''}`,
    postId,
    actionUrl: `/post/${postId}`
  });
};

export const notifyFollow = async (
  followerId: string,
  followerName: string,
  followerPhoto: string,
  followedUserId: string
) => {
  await createNotification({
    recipientId: followedUserId,
    type: 'follow',
    senderId: followerId,
    senderName: followerName,
    senderPhoto: followerPhoto,
    title: 'New Follower',
    message: `${followerName} started following you`,
    actionUrl: `/profile/${followerId}`
  });
};

export const notifyGroupAdd = async (
  groupId: string,
  groupName: string,
  adderId: string,
  adderName: string,
  adderPhoto: string,
  newMemberIds: string[]
) => {
  const promises = newMemberIds
    .filter(id => id !== adderId)
    .map(recipientId =>
      createNotification({
        recipientId,
        type: 'group_add',
        senderId: adderId,
        senderName: adderName,
        senderPhoto: adderPhoto,
        title: 'Added to Group',
        message: `${adderName} added you to ${groupName}`,
        chatId: groupId,
        actionUrl: `/chats?chatId=${groupId}`
      })
    );

  await Promise.all(promises);
};

export const notifyQuestInvite = async (
  questId: string,
  questTitle: string,
  inviterId: string,
  inviterName: string,
  inviterPhoto: string,
  inviteeId: string
) => {
  await createNotification({
    recipientId: inviteeId,
    type: 'quest_invite',
    senderId: inviterId,
    senderName: inviterName,
    senderPhoto: inviterPhoto,
    title: 'Quest Invitation',
    message: `${inviterName} invited you to join ${questTitle}`,
    questId,
    actionUrl: `/quest/${questId}`
  });
};

export const notifyMention = async (
  chatId: string,
  chatName: string,
  mentionerId: string,
  mentionerName: string,
  mentionerPhoto: string,
  messageText: string,
  mentionedUserIds: string[]
) => {
  const promises = mentionedUserIds
    .filter(id => id !== mentionerId)
    .map(recipientId =>
      createNotification({
        recipientId,
        type: 'mention',
        senderId: mentionerId,
        senderName: mentionerName,
        senderPhoto: mentionerPhoto,
        title: 'Mentioned in Chat',
        message: `${mentionerName} mentioned you: ${messageText.substring(0, 50)}${messageText.length > 50 ? '...' : ''}`,
        chatId,
        actionUrl: `/chats?chatId=${chatId}`
      })
    );

  await Promise.all(promises);
};

export const notifyNewPost = async (
  postId: string,
  postAuthorId: string,
  postAuthorName: string,
  postAuthorPhoto: string,
  postTitle: string,
  followerIds: string[]
) => {
  const promises = followerIds.map(recipientId =>
    createNotification({
      recipientId,
      type: 'follow', // Using 'follow' as generic update from followed user for now
      senderId: postAuthorId,
      senderName: postAuthorName,
      senderPhoto: postAuthorPhoto,
      title: 'New Quest Posted',
      message: `${postAuthorName} posted a new quest: ${postTitle}`,
      postId,
      actionUrl: `/post/${postId}`
    })
  );

  await Promise.all(promises);
};