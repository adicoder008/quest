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
  doc
} from 'firebase/firestore';
import { addXP } from './xpService'; // Import the XP service

// Post types
export const POST_TYPES = {
  REGULAR: 'regular',
  EVENT: 'event',
  SPONSORED: 'sponsored',
  QUEST_COMPLETION: 'quest_completion'
};

// Create a new post
export const createPost = async (postData) => {
  try {
    if (!postData.uid || !postData.text) {
      throw new Error('uid and text content are required');
    }

    // Create initial post object **without photoUrl**
    const post = {
      uid: postData.uid,
      userName: postData.userName || '',
      userProfilePic: postData.userProfilePic || '',
      text: postData.text,
      photoUrl: '', // placeholder
      postType: postData.postType || POST_TYPES.REGULAR,
      location: postData.location || null,
      topics: postData.topics || [],
      taggedUsers: postData.taggedUsers || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      isDeleted: false,
      ...(postData.questContext && { questContext: postData.questContext })
    };

    // Add post to Firestore (get docRef.id for postId)
    const postsRef = collection(db, 'posts');
    const docRef = await addDoc(postsRef, post);
    const postId = docRef.id;

    // Upload image if exists
    let imageUrl = '';
    if (postData.imageFile) {
      const fileName = `${Date.now()}_${postData.imageFile.name}`;
      // UPDATED: include postId in the path
      const storageRef = ref(storage, `posts/${postData.uid}/${postId}/${fileName}`);
      const snapshot = await uploadBytes(storageRef, postData.imageFile);
      imageUrl = await getDownloadURL(snapshot.ref);

      // Update post with photoUrl
      await updateDoc(docRef, {
        photoUrl: imageUrl,
        updatedAt: serverTimestamp()
      });
    }

    // Update user's post count
    const userRef = doc(db, 'users', postData.uid);
    await updateDoc(userRef, {
      postsCount: increment(1),
      updatedAt: serverTimestamp()
    });

    // Add XP for creating a post
    await addXP(postData.uid, 'CREATE_POST', { 
      postId: postId,
      postType: post.postType 
    });

    if (post.postType === POST_TYPES.QUEST_COMPLETION) {
      await addXP(postData.uid, 'COMPLETE_QUEST', {
        postId: postId,
        questId: postData.questContext?.questId || ''
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
    const postRef = doc(db, 'posts', postId);
    
    // First check if user already liked this post
    // You might want to implement a more sophisticated like system
    // with a subcollection for likes to prevent duplicate likes
    
    await updateDoc(postRef, {
      likeCount: increment(1),
      updatedAt: serverTimestamp()
    });

    // Add XP for liking a post (optional)
    await addXP(uid, 'LIKE_POST', { postId });

    return { success: true };
  } catch (error) {
    console.error("Error liking post:", error);
    throw error;
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
      isDeleted: false
    };

    // Add comment to subcollection
    const docRef = await addDoc(commentsRef, comment);

    // Update post's comment count
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      commentCount: increment(1),
      updatedAt: serverTimestamp()
    });

    // Add XP for commenting on a post
    await addXP(commentData.uid, 'COMMENT_POST', { 
      postId,
      commentId: docRef.id 
    });

    return { id: docRef.id, ...comment };
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

// Get real-time posts updates
export const subscribeToPosts = (callback, options = {}) => {
  const { limit = 20, postType = null } = options;
  
  let q = query(
    collection(db, 'posts'),
    orderBy('createdAt', 'desc')
  );

  // Add filters if specified
  if (postType) {
    q = query(q, where('postType', '==', postType));
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
          createdAt: data.createdAt?.toDate() 
        });
      }
    });
    callback(posts);
  });

  return unsubscribe;
};

// Additional useful functions

// Get a single post by ID
export const getPostById = async (postId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (postDoc.exists()) {
      return { id: postDoc.id, ...postDoc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting post:", error);
    throw error;
  }
};

// Update a post
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

// Soft delete a post
export const deletePost = async (postId, uid) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }
    
    const postData = postDoc.data();
    
    // Verify the user is the author
    if (postData.uid !== uid) {
      throw new Error('Unauthorized: Only the post author can delete this post');
    }
    
    // Soft delete by marking as deleted
    await updateDoc(postRef, {
      isDeleted: true,
      updatedAt: serverTimestamp()
    });
    
    // Optionally decrement user's post count
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