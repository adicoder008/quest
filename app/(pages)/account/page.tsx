"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { getUserData, getUserBadges } from '@/lib/firebaseSerive';
import { calculateLevel } from '@/lib/xpService';
import { addComment } from '@/lib/postService';
import { savePost, unsavePost, sharePost } from '@/lib/postService';
import Footer from '@/components/phoneComponents/Footer';
import MobilePostCard from '@/components/Home/MobilePostCard';
import { Settings, Edit2, Calendar, SlidersHorizontal, HelpCircle, MapPin } from 'lucide-react';
import { IoChevronForward } from "react-icons/io5";
import { collection, query, where, orderBy, getDocs, doc as firestoreDoc, updateDoc, arrayUnion, arrayRemove, increment, getDoc } from 'firebase/firestore';
import questService from '@/lib/questService';
import { Quest, User as UserType } from '@/app/types';

// Add to global styles or component styles
const styles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;


interface UserData {
  uid: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  backgroundURL?: string;
  title?: string;
  bio?: string;
  postsCount?: number;
  followers?: string[];
  following?: string[];
  totalXP?: number;
  isVerified?: boolean;
  savedPosts?: string[];
}

interface Badge {
  id: string;
  name: string;
  iconUrl: string;
  description: string;
}

interface Post {
  id: string;
  uid: string;
  userName: string;
  userProfilePic: string;
  text: string;
  photoUrl?: string | string[];
  createdAt: any;
  likeCount: number;
  commentCount: number;
  shareCount?: number;
  location?: string;
  likedBy?: string[];
  isSaved?: boolean;
  postType?: string;
  questData?: any;
  questContext?: any;
}

const AccountPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [levelInfo, setLevelInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Posts state
  const [activePostTab, setActivePostTab] = useState<'your-posts' | 'saved-posts'>('your-posts');
  const [yourPosts, setYourPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Quests state
  const [activeQuestTab, setActiveQuestTab] = useState<'public-quests' | 'private-quests' | 'saved-quests'>('public-quests');
  const [myQuests, setMyQuests] = useState<Quest[]>([]);
  const [savedQuests, setSavedQuests] = useState<Quest[]>([]);
  const [loadingQuests, setLoadingQuests] = useState(false);

  // Modals
  const [selectedPostForMenu, setSelectedPostForMenu] = useState<any>(null);
  const [selectedPostForShare, setSelectedPostForShare] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsLoggedIn(!!currentUser);

      if (currentUser) {
        try {
          const data = await getUserData(currentUser.uid);
          setUserData(data as UserData);

          const userBadges = await getUserBadges(currentUser.uid);
          setBadges(userBadges.slice(0, 3));

          const xp = data?.totalXP || 0;
          const level = calculateLevel(xp);
          setLevelInfo(level);

          // Fetch user's posts
          await fetchUserPosts(currentUser.uid);
          
          // Fetch user's saved posts
          if (data?.savedPosts && data.savedPosts.length > 0) {
            await fetchSavedPosts(data.savedPosts);
          }

          // Fetch user's quests
          await fetchUserQuests(currentUser.uid);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserPosts = async (uid: string) => {
    setLoadingPosts(true);
    try {
      const postsRef = collection(db, 'posts');
      const q = query(
        postsRef,
        where('uid', '==', uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const posts: Post[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          uid: data.uid || uid,
          userName: data.userName || userData?.displayName || 'User',
          userProfilePic: data.userProfilePic || userData?.photoURL || '/default-avatar.png',
          text: data.text || '',
          photoUrl: data.photoUrl || '',
          createdAt: data.createdAt,
          likeCount: data.likeCount || 0,
          commentCount: data.commentCount || 0,
          shareCount: data.shareCount || 0,
          location: data.location || '',
          likedBy: data.likedBy || [],
          isSaved: userData?.savedPosts?.includes(doc.id) || false,
          postType: data.postType || 'regular',
          questData: data.questData || null,
          questContext: data.questContext || null,
        };
      });
      
      setYourPosts(posts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchSavedPosts = async (savedPostIds: string[]) => {
    setLoadingPosts(true);
    try {
      const posts: Post[] = [];
      
      for (const postId of savedPostIds) {
        const postDoc = await getDoc(firestoreDoc(db, 'posts', postId));
        if (postDoc.exists()) {
          const data = postDoc.data();
          posts.push({
            id: postDoc.id,
            uid: data.uid || '',
            userName: data.userName || 'User',
            userProfilePic: data.userProfilePic || '/default-avatar.png',
            text: data.text || '',
            photoUrl: data.photoUrl || '',
            createdAt: data.createdAt,
            likeCount: data.likeCount || 0,
            commentCount: data.commentCount || 0,
            shareCount: data.shareCount || 0,
            location: data.location || '',
            likedBy: data.likedBy || [],
            isSaved: true,
            postType: data.postType || 'regular',
            questData: data.questData || null,
            questContext: data.questContext || null,
          });
        }
      }
      
      setSavedPosts(posts);
    } catch (error) {
      console.error('Error fetching saved posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchUserQuests = async (uid: string) => {
    setLoadingQuests(true);
    try {
      const quests = await questService.getUserQuests(uid);
      setMyQuests(quests);
      
      // TODO: Implement saved quests functionality
      // For now, using empty array
      setSavedQuests([]);
    } catch (error) {
      console.error('Error fetching user quests:', error);
    } finally {
      setLoadingQuests(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user?.uid) return;
    
    try {
      const updatePosts = (posts: Post[]) => posts.map(p => {
        if (p.id === postId) {
          const isLiked = p.likedBy?.includes(user.uid);
          return {
            ...p,
            likeCount: isLiked ? (p.likeCount || 1) - 1 : (p.likeCount || 0) + 1,
            likedBy: isLiked 
              ? (p.likedBy || []).filter((uid: string) => uid !== user.uid)
              : [...(p.likedBy || []), user.uid]
          };
        }
        return p;
      });

      setYourPosts(updatePosts);
      setSavedPosts(updatePosts);
      
      const post = [...yourPosts, ...savedPosts].find(p => p.id === postId);
      if (!post) return;
      
      const isLiked = post.likedBy?.includes(user.uid);
      const postRef = firestoreDoc(db, 'posts', postId);
      
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
    }
  };

  const handleSavePost = async (postId: string) => {
    if (!user?.uid) return;
    
    try {
      const updatePosts = (posts: Post[]) => posts.map(p => 
        p.id === postId ? { ...p, isSaved: !p.isSaved } : p
      );

      const post = [...yourPosts, ...savedPosts].find(p => p.id === postId);
      const isSaved = post?.isSaved;

      setYourPosts(updatePosts);
      setSavedPosts(updatePosts);
      
      if (isSaved) {
        await unsavePost(postId, user.uid);
        setSavedPosts(prev => prev.filter(p => p.id !== postId));
      } else {
        await savePost(postId, user.uid);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const handleSharePost = async (postId: string) => {
    const post = [...yourPosts, ...savedPosts].find(p => p.id === postId);
    if (post) {
      setSelectedPostForShare(post);
      
      if (user?.uid) {
        try {
          await sharePost(postId, user.uid);
          
          const updatePosts = (posts: Post[]) => posts.map(p => 
            p.id === postId ? { ...p, shareCount: (p.shareCount || 0) + 1 } : p
          );
          
          setYourPosts(updatePosts);
          setSavedPosts(updatePosts);
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
      
      const updatePosts = (posts: Post[]) => posts.map(post => 
        post.id === postId ? { ...post, commentCount: (post.commentCount || 0) + 1 } : post
      );

      setYourPosts(updatePosts);
      setSavedPosts(updatePosts);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#F7CEB0] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      <div className='h-[107px] w-full bg-black flex items-center px-5'>
        <p className='text-3xl font-semibold text-[#F7CEB0]'>Account</p>
      </div>

      {!isLoggedIn ? (
        <div className='text-white min-h-[800px] p-5'>
          <div className='bg-[#292929] justify-center items-center rounded-xl h-[250px] p-4 my-8 mx-2 flex flex-col gap-5'>
            <div>
              <p className='text-2xl text-white text-center'>Hello, Guest</p>
              <p className='text-2xl text-white text-center'>Start your Quest here!</p>
            </div>
            <button 
              onClick={() => navigateTo('/auth/signin')} 
              className='bg-[#F7CEB0] text-black py-3 px-8 text-xl rounded-3xl font-semibold hover:bg-[#f5c094] transition-colors'
            >
              Sign In
            </button>
          </div>

          <p className='text-3xl font-semibold text-[#F7CEB0] mb-4'>Settings</p>
          <MenuOption
            icon={<SlidersHorizontal className='text-[#F7CEB0]' size={28} />}
            label="Preferences"
            onClick={() => navigateTo('/account/preferences')}
          />
          <MenuOption
            icon={<HelpCircle className='text-[#F7CEB0]' size={28} />}
            label="Support"
            onClick={() => navigateTo('/account/support')}
          />
          <Footer />
        </div>
      ) : (
        <div className='text-white pb-20'>
          {/* Profile Header */}
          <div className='relative'>
            <div className='h-32 w-full relative overflow-hidden'>
              <img
                src={userData?.backgroundURL || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"}
                alt="Cover"
                className='w-full h-full object-cover'
              />
              <div className='absolute top-3 right-3 flex gap-2'>
                <button 
                  onClick={() => navigateTo('/account/profile')}
                  className='bg-[rgba(248,111,10,0.9)] p-2 rounded-full hover:bg-[rgba(248,111,10,1)] transition-colors'
                >
                  <Edit2 size={18} className='text-white' />
                </button>
                <button 
                  onClick={() => navigateTo('/account/settings')}
                  className='bg-[rgba(248,111,10,0.9)] p-2 rounded-full hover:bg-[rgba(248,111,10,1)] transition-colors'
                >
                  <Settings size={18} className='text-white' />
                </button>
              </div>
            </div>

            <div className='px-5 -mt-12'>
              <img
                src={userData?.photoURL || 'https://via.placeholder.com/150'}
                alt={userData?.displayName}
                className='w-24 h-24 rounded-full border-4 border-[#121212] object-cover'
              />
            </div>
          </div>

          {/* User Info */}
          <div className='px-5 mt-3'>
            <div className='flex items-center gap-2'>
              <h2 className='text-2xl font-bold text-white'>{userData?.displayName || 'User'}</h2>
              {userData?.isVerified && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1DA1F2">
                  <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.056-2.13c-.293-.303-.288-.694.018-.985.307-.29.718-.286 1.011.017l1.298 1.342 3.682-5.53c.12-.183.32-.29.526-.29.357 0 .688.291.688.612 0 .124-.065.249-.677.35z"/>
                </svg>
              )}
            </div>
            <p className='text-gray-400 text-sm'>@{userData?.displayName?.toLowerCase().replace(/\s/g, '') || 'user'}</p>
            {userData?.title && (
              <p className='text-[#F7CEB0] text-sm mt-1'>{userData.title}</p>
            )}
            {userData?.bio && (
              <p className='text-gray-300 text-sm mt-2 leading-relaxed'>{userData.bio}</p>
            )}

            {/* Stats */}
            <div className='flex gap-5 mt-4 text-sm'>
              <div>
                <span className='text-white font-bold'>{userData?.postsCount || yourPosts.length}</span>
                <span className='text-gray-400 ml-1'>Posts</span>
              </div>
              <div>
                <span className='text-white font-bold'>{userData?.followers?.length || 0}</span>
                <span className='text-gray-400 ml-1'>Followers</span>
              </div>
              <div>
                <span className='text-white font-bold'>{userData?.following?.length || 0}</span>
                <span className='text-gray-400 ml-1'>Following</span>
              </div>
            </div>

            {/* Level Progress */}
            {levelInfo && (
              <div className='mt-5 bg-[#292929] p-4 rounded-xl'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-[#F7CEB0] font-semibold text-sm'>
                    {levelInfo.currentLevel?.name || 'Scout'}
                  </span>
                  {levelInfo.nextLevel && (
                    <span className='text-gray-400 text-xs'>
                      {levelInfo.xpToNext} XP to {levelInfo.nextLevel.name}
                    </span>
                  )}
                </div>
                <div className='w-full bg-gray-700 rounded-full h-2.5'>
                  <div 
                    className='bg-gradient-to-r from-[#F7CEB0] to-[#EA6100] h-2.5 rounded-full transition-all duration-300'
                    style={{ width: `${(levelInfo.progress || 0) * 100}%` }}
                  ></div>
                </div>
                <p className='text-gray-400 text-xs mt-2'>
                  {userData?.totalXP || 0} XP Total
                </p>
              </div>
            )}

            {/* Badges */}
            {badges.length > 0 && (
              <div className='mt-5'>
                <div className='flex items-center justify-between mb-3'>
                  <h3 className='text-white font-semibold text-lg'>Earned Badges</h3>
                  <button 
                    onClick={() => navigateTo('/account/badges')}
                    className='text-[#F7CEB0] text-sm hover:underline'
                  >
                    View All
                  </button>
                </div>
                <div className='flex gap-3 overflow-x-auto pb-2'>
                  {badges.map(badge => (
                    <div 
                      key={badge.id}
                      className='bg-[#F8EBE2] rounded-lg p-3 flex flex-col items-center min-w-[90px] flex-shrink-0'
                    >
                      <img 
                        src={badge.iconUrl} 
                        alt={badge.name}
                        className='w-12 h-12 object-contain mb-2'
                      />
                      <span className='text-[#402B09] text-xs font-semibold text-center'>
                        {badge.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Posts Section */}
            <div className='mt-6'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-white font-semibold text-lg'>Posts</h3>
                <button 
                  onClick={() => navigateTo('/account/posts')}
                  className='text-[#F7CEB0] text-sm hover:underline'
                >
                  View All
                </button>
              </div>

              <div className='flex gap-2 mb-4'>
                <button
                  onClick={() => setActivePostTab('your-posts')}
                  className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                    activePostTab === 'your-posts'
                      ? 'bg-[#F7CEB0] text-black'
                      : 'bg-[#292929] text-gray-400 hover:bg-[#3a3a3a]'
                  }`}
                >
                  Your Posts
                </button>
                <button
                  onClick={() => setActivePostTab('saved-posts')}
                  className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                    activePostTab === 'saved-posts'
                      ? 'bg-[#F7CEB0] text-black'
                      : 'bg-[#292929] text-gray-400 hover:bg-[#3a3a3a]'
                  }`}
                >
                  Saved Posts
                </button>
              </div>

              {loadingPosts ? (
                <div className='text-center py-8'>
                  <div className='text-gray-400'>Loading posts...</div>
                </div>
              ) : activePostTab === 'your-posts' ? (
                yourPosts.length > 0 ? (
                  <div className='flex gap-4 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide'>
                    {yourPosts.slice(0, 5).map(post => (
                      <div key={post.id} className='min-w-[300px] flex-shrink-0'>
                        <CompactPostCard
                          post={post}
                          onClick={() => navigateTo(`/post/${post.id}`)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-8 bg-[#292929] rounded-lg'>
                    <p className='text-gray-400'>No posts yet</p>
                    <p className='text-gray-500 text-sm mt-1'>Share your first adventure!</p>
                  </div>
                )
              ) : (
                savedPosts.length > 0 ? (
                  <div className='flex gap-4 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide'>
                    {savedPosts.slice(0, 5).map(post => (
                      <div key={post.id} className='min-w-[300px] flex-shrink-0'>
                        <CompactPostCard
                          post={post}
                          onClick={() => navigateTo(`/post/${post.id}`)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-8 bg-[#292929] rounded-lg'>
                    <p className='text-gray-400'>No saved posts</p>
                    <p className='text-gray-500 text-sm mt-1'>Save posts to view them here</p>
                  </div>
                )
              )}
            </div>

            {/* Quests Section */}
            <div className='mt-6'>
              <div className='flex items-center justify-between mb-3'>
                <h3 className='text-white font-semibold text-lg'>Quests</h3>
                <button 
                  onClick={() => navigateTo('/account/quests')}
                  className='text-[#F7CEB0] text-sm hover:underline'
                >
                  View All
                </button>
              </div>
              
              <div className='flex gap-2 mb-4 overflow-x-auto scrollbar-hide'>
                <button
                  onClick={() => setActiveQuestTab('public-quests')}
                  className={`py-2 px-4 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    activeQuestTab === 'public-quests'
                      ? 'bg-[#F7CEB0] text-black'
                      : 'bg-[#292929] text-gray-400 hover:bg-[#3a3a3a]'
                  }`}
                >
                  Public
                </button>
                <button
                  onClick={() => setActiveQuestTab('private-quests')}
                  className={`py-2 px-4 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    activeQuestTab === 'private-quests'
                      ? 'bg-[#F7CEB0] text-black'
                      : 'bg-[#292929] text-gray-400 hover:bg-[#3a3a3a]'
                  }`}
                >
                  Private
                </button>
                <button
                  onClick={() => setActiveQuestTab('saved-quests')}
                  className={`py-2 px-4 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    activeQuestTab === 'saved-quests'
                      ? 'bg-[#F7CEB0] text-black'
                      : 'bg-[#292929] text-gray-400 hover:bg-[#3a3a3a]'
                  }`}
                >
                  Saved Quests
                </button>
              </div>

              {loadingQuests ? (
                <div className='text-center py-8'>
                  <div className='text-gray-400'>Loading quests...</div>
                </div>
              ) : activeQuestTab === 'public-quests' ? (
                myQuests.filter(q => q.isPublic).length > 0 ? (
                  <div className='flex gap-4 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide'>
                    {myQuests.filter(q => q.isPublic).slice(0, 5).map(quest => (
                      <div key={quest.id} className='min-w-[280px] flex-shrink-0'>
                        <QuestCard quest={quest} onClick={() => navigateTo(`/quest/${quest.id}`)} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-8 bg-[#292929] rounded-lg'>
                    <p className='text-gray-400'>No public quests</p>
                    <button
                      onClick={() => navigateTo('/quest/create')}
                      className='mt-3 bg-[#F7CEB0] text-black px-6 py-2 rounded-lg font-medium hover:bg-[#f5c094] transition-colors'
                    >
                      Create Public Quest
                    </button>
                  </div>
                )
              ) : activeQuestTab === 'private-quests' ? (
                myQuests.filter(q => !q.isPublic).length > 0 ? (
                  <div className='flex gap-4 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide'>
                    {myQuests.filter(q => !q.isPublic).slice(0, 5).map(quest => (
                      <div key={quest.id} className='min-w-[280px] flex-shrink-0'>
                        <QuestCard quest={quest} onClick={() => navigateTo(`/quest/${quest.id}`)} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-8 bg-[#292929] rounded-lg'>
                    <p className='text-gray-400'>No private quests</p>
                    <button
                      onClick={() => navigateTo('/quest/create')}
                      className='mt-3 bg-[#F7CEB0] text-black px-6 py-2 rounded-lg font-medium hover:bg-[#f5c094] transition-colors'
                    >
                      Create Private Quest
                    </button>
                  </div>
                )
              ) : (
                savedQuests.length > 0 ? (
                  <div className='flex gap-4 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide'>
                    {savedQuests.slice(0, 5).map(quest => (
                      <div key={quest.id} className='min-w-[280px] flex-shrink-0'>
                        <QuestCard quest={quest} onClick={() => navigateTo(`/quest/${quest.id}`)} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-8 bg-[#292929] rounded-lg'>
                    <p className='text-gray-400'>No saved quests</p>
                    <p className='text-gray-500 text-sm mt-1'>Save quests to view them here</p>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Menu Options */}
          <div className='px-5 mt-6'>
            <h3 className='text-xl font-semibold text-[#F7CEB0] mb-4'>Quick Actions</h3>
            
            <MenuOption
              icon={<Calendar className='text-[#F7CEB0]' size={24} />}
              label="Upcoming Quests"
              onClick={() => navigateTo('/account/upcoming-quests')}
            />
            <MenuOption
              icon={<SlidersHorizontal className='text-[#F7CEB0]' size={24} />}
              label="Preferences"
              onClick={() => navigateTo('/account/preferences')}
            />
            <MenuOption
              icon={<HelpCircle className='text-[#F7CEB0]' size={24} />}
              label="Support"
              onClick={() => navigateTo('/account/support')}
            />
          </div>

          <Footer />
        </div>
      )}
    </div>
  );
};

// Menu Option Component
const MenuOption: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}> = ({ icon, label, onClick }) => (
  <div 
    onClick={onClick}
    className='w-full flex justify-between items-center py-4 border-b-2 border-[#F7CEB0] cursor-pointer hover:bg-[#1a1a1a] transition-colors'
  >
    <div className='flex gap-4 items-center'>
      <div>{icon}</div>
      <div className='text-xl text-white'>{label}</div>
    </div>
    <div className='text-[#F7CEB0]'><IoChevronForward size={28} /></div>
  </div>
);

// Compact Post Card for horizontal scrolling
const CompactPostCard: React.FC<{ post: Post; onClick: () => void }> = ({ post, onClick }) => {
  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div 
      onClick={onClick}
      className='bg-[#292929] rounded-xl overflow-hidden cursor-pointer hover:bg-[#3a3a3a] transition-colors border border-gray-700'
    >
      {post.photoUrl && (
        <div className='relative h-48'>
          <img
            src={Array.isArray(post.photoUrl) ? post.photoUrl[0] : post.photoUrl}
            alt="Post"
            className='w-full h-full object-cover'
          />
        </div>
      )}
      <div className='p-3'>
        <p className='text-white text-sm line-clamp-2 mb-2'>{post.text}</p>
        <div className='flex items-center justify-between text-xs text-gray-400'>
          <span>{formatTime(post.createdAt)}</span>
          <div className='flex items-center gap-3'>
            <span>❤️ {post.likeCount || 0}</span>
            <span>💬 {post.commentCount || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Quest Card Component
const QuestCard: React.FC<{ quest: Quest; onClick: () => void }> = ({ quest, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className='bg-[#292929] rounded-xl overflow-hidden cursor-pointer hover:bg-[#3a3a3a] transition-colors border border-gray-700'
    >
      <div className='relative h-40'>
        <img
          src={quest.coverImageUrl as any || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600'}
          alt={quest.title}
          className='w-full h-full object-cover'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/70 to-transparent' />
        <div className='absolute bottom-0 left-0 right-0 p-4'>
          <h4 className='text-white font-bold text-lg mb-1'>{quest.title}</h4>
          <div className='flex items-center gap-2 text-gray-300 text-sm'>
            <MapPin size={14} />
            <span>{quest.destination}</span>
          </div>
        </div>
      </div>
      <div className='p-4'>
        <div className='flex items-center justify-between text-sm'>
          <span className='text-gray-400'>
            {new Date(quest.startDate).toLocaleDateString()} - {new Date(quest.endDate).toLocaleDateString()}
          </span>
          <span className='text-[#F7CEB0] font-medium'>
            {quest.isPublic ? 'Public' : 'Private'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;