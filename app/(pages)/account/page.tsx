"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { getUserData, getUserBadges } from '@/lib/firebaseSerive';
import { calculateLevel } from '@/lib/xpService';
import { addComment } from '@/lib/postService';
import { savePost, unsavePost, sharePost } from '@/lib/postService';
import Footer from '@/components/phoneComponents/Footer';
import MobilePostCard from '@/components/Home/MobilePostCard';
import { Settings, Edit2, Calendar, SlidersHorizontal, HelpCircle, MapPin, Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { IoChevronForward } from "react-icons/io5";
import { collection, query, where, orderBy, getDocs, doc as firestoreDoc, updateDoc, arrayUnion, arrayRemove, increment, getDoc } from 'firebase/firestore';
import questService from '@/lib/questService';
import { Quest, User as UserType } from '@/app/types';
import NavBar from '@/components/Nav';


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
          console.log("User XP:", xp);
        
          const level = calculateLevel(xp);
          console.log("Calculated Level:", level);
          setLevelInfo(level);
          console.log("Level Info Set:", level);

          await fetchUserPosts(currentUser.uid);
          
          if (data?.savedPosts && data.savedPosts.length > 0) {
            await fetchSavedPosts(data.savedPosts);
          }

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
      
      const savedQuestItems: any[] = (await questService.getUserSavedQuests(uid)) || [];
      const savedQuestIds: string[] = savedQuestItems
        .map((item: any) => (typeof item === 'string' ? item : item?.id))
        .filter(Boolean);
      const savedQuestsData = await Promise.all(
        savedQuestIds.map((id: string) => questService.getQuestById(id))
      );
      setSavedQuests(savedQuestsData.filter(Boolean) as Quest[]);
    } catch (error) {
      console.error('Error fetching quests:', error);
    } finally {
      setLoadingQuests(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    try {
      const postRef = firestoreDoc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      if (!postDoc.exists()) return;

      const likedBy = postDoc.data().likedBy || [];
      const isLiked = likedBy.includes(user.uid);

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

      const updatePosts = (posts: Post[]) =>
        posts.map(post =>
          post.id === postId
            ? {
                ...post,
                likedBy: isLiked
                  ? post.likedBy?.filter(id => id !== user.uid)
                  : [...(post.likedBy || []), user.uid],
                likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1
              }
            : post
        );

      setYourPosts(updatePosts);
      setSavedPosts(updatePosts);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId: string, commentText: string) => {
    if (!user || !commentText.trim()) return;
    try {
      await addComment(postId, user.uid, commentText);
      const updatePosts = (posts: Post[]) =>
        posts.map(post =>
          post.id === postId
            ? { ...post, commentCount: post.commentCount + 1 }
            : post
        );
      setYourPosts(updatePosts);
      setSavedPosts(updatePosts);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleSave = async (postId: string, isSaved: boolean) => {
    if (!user) return;
    try {
      if (isSaved) {
        await unsavePost(postId, user.uid);
      } else {
        await savePost(postId, user.uid);
      }
      const updatePosts = (posts: Post[]) =>
        posts.map(post =>
          post.id === postId ? { ...post, isSaved: !isSaved } : post
        );
      setYourPosts(updatePosts);
      setSavedPosts(updatePosts);
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handleShare = async (postId: string) => {
    try {
      await sharePost(postId);
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-[#121212] flex items-center justify-center'>
        <div className='w-16 h-16 border-4 border-[#EA6100] border-t-transparent rounded-full animate-spin'></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className='min-h-screen bg-[#121212] text-white flex items-center justify-center px-4'>
        <div className='text-center max-w-md'>
          <h2 className='text-3xl font-bold text-[#EA6100] mb-4'>Welcome to OnQuest</h2>
          <p className='text-gray-400 mb-6'>Please log in to view your profile</p>
          <button
            onClick={() => navigateTo('/login')}
            className='bg-[#EA6100] text-black px-8 py-3 rounded-lg font-medium hover:bg-[#f5c094] transition-colors'
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#121212]'>
      <style>{styles}</style>
      
      <div className="hidden lg:block">
        <NavBar user={user} onSignOut={handleSignOut} />
      </div>
      
      {/* Desktop: Account for sidebar, Mobile: Full width */}
      <div className='lg:ml-[280px]'>
        <div className='max-w-7xl mx-auto'>
          {/* Profile Header */}
          <div className='relative'>
            {/* Background Image */}
            <div className='h-48 lg:h-64 relative overflow-hidden'>
              <img
                src={userData?.backgroundURL || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200'}
                alt='Profile Background'
                className='w-full h-full object-cover'
              />
              <div className='absolute inset-0 bg-gradient-to-b from-transparent to-[#121212]'></div>
            </div>

            {/* Profile Info - Overlapping */}
            <div className='relative px-5 lg:px-8 -mt-16 lg:-mt-20'>
              <div className='flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4'>
                {/* Left: Avatar and Name */}
                <div className='flex flex-col lg:flex-row items-center lg:items-end gap-4 lg:gap-6'>
                  <div className='relative'>
                    <img
                      src={userData?.photoURL || '/default-avatar.png'}
                      alt='Profile'
                      className='w-32 h-32 lg:w-40 lg:h-40 rounded-full border-4 border-[#121212] object-cover'
                    />
                    {levelInfo && (
                      <div className='absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#EA6100] text-black px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap'>
                        {levelInfo.currentLevel}
                      </div>
                    )}
                  </div>
                  <div className='text-center lg:text-left lg:mb-4'>
                    <div className='flex items-center gap-2 justify-center lg:justify-start'>
                      <h1 className='text-2xl lg:text-3xl font-bold text-white'>
                        {userData?.displayName || 'User'}
                      </h1>
                      {userData?.isVerified && (
                        <span className='text-[#EA6100] text-xl'>✓</span>
                      )}
                    </div>
                    <p className='text-gray-400 mt-1'>
                      @{userData?.displayName?.toLowerCase().replace(/\s+/g, '') || 'user'}
                    </p>
                    {userData?.title && (
                      <p className='text-gray-500 text-sm mt-1'>{userData.title}</p>
                    )}
                  </div>
                </div>

                {/* Right: Edit Button (Desktop) */}
                <div className='hidden lg:flex lg:mb-4'>
                  <button
                    onClick={() => navigateTo('/settings')}
                    className='flex items-center gap-2 bg-[#292929] hover:bg-[#3a3a3a] text-white px-6 py-2.5 rounded-lg transition-colors'
                  >
                    <Edit2 size={18} />
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>

              {/* Stats - Desktop: Single row, Mobile: Keep as is */}
              <div className='mt-6 grid grid-cols-3 lg:flex lg:gap-8 gap-4 text-center lg:text-left'>
                <div>
                  <div className='text-xl lg:text-2xl font-bold text-white'>
                    {userData?.postsCount || yourPosts.length}
                  </div>
                  <div className='text-gray-400 text-sm'>Posts</div>
                </div>
                <div>
                  <div className='text-xl lg:text-2xl font-bold text-white'>
                    {userData?.followers?.length || 0}
                  </div>
                  <div className='text-gray-400 text-sm'>Followers</div>
                </div>
                <div>
                  <div className='text-xl lg:text-2xl font-bold text-white'>
                    {userData?.following?.length || 0}
                  </div>
                  <div className='text-gray-400 text-sm'>Following</div>
                </div>
                {levelInfo && (
                  <div className='col-span-3 lg:col-span-1'>
                    <div className='text-xl lg:text-2xl font-bold text-[#EA6100]'>
                      {levelInfo.totalXP} XP
                    </div>
                    <div className='text-gray-400 text-sm'>Experience</div>
                  </div>
                )}
              </div>

              {/* Bio */}
              {userData?.bio && (
                <div className='mt-4 text-gray-300 max-w-3xl'>
                  {userData.bio}
                </div>
              )}

              {/* Badges - Desktop: Horizontal, Mobile: Keep horizontal scroll */}
              {badges.length > 0 && (
                <div className='mt-6'>
                  <h3 className='text-white font-semibold mb-3'>Badges</h3>
                  <div className='flex gap-3 overflow-x-auto pb-2 scrollbar-hide'>
                    {badges.map((badge) => (
                      <div
                        key={badge.id}
                        className='flex-shrink-0 bg-[#292929] rounded-lg p-3 hover:bg-[#3a3a3a] transition-colors'
                        title={badge.description}
                      >
                        <img
                          src={badge.iconUrl}
                          alt={badge.name}
                          className='w-12 h-12 object-contain'
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop: Grid layout, Mobile: Stack */}
          <div className='mt-8 px-5 lg:px-8 pb-20 lg:pb-8'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              
              {/* Left Column - Posts (Desktop: 2/3, Mobile: Full) */}
              <div className='lg:col-span-2 space-y-6'>
                
                {/* Posts Section */}
                <div className='bg-[#1a1a1a] rounded-xl p-5 lg:p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <h2 className='text-2xl font-bold text-white'>Posts</h2>
                  </div>
                  
                  {/* Post Tabs */}
                  <div className='flex gap-3 mb-6 overflow-x-auto scrollbar-hide'>
                    <button
                      onClick={() => setActivePostTab('your-posts')}
                      className={`py-2 px-4 rounded-lg font-medium transition-colors whitespace-nowrap ${
                        activePostTab === 'your-posts'
                          ? 'bg-[#EA6100] text-black'
                          : 'bg-[#292929] text-gray-400 hover:bg-[#3a3a3a]'
                      }`}
                    >
                      Your Posts ({yourPosts.length})
                    </button>
                    <button
                      onClick={() => setActivePostTab('saved-posts')}
                      className={`py-2 px-4 rounded-lg font-medium transition-colors whitespace-nowrap ${
                        activePostTab === 'saved-posts'
                          ? 'bg-[#EA6100] text-black'
                          : 'bg-[#292929] text-gray-400 hover:bg-[#3a3a3a]'
                      }`}
                    >
                      Saved Posts ({savedPosts.length})
                    </button>
                  </div>

                  {/* Posts Content - Horizontal Scroll */}
                  {loadingPosts ? (
                    <div className='text-center py-8'>
                      <div className='text-gray-400'>Loading posts...</div>
                    </div>
                  ) : (
                    <div>
                      {activePostTab === 'your-posts' ? (
                        yourPosts.length > 0 ? (
                          <div>
                            <div className='flex gap-4 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide'>
                              {yourPosts.slice(0, 5).map(post => (
                                <div key={post.id} className='min-w-[300px] lg:min-w-[320px] flex-shrink-0'>
                                  <PostCardCompact
                                    post={post}
                                    currentUser={user}
                                    onLike={() => handleLike(post.id)}
                                    onClick={() => navigateTo(`/post/${post.id}`)}
                                  />
                                </div>
                              ))}
                            </div>
                            {yourPosts.length > 5 && (
                              <button
                                onClick={() => navigateTo('/account/all-posts?tab=your-posts')}
                                className='mt-4 w-full py-3 bg-[#292929] hover:bg-[#3a3a3a] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2'
                              >
                                <span>View All Posts ({yourPosts.length})</span>
                                <IoChevronForward />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className='text-center py-8 bg-[#292929] rounded-lg'>
                            <p className='text-gray-400'>No posts yet</p>
                            <button
                              onClick={() => navigateTo('/create-post')}
                              className='mt-3 bg-[#EA6100] text-black px-6 py-2 rounded-lg font-medium hover:bg-[#f5c094] transition-colors'
                            >
                              Create Your First Post
                            </button>
                          </div>
                        )
                      ) : (
                        savedPosts.length > 0 ? (
                          <div>
                            <div className='flex gap-4 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide'>
                              {savedPosts.slice(0, 5).map(post => (
                                <div key={post.id} className='min-w-[300px] lg:min-w-[320px] flex-shrink-0'>
                                  <PostCardCompact
                                    post={post}
                                    currentUser={user}
                                    onLike={() => handleLike(post.id)}
                                    onClick={() => navigateTo(`/post/${post.id}`)}
                                  />
                                </div>
                              ))}
                            </div>
                            {savedPosts.length > 5 && (
                              <button
                                onClick={() => navigateTo('/account/all-posts?tab=saved-posts')}
                                className='mt-4 w-full py-3 bg-[#292929] hover:bg-[#3a3a3a] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2'
                              >
                                <span>View All Saved Posts ({savedPosts.length})</span>
                                <IoChevronForward />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className='text-center py-8 bg-[#292929] rounded-lg'>
                            <p className='text-gray-400'>No saved posts</p>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* Quests Section */}
                <div className='bg-[#1a1a1a] rounded-xl p-5 lg:p-6'>
                  <h2 className='text-2xl font-bold text-white mb-4'>Quests</h2>
                  
                  {/* Quest Tabs */}
                  <div className='flex gap-3 mb-6 overflow-x-auto scrollbar-hide'>
                    <button
                      onClick={() => setActiveQuestTab('public-quests')}
                      className={`py-2 px-4 rounded-lg font-medium transition-colors whitespace-nowrap ${
                        activeQuestTab === 'public-quests'
                          ? 'bg-[#EA6100] text-black'
                          : 'bg-[#292929] text-gray-400 hover:bg-[#3a3a3a]'
                      }`}
                    >
                      Public
                    </button>
                    <button
                      onClick={() => setActiveQuestTab('private-quests')}
                      className={`py-2 px-4 rounded-lg font-medium transition-colors whitespace-nowrap ${
                        activeQuestTab === 'private-quests'
                          ? 'bg-[#EA6100] text-black'
                          : 'bg-[#292929] text-gray-400 hover:bg-[#3a3a3a]'
                      }`}
                    >
                      Private
                    </button>
                    <button
                      onClick={() => setActiveQuestTab('saved-quests')}
                      className={`py-2 px-4 rounded-lg font-medium transition-colors whitespace-nowrap ${
                        activeQuestTab === 'saved-quests'
                          ? 'bg-[#EA6100] text-black'
                          : 'bg-[#292929] text-gray-400 hover:bg-[#3a3a3a]'
                      }`}
                    >
                      Saved Quests
                    </button>
                  </div>

                  {/* Quests Content - Horizontal Scroll */}
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
                          className='mt-3 bg-[#EA6100] text-black px-6 py-2 rounded-lg font-medium hover:bg-[#f5c094] transition-colors'
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
                          className='mt-3 bg-[#EA6100] text-black px-6 py-2 rounded-lg font-medium hover:bg-[#f5c094] transition-colors'
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

              {/* Right Column - Quick Actions (Desktop: 1/3, Mobile: Full) */}
              <div className='lg:col-span-1 space-y-6'>
                <div className='bg-[#1a1a1a] rounded-xl p-5 lg:p-6 lg:sticky lg:top-6'>
                  <h3 className='text-xl font-semibold text-[#EA6100] mb-4'>Quick Actions</h3>
                  
                  <div className='space-y-2'>
                    <MenuOption
                      icon={<Settings className='text-[#EA6100]' size={20} />}
                      label="Settings"
                      onClick={() => navigateTo('/settings')}
                    />
                    <MenuOption
                      icon={<Calendar className='text-[#EA6100]' size={20} />}
                      label="Upcoming Quests"
                      onClick={() => navigateTo('/account/upcoming-quests')}
                    />
                    <MenuOption
                      icon={<SlidersHorizontal className='text-[#EA6100]' size={20} />}
                      label="Preferences"
                      onClick={() => navigateTo('/account/preferences')}
                    />
                    <MenuOption
                      icon={<HelpCircle className='text-[#EA6100]' size={20} />}
                      label="Support"
                      onClick={() => navigateTo('/account/support')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Footer */}
          <div className='lg:hidden'>
            <Footer />
          </div>
        </div>
      </div>
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
    className='flex justify-between items-center py-3 px-4 rounded-lg hover:bg-[#292929] cursor-pointer transition-colors group'
  >
    <div className='flex gap-3 items-center'>
      <div className='flex-shrink-0'>{icon}</div>
      <div className='text-white group-hover:text-[#EA6100] transition-colors'>{label}</div>
    </div>
    <div className='text-[#EA6100] opacity-0 group-hover:opacity-100 transition-opacity'>
      <IoChevronForward size={20} />
    </div>
  </div>
);

// Compact Post Card matching your PostCard design
const PostCardCompact: React.FC<{ 
  post: Post; 
  currentUser: any; 
  onLike: () => void;
  onClick: () => void;
}> = ({ post, currentUser, onLike, onClick }) => {
  const [liked, setLiked] = useState(post.likedBy?.includes(currentUser?.uid) || false);

  useEffect(() => {
    setLiked(post.likedBy?.includes(currentUser?.uid) || false);
  }, [post.likedBy, currentUser?.uid]);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike();
  };

  return (
    <div 
      className='bg-[#292929] rounded-xl overflow-hidden cursor-pointer hover:bg-[#3a3a3a] transition-colors border border-gray-800 hover:border-[#EA6100]'
      onClick={onClick}
    >
      {/* User header */}
      <div className='flex items-center justify-between p-3 border-b border-gray-800'>
        <div className='flex items-center gap-2'>
          <img 
            src={post.userProfilePic || '/default-avatar.png'} 
            alt={post.userName}
            className='w-8 h-8 rounded-full object-cover'
          />
          <div>
            <span className='text-white text-sm font-medium block'>{post.userName}</span>
            <span className='text-gray-400 text-xs'>{formatTime(post.createdAt)}</span>
          </div>
        </div>
        <button className='text-gray-400 hover:text-white' onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Post Image */}
      {post.photoUrl && (
        <div className='relative h-48'>
          <img
            src={Array.isArray(post.photoUrl) ? post.photoUrl[0] : post.photoUrl}
            alt="Post"
            className='w-full h-full object-cover'
          />
        </div>
      )}

      {/* Post Content */}
      <div className='p-3'>
        <p className='text-white text-sm line-clamp-2 mb-3'>{post.text}</p>
        
        {/* Actions */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <button 
              onClick={handleLikeClick}
              className={`flex items-center gap-1 transition-colors ${liked ? 'text-red-500' : 'text-gray-400'}`}
            >
              <Heart size={18} className={liked ? 'fill-current' : ''} />
              <span className='text-xs'>{post.likeCount || 0}</span>
            </button>
            <button className='flex items-center gap-1 text-gray-400 hover:text-white transition-colors' onClick={(e) => e.stopPropagation()}>
              <MessageCircle size={18} />
              <span className='text-xs'>{post.commentCount || 0}</span>
            </button>
            <button className='text-gray-400 hover:text-white transition-colors' onClick={(e) => e.stopPropagation()}>
              <Share2 size={18} />
            </button>
          </div>
          <button className='text-gray-400 hover:text-[#EA6100] transition-colors' onClick={(e) => e.stopPropagation()}>
            <Bookmark size={18} className={post.isSaved ? 'fill-current text-[#EA6100]' : ''} />
          </button>
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
      className='bg-[#292929] rounded-xl overflow-hidden cursor-pointer hover:bg-[#3a3a3a] transition-colors border border-gray-800 hover:border-[#EA6100]'
    >
      <div className='relative h-40'>
        <img
          src={quest.coverImageUrl as any || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600'}
          alt={quest.title}
          className='w-full h-full object-cover'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/70 to-transparent' />
        <div className='absolute bottom-0 left-0 right-0 p-4'>
          <h4 className='text-white font-bold text-lg mb-1 line-clamp-1'>{quest.title}</h4>
          <div className='flex items-center gap-2 text-gray-300 text-sm'>
            <MapPin size={14} />
            <span className='line-clamp-1'>{quest.destination}</span>
          </div>
        </div>
      </div>
      <div className='p-4'>
        <div className='flex items-center justify-between text-sm'>
          <span className='text-gray-400 text-xs'>
            {new Date(quest.startDate).toLocaleDateString()} - {new Date(quest.endDate).toLocaleDateString()}
          </span>
          <span className='text-[#EA6100] font-medium text-xs'>
            {quest.isPublic ? 'Public' : 'Private'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;

