import { useState, useEffect, useCallback } from 'react';
import { updateDoc, doc as firestoreDoc, arrayUnion, arrayRemove, increment, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getPaginatedPosts } from '@/lib/postService';
import { addComment, savePost, unsavePost, sharePost } from '@/lib/postService';
import { Post, User as UserType } from '@/app/types/index';

export const useFeed = (user: UserType | null) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState<any>(null);

  // Initial posts load
  useEffect(() => {
    const loadInitialPosts = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const { posts: initialPosts, lastVisible: lastDoc, hasMore: more } = await getPaginatedPosts(null, 10);
        setPosts(initialPosts);
        setLastVisible(lastDoc);
        setHasMore(more);
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialPosts();
  }, [user?.uid]);

  // Load more posts
  const loadMorePosts = useCallback(async () => {
    if (!user?.uid || loadingMore || !hasMore || !lastVisible) return;

    setLoadingMore(true);
    try {
      const { posts: newPosts, lastVisible: lastDoc, hasMore: more } = await getPaginatedPosts(lastVisible, 10);
      
      setPosts(prev => [...prev, ...newPosts]);
      setLastVisible(lastDoc);
      setHasMore(more);
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [user?.uid, loadingMore, hasMore, lastVisible]);

  // Like post handler
  const handleLikePost = async (postId: string) => {
    if (!user?.uid) return;
    
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      
      const isLiked = post.likedBy?.includes(user.uid);
      const postRef = firestoreDoc(db, 'posts', postId);
      
      // Optimistic update
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? {
              ...p,
              likeCount: isLiked ? (p.likeCount || 1) - 1 : (p.likeCount || 0) + 1,
              likedBy: isLiked 
                ? (p.likedBy || []).filter((uid: string) => uid !== user.uid)
                : [...(p.likedBy || []), user.uid]
            }
          : p
      ));
      
      // Update Firebase
      if (isLiked) {
        await updateDoc(postRef, {
          likedBy: arrayRemove(user.uid),
          likeCount: increment(-1)
        });
      } else {
        await updateDoc(postRef, {
          likedBy: arrayUnion(user.uid),
          likeCount: increment(1)
        });
      }
    } catch (error) {
      console.error('Error liking post:', error);
      
      // Revert on error
      const postDoc = await getDoc(firestoreDoc(db, 'posts', postId));
      if (postDoc.exists()) {
        const data = postDoc.data();
        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? {
                ...p,
                likeCount: data.likeCount || 0,
                likedBy: data.likedBy || []
              }
            : p
        ));
      }
    }
  };

  // Save post handler
  const handleSavePost = async (postId: string) => {
    if (!user?.uid) return;
    
    try {
      const post = posts.find(p => p.id === postId);
      const isSaved = post?.isSaved;
      
      // Optimistic update
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, isSaved: !isSaved } : p
      ));
      
      if (isSaved) {
        await unsavePost(postId, user.uid);
      } else {
        await savePost(postId, user.uid);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      
      // Revert on error
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, isSaved: !p.isSaved } : p
      ));
    }
  };

  // Share post handler
  const handleSharePost = async (postId: string) => {
    if (!user?.uid) return;
    
    try {
      await sharePost(postId, user.uid);
      
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, shareCount: (p.shareCount || 0) + 1 }
          : p
      ));
      
      return posts.find(p => p.id === postId);
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  // Add comment handler
  const handleAddComment = async (postId: string, commentText: string) => {
    if (!user?.uid || !commentText.trim()) return;
    
    try {
      await addComment(postId, {
        uid: user.uid,
        userName: user.displayName || 'Anonymous',
        userProfilePic: user.photoURL || '',
        text: commentText.trim()
      });
      
      // Optimistic update
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, commentCount: (post.commentCount || 0) + 1 }
          : post
      ));

      // Verify count from Firebase
      const postRef = firestoreDoc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      if (postDoc.exists()) {
        const data = postDoc.data();
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, commentCount: data.commentCount || 0 }
            : post
        ));
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      
      // Revert on error
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, commentCount: Math.max(0, (post.commentCount || 1) - 1) }
          : post
      ));
    }
  };

  // Delete post handler
  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  return {
    posts,
    loading,
    loadingMore,
    hasMore,
    loadMorePosts,
    handleLikePost,
    handleSavePost,
    handleSharePost,
    handleAddComment,
    handleDeletePost
  };
};