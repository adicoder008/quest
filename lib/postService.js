import { db, storage } from './firebase.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { compressAndUploadImage } from './imageService';
import { notifyPostLike ,notifyFollow,notifyPostComment } from './notificationService';



import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot, 
  updateDoc,
  increment,
  doc,
  getDoc,
  where,
  limit,
  writeBatch,
  deleteDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { addXP } from './xpService'; // Import the XP service

// Post types
export const POST_TYPES = {
  REGULAR: 'regular',
  EVENT: 'event',
  SPONSORED: 'sponsored',
  QUEST_COMPLETION: 'quest_completion'
};

// Content types for regular posts
export const CONTENT_TYPES = {
  TEXT_ONLY: 'text_only',
  PHOTO_ONLY: 'photo_only',
  PHOTO_WITH_TEXT: 'photo_with_text'
};

export const savePost = async (postId, uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      savedPosts: arrayUnion(postId),
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error("Error saving post:", error);
    throw error;
  }
};

// Unsave/Remove bookmark from a post
export const unsavePost = async (postId, uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      savedPosts: arrayRemove(postId),
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error("Error unsaving post:", error);
    throw error;
  }
};

// Check if user saved a post
export const checkUserSavedPost = async (postId, uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const savedPosts = userDoc.data().savedPosts || [];
      return savedPosts.includes(postId);
    }
    return false;
  } catch (error) {
    console.error("Error checking save status:", error);
    return false;
  }
};

// Get user's saved posts
export const getSavedPosts = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return [];
    }

    const savedPostIds = userDoc.data().savedPosts || [];
    
    if (savedPostIds.length === 0) {
      return [];
    }

    // Fetch all saved posts
    const posts = [];
    for (const postId of savedPostIds) {
      const postDoc = await getDoc(doc(db, 'posts', postId));
      if (postDoc.exists() && !postDoc.data().isDeleted) {
        posts.push({
          id: postDoc.id,
          ...postDoc.data(),
          createdAt: postDoc.data().createdAt?.toDate(),
          updatedAt: postDoc.data().updatedAt?.toDate()
        });
      }
    }

    return posts;
  } catch (error) {
    console.error("Error getting saved posts:", error);
    throw error;
  }
};

// ============= SHARE FUNCTIONS =============

// Share a post (increment share count)
export const sharePost = async (postId, uid) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      shareCount: increment(1),
      updatedAt: serverTimestamp()
    });

    // Add XP for sharing
    await addXP(uid, 'SHARE_POST', { postId });

    return { success: true };
  } catch (error) {
    console.error("Error sharing post:", error);
    throw error;
  }
};

// ============= REPORT FUNCTIONS =============

// Report a post
export const reportPost = async (postId, uid, reason, description = '') => {
  try {
    const reportsRef = collection(db, 'reports');
    
    await addDoc(reportsRef, {
      postId,
      reportedBy: uid,
      reason,
      description,
      status: 'pending',
      createdAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error("Error reporting post:", error);
    throw error;
  }
};

// Create a new post
export const createPost = async (postData) => {
  try {
    if (!postData.uid || (!postData.text && !postData.imageFile)) {
      throw new Error('uid and either text or image content are required');
    }

    // Determine content type for regular posts
    let contentType = CONTENT_TYPES.TEXT_ONLY;
    if (postData.postType === POST_TYPES.REGULAR) {
      if (postData.imageFile && postData.text) {
        contentType = CONTENT_TYPES.PHOTO_WITH_TEXT;
      } else if (postData.imageFile) {
        contentType = CONTENT_TYPES.PHOTO_ONLY;
      }
    }

    // Create initial post object
    const post = {
      uid: postData.uid,
      userName: postData.userName || '',
      userProfilePic: postData.userProfilePic || '',
      text: postData.text || '',
      photoUrl: '', // placeholder
      postType: postData.postType || POST_TYPES.REGULAR,
      contentType: contentType,
      location: postData.location || null,
      topics: postData.topics || [],
      taggedUsers: postData.taggedUsers || [],
      caption: postData.caption || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      isDeleted: false,
      visibility: postData.visibility || 'public', // public, friends, private
      
      // Event-specific fields
      ...(postData.postType === POST_TYPES.EVENT && {
        eventTitle: postData.eventTitle || '',
        eventSubtitle: postData.eventSubtitle || '',
        eventPrice: postData.eventPrice || null,
        eventDate: postData.eventDate || null,
        eventLocation: postData.eventLocation || postData.location,
        eventCapacity: postData.eventCapacity || null,
        attendeesCount: 0
      }),

      // Quest completion fields
      ...(postData.questContext && { 
        questContext: {
          questId: postData.questContext.questId,
          questTitle: postData.questContext.questTitle,
          description: postData.questContext.description,
          category: postData.questContext.category || 'general',
          xpEarned: postData.questContext.xpEarned || 0,
          difficulty: postData.questContext.difficulty || 'normal'
        }
      })
    };

    // Add post to Firestore (get docRef.id for postId)
    const postsRef = collection(db, 'posts');
    const docRef = await addDoc(postsRef, post);
    const postId = docRef.id;

    // Upload image if exists
    let imageUrl = '';
    if (postData.imageFile) {
    imageUrl = await compressAndUploadImage(
    postData.imageFile,
    'posts',
    postData.uid
  );
}

    // Update user's post count and stats
    const userRef = doc(db, 'users', postData.uid);
    const updateData = {
      postsCount: increment(1),
      updatedAt: serverTimestamp()
    };

    // Increment specific counters based on post type
    if (post.postType === POST_TYPES.QUEST_COMPLETION) {
      updateData.questsCompleted = increment(1);
    } else if (post.postType === POST_TYPES.EVENT) {
      updateData.eventsCreated = increment(1);
    }

    await updateDoc(userRef, updateData);

    // Add XP for creating a post (commented out until xpService is available)
    
    const xpActions = {
      [POST_TYPES.REGULAR]: 'CREATE_POST',
      [POST_TYPES.EVENT]: 'CREATE_EVENT',
      [POST_TYPES.QUEST_COMPLETION]: 'CREATE_POST'
    };

    await addXP(postData.uid, xpActions[post.postType] || 'CREATE_POST', { 
      postId: postId,
      postType: post.postType 
    });

    // Additional XP for quest completion
    if (post.postType === POST_TYPES.QUEST_COMPLETION) {
      await addXP(postData.uid, 'COMPLETE_QUEST', {
        postId: postId,
        questId: postData.questContext?.questId || '',
        xpBonus: postData.questContext?.xpEarned || 0
      });
    }
    

    // Return updated post object
    return { id: postId, ...post, photoUrl: imageUrl };

  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

// Like a post
export const likePost = async (postId, uid) => {
  try {
    // Check if user already liked this post
    const likesRef = collection(db, 'posts', postId, 'likes');
    const existingLike = await getDoc(query(likesRef, where('uid', '==', uid)));
    
    if (!existingLike.empty) {
      throw new Error('User already liked this post');
    }

    // Add like document
    await addDoc(likesRef, {
      uid: uid,
      createdAt: serverTimestamp()
    });

    // Update post like count
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likeCount: increment(1),
      updatedAt: serverTimestamp()
    });

    // Add XP for liking a post (commented out until xpService is available)
    // await addXP(uid, 'LIKE_POST', { postId });

      const postDoc = await getDoc(doc(db, 'posts', postId));
  if (postDoc.exists()) {
    const postAuthorId = postDoc.data().uid;
    
    // Get liker info
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      await notifyPostLike(
        postId,
        postAuthorId,
        uid,
        userData.displayName || 'Someone',
        userData.photoURL || ''
      );
    }
  }

    return { success: true };
  } catch (error) {
    console.error("Error liking post:", error);
    throw error;
  }
};

// Unlike a post
export const unlikePost = async (postId, uid) => {
  try {
    const likesRef = collection(db, 'posts', postId, 'likes');
    const existingLike = await getDocs(query(likesRef, where('uid', '==', uid)));
    
    if (existingLike.empty) {
      throw new Error('User has not liked this post');
    }

    // Remove like document
    await deleteDoc(existingLike.docs[0].ref);

    // Update post like count
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likeCount: increment(-1),
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error("Error unliking post:", error);
    throw error;
  }
};

// Check if user liked a post
export const checkUserLikedPost = async (postId, uid) => {
  try {
    const likesRef = collection(db, 'posts', postId, 'likes');
    const existingLike = await getDocs(query(likesRef, where('uid', '==', uid)));
    return !existingLike.empty;
  } catch (error) {
    console.error("Error checking like status:", error);
    return false;
  }
};

// Add a comment to a post
export const addComment = async (postId, commentData) => {
  try {
    const commentsRef = collection(db, 'posts', postId, 'comments');
    
    const comment = {
      uid: commentData.uid,
      userName: commentData.userName || '',
      userProfilePic: commentData.userProfilePic || '',
      text: commentData.text,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isDeleted: false,
      likeCount: 0,
      replyCount: 0
    };

    // Add comment to subcollection
    const docRef = await addDoc(commentsRef, comment);

    // Update post's comment count
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      commentCount: increment(1),
      updatedAt: serverTimestamp()
    });

    // Add XP for commenting on a post (commented out until xpService is available)
    /*
    await addXP(commentData.uid, 'COMMENT_POST', { 
      postId,
      commentId: docRef.id 
    });
    */

   const postDoc = await getDoc(doc(db, 'posts', postId));
    if (postDoc.exists()) {
      const postAuthorId = postDoc.data().uid;
      
      await notifyPostComment(
        postId,
        postAuthorId,
        commentData.uid,
        commentData.userName,
        commentData.userProfilePic,
        commentData.text
      );
    }
    
    return { id: docRef.id, ...comment };

  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

// Get real-time posts updates
export const subscribeToPosts = (callback, options = {}) => {
  const { 
    limit: queryLimit = 20, 
    postType = null, 
    userId = null,
    contentType = null 
  } = options;
  
  let q = query(
    collection(db, 'posts'),
    orderBy('createdAt', 'desc')
  );

  // Add filters if specified
  if (postType) {
    q = query(q, where('postType', '==', postType));
  }
  
  if (userId) {
    q = query(q, where('uid', '==', userId));
  }
  
  if (contentType) {
    q = query(q, where('contentType', '==', contentType));
  }

  // Add limit
  if (queryLimit) {
    q = query(q, limit(queryLimit));
  }

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const posts = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Only include non-deleted posts
      if (!data.isDeleted) {
        posts.push({ 
          id: doc.id, 
          ...data,
          // Convert Firestore timestamp to JS date if needed
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        });
      }
    });
    callback(posts);
  });

  return unsubscribe;
};
// Follow a user
export const followUser = async (currentUserId, targetUserId) => {
  try {
    if (currentUserId === targetUserId) {
      throw new Error("You cannot follow yourself.");
    }

    const batch = writeBatch(db);

    // Add targetUser to currentUser's "following" subcollection
    const followingRef = doc(db, 'users', currentUserId, 'following', targetUserId);
    batch.set(followingRef, {
      uid: targetUserId,
      followedAt: serverTimestamp()
    });

    // Add currentUser to targetUser's "followers" subcollection
    const followerRef = doc(db, 'users', targetUserId, 'followers', currentUserId);
    batch.set(followerRef, {
      uid: currentUserId,
      followedAt: serverTimestamp()
    });

    // Update followingCount for currentUser
    const currentUserRef = doc(db, 'users', currentUserId);
    batch.update(currentUserRef, { followingCount: increment(1) });

    // Update followersCount for targetUser
    const targetUserRef = doc(db, 'users', targetUserId);
    batch.update(targetUserRef, { followersCount: increment(1) });

    await batch.commit();

    // Add XP for following a user
    await addXP(currentUserId, 'FOLLOW_USER', { targetUserId });

  // Get follower info
    const userDoc = await getDoc(doc(db, 'users', currentUserId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      await notifyFollow(
        currentUserId,
        userData.displayName || 'Someone',
        userData.photoURL || '',
        targetUserId
      );
    }
    
    return { success: true };
    } catch (error) {
    console.error("Error following user:", error);
    throw error;
  }
};

// Unfollow a user
export const unfollowUser = async (currentUserId, targetUserId) => {
  try {
    if (currentUserId === targetUserId) {
      throw new Error("You cannot unfollow yourself.");
    }

    const batch = writeBatch(db);

    // Remove targetUser from currentUser's "following" subcollection
    const followingRef = doc(db, 'users', currentUserId, 'following', targetUserId);
    batch.delete(followingRef);

    // Remove currentUser from targetUser's "followers" subcollection
    const followerRef = doc(db, 'users', targetUserId, 'followers', currentUserId);
    batch.delete(followerRef);

    // Update followingCount for currentUser
    const currentUserRef = doc(db, 'users', currentUserId);
    batch.update(currentUserRef, { followingCount: increment(-1) });

    // Update followersCount for targetUser
    const targetUserRef = doc(db, 'users', targetUserId);
    batch.update(targetUserRef, { followersCount: increment(-1) });

    await batch.commit();

    return { success: true };
  } catch (error) {
    console.error("Error unfollowing user:", error);
    throw error;
  }
};


// Get posts by specific filters
export const getPostsByFilter = async (filters = {}) => {
  try {
    const { 
      postType, 
      userId, 
      contentType, 
      location, 
      topics = [],
      limit: queryLimit = 20 
    } = filters;

    let q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc')
    );

    // Apply filters
    if (postType) {
      q = query(q, where('postType', '==', postType));
    }
    
    if (userId) {
      q = query(q, where('uid', '==', userId));
    }
    
    if (contentType) {
      q = query(q, where('contentType', '==', contentType));
    }
    
    if (location) {
      q = query(q, where('location', '==', location));
    }
    
    if (topics.length > 0) {
      q = query(q, where('topics', 'array-contains-any', topics));
    }

    // Add limit
    if (queryLimit) {
      q = query(q, limit(queryLimit));
    }

    const querySnapshot = await getDocs(q);
    const posts = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.isDeleted) {
        posts.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        });
      }
    });

    return posts;
  } catch (error) {
    console.error("Error getting posts by filter:", error);
    throw error;
  }
};

// Get trending posts (based on engagement)
export const getTrendingPosts = async (timeframe = '24h', limitCount = 10) => {
  try {
    const now = new Date();
    let startTime;
    
    switch (timeframe) {
      case '1h':
        startTime = new Date(now.getTime() - (1 * 60 * 60 * 1000));
        break;
      case '24h':
        startTime = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        break;
      case '7d':
        startTime = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        break;
      default:
        startTime = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    }

    const q = query(
      collection(db, 'posts'),
      where('createdAt', '>=', startTime),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'desc'),
      limit(limitCount * 3) // Get more to sort by engagement
    );

    const querySnapshot = await getDocs(q);
    const posts = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const engagementScore = (data.likeCount || 0) + (data.commentCount || 0) * 2 + (data.shareCount || 0) * 3;
      
      posts.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        engagementScore
      });
    });

    // Sort by engagement score and return top posts
    return posts
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, limitCount);
      
  } catch (error) {
    console.error("Error getting trending posts:", error);
    throw error;
  }
};

// Event-specific functions
export const joinEvent = async (postId, uid, userData) => {
  try {
    const eventRef = doc(db, 'posts', postId);
    const eventDoc = await getDoc(eventRef);
    
    if (!eventDoc.exists() || eventDoc.data().postType !== POST_TYPES.EVENT) {
      throw new Error('Event not found');
    }

    // Add user to event attendees
    const attendeesRef = collection(db, 'posts', postId, 'attendees');
    await addDoc(attendeesRef, {
      uid: uid,
      userName: userData.userName,
      userProfilePic: userData.userProfilePic,
      joinedAt: serverTimestamp()
    });

    // Update attendees count
    await updateDoc(eventRef, {
      attendeesCount: increment(1),
      updatedAt: serverTimestamp()
    });

    // Add XP for joining event (commented out until xpService is available)
     await addXP(uid, 'JOIN_EVENT', { postId });

    return { success: true };
  } catch (error) {
    console.error("Error joining event:", error);
    throw error;
  }
};

// Additional utility functions
export const getPostById = async (postId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (postDoc.exists()) {
      const data = postDoc.data();
      return { 
        id: postDoc.id, 
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting post:", error);
    throw error;
  }
};

export const updatePost = async (postId, updates) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
};

export const deletePost = async (postId, uid) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }
    
    const postData = postDoc.data();
    
    if (postData.uid !== uid) {
      throw new Error('Unauthorized: Only the post author can delete this post');
    }
    
    await updateDoc(postRef, {
      isDeleted: true,
      updatedAt: serverTimestamp()
    });
    
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      postsCount: increment(-1),
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
};