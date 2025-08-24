import { db, storage } from './firebase.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
  limit
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
      const fileName = `${Date.now()}_${postData.imageFile.name}`;
      const storageRef = ref(storage, `posts/${postData.uid}/${postId}/${fileName}`);
      const snapshot = await uploadBytes(storageRef, postData.imageFile);
      imageUrl = await getDownloadURL(snapshot.ref);

      // Update post with photoUrl
      await updateDoc(docRef, {
        photoUrl: imageUrl,
        updatedAt: serverTimestamp()
      });
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
    /*
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
    */

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
    const existingLike = await getDocs(query(likesRef, where('uid', '==', uid)));
    
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
    // await addXP(uid, 'JOIN_EVENT', { postId });

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