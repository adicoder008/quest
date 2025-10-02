'use client';

import { useState, useEffect, Key } from 'react';
import { Plus, MessageCircle, Heart, Bookmark, Search, MoreHorizontal, MapPin, X, Send } from 'lucide-react';
import { subscribeToPosts, likePost, addComment, followUser, unfollowUser } from '../../../lib/postService';
import { getCurrentUserData } from '../../../lib/authService';
import { auth, db } from '../../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import CreatePostModal from '../../../components/Home/CreatePostModal';
import PostCard from '../../../components/Home/PostCard';
import { User, Post } from '../../types/index';
import Header from '@/components/phoneComponents/header';
import Footer from '@/components/phoneComponents/Footer';
import useResponsive from '../../../hooks/useResponsive';
import CreatePost from '@/components/Feed_old/CreatePost';
import Navbar from '@/components/Nav';
import { collection, query, orderBy, onSnapshot, updateDoc, doc as firestoreDoc, arrayUnion, arrayRemove, increment, getDocs } from 'firebase/firestore';
import { getDoc, doc } from 'firebase/firestore';
import { FaPlus, FaHeartbeat, FaRegCommentDots, FaShareSquare } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const ResponsiveFeedPage = () => {
  const isDesktop = useResponsive(768);

  if (isDesktop) {
    return <Feed />;
  }
  
  return <MobileFeedPage />;
};
interface Comment {
  id: string;
  text: string;        // ✅ Now properly set from Firestore
  createdAt: any;      // ✅ Now properly set from Firestore
  author: {
    name: string;
    avatar: string;
  };
  [key: string]: any;
}
// =================================================================
// COMMENT MODAL FOR DESKTOP (TWITTER-STYLE)
// =================================================================
interface CommentModalProps {
  post: any;
  user: User;
  onClose: () => void;
  onCommentSubmit: (postId: string, commentText: string) => void;
}

const CommentModal = ({ post, user, onClose, onCommentSubmit }: CommentModalProps) => {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      if (!post?.id) return;
      
      try {
        const commentsRef = collection(db, 'posts', post.id, 'comments');
        const commentsQuery = query(commentsRef, orderBy('createdAt', 'desc'));
        const commentsSnapshot = await getDocs(commentsQuery);
        
        const commentsData: Comment[] = [];
      for (const commentDoc of commentsSnapshot.docs) {
        const commentData = commentDoc.data();
        let commentAuthor = {
          name: 'Anonymous',
          avatar: '/default-avatar.png'
        };
        
        if (commentData.uid) {
          try {
            const userDoc = await getDoc(doc(db, 'users', commentData.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              commentAuthor = {
                name: userData.displayName || 'Anonymous',
                avatar: userData.photoURL || '/default-avatar.png'
              };
            }
          } catch (error) {
            console.error('Error fetching comment author:', error);
          }
        }
        
            commentsData.push({
  id: commentDoc.id,
  text: commentData.text || '',      // ✅ Get text from Firestore
  createdAt: commentData.createdAt,  // ✅ Get timestamp from Firestore
  author: commentAuthor,
  ...commentData                      // ✅ Spread AFTER to avoid overwriting
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
      
      // Refresh comments after submitting
      const commentsRef = collection(db, 'posts', post.id, 'comments');
      const commentsQuery = query(commentsRef, orderBy('createdAt', 'desc'));
      const commentsSnapshot = await getDocs(commentsQuery);
      
      const commentsData = [];
      for (const commentDoc of commentsSnapshot.docs) {
        const commentData = commentDoc.data();
        let commentAuthor = {
          name: 'Anonymous',
          avatar: '/default-avatar.png'
        };
        
        if (commentData.uid) {
          try {
            const userDoc = await getDoc(doc(db, 'users', commentData.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              commentAuthor = {
                name: userData.displayName || 'Anonymous',
                avatar: userData.photoURL || '/default-avatar.png'
              };
            }
          } catch (error) {
            console.error('Error fetching comment author:', error);
          }
        }
        
       
commentsData.push({
  id: commentDoc.id,
  text: commentData.text || '',      // ✅ Get text from Firestore
  createdAt: commentData.createdAt,  // ✅ Get timestamp from Firestore
  author: commentAuthor,
  ...commentData                      // ✅ Spread AFTER
});
      }
      
      setComments(commentsData);
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const formatCommentTime = (timestamp: { toDate: () => any; seconds: number; }) => {
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
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
          <h2 className="text-xl font-bold text-white">Comments</h2>
          <div className="w-8"></div> {/* Spacer for balance */}
        </div>

        {/* Original Post */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-start gap-3">
            <img 
              src={post.author.avatar} 
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-medium text-white">{post.author.name}</h3>
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
                    className="rounded-lg max-w-xs object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments List */}
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
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-white">{comment.author.name}</h4>
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

        {/* Comment Input - Fixed at bottom */}
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

const Feed = () => {
  const [user, setUser] = useState<User | null>(null);
const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
 const [posts, setPosts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [popularUsers, setPopularUsers] = useState<any[]>([]);
const [selectedPostForComment, setSelectedPostForComment] = useState<any>(null); 
 const router = useRouter();
 
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      // Convert Firebase User to custom User type
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
    const unsubscribePosts = onSnapshot(
      query(collection(db, 'posts'), orderBy('createdAt', 'desc')),
      async (snapshot) => {
        const postsData = [];
        
        for (const docc of snapshot.docs) {
          const data = docc.data();
          let authorName = 'Anonymous';
          let authorAvatar = '/default-avatar.png';
          let authorTitle = '';
          
          try {
            const userDoc = await getDoc(doc(db, 'users', data.userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              authorName = userData.displayName || authorName;
              authorAvatar = userData.photoURL || authorAvatar;
              authorTitle = userData.title || '';
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
    
          postsData.push({
            id: docc.id,
            author: {
              id: data.userId,
              name: authorName,
              avatar: authorAvatar,
              title: data.postType === 'sponsored' ? 'Sponsored' : authorTitle
            },
            content: {
              text: data.text,
              images: data.photoUrl ? [data.photoUrl] : []
            },
            metadata: {
              time: '',
              location: data.location || '',
              createdAt: data.createdAt
            },
            stats: {
              likes: data.likeCount || 0,
              comments: data.commentCount || 0,
              likedBy: data.likedBy || []
            },
            postType: data.postType,
            ...(data.eventDetails && { eventDetails: data.eventDetails }),
            ...(data.questContext && { questContext: data.questContext })
          });
        }
        
        setPosts(postsData);
      }
    );
  
    const unsubscribeEvents = onSnapshot(
      query(collection(db, 'events'), orderBy('startTime', 'asc')),
      (snapshot) => {
        const eventsData = snapshot.docs.map(docc => ({
          id: docc.id,
          ...docc.data(),
          formattedDate: {
            day: new Date(docc.data().startTime).getDate(),
            month: new Date(docc.data().startTime).toLocaleString('default', { month: 'short' })
          }
        }));
        setEvents(eventsData.slice(0, 5));
      }
    );
  
    const unsubscribeUsers = onSnapshot(
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
  
    return () => {
      unsubscribePosts();
      unsubscribeEvents();
      unsubscribeUsers();
    };
  }, []);

  const handleLike = async (postId: string) => {
    if (!user?.uid) return;
    
    try {
      const post = posts.find(p => p.id === postId);
      const isLiked = post?.stats?.likedBy?.includes(user.uid);
      
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
      console.error('Error toggling like:', error);
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
      
      // Update local state to reflect the new comment count
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              stats: { 
                ...post.stats, 
                comments: post.stats.comments + 1 
              } 
            }
          : post
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleFollow = async (userId: string) => {
    if (!user?.uid || userId === user.uid) return;
    
    try {
      const userToFollow = popularUsers.find(u => u.id === userId);
      const isFollowing = userToFollow?.followers?.includes(user.uid);
      
      if (isFollowing) {
        await unfollowUser(user.uid, userId);
      } else {
        await followUser(user.uid, userId);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const formatTime = (timestamp: { seconds: number; }) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Event Card Component
const EventCard = ({ date, title, location, type = "other" }: {
  date: { day: string; month: string };
  title: string;
  location: string;
  type?: string;
}) => {    const getTypeColor = () => {
      switch (type) {
        case "music": return "bg-blue-500";
        case "workshop": return "bg-green-500";
        case "meetup": return "bg-purple-500";
        case "festival": return "bg-yellow-500";
        default: return "bg-[#EA6100]";
      }
    };

    return (
      <div className="flex items-center gap-3">
        <div className={`flex flex-col items-center justify-center min-w-[48px] h-12 ${getTypeColor()} rounded-lg text-white`}>
          <span className="text-sm font-medium">{date.month}</span>
          <span className="text-base font-bold">{date.day}</span>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-white">{title}</h3>
          <p className="text-xs text-gray-400">{location}</p>
        </div>
      </div>
    );
  };

  // Traveler Card Component
 const TravelerCard = ({ name, title, avatar, onFollow, isFollowing }: {
  name: string;
  title: string;
  avatar: string;
  onFollow: () => void;
  isFollowing: boolean;
}) => {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
          <div>
            <h3 className="text-sm font-medium text-white">{name}</h3>
            <p className="text-xs text-gray-400">{title}</p>
          </div>
        </div>
        <button
          onClick={onFollow}
          className={`text-xs px-3 py-1 rounded-full transition-colors ${
            isFollowing 
              ? 'bg-gray-700 text-white hover:bg-gray-600' 
              : 'bg-[#F7CEB0] text-black hover:bg-[#f5c094]'
          }`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>
    );
  };

  // Desktop Post Component
  const DesktopPost = ({ post }: { post: any }) => {
    const isLiked = post.stats?.likedBy?.includes(user?.uid);

    return (
      <article className="border bg-gray-900 mb-4 rounded-lg border-gray-700">
        {/* Post Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <img 
              src={post.author.avatar} 
              alt={post.author.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h3 className="text-base font-medium text-white">{post.author.name}</h3>
              <p className="text-sm text-gray-400">
                {formatTime(post.metadata.createdAt)} · {post.metadata.location}
              </p>
            </div>
          </div>
          <MoreHorizontal className="w-6 h-6 text-gray-400 cursor-pointer" />
        </div>

        {/* Post Content */}
        {post.content.text && (
          <p className="px-4 pb-3 text-white">{post.content.text}</p>
        )}

        {/* Images */}
        {post.content.images && post.content.images.length > 0 && (
          <div className="px-4 pb-3">
            {post.content.images.map((image: string | Blob | undefined, index: Key | null | undefined) => (
              <img
                key={index}
                src={image}
                alt={`Post content ${index}`}
                className="w-full rounded-lg object-cover"
              />
            ))}
          </div>
        )}

        {/* Actions */}
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
            
            <button className="text-gray-400 hover:text-[#F7CEB0] transition-colors">
              <FaShareSquare className="w-6 h-6" />
            </button>

            <button className="ml-auto text-gray-400 hover:text-[#F7CEB0] transition-colors">
              <Bookmark className="w-6 h-6" />
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
      <Navbar />

      <main className="box-border flex gap-4 max-w-[1800px] mx-auto px-[67px] py-5 max-md:flex-col max-md:p-5 max-sm:p-2.5">
        {/* Left Sidebar */}
        <aside className="w-[332px] max-md:w-full">
          <div className="border bg-gray-900 mb-3 rounded-lg border-gray-700">
            <div className="h-[76px] overflow-hidden bg-gradient-to-r from-gray-800 to-gray-900 rounded-t-lg">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/9e602cf47f7f87365e5624f662b21dd3f5655dcf"
                alt="Cover"
                className="w-full h-full object-cover opacity-50"
              />
            </div>
            <div className="p-5">
              {user ? (
                <>
                  <img
                    src={user.photoURL || '/default-avatar.png'}
                    alt="Profile"
                    className="-mt-10 mb-2.5 w-16 h-16 rounded-full object-cover border-2 border-[#F7CEB0]"
                  />
                  <h2 className="text-xl mb-1 text-white">{user.displayName || 'User'}</h2>
                  <p className="text-sm text-gray-400">
                    {userData?.title || 'Travel Enthusiast'}
                  </p>
                </>
              ) : (
                <>
                  <div className="-mt-10 mb-2.5 w-16 h-16 bg-gray-700 rounded-full"></div>
                  <h2 className="text-xl mb-1 text-white">Guest</h2>
                  <p className="text-sm text-gray-400">Sign in to post</p>
                </>
              )}
            </div>
          </div>

          <nav className="border bg-gray-900 p-3 rounded-lg border-gray-700">
            <div className="flex items-center gap-3 text-base p-2 text-gray-300 hover:text-[#F7CEB0] hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
              <Search className="w-5 h-5" />
              <span>Events</span>
            </div>
            <div className="flex items-center gap-3 text-base p-2 text-gray-300 hover:text-[#F7CEB0] hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
              <Bookmark className="w-5 h-5" />
              <span>Saved</span>
            </div>
          </nav>
        </aside>

        {/* Main Feed */}
        <section className="w-[680px] max-md:w-full">
          {user && <CreatePost onPostCreated={() => {}} />}
            
          {posts.map((post) => (
            <DesktopPost key={post.id} post={post} />
          ))}

          {posts.length === 0 && (
            <div className="border bg-gray-900 p-6 rounded-lg border-gray-700 text-center">
              <h3 className="text-lg font-medium mb-2 text-white">No posts yet</h3>
              <p className="text-gray-400">
                {user ? "Be the first to share your travel experience!" : "Sign in to see posts"}
              </p>
            </div>
          )}
        </section>

        {/* Right Sidebar */}
        <aside className="w-[332px] max-md:w-full">
          <div className="border bg-gray-900 p-4 rounded-lg border-gray-700">
            <h2 className="text-base font-medium mb-4 text-white">Upcoming Events</h2>
            <div className="flex flex-col gap-3">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  date={{
                    day: new Date(event.startTime).getDate().toString(),
                    month: new Date(event.startTime).toLocaleString('default', { month: 'short' })
                  }}
                  title={event.title}
                  location={event.location}
                  type={event.type || 'other'}
                />
              ))}
              {events.length === 0 && (
                <p className="text-sm text-gray-400">No upcoming events</p>
              )}
              <button className="text-[#F7CEB0] text-sm font-medium mt-2 hover:underline">
                Explore more
              </button>
            </div>
          </div>

          <div className="border bg-gray-900 mt-4 p-4 rounded-lg border-gray-700">
            <h2 className="text-base font-medium mb-4 text-white">Popular Travelers</h2>
            <div className="flex flex-col gap-3">
              {popularUsers.map((traveler) => (
                <TravelerCard
                  key={traveler.id}
                  name={traveler.displayName}
                  title={traveler.title || 'Travel Enthusiast'}
                  avatar={traveler.photoURL || '/default-avatar.png'}
                  onFollow={() => handleFollow(traveler.id)}
                  isFollowing={traveler.followers?.includes(user?.uid)}
                />
              ))}
              {popularUsers.length === 0 && (
                <p className="text-sm text-gray-400">No popular travelers yet</p>
              )}
              <button className="text-[#F7CEB0] text-sm font-medium mt-2 hover:underline">
                Explore more
              </button>
            </div>
          </div>
        </aside>

        {user && (
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={() => router.push('/create-quest')}
              className="flex items-center justify-center w-14 h-14 bg-[#F7CEB0] text-black rounded-full shadow-lg hover:bg-[#f5c094] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#F7CEB0] focus:ring-opacity-50"
              aria-label="Create new quest"
            >
              <FaPlus className="text-xl" />
            </button>
          </div>
        )}
      </main>

    {selectedPostForComment && user && (
      <CommentModal
        post={selectedPostForComment}
        user={user}
        onClose={() => setSelectedPostForComment(null)}
        onCommentSubmit={handleCommentSubmit}
      />
    )}
    </div>
  );
};

const MobileFeedPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          const userData = await getCurrentUserData();
          setUser(userData);
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
      }
    });

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
      
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, commentCount: post.commentCount + 1 }
          : post
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
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

      <div className="px-4 py-4">
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 flex items-center gap-3 hover:bg-gray-700 transition-colors"
        >
          <Plus className="text-[#F7CEB0] w-5 h-5" />
          <span className="text-gray-300">What's on your mind?</span>
        </button>
      </div>

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

      {showCreateModal && user && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          user={user}
        />
      )}

      <Footer />
    </div>
  );
};

export default ResponsiveFeedPage;