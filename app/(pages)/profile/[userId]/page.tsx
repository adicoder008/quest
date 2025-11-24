"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { getUserData, getUserBadges } from '@/lib/firebaseSerive';
import { calculateLevel } from '@/lib/xpService';
import { followUser, unfollowUser } from '@/lib/postService';
import Footer from '@/components/phoneComponents/Footer';
import { MapPin, UserPlus, UserMinus, MessageCircle, Heart, Share2, Bookmark, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { IoChevronForward } from "react-icons/io5";
import { collection, query, where, orderBy, getDocs, doc as firestoreDoc, updateDoc, arrayUnion, arrayRemove, increment, getDoc } from 'firebase/firestore';
import questService from '@/lib/questService';
import { Quest } from '@/app/types';
import NavBar from '@/components/LeftSideNav';
import { followUser as followUserService, unfollowUser as unfollowUserService, getFollowingList, getFollowersList } from '@/lib/followService';


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
}

const PublicProfilePage = () => {
  const router = useRouter();
  const params = useParams();
  const profileUserId = params?.userId as string;
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileUser, setProfileUser] = useState<UserData | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [publicQuests, setPublicQuests] = useState<Quest[]>([]);
  const [levelInfo, setLevelInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followingCount, setFollowingCount] = useState(0);
 const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setCurrentUser(authUser);

      if (profileUserId) {
        try {
          const data = await getUserData(profileUserId);
          setProfileUser(data as UserData);

          const following = await getFollowingList(profileUserId);
          const followers = await getFollowersList(profileUserId);

          setFollowingCount(following.length);
          setFollowersCount(followers.length);

          if (authUser && data?.followers) {
            setIsFollowing(data.followers.includes(authUser.uid));
          }

          const userBadges = await getUserBadges(profileUserId);
          setBadges(userBadges.slice(0, 3));

          const xp = data?.totalXP || 0;
          const level = calculateLevel(xp);
          setLevelInfo(level);

          await fetchUserPosts(profileUserId, data);
          await fetchPublicQuests(profileUserId);
        } catch (error) {
          console.error("Error fetching profile data:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profileUserId]);

  const fetchUserPosts = async (uid: string, userData?: any) => {
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
          isSaved: false,
        };
      });
      
      setPosts(posts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const fetchPublicQuests = async (uid: string) => {
    try {
      const allQuests = await questService.getUserQuests(uid);
      const publicQuestsOnly = allQuests.filter(q => q.isPublic);
      setPublicQuests(publicQuestsOnly);
    } catch (error) {
      console.error('Error fetching public quests:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser?.uid || !profileUserId) return;

    try {
      if (isFollowing) {
        await unfollowUser(currentUser.uid, profileUserId);
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        await followUser(currentUser.uid, profileUserId);
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
       const data = await getUserData(profileUserId);
    setProfileUser(data as UserData);
    
    // Optionally refresh counts from database
    const followers = await getFollowersList(profileUserId);
    setFollowersCount(followers.length);
    } catch (error) {
      console.error('Error toggling follow:', error);
      const followers = await getFollowersList(profileUserId);
      setFollowersCount(followers.length);
      setIsFollowing(followers.includes(currentUser.uid));
    }
  };

  const handleMessageUser = () => {
    router.push(`/chats?user=${profileUserId}`);
  };

  const handleLike = async (postId: string) => {
    if (!currentUser) return;
    try {
      const postRef = firestoreDoc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      if (!postDoc.exists()) return;

      const likedBy = postDoc.data().likedBy || [];
      const isLiked = likedBy.includes(currentUser.uid);

      if (isLiked) {
        await updateDoc(postRef, {
          likedBy: arrayRemove(currentUser.uid),
          likeCount: increment(-1)
        });
      } else {
        await updateDoc(postRef, {
          likedBy: arrayUnion(currentUser.uid),
          likeCount: increment(1)
        });
      }

      setPosts(posts.map(post =>
        post.id === postId
          ? {
              ...post,
              likedBy: isLiked
                ? post.likedBy?.filter(id => id !== currentUser.uid)
                : [...(post.likedBy || []), currentUser.uid],
              likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1
            }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#EA6100] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">User not found</p>
          <button 
            onClick={() => router.back()}
            className="bg-[#EA6100] text-black px-6 py-2 rounded-lg font-medium hover:bg-[#f5c094] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.uid === profileUserId;

  return (
    <div className="min-h-screen bg-[#121212]">
      <style>{styles}</style>

      <div className="hidden lg:block">
        <NavBar user={currentUser} onSignOut={() => {}} />
      </div>
      
      <div className='lg:ml-[280px]'>
        <div className='max-w-7xl mx-auto'>
          
          {/* Mobile Header */}
          <div className='lg:hidden sticky top-0 z-10 h-[60px] w-full bg-black flex items-center px-5 border-b border-gray-700'>
            <button 
              onClick={() => router.back()}
              className='text-white mr-4 hover:text-[#EA6100] transition-colors'
            >
              <ArrowLeft size={24} />
            </button>
            <p className='text-xl font-semibold text-white'>{profileUser.displayName || 'Profile'}</p>
          </div>

          {/* Desktop Header */}
          <div className='hidden lg:block sticky top-0 z-10 bg-[#121212] border-b border-gray-700 py-4 px-8'>
            <div className='flex items-center gap-4'>
              <button 
                onClick={() => router.back()}
                className='text-white hover:text-[#EA6100] transition-colors'
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className='text-2xl font-bold text-white'>{profileUser.displayName || 'Profile'}</h1>
                <p className='text-gray-400 text-sm'>{posts.length} posts</p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className='px-5 lg:px-8 pb-20 lg:pb-8'>
            {/* Profile Header */}
            <div className='relative'>
              <div className='h-48 lg:h-64 relative overflow-hidden rounded-b-xl lg:rounded-xl lg:mt-6'>
                <img
                  src={profileUser.backgroundURL || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200'}
                  alt='Profile Background'
                  className='w-full h-full object-cover'
                />
                <div className='absolute inset-0 bg-gradient-to-b from-transparent to-[#121212]'></div>
              </div>

              <div className='relative -mt-16 lg:-mt-20'>
                <div className='flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4'>
                  <div className='flex flex-col lg:flex-row items-center lg:items-end gap-4 lg:gap-6'>
                    <div className='relative'>
                      <img
                        src={profileUser.photoURL || '/default-avatar.png'}
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
                          {profileUser.displayName || 'User'}
                        </h1>
                        {profileUser.isVerified && (
                          <span className='text-[#EA6100] text-xl'>✓</span>
                        )}
                      </div>
                      <p className='text-gray-400 mt-1'>
                        @{profileUser.displayName?.toLowerCase().replace(/\s+/g, '') || 'user'}
                      </p>
                      {profileUser.title && (
                        <p className='text-gray-500 text-sm mt-1'>{profileUser.title}</p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className='lg:mb-4 w-full lg:w-auto'>
                    {!isOwnProfile && currentUser ? (
                      <div className='flex gap-3'>
                        <button
                          onClick={handleFollowToggle}
                          className={`flex-1 lg:flex-none px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                            isFollowing
                              ? 'bg-[#292929] text-white border border-gray-600 hover:bg-[#3a3a3a]'
                              : 'bg-[#EA6100] text-black hover:bg-[#f5c094]'
                          }`}
                        >
                          {isFollowing ? (
                            <>
                              <UserMinus size={18} />
                              <span>Following</span>
                            </>
                          ) : (
                            <>
                              <UserPlus size={18} />
                              <span>Follow</span>
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={handleMessageUser}
                          className='flex-1 lg:flex-none px-6 py-2.5 rounded-lg font-medium bg-[#292929] text-white border border-gray-600 hover:bg-[#3a3a3a] transition-colors flex items-center justify-center gap-2'
                        >
                          <MessageCircle size={18} />
                          <span>Message</span>
                        </button>
                      </div>
                    ) : isOwnProfile ? (
                      <button
                        onClick={() => router.push('/account')}
                        className='w-full px-6 py-2.5 rounded-lg font-medium bg-[#EA6100] text-black hover:bg-[#f5c094] transition-colors'
                      >
                        View Your Profile
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Stats */}
                <div className='mt-6 grid grid-cols-3 lg:flex lg:gap-8 gap-4 text-center lg:text-left'>
                  <div>
                    <div className='text-xl lg:text-2xl font-bold text-white'>
                      {posts.length}
                    </div>
                    <div className='text-gray-400 text-sm'>Posts</div>
                  </div>
                  <div>
                    <div className='text-xl lg:text-2xl font-bold text-white'>
                      {followersCount}
                    </div>
                    <div className='text-gray-400 text-sm'>Followers</div>
                  </div>
                  <div>
                    <div className='text-xl lg:text-2xl font-bold text-white'>
                      {followingCount}
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
                {profileUser.bio && (
                  <div className='mt-4 text-gray-300 max-w-3xl'>
                    {profileUser.bio}
                  </div>
                )}

                {/* Level Progress */}
                {levelInfo && (
                  <div className='mt-5 bg-[#1a1a1a] p-4 rounded-xl'>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-[#EA6100] font-semibold text-sm'>
                        {levelInfo.currentLevel || 'Scout'}
                      </span>
                      {levelInfo.nextLevel && (
                        <span className='text-gray-400 text-xs'>
                          {levelInfo.xpToNext} XP to {levelInfo.nextLevel}
                        </span>
                      )}
                    </div>
                    <div className='w-full bg-gray-700 rounded-full h-2.5'>
                      <div 
                        className='bg-gradient-to-r from-[#EA6100] to-[#f5c094] h-2.5 rounded-full transition-all duration-300'
                        style={{ width: `${(levelInfo.progress || 0) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Badges */}
                {badges.length > 0 && (
                  <div className='mt-6'>
                    <h3 className='text-white font-semibold text-lg mb-3'>Earned Badges</h3>
                    <div className='flex gap-3 overflow-x-auto pb-2 scrollbar-hide'>
                      {badges.map(badge => (
                        <div 
                          key={badge.id}
                          className='bg-[#292929] rounded-lg p-3 flex flex-col items-center min-w-[90px] flex-shrink-0 hover:bg-[#3a3a3a] transition-colors'
                          title={badge.description}
                        >
                          <img 
                            src={badge.iconUrl} 
                            alt={badge.name}
                            className='w-12 h-12 object-contain mb-2'
                          />
                          <span className='text-white text-xs font-semibold text-center'>
                            {badge.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Content Sections */}
            <div className='mt-8 space-y-6'>
              {/* Posts */}
              {posts.length > 0 ? (
                <div className='bg-[#1a1a1a] rounded-xl p-5 lg:p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-white font-semibold text-xl'>Posts</h3>
                    {posts.length > 3 && (
                      <button 
                        onClick={() => router.push(`/user/${profileUserId}/posts`)}
                        className='text-[#EA6100] text-sm hover:underline flex items-center gap-1'
                      >
                        <span>View All ({posts.length})</span>
                        <IoChevronForward />
                      </button>
                    )}
                  </div>
                  
                  <div className='space-y-4'>
                    {posts.slice(0, 3).map(post => (
                      <PostCard
                        key={post.id}
                        post={post}
                        currentUser={currentUser}
                        onLike={() => handleLike(post.id)}
                        onClick={() => router.push(`/post/${post.id}`)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className='bg-[#1a1a1a] rounded-xl p-8 text-center'>
                  <p className='text-gray-400'>No posts yet</p>
                </div>
              )}

              {/* Public Quests */}
              {publicQuests.length > 0 ? (
                <div className='bg-[#1a1a1a] rounded-xl p-5 lg:p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-white font-semibold text-xl'>Public Quests</h3>
                    {publicQuests.length > 4 && (
                      <button 
                        onClick={() => router.push(`/user/${profileUserId}/quests`)}
                        className='text-[#EA6100] text-sm hover:underline flex items-center gap-1'
                      >
                        <span>View All ({publicQuests.length})</span>
                        <IoChevronForward />
                      </button>
                    )}
                  </div>
                  
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {publicQuests.slice(0, 4).map(quest => (
                      <QuestCard
                        key={quest.id}
                        quest={quest}
                        onClick={() => router.push(`/quest/${quest.id}`)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                posts.length === 0 && (
                  <div className='bg-[#1a1a1a] rounded-xl p-8 text-center'>
                    <p className='text-gray-400'>No public content yet</p>
                  </div>
                )
              )}
            </div>
          </div>

          <div className='lg:hidden'>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

// Post Card Component with Read More
const PostCard: React.FC<{ 
  post: Post; 
  currentUser: any; 
  onLike: () => void;
  onClick: () => void;
}> = ({ post, currentUser, onLike, onClick }) => {
  const [liked, setLiked] = useState(post.likedBy?.includes(currentUser?.uid) || false);
  const [showFullText, setShowFullText] = useState(false);

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

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    onLike();
  };

  const textLimit = 150;
  const needsReadMore = post.text.length > textLimit;

  return (
    <div 
      className='bg-[#292929] rounded-xl overflow-hidden hover:bg-[#3a3a3a] transition-colors border border-gray-800'
    >
      <div className='flex items-center justify-between p-4 border-b border-gray-800'>
        <div className='flex items-center gap-3 cursor-pointer' onClick={onClick}>
          <img 
            src={post.userProfilePic || '/default-avatar.png'} 
            alt={post.userName}
            className='w-10 h-10 rounded-full object-cover'
          />
          <div>
            <span className='text-white font-medium block'>{post.userName}</span>
            <span className='text-gray-400 text-sm'>{formatTime(post.createdAt)}</span>
          </div>
        </div>
        <button className='text-gray-400 hover:text-white' onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal size={20} />
        </button>
      </div>

      {post.photoUrl && (
        <div className='relative w-full aspect-square cursor-pointer' onClick={onClick}>
          <img
            src={Array.isArray(post.photoUrl) ? post.photoUrl[0] : post.photoUrl}
            alt="Post"
            className='w-full h-full object-cover'
          />
        </div>
      )}

      <div className='p-4'>
        <div className='mb-3'>
          <p className='text-white'>
            {needsReadMore && !showFullText 
              ? `${post.text.slice(0, textLimit)}...` 
              : post.text
            }
          </p>
          {needsReadMore && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowFullText(!showFullText);
              }}
              className='text-[#EA6100] text-sm mt-1 hover:underline'
            >
              {showFullText ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
        
        <div className='flex items-center justify-between pt-3 border-t border-gray-800'>
          <div className='flex items-center gap-4'>
            <button 
              onClick={handleLike}
              className={`flex items-center gap-2 transition-colors ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
            >
              <Heart size={22} className={liked ? 'fill-current' : ''} />
              <span className='text-sm font-medium'>{post.likeCount || 0}</span>
            </button>
            <button 
              className='flex items-center gap-2 text-gray-400 hover:text-white transition-colors'
              onClick={onClick}
            >
              <MessageCircle size={22} />
              <span className='text-sm font-medium'>{post.commentCount || 0}</span>
            </button>
            <button 
              className='text-gray-400 hover:text-white transition-colors'
              onClick={(e) => e.stopPropagation()}
            >
              <Share2 size={22} />
            </button>
          </div>
          <button 
            className='text-gray-400 hover:text-[#EA6100] transition-colors'
            onClick={(e) => e.stopPropagation()}
          >
            <Bookmark size={22} className={post.isSaved ? 'fill-current text-[#EA6100]' : ''} />
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
      <div className='relative h-48'>
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
            {new Date(quest.startDate).toLocaleDateString()}
          </span>
          <span className='text-[#EA6100] font-medium text-xs'>Public</span>
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage;