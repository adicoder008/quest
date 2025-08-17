// src/components/quest/EngagementSection.jsx
import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Heart, 
  Send, 
  Flag, 
  MoreHorizontal,
  User,
  Crown,
  Award,
  Star
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../../lib/firebase.cjs';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

const Comment = ({ comment, currentUser, onReply }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // Fetch user info for the comment author
    const fetchUserInfo = async () => {
      if (comment.userId) {
        try {
          const userDoc = await getDoc(doc(db, 'users', comment.userId));
          if (userDoc.exists()) {
            setUserInfo(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      }
    };
    
    fetchUserInfo();
  }, [comment.userId]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !currentUser) return;

    try {
      await onReply(comment.id, replyText.trim());
      setReplyText('');
      setShowReplyForm(false);
      toast.success('Reply posted!');
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Failed to post reply');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <img
          src={userInfo?.avatar || '/default-avatar.png'}
          alt={userInfo?.username || 'User'}
          className="w-8 h-8 rounded-full flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm text-gray-900">
                {userInfo?.username || 'Anonymous'}
              </span>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(comment.createdAt?.toDate() || new Date())} ago
              </span>
            </div>
            <p className="text-sm text-gray-700">{comment.text}</p>
          </div>
          
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="hover:text-blue-600 transition-colors"
            >
              Reply
            </button>
            <button className="hover:text-red-600 transition-colors">
              <Heart className="w-3 h-3 inline mr-1" />
              {comment.likes || 0}
            </button>
          </div>
          
          {/* Reply Form */}
          {showReplyForm && currentUser && (
            <form onSubmit={handleReply} className="mt-3">
              <div className="flex gap-2">
                <img
                  src={currentUser.photoURL || '/default-avatar.png'}
                  alt={currentUser.displayName}
                  className="w-6 h-6 rounded-full flex-shrink-0"
                />
                <div className="flex-1">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="2"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setShowReplyForm(false)}
                      className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
          
          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-2 pl-4 border-l-2 border-gray-100">
              {comment.replies.map((reply, index) => (
                <Comment
                  key={index}
                  comment={reply}
                  currentUser={currentUser}
                  onReply={onReply}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const OwnershipInfo = ({ quest }) => {
  const [ownerInfo, setOwnerInfo] = useState(null);
  const [coOwnerInfo, setCoOwnerInfo] = useState([]);

  useEffect(() => {
    // Fetch owner and co-owner information
    const fetchOwnerInfo = async () => {
      if (quest.createdBy) {
        try {
          const userDoc = await getDoc(doc(db, 'users', quest.createdBy));
          if (userDoc.exists()) {
            setOwnerInfo(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching owner info:', error);
        }
      }
    };

    const fetchCoOwnerInfo = async () => {
      if (quest.coOwners && quest.coOwners.length > 0) {
        try {
          const coOwnerPromises = quest.coOwners.map(async (userId) => {
            const userDoc = await getDoc(doc(db, 'users', userId));
            return userDoc.exists() ? { id: userId, ...userDoc.data() } : null;
          });
          
          const coOwnerData = await Promise.all(coOwnerPromises);
          setCoOwnerInfo(coOwnerData.filter(Boolean));
        } catch (error) {
          console.error('Error fetching co-owner info:', error);
        }
      }
    };

    fetchOwnerInfo();
    fetchCoOwnerInfo();
  }, [quest.createdBy, quest.coOwners]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
        <Crown className="w-4 h-4 text-yellow-500" />
        Quest Creators
      </h3>
      
      {/* Owner */}
      {ownerInfo && (
        <div className="flex items-center gap-3 mb-4">
          <img
            src={ownerInfo.avatar || '/default-avatar.png'}
            alt={ownerInfo.username}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{ownerInfo.username}</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                Owner
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {ownerInfo.bio || `Created ${formatDistanceToNow(new Date(quest.createdAt))} ago`}
            </p>
          </div>
        </div>
      )}
      
      {/* Co-owners */}
      {coOwnerInfo.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Co-owners</h4>
          {coOwnerInfo.map((coOwner) => (
            <div key={coOwner.id} className="flex items-center gap-3">
              <img
                src={coOwner.avatar || '/default-avatar.png'}
                alt={coOwner.username}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{coOwner.username}</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    Co-owner
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const GamificationDisplay = ({ quest, currentUser }) => {
  if (!quest.gamification || !currentUser) return null;

  const { points, badges, achievements } = quest.gamification;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
        <Award className="w-4 h-4 text-purple-500" />
        Quest Rewards
      </h3>
      
      {/* Points */}
      {points && (
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-gray-600">Experience Points</span>
          <span className="font-medium text-purple-600">+{points} XP</span>
        </div>
      )}
      
      {/* Badges */}
      {badges && badges.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Badges Earned</h4>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, index) => (
              <div
                key={index}
                className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 text-xs rounded-full"
              >
                <Star className="w-3 h-3" />
                {badge.name}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Achievements */}
      {achievements && achievements.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Achievements</h4>
          <div className="space-y-2">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-sm text-gray-600">
                🏆 {achievement.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const EngagementSection = ({ questId, quest, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!questId || !showComments) return;

    // Subscribe to comments
    const commentsQuery = query(
      collection(db, 'comments'),
      where('questId', '==', questId),
      where('parentId', '==', null), // Only top-level comments
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [questId, showComments]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'comments'), {
        questId,
        userId: currentUser.uid,
        text: newComment.trim(),
        createdAt: serverTimestamp(),
        parentId: null,
        likes: 0
      });

      setNewComment('');
      toast.success('Comment posted!');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (parentId, replyText) => {
    if (!currentUser) return;

    await addDoc(collection(db, 'comments'), {
      questId,
      userId: currentUser.uid,
      text: replyText,
      createdAt: serverTimestamp(),
      parentId,
      likes: 0
    });
  };

  return (
    <div className="space-y-6">
      {/* Comments Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Comments ({comments.length})
            </h3>
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              {showComments ? 'Hide' : 'Show'} Comments
            </button>
          </div>
        </div>

        {showComments && (
          <div className="p-6">
            {/* Comment Form */}
            {currentUser ? (
              <form onSubmit={handleSubmitComment} className="mb-6">
                <div className="flex gap-3">
                  <img
                    src={currentUser.photoURL || '/default-avatar.png'}
                    alt={currentUser.displayName}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts about this quest..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows="3"
                    />
                    <div className="flex justify-end mt-3">
                      <button
                        type="submit"
                        disabled={!newComment.trim() || loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        {loading ? 'Posting...' : 'Post Comment'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600 mb-2">Sign in to join the conversation</p>
                <button className="text-blue-600 hover:text-blue-700 transition-colors">
                  Sign In
                </button>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No comments yet. Be the first to share your thoughts!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <Comment
                    key={comment.id}
                    comment={comment}
                    currentUser={currentUser}
                    onReply={handleReply}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Ownership Info */}
      <OwnershipInfo quest={quest} />

      {/* Gamification Display */}
      <GamificationDisplay quest={quest} currentUser={currentUser} />

      {/* Report Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <button
          className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors"
          onClick={() => {
            // Handle report functionality
            toast.success('Report submitted. Thank you for helping keep our community safe.');
          }}
        >
          <Flag className="w-4 h-4" />
          Report Quest
        </button>
        <p className="text-xs text-gray-500 mt-1">
          Report inappropriate content or violations of community guidelines
        </p>
      </div>
    </div>
  );
};

export default EngagementSection;