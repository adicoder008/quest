'use client';

import { useState, useEffect } from 'react';
import { Plus, MessageCircle } from 'lucide-react';
import { subscribeToPosts, likePost, addComment } from '../../../lib/postService';
import { getCurrentUserData } from '../../../lib/authService';
import { auth } from '../../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import CreatePostModal from '../../../components/Home/CreatePostModal';
import PostCard from '../../../components/Home/PostCard';
import { Post, User } from '../../types/index';

const FeedPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Subscribe to auth changes
    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          const userData = await getCurrentUserData();
          setUser(userData);
        } catch (error) {
          console.error('Error getting user data:', error);
          setUser({
            uid: authUser.uid,
            displayName: authUser.displayName ?? undefined,
            email: authUser.email ?? undefined,
            photoURL: authUser.photoURL ?? undefined
          });
        }
      } else {
        setUser(null);
      }
    });

    // Subscribe to posts updates
    const unsubscribePosts = subscribeToPosts((newPosts: Post[]) => {
      setPosts(newPosts);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribePosts();
    };
  }, []);

  const handleLikePost = async (postId: string) => {
    if (!user?.uid) return;
    
    try {
      await likePost(postId, user.uid);
      // Update local state optimistically
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likeCount: post.likeCount + 1 }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async (postId: string, commentText: string) => {
    if (!user?.uid || !commentText.trim()) return;
    
    try {
      await addComment(postId, {
        uid: user.uid,
        userName: user.displayName || 'Anonymous',
        userProfilePic: user.photoURL || '',
        text: commentText.trim()
      });
      
      // Update local state
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, commentCount: post.commentCount + 1 }
          : post
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Show login message if user is not authenticated
  if (!user && !loading) {
    return (
      <div className="w-full min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl mb-4">Please sign in to view the feed</h2>
          <button 
            onClick={() => window.location.href = '/auth'}
            className="bg-peach-200 text-gray-900 px-6 py-2 rounded-lg font-medium hover:bg-peach-300 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-900 text-white">
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-800/95 backdrop-blur-md border-b border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img 
              src="/Logo.png" 
              alt="Quest" 
              className="w-16 h-8 object-contain"
            />
          </div>
          <div className="flex items-center gap-4">
            <MessageCircle className="w-6 h-6" />
            <div className="w-6 h-6 bg-peach-200 rounded-full" />
          </div>
        </div>
        
        {/* Welcome Message */}
        <div className="px-4 pb-4">
          <h1 className="text-2xl font-medium text-white">
            New day, new <span className="text-peach-200">Quest</span> — let's go!
          </h1>
        </div>
      </div>

      {/* Create Post Button */}
      <div className="px-4 py-4">
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg p-4 flex items-center gap-3 hover:bg-gray-700 transition-colors"
        >
          <Plus className="w-6 h-6 text-peach-200" />
          <span className="text-gray-300">What's on your mind?</span>
        </button>
      </div>

      {/* Posts Feed */}
      <div className="pb-20">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No posts yet</div>
            <div className="text-gray-500 text-sm mt-2">Be the first to share something!</div>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={() => handleLikePost(post.id)}
              onComment={(text) => handleAddComment(post.id, text)}
              currentUser={user}
            />
          ))
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && user && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          user={user}
        />
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-md border-t border-peach-200/20">
        <div className="flex items-center justify-between px-6 py-2">
          <div className="flex flex-col items-center text-peach-200">
            <div className="w-6 h-6 mb-1">🏠</div>
            <span className="text-xs">Home</span>
          </div>
          <div className="flex flex-col items-center text-white">
            <div className="w-6 h-6 mb-1">🔍</div>
            <span className="text-xs">Explore</span>
          </div>
          <div className="flex flex-col items-center text-white">
            <div className="w-6 h-6 mb-1">➕</div>
            <span className="text-xs">Post</span>
          </div>
          <div className="flex flex-col items-center text-white">
            <div className="w-6 h-6 mb-1">🎯</div>
            <span className="text-xs">Quest</span>
          </div>
          <div className="flex flex-col items-center text-white">
            <div className="w-6 h-6 mb-1">👤</div>
            <span className="text-xs">Account</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;