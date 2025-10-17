'use client';

import React, { useState, useEffect, Key } from 'react';
import { Plus, MessageCircle, Heart, Bookmark, Search, MoreHorizontal, MapPin, X, Send, Share2, Flag, Trash2, Edit, Copy, BookmarkCheck, Home, Calendar, User, Bell, Mail, Settings, LogOut, UserPlus, UserCheck } from 'lucide-react';
import { subscribeToPosts, addComment, followUser, unfollowUser, savePost, unsavePost, sharePost, reportPost, deletePost } from '@/lib/postService';
import { getCurrentUserData } from '@/lib/authService';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import CreatePostModal from '@/components/Home/CreatePostModal';
import PostCard from '@/components/Home/PostCard';
import { User as UserType, Post } from '@/app/types/index';
import Header from '@/components/phoneComponents/header';
import Footer from '@/components/phoneComponents/Footer';
import useResponsive from '@/hooks/useResponsive';
import CreatePost from '@/components/Feed_old/CreatePost';
import { collection, query, orderBy, onSnapshot, updateDoc, doc as firestoreDoc, arrayUnion, arrayRemove, increment, getDocs } from 'firebase/firestore';
import { getDoc, doc } from 'firebase/firestore';
import { FaPlus, FaHeartbeat, FaRegCommentDots, FaShareSquare } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { QuestFeedGrid } from '@/components/quest/QuestFeedCard';
import questService from '@/lib/questService';
import { MobileQuestPostCard, QuestPostCard } from '@/components/Home/QuestPostCard';
import { getPaginatedPosts } from '../../../lib/postService';
import { getUserBadges, getLevelInfo } from '../../../lib/firebaseSerive';

// Import the new NavBar component
import NavBar from '@/components/Nav';

// Helper function to generate username from display name
const generateUsername = (displayName: string | null | undefined): string => {
  if (!displayName) return 'user';
  return displayName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9_]/g, '');
};

// New component for the post creation button and modal logic
const CreatePostTrigger = ({ user }: { user: UserType | null }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);

    if (!user) return null;

    return (
        <>
            <div className="px-4 py-4">
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 flex items-center gap-3 hover:bg-gray-700 transition-colors"
                >
                    <Plus className="text-[#F7CEB0] w-5 h-5" />
                    <span className="text-gray-300">What's on your mind?</span>
                </button>
            </div>

            {showCreateModal && user && (
                <CreatePostModal
                    onClose={() => setShowCreateModal(false)}
                    user={user}
                />
            )}
        </>
    );
};

// Responsive wrapper
const ResponsiveFeedPage = () => {
  const isDesktop = useResponsive(768);

  if (isDesktop) {
    return <Feed />;
  }
  
  return <MobileFeedPage />;
};

// RIGHT SIDEBAR
const RightSidebar = ({ user, userData }: any) => {
  const [badges, setBadges] = useState<any[]>([]);
  const [levelInfo, setLevelInfo] = useState<any>(null);
  const [popularUsers, setPopularUsers] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) return;

      try {
        const userBadges = await getUserBadges(user.uid);
        setBadges(userBadges.slice(0, 3));

        const xp = userData?.totalXP || 0;
        const level = getLevelInfo(xp);
        setLevelInfo(level);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user, userData]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'users'), orderBy('followers', 'desc')),
      (snapshot) => {
        const usersData = snapshot.docs.map(docc => ({
          id: docc.id,
          ...docc.data(),
          photoURL: docc.data().photoURL || '/default-avatar.png',
          followers: docc.data().followers || []
        }));
        setPopularUsers(usersData.slice(0, 4));
      }
    );
    
    return () => unsubscribe();
  }, []);

  const handleFollow = async (uid: string) => {
    if (!user?.uid || uid === user.uid) return;
    
    try {
      const userToFollow = popularUsers.find(u => u.id === uid);
      const isFollowing = userToFollow?.followers?.includes(user.uid);
      
      if (isFollowing) {
        await unfollowUser(user.uid, uid);
      } else {
        await followUser(user.uid, uid);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  return (
    <div className="fixed right-0 top-0 h-screen w-[380px] border-l border-gray-700 bg-black p-4 overflow-y-auto">
      {/* User Profile Card */}
      <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden mb-4">
        <div className="h-24 bg-gradient-to-r from-[#F7CEB0] to-[#EA6100]"></div>
        
        <div className="px-4 pb-4">
          <img 
            src={user?.photoURL || '/default-avatar.png'} 
            alt={user?.displayName}
            className="w-20 h-20 rounded-full border-4 border-gray-900 -mt-10 mb-3 object-cover cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => router.push(`/profile/${user?.uid}`)}
          />
          
          <h3 className="text-white text-lg font-bold mb-1 cursor-pointer hover:underline" onClick={() => router.push(`/profile/${user?.uid}`)}>
            {user?.displayName || 'User'}
          </h3>
          <p className="text-gray-400 text-sm mb-3">
            @{generateUsername(user?.displayName)}
          </p>
          
          {userData?.bio && (
            <p className="text-gray-300 text-sm mb-3 line-clamp-2">
              {userData.bio}
            </p>
          )}

          {/* Stats */}
          <div className="flex gap-4 mb-4">
            <div>
              <span className="text-white font-bold">{userData?.followingCount || 0}</span>
              <span className="text-gray-400 text-sm ml-1">Following</span>
            </div>
            <div>
              <span className="text-white font-bold">{userData?.followersCount || 0}</span>
              <span className="text-gray-400 text-sm ml-1">Followers</span>
            </div>
          </div>

          {/* Level Progress */}
          {levelInfo && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#F7CEB0] font-medium text-sm">
                  {levelInfo.currentLevel.name}
                </span>
                {levelInfo.nextLevel && (
                  <span className="text-gray-400 text-xs">
                    {levelInfo.xpToNext} XP to {levelInfo.nextLevel.name}
                  </span>
                )}
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[#F7CEB0] to-[#EA6100] h-2 rounded-full transition-all"
                  style={{ width: `${(levelInfo.progress || 0) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Badges */}
          {badges.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium text-sm">Earned Badges</h4>
                <button 
                  onClick={() => router.push(`/profile/${user?.uid}#badges`)}
                  className="text-[#F7CEB0] text-xs hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="flex gap-2">
                {badges.map(badge => (
                  <div 
                    key={badge.id}
                    className="bg-[#F8EBE2] rounded-lg p-2 flex flex-col items-center min-w-[70px]"
                    title={badge.description}
                  >
                    <img 
                      src={badge.iconUrl} 
                      alt={badge.name}
                      className="w-10 h-10 object-contain mb-1"
                    />
                    <span className="text-[#402B09] text-[10px] font-semibold text-center">
                      {badge.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Popular Travelers */}
      <div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
        <h4 className="text-white font-medium text-base mb-4">Popular Travelers</h4>
        <div className="space-y-3">
          {popularUsers.map((traveler) => (
            <div key={traveler.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(`/profile/${traveler.id}`)}>
                <img 
                  src={traveler.photoURL} 
                  alt={traveler.displayName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h5 className="text-white text-sm font-medium hover:underline">
                    {traveler.displayName}
                  </h5>
                  <p className="text-gray-400 text-xs">
                    @{generateUsername(traveler.displayName)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleFollow(traveler.id)}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  traveler.followers?.includes(user?.uid)
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-[#F7CEB0] text-black hover:bg-[#f5c094]'
                }`}
              >
                {traveler.followers?.includes(user?.uid) ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
        <button className="text-[#F7CEB0] text-sm font-medium mt-4 hover:underline">
          Explore more
        </button>
      </div>
    </div>
  );
};

// ... (Keep PostMenu, ShareModal, CommentModal as they are)

const PostMenu = ({ post, user, onClose, onDelete, onReport }: any) => {
  const isOwnPost = user?.uid === post.author?.id || user?.uid === post.uid;
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(postUrl);
    alert('Link copied to clipboard!');
    onClose();
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(post.id, user!.uid);
        onDelete?.();
        onClose();
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post');
      }
    }
  };

  const handleReport = async () => {
    if (!reportReason) {
      alert('Please select a reason');
      return;
    }

    try {
      await reportPost(post.id, user!.uid, reportReason, reportDescription);
      alert('Post reported successfully');
      setShowReportModal(false);
      onClose();
    } catch (error) {
      console.error('Error reporting post:', error);
      alert('Failed to report post');
    }
  };

  if (showReportModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
        <div className="bg-gray-900 rounded-lg w-full max-w-md border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Report Post</h3>
            <button onClick={() => setShowReportModal(false)}>
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Reason</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-[#F7CEB0] focus:outline-none"
              >
                <option value="">Select a reason</option>
                <option value="spam">Spam</option>
                <option value="harassment">Harassment</option>
                <option value="inappropriate">Inappropriate Content</option>
                <option value="false_info">False Information</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-300 mb-2 block">Additional Details (Optional)</label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Provide more details..."
                className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-[#F7CEB0] focus:outline-none resize-none"
                rows={3}
              />
            </div>

            <button
              onClick={handleReport}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Submit Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-lg w-full max-w-sm border border-gray-700 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-bold text-white">Post Options</h3>
          <button onClick={onClose}>
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="py-2">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors text-white"
          >
            <Copy size={20} />
            <span>Copy Link</span>
          </button>

          {isOwnPost ? (
            <>
              <button
                onClick={() => {/* Edit functionality can be added later */}}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors text-white"
              >
                <Edit size={20} />
                <span>Edit Post</span>
              </button>

              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors text-red-500"
              >
                <Trash2 size={20} />
                <span>Delete Post</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowReportModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors text-red-500"
            >
              <Flag size={20} />
              <span>Report Post</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ShareModal = ({ post, onClose }: any) => {
  const postUrl = `${window.location.origin}/post/${post.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl);
    alert('Link copied to clipboard!');
  };

  const handleShare = async (platform: string) => {
    let shareUrl = '';
    const text = encodeURIComponent(post.content?.text || post.text || 'Check out this post!');
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(postUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${encodeURIComponent(postUrl)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${text}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-lg w-full max-w-md border border-gray-700 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-bold text-white">Share Post</h3>
          <button onClick={onClose}>
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-4">
          <div className="bg-gray-800 p-3 rounded-lg mb-4 flex items-center gap-2">
            <input
              type="text"
              value={postUrl}
              readOnly
              className="flex-1 bg-transparent text-gray-300 text-sm outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="bg-[#F7CEB0] text-black px-3 py-1 rounded text-sm font-medium hover:bg-[#f5c094] transition-colors"
            >
              Copy
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <button
              onClick={() => handleShare('twitter')}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
                </svg>
              </div>
              <span className="text-xs text-gray-300">Twitter</span>
            </button>

            <button
              onClick={() => handleShare('facebook')}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                </svg>
              </div>
              <span className="text-xs text-gray-300">Facebook</span>
            </button>

            <button
              onClick={() => handleShare('whatsapp')}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path>
                </svg>
              </div>
              <span className="text-xs text-gray-300">WhatsApp</span>
            </button>

            <button
              onClick={() => handleShare('telegram')}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"></path>
                </svg>
              </div>
              <span className="text-xs text-gray-300">Telegram</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CommentModal = ({ post, user, onClose, onCommentSubmit }: any) => {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchComments = async () => {
      if (!post?.id) return;
      
      try {
        const commentsRef = collection(db, 'posts', post.id, 'comments');
        const commentsQuery = query(commentsRef, orderBy('createdAt', 'desc'));
        const commentsSnapshot = await getDocs(commentsQuery);
        
        const commentsData: any[] = [];
        for (const commentDoc of commentsSnapshot.docs) {
          const commentData = commentDoc.data();
          let commentAuthor = {
            name: 'Anonymous',
            avatar: '/default-avatar.png',
            uid: commentData.uid
          };
          
          if (commentData.uid) {
            try {
              const userDoc = await getDoc(doc(db, 'users', commentData.uid));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                commentAuthor = {
                  name: userData.displayName || 'Anonymous',
                  avatar: userData.photoURL || '/default-avatar.png',
                  uid: commentData.uid
                };
              }
            } catch (error) {
              console.error('Error fetching comment author:', error);
            }
          }
          
          commentsData.push({
            id: commentDoc.id,
            text: commentData.text || '',
            createdAt: commentData.createdAt,
            author: commentAuthor,
            ...commentData
          });
        }
        
        setComments(commentsData);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [post?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    
    try {
      await onCommentSubmit(post.id, commentText);
      setCommentText('');
      
      // Refresh comments
      const commentsRef = collection(db, 'posts', post.id, 'comments');
      const commentsQuery = query(commentsRef, orderBy('createdAt', 'desc'));
      const commentsSnapshot = await getDocs(commentsQuery);
      
      const commentsData = [];
      for (const commentDoc of commentsSnapshot.docs) {
        const commentData = commentDoc.data();
        let commentAuthor = {
          name: 'Anonymous',
          avatar: '/default-avatar.png',
          uid: commentData.uid
        };
        
        if (commentData.uid) {
          try {
            const userDoc = await getDoc(doc(db, 'users', commentData.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              commentAuthor = {
                name: userData.displayName || 'Anonymous',
                avatar: userData.photoURL || '/default-avatar.png',
                uid: commentData.uid
              };
            }
          } catch (error) {
            console.error('Error fetching comment author:', error);
          }
        }
        
        commentsData.push({
          id: commentDoc.id,
          text: commentData.text || '',
          createdAt: commentData.createdAt,
          author: commentAuthor,
          ...commentData
        });
      }
      
      setComments(commentsData);
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const formatCommentTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col border border-gray-700 shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
          <h2 className="text-xl font-bold text-white">Comments</h2>
          <div className="w-8"></div>
        </div>

        <div className="p-4 border-b border-gray-700">
          <div className="flex items-start gap-3">
            <img 
              src={post.author.avatar} 
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => router.push(`/profile/${post.author.id}`)}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-medium text-white cursor-pointer hover:underline" onClick={() => router.push(`/profile/${post.author.id}`)}>
                  {post.author.name}
                </h3>
                <span className="text-gray-400 text-sm">·</span>
                <span className="text-gray-400 text-sm">
                  {new Date(post.metadata.createdAt?.seconds * 1000).toLocaleDateString()}
                </span>
              </div>
              <p className="text-white text-sm">{post.content.text}</p>
              {post.content.images && post.content.images.length > 0 && (
                <div className="mt-3">
                  <img
                    src={post.content.images[0]}
                    alt="Post content"
                    className="rounded-lg max-w-xs object-cover max-h-[30vh]"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="text-gray-400">Loading comments...</div>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <MessageCircle size={48} className="text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No comments yet</h3>
              <p className="text-gray-400">Be the first to comment on this post!</p>
            </div>
          ) : (
            <div className="p-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3 mb-6 last:mb-0">
                  <img 
                    src={comment.author.avatar} 
                    alt={comment.author.name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => router.push(`/profile/${comment.author.uid}`)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-white cursor-pointer hover:underline" onClick={() => router.push(`/profile/${comment.author.uid}`)}>
                        {comment.author.name}
                      </h4>
                      <span className="text-gray-400 text-xs">·</span>
                      <span className="text-gray-400 text-xs">
                        {formatCommentTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-white text-sm">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-700 bg-gray-900">
          <form onSubmit={handleSubmit} className="flex items-start gap-3">
            <img 
              src={user?.photoURL || '/default-avatar.png'} 
              alt="Your profile"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 relative">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Post your comment..."
                className="w-full bg-gray-800 text-white p-3 pr-12 rounded-lg border border-gray-600 focus:ring-2 focus:ring-[#F7CEB0] focus:border-transparent focus:outline-none resize-none"
                rows={2}
                required
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className={`absolute right-2 bottom-2 p-2 rounded-full transition-colors ${
                  commentText.trim() 
                    ? 'bg-[#F7CEB0] text-black hover:bg-[#f5c094]' 
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// DESKTOP FEED COMPONENT
const Feed = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPostForComment, setSelectedPostForComment] = useState<any>(null);
  const [selectedPostForMenu, setSelectedPostForMenu] = useState<any>(null);
  const [selectedPostForShare, setSelectedPostForShare] = useState<any>(null);
  const router = useRouter();
  
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          displayName: currentUser.displayName ?? undefined,
          email: currentUser.email ?? undefined,
          photoURL: currentUser.photoURL ?? undefined
        });
        
        try {
          const userDetails = await getCurrentUserData();
          setUserData(userDetails);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadInitialPosts = async () => {
      if (!userData) return;
      
      try {
        setInitialLoading(true);
        const result = await getPaginatedPosts(null, 5);
        
        const postsWithSavedStatus = result.posts.map(post => ({
          ...post,
          isSaved: userData?.savedPosts?.includes(post.id) || false
        }));
        
        setPosts(postsWithSavedStatus);
        setLastVisible(result.lastVisible);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error('Error loading initial posts:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialPosts();
  }, [userData]);

  const loadMorePosts = async () => {
    if (!hasMore || loadingMore || !lastVisible) return;
    
    try {
      setLoadingMore(true);
      const result = await getPaginatedPosts(lastVisible, 5);
      
      const postsWithSavedStatus = result.posts.map(post => ({
        ...post,
        isSaved: userData?.savedPosts?.includes(post.id) || false
      }));
      
      setPosts(prev => [...prev, ...postsWithSavedStatus]);
      setLastVisible(result.lastVisible);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = document.getElementById('scroll-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [hasMore, loadingMore, lastVisible]);

  const handleLike = async (postId: string) => {
    if (!user?.uid) return;
    
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      
      const isLiked = post.stats?.likedBy?.includes(user.uid);
      const postRef = firestoreDoc(db, 'posts', postId);
      
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? {
              ...p,
              stats: {
                ...p.stats,
                likes: isLiked ? p.stats.likes - 1 : p.stats.likes + 1,
                likedBy: isLiked 
                  ? p.stats.likedBy.filter((uid: string) => uid !== user.uid)
                  : [...p.stats.likedBy, user.uid]
              }
            }
          : p
      ));
      
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
      console.error('Error toggling like:', error);
      const postDoc = await getDoc(firestoreDoc(db, 'posts', postId));
      if (postDoc.exists()) {
        const data = postDoc.data();
        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? {
                ...p,
                stats: {
                  ...p.stats,
                  likes: data.likeCount || 0,
                  likedBy: data.likedBy || []
                }
              }
            : p
        ));
      }
    }
  };

  const handleSave = async (postId: string) => {
    if (!user?.uid) return;
    
    try {
      const post = posts.find(p => p.id === postId);
      const isSaved = post?.isSaved;
      
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
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, isSaved: !p.isSaved } : p
      ));
    }
  };

  const handleShare = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setSelectedPostForShare(post);
      
      if (user?.uid) {
        try {
          await sharePost(postId, user.uid);
          setPosts(prev => prev.map(p => 
            p.id === postId 
              ? { ...p, stats: { ...p.stats, shares: (p.stats.shares || 0) + 1 } }
              : p
          ));
        } catch (error) {
          console.error('Error sharing post:', error);
        }
      }
    }
  };

  const handleComment = (post: any) => {
    setSelectedPostForComment(post);
  };

  const handleCommentSubmit = async (postId: string, commentText: string) => {
    if (!user?.uid || !commentText.trim()) return;
    
    try {
      await addComment(postId, {
        uid: user.uid,
        userName: user.displayName || 'Anonymous',
        userProfilePic: user.photoURL || '',
        text: commentText.trim(),
        createdAt: new Date()
      });
      
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              stats: { 
                ...post.stats, 
                comments: (post.stats.comments || 0) + 1 
              } 
            }
          : post
      ));

      const postRef = firestoreDoc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      if (postDoc.exists()) {
        const data = postDoc.data();
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                stats: { 
                  ...post.stats, 
                  comments: data.commentCount || 0 
                } 
              }
            : post
        ));
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              stats: { 
                ...post.stats, 
                comments: Math.max(0, (post.stats.comments || 1) - 1) 
              } 
            }
          : post
      ));
    }
  };

  const handleFollowInPost = async (authorId: string) => {
    if (!user?.uid || authorId === user.uid) return;
    
    try {
      await followUser(user.uid, authorId);
      // Optionally update local state to reflect the follow
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const DesktopPost = ({ post, user }: { post: any, user: UserType | null }) => {
    const isLiked = post.stats?.likedBy?.includes(user?.uid);
    const isSaved = post.isSaved;
    const [isFollowingUser, setIsFollowingUser] = useState(false);
    const [checkingFollow, setCheckingFollow] = useState(true);
    const authorId = post.author?.id || post.uid;


    useEffect(() => {
      // In your useEffect where you check follow status
      const checkFollowStatus = async () => {
        if (!user?.uid || !authorId || user.uid === authorId) {
          setCheckingFollow(false);
          return;
        }
        
        try {
          const followerDocRef = doc(db, 'users', authorId, 'followers', user.uid);
          const followerDoc = await getDoc(followerDocRef);
          setIsFollowingUser(followerDoc.exists());
        } catch (error) {
          console.error('Error checking follow status:', error);
        } finally {
          setCheckingFollow(false);
        }
      };

      checkFollowStatus();
    }, [user?.uid, authorId]);

    const handleFollowClick = async () => {
        if (!user?.uid || !authorId || authorId === user.uid) {
          console.error('Invalid user IDs for follow operation');
          return;
        }

        try {
          if (isFollowingUser) {
            await unfollowUser(user.uid, authorId);
            setIsFollowingUser(false);
          } else {
            await followUser(user.uid, authorId);
            setIsFollowingUser(true);
          }
        } catch (error) {
          console.error('Error toggling follow:', error);
        }
      };
    

    const isQuestPost = post.postType === 'quest' || post.postType === 'quest_completion';
    const questData = post.questData || post.questContext;
    const initialPostImage = post.content?.images?.[0] || post.photoUrl;
    const postText = post.content?.text || post.text;
    
    const [finalPostImage, setFinalPostImage] = useState(initialPostImage);

    useEffect(() => {
        const resolveQuestImage = async () => {
            if (isQuestPost && !finalPostImage && questData?.questId && user?.uid) {
                try {
                    const questDoc = await questService.getQuest(user.uid, questData.questId);
                    if (questDoc && questDoc.coverImageUrl) {
                        setFinalPostImage(questDoc.coverImageUrl);
                    }
                } catch (error) {
                    console.error("Failed to fetch fallback quest cover image:", error);
                }
            }
        };
        resolveQuestImage();
    }, [post.id, isQuestPost, finalPostImage, questData?.questId, user?.uid]);

    if (post.postType === 'quest_completion' || post.questContext) {
      return (
        <QuestPostCard
          post={{
            id: post.id,
            uid: post.author.id,
            userName: post.author.name,
            userProfilePic: post.author.avatar,
            text: post.content.text || '',
            photoUrl: post.content.images?.[0] || '',
            createdAt: post.metadata.createdAt,
            likeCount: post.stats.likes || 0,
            commentCount: post.stats.comments || 0,
            shareCount: post.stats.shares || 0,
            likedBy: post.stats.likedBy || [],
            questContext: post.questContext
          }}
          currentUser={user}
          onLike={() => handleLike(post.id)}
          onComment={() => handleComment(post)}
          onShare={() => handleShare(post.id)}
          onSave={() => handleSave(post.id)}
          onMenu={() => setSelectedPostForMenu(post)}
          isSaved={isSaved}
        />
      );
    }

    if (isQuestPost) {
      return (
        <article className="border bg-gray-900 mb-4 rounded-lg border-gray-700">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 flex-1">
              <img 
                src={post.author.avatar} 
                alt={post.author.name} 
                className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => router.push(`/profile/${post.author.id}`)}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-medium text-white cursor-pointer hover:underline" onClick={() => router.push(`/profile/${post.author.id}`)}>
                    {post.author.name}
                  </h3>
                  {!checkingFollow && user?.uid !== post.author.id && (
                    <button
                      onClick={handleFollowClick}
                      className={`text-xs px-2 py-1 rounded-full transition-colors ${
                        isFollowingUser
                          ? 'bg-gray-700 text-white hover:bg-gray-600'
                          : 'bg-[#F7CEB0] text-black hover:bg-[#f5c094]'
                      }`}
                    >
                      {isFollowingUser ? <UserCheck size={14} /> : <UserPlus size={14} />}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-gray-400 text-xs">@{generateUsername(post.author.name)}</p>
                  <span className="text-gray-400 text-xs">·</span>
                  <p className="text-gray-400 text-xs">Shared a Quest · {formatTime(post.metadata.createdAt)}</p>
                </div>
              </div>
            </div>
            <button onClick={() => setSelectedPostForMenu(post)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors">
              <MoreHorizontal className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {postText && (
            <p className="px-4 pb-3 text-white">{postText}</p>
          )}

          {finalPostImage && (
            <div className="px-4 pb-3">
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={finalPostImage}
                  alt={`Quest to ${questData?.destination || questData?.questTitle}`}
                  className="w-full object-cover max-h-[30vh]"
                />
                <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/80 via-black/50 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-end">
                  <h2 className="text-xl font-bold text-white drop-shadow-lg pr-2">{questData?.title || questData?.questTitle}</h2>
                  <button onClick={() => setSelectedPostForMenu(post)} className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-gray-700 px-4 py-3">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-2 transition-colors ${
                  isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <FaHeartbeat className="w-6 h-6" />
                <span className="text-sm">{post.stats.likes}</span>
              </button>
              
              <button 
                onClick={() => handleComment(post)}
                className="flex items-center gap-2 text-gray-400 hover:text-[#F7CEB0] transition-colors"
              >
                <FaRegCommentDots className="w-6 h-6" />
                <span className="text-sm">{post.stats.comments}</span>
              </button>
              
              <button 
                onClick={() => handleShare(post.id)}
                className="flex items-center gap-2 text-gray-400 hover:text-[#F7CEB0] transition-colors"
              >
                <Share2 className="w-6 h-6" />
                {/* <span className="text-sm">{post.stats.shares || 0}</span> */}
              </button>

              <button 
                onClick={() => handleSave(post.id)}
                className={`ml-auto transition-colors ${
                  isSaved ? 'text-[#F7CEB0]' : 'text-gray-400 hover:text-[#F7CEB0]'
                }`}
              >
                {isSaved ? <BookmarkCheck className="w-6 h-6" /> : <Bookmark className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </article>
      );
    }

    return (
      <article className="border bg-gray-900 mb-4 rounded-lg border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 flex-1">
            <img 
              src={post.author.avatar} 
              alt={post.author.name}
              className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => router.push(`/profile/${post.author.id}`)}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-medium text-white cursor-pointer hover:underline" onClick={() => router.push(`/profile/${post.author.id}`)}>
                  {post.author.name}
                </h3>
                {!checkingFollow && user?.uid !== post.author.id && (
                  <button
                    onClick={handleFollowClick}
                    className={`text-xs px-2 py-1 rounded-full transition-colors ${
                      isFollowingUser
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-[#F7CEB0] text-black hover:bg-[#f5c094]'
                    }`}
                  >
                    {isFollowingUser ? <UserCheck size={14} /> : <UserPlus size={14} />}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-gray-400 text-xs">@{generateUsername(post.author.name)}</p>
                <span className="text-gray-400 text-xs">·</span>
                <p className="text-gray-400 text-xs">{formatTime(post.metadata.createdAt)} · {post.metadata.location}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setSelectedPostForMenu(post)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors"
          >
            <MoreHorizontal className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {postText && (
          <p className="px-4 pb-3 text-white">{postText}</p>
        )}

        {finalPostImage && (
          <div className="px-4 pb-3">
            <img
              src={finalPostImage}
              alt="Post content"
              className="w-full rounded-lg object-cover max-h-[30vh]"
            />
          </div>
        )}

        <div className="border-t border-gray-700 px-4 py-3">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => handleLike(post.id)}
              className={`flex items-center gap-2 transition-colors ${
                isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <FaHeartbeat className="w-6 h-6" />
              <span className="text-sm">{post.stats.likes}</span>
            </button>
            
            <button 
              onClick={() => handleComment(post)}
              className="flex items-center gap-2 text-gray-400 hover:text-[#F7CEB0] transition-colors"
            >
              <FaRegCommentDots className="w-6 h-6" />
              <span className="text-sm">{post.stats.comments}</span>
            </button>
            
            <button 
              onClick={() => handleShare(post.id)}
              className="flex items-center gap-2 text-gray-400 hover:text-[#F7CEB0] transition-colors"
            >
              <Share2 className="w-6 h-6" />
              {/* <span className="text-sm">{post.stats.shares || 0}</span> */}
            </button>

            <button 
              onClick={() => handleSave(post.id)}
              className={`ml-auto transition-colors ${
                isSaved ? 'text-[#F7CEB0]' : 'text-gray-400 hover:text-[#F7CEB0]'
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-6 h-6" /> : <Bookmark className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </article>
    );
  };

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar 
        user={user} 
        onSignOut={handleSignOut}
      />

      <main className="ml-[280px] mr-[380px] min-h-screen border-x border-gray-700">
         <div className="border-b border-gray-700">
           <div className="p-4">
              <h1 className="text-2xl font-medium text-white">
                New day, <span className="text-[#F7CEB0]"> new Quest</span> — let's go!
              </h1>
           </div>
           <CreatePostTrigger user={user} />
         </div>
        
        <div className="p-4">
          {initialLoading ? (
            <div className="border bg-gray-900 p-6 rounded-lg border-gray-700 text-center">
              <div className="text-gray-400">Loading posts...</div>
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <DesktopPost key={post.id} post={post} user={user} />
              ))}

              {hasMore && (
                <div id="scroll-sentinel" className="py-4">
                  {loadingMore && (
                    <div className="border bg-gray-900 p-6 rounded-lg border-gray-700 text-center">
                      <div className="text-gray-400">Loading more posts...</div>
                    </div>
                  )}
                </div>
              )}

              {!hasMore && posts.length > 0 && (
                <div className="border bg-gray-900 p-6 rounded-lg border-gray-700 text-center">
                  <p className="text-gray-400">You've reached the end!</p>
                </div>
              )}

              {posts.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg">No posts yet</div>
                  <div className="text-gray-500 text-sm mt-2">Be the first to share something!</div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <RightSidebar user={user} userData={userData} />

      {user && (
        <div className="fixed bottom-6 left-[calc(280px+50%)] transform -translate-x-1/2 z-50">
          <button
            onClick={() => router.push('/quests/create') }
            className="flex items-center justify-center w-14 h-14 bg-[#F7CEB0] text-black rounded-full shadow-lg hover:bg-[#f5c094] transition-all duration-200"
            aria-label="Create new quest"
          >
            <FaPlus className="text-xl" />
          </button>
        </div>
      )}

      {selectedPostForComment && user && (
        <CommentModal
          post={selectedPostForComment}
          user={user}
          onClose={() => setSelectedPostForComment(null)}
          onCommentSubmit={handleCommentSubmit}
        />
      )}

      {selectedPostForMenu && (
        <PostMenu
          post={selectedPostForMenu}
          user={user}
          onClose={() => setSelectedPostForMenu(null)}
          onDelete={() => {
            setPosts(prev => prev.filter(p => p.id !== selectedPostForMenu.id));
            setSelectedPostForMenu(null);
          }}
        />
      )}

      {selectedPostForShare && (
        <ShareModal
          post={selectedPostForShare}
          onClose={() => setSelectedPostForShare(null)}
        />
      )}
    </div>
  );
};

// ... (Keep Mobile components as they are but add similar follow button and profile navigation logic)

// Add similar logic to MobilePostCard for follow buttons and profile navigation
const MobilePostCard = ({ 
  post, 
  currentUser, 
  onLike, 
  onComment, 
  onSave, 
  onShare, 
  onMenuClick 
}: any) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [checkingFollow, setCheckingFollow] = useState(true);
  const router = useRouter();

  const isLiked = post.likedBy?.includes(currentUser.uid);
  const isSaved = post.isSaved;
  const authorId = post.uid;


    useEffect(() => {
    // In your useEffect where you check follow status
    const checkFollowStatus = async () => {
      if (!currentUser?.uid || !authorId || currentUser.uid === authorId) {
        setCheckingFollow(false);
        return;
      }
      
      try {
        const followerDocRef = doc(db, 'users', authorId, 'followers', currentUser.uid);
        const followerDoc = await getDoc(followerDocRef);
        setIsFollowingUser(followerDoc.exists());
      } catch (error) {
        console.error('Error checking follow status:', error);
      } finally {
        setCheckingFollow(false);
      }
    };

    checkFollowStatus();
  }, [currentUser?.uid, authorId]);

  const handleFollowClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser?.uid || post.uid === currentUser.uid) return;

    try {
      if (isFollowingUser) {
        await unfollowUser(currentUser.uid, post.uid);
        setIsFollowingUser(false);
      } else {
        await followUser(currentUser.uid, post.uid);
        setIsFollowingUser(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const isQuestPost = post.postType === 'quest' || post.postType === 'quest_completion';
  const questData = post.questData || post.questContext;
  const initialPostImage = post.photoUrl;
  const [finalPostImage, setFinalPostImage] = useState(initialPostImage);
  
  useEffect(() => {
    const resolveQuestImage = async () => {
        if (isQuestPost && !finalPostImage && questData?.questId && currentUser?.uid) {
            try {
                const questDoc = await questService.getQuest(currentUser.uid, questData.questId);
                if (questDoc && questDoc.coverImageUrl) {
                    setFinalPostImage(questDoc.coverImageUrl);
                }
            } catch (error) {
                console.error("Failed to fetch fallback quest cover image:", error);
            }
        }
    };
    resolveQuestImage();
  }, [post.id, isQuestPost, finalPostImage, questData?.questId, currentUser?.uid]);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const loadComments = async () => {
    if (!post?.id) return;
    
    setLoadingComments(true);
    try {
      const commentsRef = collection(db, 'posts', post.id, 'comments');
      const commentsQuery = query(commentsRef, orderBy('createdAt', 'desc'));
      const commentsSnapshot = await getDocs(commentsQuery);
      
      const commentsData: any[] = [];
      for (const commentDoc of commentsSnapshot.docs) {
        const commentData = commentDoc.data();
        let commentAuthor = {
          name: 'Anonymous',
          avatar: '/default-avatar.png',
          uid: commentData.uid
        };
        
        if (commentData.uid) {
          try {
            const userDoc = await getDoc(doc(db, 'users', commentData.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              commentAuthor = {
                name: userData.displayName || 'Anonymous',
                avatar: userData.photoURL || '/default-avatar.png',
                uid: commentData.uid
              };
            }
          } catch (error) {
            console.error('Error fetching comment author:', error);
          }
        }
        
        commentsData.push({
          id: commentDoc.id,
          text: commentData.text || '',
          createdAt: commentData.createdAt,
          author: commentAuthor,
          ...commentData
        });
      }
      
      setComments(commentsData);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleToggleComments = () => {
    if (!showComments) {
      loadComments();
    }
    setShowComments(!showComments);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    await onComment(commentText);
    setCommentText('');
    loadComments();
  };
  
  if (isQuestPost) {
    return (
      <article className="border-b border-gray-800 bg-black p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <img 
              src={post.userProfilePic || '/default-avatar.png'} 
              alt={post.userName}
              className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => router.push(`/profile/${post.uid}`)}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-white cursor-pointer hover:underline" onClick={() => router.push(`/profile/${post.uid}`)}>
                  {post.userName}
                </h3>
                {!checkingFollow && currentUser?.uid !== post.uid && (
                  <button
                    onClick={handleFollowClick}
                    className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                      isFollowingUser
                        ? 'bg-gray-700 text-white'
                        : 'bg-[#F7CEB0] text-black'
                    }`}
                  >
                    {isFollowingUser ? <UserCheck size={12} /> : <UserPlus size={12} />}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1">
                <p className="text-xs text-gray-400">@{generateUsername(post.userName)}</p>
                <span className="text-xs text-gray-400">·</span>
                <p className="text-xs text-gray-400">Shared a Quest · {formatTime(post.createdAt)}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={onMenuClick}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {post.text && (
          <p className="text-white text-sm mb-3">{post.text}</p>
        )}

        {finalPostImage && (
          <div className="mb-3">
            <div className="relative rounded-lg overflow-hidden">
              <img src={finalPostImage} alt="Post content" className="w-full object-cover max-h-[30vh]" />
              <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/80 via-black/50 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-end">
                <h2 className="text-lg font-bold text-white drop-shadow-lg pr-2">{questData?.title || questData?.questTitle}</h2>
                <button onClick={onMenuClick} className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 transition-colors">
                  <MoreHorizontal className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-800">
          <button 
            onClick={onLike}
            className={`flex items-center gap-2 transition-colors ${
              isLiked ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            <FaHeartbeat className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-xs">{post.likeCount || 0}</span>
          </button>
          
          <button 
            onClick={handleToggleComments}
            className="flex items-center gap-2 text-gray-400 hover:text-[#F7CEB0] transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs">{post.commentCount || 0}</span>
          </button>
          
          <button 
            onClick={onShare}
            className="flex items-center gap-2 text-gray-400 hover:text-[#F7CEB0] transition-colors"
          >
            <Share2 className="w-5 h-5" />
            {/* <span className="text-xs">{post.shareCount || 0}</span> */}
          </button>

          <button 
            onClick={onSave}
            className={`transition-colors ${
              isSaved ? 'text-[#F7CEB0]' : 'text-gray-400 hover:text-[#F7CEB0]'
            }`}
          >
            {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
          </button>
        </div>

        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-800">
            <form onSubmit={handleSubmitComment} className="mb-4">
              <div className="flex items-start gap-2">
                <img 
                  src={currentUser.photoURL || '/default-avatar.png'} 
                  alt="Your profile"
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full bg-gray-900 text-white px-3 py-2 pr-10 rounded-lg border border-gray-700 focus:ring-2 focus:ring-[#F7CEB0] focus:border-transparent focus:outline-none text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 transition-colors ${
                      commentText.trim() 
                        ? 'text-[#F7CEB0]' 
                        : 'text-gray-600'
                    }`}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </form>

            {loadingComments ? (
              <div className="text-center py-4">
                <div className="text-gray-400 text-sm">Loading comments...</div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm">No comments yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-2">
                    <img 
                      src={comment.author.avatar} 
                      alt={comment.author.name}
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => router.push(`/profile/${comment.author.uid}`)}
                    />
                    <div className="flex-1">
                      <div className="bg-gray-900 rounded-lg p-2">
                        <h4 className="text-xs font-medium text-white mb-1 cursor-pointer hover:underline" onClick={() => router.push(`/profile/${comment.author.uid}`)}>
                          {comment.author.name}
                        </h4>
                        <p className="text-xs text-gray-300">{comment.text}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 ml-2">
                        {formatTime(comment.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </article>
    );
  }

  if (post.postType === 'quest_completion' || post.questContext) {
    return (
      <MobileQuestPostCard
        post={{
          id: post.id,
          uid: post.uid,
          userName: post.userName,
          userProfilePic: post.userProfilePic,
          text: post.text || '',
          photoUrl: post.photoUrl || '',
          createdAt: post.createdAt,
          likeCount: post.likeCount || 0,
          commentCount: post.commentCount || 0,
          shareCount: post.shareCount || 0,
          likedBy: post.likedBy || [],
          questContext: post.questContext
        }}
        currentUser={currentUser}
        onLike={onLike}
        onComment={() => onComment(post)}
        onShare={onShare}
        onSave={onSave}
        onMenu={onMenuClick}
        isSaved={post.isSaved}
      />
    );
  }

  return (
    <article className="border-b border-gray-800 bg-black p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <img 
            src={post.userProfilePic || '/default-avatar.png'} 
            alt={post.userName}
            className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => router.push(`/profile/${post.uid}`)}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-white cursor-pointer hover:underline" onClick={() => router.push(`/profile/${post.uid}`)}>
                {post.userName}
              </h3>
              {!checkingFollow && currentUser?.uid !== post.uid && (
                <button
                  onClick={handleFollowClick}
                  className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                    isFollowingUser
                      ? 'bg-gray-700 text-white'
                      : 'bg-[#F7CEB0] text-black'
                  }`}
                >
                  {isFollowingUser ? <UserCheck size={12} /> : <UserPlus size={12} />}
                </button>
              )}
            </div>
            <div className="flex items-center gap-1">
              <p className="text-xs text-gray-400">@{generateUsername(post.userName)}</p>
              <span className="text-xs text-gray-400">·</span>
              <p className="text-xs text-gray-400">
                {formatTime(post.createdAt)} {post.location && `· ${post.location}`}
              </p>
            </div>
          </div>
        </div>
        <button 
          onClick={onMenuClick}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors"
        >
          <MoreHorizontal className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {post.text && (
        <p className="text-white text-sm mb-3">{post.text}</p>
      )}

      {finalPostImage && (
        <div className="mb-3">
          <img
            src={finalPostImage}
            alt="Post content"
            className="w-full rounded-lg object-cover max-h-[30vh]"
          />
        </div>
      )}

      <div className="flex items-center pt-2 border-t border-gray-800 gap-3">
        <button 
          onClick={onLike}
          className={`flex items-center gap-1 transition-colors ${
            isLiked ? 'text-red-500' : 'text-gray-400'
          }`}
        >
          <FaHeartbeat className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          <span className="text-xs">{post.likeCount || 0}</span>
        </button>
        
        <button 
          onClick={handleToggleComments}
          className="flex items-center gap-1 text-gray-400 hover:text-[#F7CEB0] transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs">{post.commentCount || 0}</span>
        </button>
        
        <button 
          onClick={onShare}
          className="flex items-center gap-1 text-gray-400 hover:text-[#F7CEB0] transition-colors"
        >
          <Share2 className="w-5 h-5" />
          {/* <span className="text-xs">{post.shareCount || 0}</span> */}
        </button>

        <button 
          onClick={onSave}
          className={`ml-auto transition-colors ${
            isSaved ? 'text-[#F7CEB0]' : 'text-gray-400 hover:text-[#F7CEB0]'
          }`}
        >
          {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
        </button>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <form onSubmit={handleSubmitComment} className="mb-4">
            <div className="flex items-start gap-2">
              <img 
                src={currentUser.photoURL || '/default-avatar.png'} 
                alt="Your profile"
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full bg-gray-900 text-white px-3 py-2 pr-10 rounded-lg border border-gray-700 focus:ring-2 focus:ring-[#F7CEB0] focus:border-transparent focus:outline-none text-sm"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 transition-colors ${
                    commentText.trim() 
                      ? 'text-[#F7CEB0]' 
                      : 'text-gray-600'
                  }`}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </form>

          {loadingComments ? (
            <div className="text-center py-4">
              <div className="text-gray-400 text-sm">Loading comments...</div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm">No comments yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2">
                  <img 
                    src={comment.author.avatar} 
                    alt={comment.author.name}
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => router.push(`/profile/${comment.author.uid}`)}
                  />
                  <div className="flex-1">
                    <div className="bg-gray-900 rounded-lg p-2">
                      <h4 className="text-xs font-medium text-white mb-1 cursor-pointer hover:underline" onClick={() => router.push(`/profile/${comment.author.uid}`)}>
                        {comment.author.name}
                      </h4>
                      <p className="text-xs text-gray-300">{comment.text}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-2">
                      {formatTime(comment.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
};

const MobileFeedPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [selectedPostForMenu, setSelectedPostForMenu] = useState<any>(null);
  const [selectedPostForShare, setSelectedPostForShare] = useState<any>(null);
  
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          const userData = await getCurrentUserData();
          setUser(userData);
          setUserData(userData);
        } catch (error) {
          console.error('Error getting user data:', error);
          setUser({
            uid: authUser.uid,
            displayName: authUser.displayName ?? 'Anonymous',
            email: authUser.email ?? 'Anonymous',
            photoURL: authUser.photoURL ?? '',
          });
        }
      } else {
        setUser(null);
        setUserData(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const loadInitialPosts = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const result = await getPaginatedPosts(null, 5);
        
        const postsData = result.posts.map(post => ({
          id: post.id,
          authorId: post.uid,
          uid: post.uid,
          userName: post.userName || post.author.name,
          userProfilePic: post.userProfilePic || post.author.avatar,
          text: post.text || post.content?.text || '',
          photoUrl: post.photoUrl || post.content?.images?.[0] || '',
          location: post.location || post.metadata?.location || '',
          createdAt: post.createdAt || post.metadata?.createdAt,
          likeCount: post.likeCount ?? post.stats?.likes ?? 0,
          commentCount: post.commentCount ?? post.stats?.comments ?? 0,
          shareCount: post.shareCount ?? post.stats?.shares ?? 0,
          likedBy: post.likedBy || post.stats?.likedBy || [],
          isSaved: userData?.savedPosts?.includes(post.id) || false,
          postType: post.postType || 'regular',
          questData: post.questData || post.questContext || null,
        }));
        
        setPosts(postsData);
        setLastVisible(result.lastVisible);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error('Error loading initial posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialPosts();
  }, [user, userData]);

  const loadMorePosts = async () => {
    if (!hasMore || loadingMore || !lastVisible || !user) return;
    
    try {
      setLoadingMore(true);
      const result = await getPaginatedPosts(lastVisible, 5);
      
      const postsData = result.posts.map(post => ({
        id: post.id,
        authorId: post.uid,
        uid: post.uid,
        userName: post.userName || post.author.name,
        userProfilePic: post.userProfilePic || post.author.avatar,
        text: post.text || post.content?.text || '',
        photoUrl: post.photoUrl || post.content?.images?.[0] || '',
        location: post.location || post.metadata?.location || '',
        createdAt: post.createdAt || post.metadata?.createdAt,
        likeCount: post.likeCount ?? post.stats?.likes ?? 0,
        commentCount: post.commentCount ?? post.stats?.comments ?? 0,
        shareCount: post.shareCount ?? post.stats?.shares ?? 0,
        likedBy: post.likedBy || post.stats?.likedBy || [],
        isSaved: userData?.savedPosts?.includes(post.id) || false,
        postType: post.postType || 'regular',
        questData: post.questData || post.questContext || null,
      }));
      
      setPosts(prev => [...prev, ...postsData]);
      setLastVisible(result.lastVisible);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = document.getElementById('mobile-scroll-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [hasMore, loadingMore, lastVisible]);

  const handleLikePost = async (postId: string) => {
    if (!user?.uid) return;
    
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      
      const isLiked = post.likedBy?.includes(user.uid);
      const postRef = firestoreDoc(db, 'posts', postId);
      
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

  const handleSavePost = async (postId: string) => {
    if (!user?.uid) return;
    
    try {
      const post = posts.find(p => p.id === postId);
      const isSaved = post?.isSaved;
      
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
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, isSaved: !p.isSaved } : p
      ));
    }
  };

  const handleSharePost = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setSelectedPostForShare(post);
      
      if (user?.uid) {
        try {
          await sharePost(postId, user.uid);
          setPosts(prev => prev.map(p => 
            p.id === postId 
              ? { ...p, shareCount: (p.shareCount || 0) + 1 }
              : p
          ));
        } catch (error) {
          console.error('Error sharing post:', error);
        }
      }
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
      
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, commentCount: (post.commentCount || 0) + 1 }
          : post
      ));

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
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, commentCount: Math.max(0, (post.commentCount || 1) - 1) }
          : post
      ));
    }
  };

  if (!user && !loading) {
    return (
      <div className="w-full min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl mb-4">Please sign in to view the feed</h2>
          <button 
            onClick={() => window.location.href = '/auth'}
            className="bg-[#F7CEB0] text-black px-6 py-2 rounded-lg font-medium hover:bg-[#f5c094] transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-black text-white">
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-black text-white">
      <div className="sticky top-0 z-10 bg-black backdrop-blur-md border-b border-gray-700">
        <Header /> 
        
        <div className="px-4 pb-4">
          <h1 className="text-2xl font-medium text-white">
            New day, <span className="text-[#F7CEB0]"> new Quest</span> — let's go!
          </h1>
        </div>
      </div>
      
      <CreatePostTrigger user={user} />

      <div className="pb-20">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No posts yet</div>
            <div className="text-gray-500 text-sm mt-2">Be the first to share something!</div>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <MobilePostCard
                key={post.id}
                post={post}
                currentUser={user!}
                onLike={() => handleLikePost(post.id)}
                onComment={(text: string) => handleAddComment(post.id, text)}
                onSave={() => handleSavePost(post.id)}
                onShare={() => handleSharePost(post.id)}
                onMenuClick={() => setSelectedPostForMenu(post)}
              />
            ))}

            {hasMore && (
              <div id="mobile-scroll-sentinel" className="py-4">
                {loadingMore && (
                  <div className="text-center py-4">
                    <div className="text-gray-400">Loading more posts...</div>
                  </div>
                )}
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400">You've reached the end!</p>
              </div>
            )}
          </>
        )}
      </div>

      {selectedPostForMenu && (
        <PostMenu
          post={selectedPostForMenu}
          user={user}
          onClose={() => setSelectedPostForMenu(null)}
          onDelete={() => {
            setPosts(prev => prev.filter(p => p.id !== selectedPostForMenu.id));
            setSelectedPostForMenu(null);
          }}
        />
      )}

      {selectedPostForShare && (
        <ShareModal
          post={selectedPostForShare}
          onClose={() => setSelectedPostForShare(null)}
        />
      )}

      <Footer />
    </div>
  );
};

export default ResponsiveFeedPage;