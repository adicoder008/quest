'use client';

import { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';

type Post = {
  id: string;
  userProfilePic?: string;
  userName: string;
  createdAt: any;
  text?: string;
  photoUrl?: string;
};

type User = {
  uid: string;
  photoURL?: string;
  // add other user fields if needed
};

type CommentModalProps = {
  post: Post;
  onClose: () => void;
  onAddComment: (comment: string) => Promise<void>;
  currentUser?: User | null;
};

const CommentModal = ({ post, onClose, onAddComment, currentUser }: CommentModalProps) => {
  const [comments, setComments] = useState<Array<{
    id: string;
    userProfilePic?: string;
    userName: string;
    createdAt: Date | null;
    text?: string;
  }>>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to comments for this post
    const commentsRef = collection(db, 'posts', post.id, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const commentsData: Array<{
        id: string;
        userProfilePic?: string;
        userName: string;
        createdAt: Date | null;
        text?: string;
      }> = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.isDeleted) {
          commentsData.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate(),
              userName: ''
          });
        }
      });
      setComments(commentsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [post.id]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !currentUser?.uid) return;

    try {
      await onAddComment(newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const formatTime = (timestamp: Date | null) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const commentTime = timestamp;
    const diffMs = now.getTime() - commentTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMinutes < 1) return 'now';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex">
      <div className="w-full bg-gray-900 text-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <button onClick={onClose} className="text-white">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-semibold">Comments</h2>
          <div className="w-6" /> {/* Spacer */}
        </div>

        {/* Original Post Preview */}
        <div className="p-4 border-b border-gray-700 bg-gray-800/50">
          <div className="flex items-center gap-3 mb-3">
            <img 
              src={post.userProfilePic || '/default-avatar.png'} 
              alt={post.userName}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <span className="text-peach-200 font-medium">{post.userName}</span>
              <div className="text-gray-400 text-sm">{formatTime(post.createdAt)}</div>
            </div>
          </div>
          
          {post.text && (
            <p className="text-gray-300 text-sm line-clamp-3">{post.text}</p>
          )}
          
          {post.photoUrl && (
            <img 
              src={post.photoUrl} 
              alt="Post" 
              className="w-full h-32 object-cover rounded mt-2"
            />
          )}
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-400">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <div className="text-lg mb-2">💬</div>
              <div>No comments yet</div>
              <div className="text-sm">Be the first to comment!</div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <img 
                    src={comment.userProfilePic || '/default-avatar.png'} 
                    alt={comment.userName}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-800 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-peach-200 font-medium text-sm">
                          {comment.userName}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {formatTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-white text-sm">{comment.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Input */}
        {currentUser ? (
          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-3">
              <img 
                src={currentUser.photoURL || '/default-avatar.png'} 
                alt="You"
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitComment();
                    }
                  }}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-peach-200"
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                  className={`p-2 rounded-full transition-colors ${
                    newComment.trim() 
                      ? 'bg-peach-200 text-gray-900 hover:bg-peach-300' 
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 border-t border-gray-700 text-center">
            <div className="text-gray-400">Please log in to comment</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentModal;