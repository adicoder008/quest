import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Heart, MoreHorizontal, Trash2, Flag } from 'lucide-react';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp, doc, getDoc, updateDoc, increment, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

interface CommentModalProps {
  post: any;
  user: any;
  onClose: () => void;
  onCommentSubmit?: (postId: string, text: string) => Promise<void>;
}

const CommentModal: React.FC<CommentModalProps> = ({ post, user, onClose, onCommentSubmit }) => {
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchComments();
  }, [post.id]);

  const fetchComments = async () => {
    try {
      const commentsRef = collection(db, 'posts', post.id, 'comments');
      const q = query(commentsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const commentsData = await Promise.all(snapshot.docs.map(async (commentDoc) => {
        const data = commentDoc.data();
        let author = {
          name: data.userName || 'Anonymous',
          photoURL: data.userProfilePic || '/default-avatar.png',
          uid: data.uid
        };

        // Fetch latest user data if possible
        if (data.uid) {
          try {
            const userSnap = await getDoc(doc(db, 'users', data.uid));
            if (userSnap.exists()) {
              const userData = userSnap.data();
              author = {
                name: userData.displayName || 'Anonymous',
                photoURL: userData.photoURL || '/default-avatar.png',
                uid: data.uid
              };
            }
          } catch (e) {
            console.error('Error fetching user data', e);
          }
        }

        return {
          id: commentDoc.id,
          ...data,
          author
        };
      }));

      setComments(commentsData);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    setSubmitting(true);
    try {
      if (onCommentSubmit) {
        await onCommentSubmit(post.id, commentText);
      } else {
        // Fallback if no handler provided
        await addDoc(collection(db, 'posts', post.id, 'comments'), {
          uid: user.uid,
          userName: user.displayName || 'Anonymous',
          userProfilePic: user.photoURL || '',
          text: commentText.trim(),
          createdAt: serverTimestamp()
        });
      }

      setCommentText('');
      fetchComments(); // Refresh comments
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 w-full max-w-4xl h-[80vh] rounded-2xl overflow-hidden flex border border-gray-800" onClick={e => e.stopPropagation()}>
        {/* Left Side - Post Content (Image/Video) */}
        <div className="hidden md:flex w-1/2 bg-black items-center justify-center relative">
          {post.photoUrl ? (
            <img
              src={post.photoUrl}
              alt="Post content"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-400">{post.text}</p>
            </div>
          )}

          {/* Quest Overlay if applicable */}
          {post.questContext && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <h3 className="text-white font-bold text-lg">{post.questContext.questTitle}</h3>
              <p className="text-gray-300 text-sm line-clamp-2">{post.questContext.description}</p>
            </div>
          )}
        </div>

        {/* Right Side - Comments & Details */}
        <div className="w-full md:w-1/2 flex flex-col bg-gray-900">
          {/* Header */}
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={post.userProfilePic || '/default-avatar.png'}
                alt={post.userName}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="font-semibold text-white text-sm">{post.userName}</span>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {/* Post Caption as first comment */}
            {post.text && (
              <div className="flex gap-3">
                <img
                  src={post.userProfilePic || '/default-avatar.png'}
                  alt={post.userName}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-white text-sm">{post.userName}</span>
                    <span className="text-gray-300 text-sm">{post.text}</span>
                  </div>
                  <span className="text-gray-500 text-xs mt-1 block">{formatTime(post.createdAt)}</span>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-4 text-gray-500">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No comments yet. Be the first!</div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 group">
                  <img
                    src={comment.author.photoURL}
                    alt={comment.author.name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0 cursor-pointer"
                    onClick={() => router.push(`/profile/${comment.author.uid}`)}
                  />
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span
                        className="font-semibold text-white text-sm cursor-pointer hover:underline"
                        onClick={() => router.push(`/profile/${comment.author.uid}`)}
                      >
                        {comment.author.name}
                      </span>
                      <span className="text-gray-300 text-sm">{comment.text}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-gray-500 text-xs">{formatTime(comment.createdAt)}</span>
                      {/* Reply button could go here */}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={commentsEndRef} />
          </div>

          {/* Comment Input */}
          <div className="p-4 border-t border-gray-800">
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
              <img
                src={user?.photoURL || '/default-avatar.png'}
                alt="You"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full bg-gray-800 text-white px-4 py-2 pr-10 rounded-full border border-gray-700 focus:border-[#F7CEB0] focus:outline-none text-sm"
                  disabled={submitting}
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || submitting}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#F7CEB0] disabled:opacity-50 hover:text-[#f5c094]"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;