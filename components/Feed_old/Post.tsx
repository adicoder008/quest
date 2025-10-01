import { useState, useEffect } from 'react';
import { Avatar } from "./avatar";
import { Button } from "./Button";
import { db, auth } from '../../lib/firebase.js';
import { 
  collection,
  addDoc,
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  increment,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

interface PostProps {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    title?: string;
  };
  content: {
    text: string;
    images?: string[];
  };
  metadata: {
    time: string;
    location: string;
    createdAt: { seconds: number };
  };
  stats: {
    likes: number;
    comments: number;
    likedBy: string[];
  };
  postType?: 'regular' | 'event' | 'sponsored' | 'quest_completion';
  eventDetails?: {
    startTime: string;
    endTime: string;
    maxParticipants: number;
  };
  questContext?: {
    questId: string;
    placesVisited: number;
    daysTaken: number;
  };
}

export const Post = ({ 
  id,
  author,
  content,
  metadata,
  stats,
  postType = 'regular',
  eventDetails,
  questContext
}: PostProps) => {
  const [user] = useAuthState(auth);
  const [isLiked, setIsLiked] = useState(false);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);

  // Format post time
  const formatTime = (timestamp: { seconds: number }) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if current user liked the post
  useEffect(() => {
    if (user && stats.likedBy) {
      setIsLiked(stats.likedBy.includes(user.uid));
    }
  }, [user, stats.likedBy]);

  useEffect(() => {
    const checkFollowing = async () => {
      if (user && author.id) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const following = userDoc.data().following || [];
          setIsFollowing(following.includes(author.id));
        }
      }
    };
    checkFollowing();
  }, [user, author.id]);

  // Handle follow/unfollow
  const handleFollow = async () => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    
    try {
      if (isFollowing) {
        await updateDoc(userRef, {
          following: arrayRemove(author.id)
        });
      } else {
        await updateDoc(userRef, {
          following: arrayUnion(author.id)
        });
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Error updating follow:", error);
    }
  };

  // Handle like/unlike
  const handleLike = async () => {
    if (!user) return;

    const postRef = doc(db, 'posts', id);
    
    try {
      if (isLiked) {
        await updateDoc(postRef, {
          'stats.likes': increment(-1),
          'stats.likedBy': arrayRemove(user.uid)
        });
      } else {
        await updateDoc(postRef, {
          'stats.likes': increment(1),
          'stats.likedBy': arrayUnion(user.uid)
        });
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;

    try {
      // Add comment to 'comments' collection
      const commentsRef = collection(db, 'comments');
      await addDoc(commentsRef, {
        userId: user.uid,
        postId: id,
        userAvatar: user.photoURL,
        userName: user.displayName || 'Anonymous',
        text: comment,
        createdAt: serverTimestamp()
      });

      // Update comment count in the post document
      const postRef = doc(db, 'posts', id);
      await updateDoc(postRef, {
        'stats.comments': increment(1)
      });

      setComment('');
      loadComments(); // Refresh comments after submission
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Load comments for this post
  const loadComments = async () => {
    try {
      const commentsRef = collection(db, 'comments');
      const q = query(
        commentsRef, 
        where('postId', '==', id), 
        orderBy('createdAt', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const loadedComments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setComments(loadedComments);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  const toggleComments = () => {
    if (!showComments) {
      loadComments();
    }
    setShowComments(!showComments);
  };

  // Load comments when component mounts or when showComments changes
  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [id, showComments]);

  return (
    <article className="box-border border bg-[#F8F9FA] mb-3 p-3 rounded-lg border-solid border-[#C5C4C7]">
      {/* Post Header */}
      <div className="box-border flex items-center justify-between px-2.5 py-1">
        <div className="flex items-center gap-3">
          <Avatar src={author.avatar} alt={author.name} />
          <div className="flex flex-col">
            <h3 className="text-base font-medium">{author.name}</h3>
            <p className="text-sm text-[#8B8A8F]">
              {formatTime(metadata.createdAt)} · {metadata.location}
              {postType === 'event' && ' · Event'}
              {postType === 'sponsored' && ' · Sponsored'}
              {postType === 'quest_completion' && ' · Quest Completed'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {user?.uid !== author.id && (
              <button 
                onClick={handleFollow}
                className={`text-xs px-2 py-1 rounded-full ${
                  isFollowing 
                    ? 'bg-primary-200 text-black' 
                    : 'bg-primary-600 text-black'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
          <button aria-label="More options">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 16.5C12.3978 16.5 12.7794 16.658 13.0607 16.9393C13.342 17.2206 13.5 17.6022 13.5 18C13.5 18.3978 13.342 18.7794 13.0607 19.0607C12.7794 19.342 12.3978 19.5 12 19.5C11.6022 19.5 11.2206 19.342 10.9393 19.0607C10.658 18.7794 10.5 18.3978 10.5 18C10.5 17.6022 10.658 17.2206 10.9393 16.9393C11.2206 16.658 11.6022 16.5 12 16.5ZM12 10.5C12.3978 10.5 12.7794 10.658 13.0607 10.9393C13.342 11.2206 13.5 11.6022 13.5 12C13.5 12.3978 13.342 12.7794 13.0607 13.0607C12.7794 13.342 12.3978 13.5 12 13.5C11.6022 13.5 11.2206 13.342 10.9393 13.0607C10.658 12.7794 10.5 12.3978 10.5 12C10.5 11.6022 10.658 11.2206 10.9393 10.9393C11.2206 10.658 11.6022 10.5 12 10.5Z"
                fill="black"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Post Content */}
      <p className="text-sm leading-normal mx-0 my-3 px-2.5 py-1">
        {content.text}
      </p>

      {/* Event Details */}
      {postType === 'event' && eventDetails && (
        <div className="bg-blue-50 p-3 rounded-lg mb-3">
          <h4 className="font-medium mb-1">Event Details</h4>
          <p>Start: {new Date(eventDetails.startTime).toLocaleString()}</p>
          <p>End: {new Date(eventDetails.endTime).toLocaleString()}</p>
          <p>Max Participants: {eventDetails.maxParticipants}</p>
        </div>
      )}

      {/* Quest Completion Details */}
      {postType === 'quest_completion' && questContext && (
        <div className="bg-green-50 p-3 rounded-lg mb-3">
          <h4 className="font-medium mb-1">Quest Completed</h4>
          <p>Places Visited: {questContext.placesVisited}</p>
          <p>Days Taken: {questContext.daysTaken}</p>
        </div>
      )}

      {/* Images */}
      {content.images && content.images.length > 0 && (
        <div className="flex gap-2 my-3 max-sm:flex-col">
          {content.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Post content ${index}`}
              className="flex-1 h-auto max-h-96 rounded-lg object-cover"
            />
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 pt-3 border-t border-t-[#C5C4C7]">
        <button 
          className={`flex items-center gap-1 text-sm ${isLiked ? 'text-red-500' : 'text-black'}`}
          onClick={handleLike}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={isLiked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" />
          </svg>
          <span>{stats.likes}</span>
        </button>
        
        <button 
          className="flex items-center gap-1 text-sm"
          onClick={toggleComments}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M21 11.5C21 16.1944 16.9706 20 12 20C10.5332 20 9.14435 19.7192 7.91103 19.2079C7.15388 19.9234 5.95493 20.4903 4.4549 20.7366C4.28484 20.766 4.11384 20.7887 3.94244 20.8046C3.69541 20.8276 3.5 20.6047 3.5 20.3564C3.5 20.2181 3.5647 20.0913 3.64928 19.9833C3.73576 19.8737 3.83759 19.7557 3.94244 19.6341C4.11616 19.4314 4.3004 19.212 4.46693 18.9938C4.79447 18.5913 5.06283 18.1535 5.17533 17.726C3.80132 16.1254 3 13.9113 3 11.5C3 6.80558 7.02944 3 12 3C16.9706 3 21 6.80558 21 11.5Z" />
          </svg>
          <span>{stats.comments}</span>
        </button>
        
        <button className="ml-auto" aria-label="Share">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20.33 3.67008C20.1408 3.48225 19.9035 3.3502 19.6442 3.28845C19.3849 3.22671 19.1135 3.23765 18.86 3.32008L4.23 8.20008C3.95867 8.28606 3.7189 8.45051 3.54099 8.67267C3.36307 8.89484 3.25498 9.16474 3.23037 9.4483C3.20576 9.73186 3.26573 10.0164 3.40271 10.2658C3.53969 10.5153 3.74754 10.7186 4 10.8501L10.07 13.8501L13.07 19.9401C13.1906 20.1785 13.3751 20.3786 13.6029 20.5181C13.8307 20.6576 14.0929 20.731 14.36 20.7301H14.46C14.7461 20.709 15.0192 20.6024 15.2439 20.424C15.4686 20.2457 15.6345 20.0039 15.72 19.7301L20.67 5.14008C20.7584 4.88801 20.7734 4.61602 20.7132 4.35578C20.653 4.09553 20.5201 3.85774 20.33 3.67008Z" />
          </svg>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-t-[#C5C4C7]">
          {/* Comment Form */}
          {user && (
            <form onSubmit={handleCommentSubmit} className="flex gap-2 mb-3">
              <Avatar src={user.photoURL || ''} alt={user.displayName || 'User'} size="sm" />
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                />
                <button 
                  type="submit"
                  className="bg-blue-500 text-white px-3 rounded-lg"
                >
                  Post
                </button>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-2">
                <Avatar src={comment.userAvatar} alt={comment.userName} size="sm" />
                <div className="flex-1 bg-gray-100 p-2 rounded-lg">
                  <div className="font-medium">{comment.userName}</div>
                  <div>{comment.text}</div>
                  <div className="text-xs text-gray-500">
                    {comment.createdAt?.seconds 
                      ? new Date(comment.createdAt.seconds * 1000).toLocaleString()
                      : new Date(comment.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};