import React, { useState, useEffect } from 'react';
import { MessageCircle, Share2, Bookmark, BookmarkCheck, MoreHorizontal } from 'lucide-react';
import { FaHeartbeat } from 'react-icons/fa';
import { collection, query, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Send } from 'lucide-react';
import questService from '@/lib/questService';
import { User } from '@/app/types';

interface MobilePostCardProps {
  post: any;
  currentUser: User;
  onLike: () => void;
  onComment: (text: string) => void;
  onSave: () => void;
  onShare: () => void;
  onMenuClick: () => void;
}

const MobilePostCard: React.FC<MobilePostCardProps> = ({ 
  post, 
  currentUser, 
  onLike, 
  onComment, 
  onSave, 
  onShare, 
  onMenuClick 
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const isLiked = post.likedBy?.includes(currentUser.uid);
  const isSaved = post.isSaved;

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
  
  // Quest Post Rendering
  if (isQuestPost) {
    return (
      <article className="border-b border-gray-800 bg-black p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <img 
              src={post.userProfilePic || '/default-avatar.png'} 
              alt={post.userName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="text-sm font-medium text-white">{post.userName}</h3>
              <p className="text-xs text-gray-400">
                Shared a Quest · {formatTime(post.createdAt)}
              </p>
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
              <img src={finalPostImage} alt="Post content" className="w-full h-auto object-cover" />
              <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/80 via-black/50 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-end">
                <h2 className="text-lg font-bold text-white drop-shadow-lg pr-2">
                  {questData?.title || questData?.questTitle}
                </h2>
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
            className="flex items-center gap-2 text-gray-400 hover:text-[#EA6100] transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs">{post.commentCount || 0}</span>
          </button>
          
          <button 
            onClick={onShare}
            className="flex items-center gap-2 text-gray-400 hover:text-[#EA6100] transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-xs">{post.shareCount || 0}</span>
          </button>

          <button 
            onClick={onSave}
            className={`transition-colors ${
              isSaved ? 'text-[#EA6100]' : 'text-gray-400 hover:text-[#EA6100]'
            }`}
          >
            {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
          </button>
        </div>

        {/* Comments Section */}
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
                    className="w-full bg-gray-900 text-white px-3 py-2 pr-10 rounded-lg border border-gray-700 focus:ring-2 focus:ring-[#EA6100] focus:border-transparent focus:outline-none text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 transition-colors ${
                      commentText.trim() 
                        ? 'text-[#EA6100]' 
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
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="bg-gray-900 rounded-lg p-2">
                        <h4 className="text-xs font-medium text-white mb-1">
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

  // Quest Completion Post
  if (post.postType === 'quest_completion' || post.questContext) {
    return (
      <article className="border-b border-gray-800 bg-black p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <img 
              src={post.userProfilePic || '/default-avatar.png'} 
              alt={post.userName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="text-sm font-medium text-white">{post.userName}</h3>
              <p className="text-xs text-gray-400">
                Completed a Quest · {formatTime(post.createdAt)}
              </p>
            </div>
          </div>
          <button 
            onClick={onMenuClick}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Quest Context Badge */}
        {questData && (
          <div className="mb-3 bg-gradient-to-r from-[#EA6100]/20 to-[#EA6100]/20 border border-[#EA6100]/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#EA6100] text-xs font-semibold">🏆 Quest Completed</span>
              {questData.xpEarned && (
                <span className="text-[#EA6100] text-xs">+{questData.xpEarned} XP</span>
              )}
            </div>
            <p className="text-white text-sm font-medium">{questData.questTitle}</p>
            {questData.description && (
              <p className="text-gray-400 text-xs mt-1">{questData.description}</p>
            )}
          </div>
        )}

        {post.text && (
          <p className="text-white text-sm mb-3">{post.text}</p>
        )}

        {finalPostImage && (
          <div className="mb-3">
            <img
              src={finalPostImage}
              alt="Quest completion"
              className="w-full rounded-lg object-cover"
            />
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
            className="flex items-center gap-2 text-gray-400 hover:text-[#EA6100] transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs">{post.commentCount || 0}</span>
          </button>
          
          <button 
            onClick={onShare}
            className="flex items-center gap-2 text-gray-400 hover:text-[#EA6100] transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-xs">{post.shareCount || 0}</span>
          </button>

          <button 
            onClick={onSave}
            className={`transition-colors ${
              isSaved ? 'text-[#EA6100]' : 'text-gray-400 hover:text-[#EA6100]'
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
                    className="w-full bg-gray-900 text-white px-3 py-2 pr-10 rounded-lg border border-gray-700 focus:ring-2 focus:ring-[#EA6100] focus:border-transparent focus:outline-none text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 transition-colors ${
                      commentText.trim() ? 'text-[#EA6100]' : 'text-gray-600'
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
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="bg-gray-900 rounded-lg p-2">
                        <h4 className="text-xs font-medium text-white mb-1">
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

  // Regular Post
  return (
    <article className="border-b border-gray-800 bg-black p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img 
            src={post.userProfilePic || '/default-avatar.png'} 
            alt={post.userName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="text-sm font-medium text-white">{post.userName}</h3>
            <p className="text-xs text-gray-400">
              {formatTime(post.createdAt)} {post.location && `· ${post.location}`}
            </p>
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
            className="w-full rounded-lg object-cover"
          />
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
          className="flex items-center gap-2 text-gray-400 hover:text-[#EA6100] transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs">{post.commentCount || 0}</span>
        </button>
        
        <button 
          onClick={onShare}
          className="flex items-center gap-2 text-gray-400 hover:text-[#EA6100] transition-colors"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-xs">{post.shareCount || 0}</span>
        </button>

        <button 
          onClick={onSave}
          className={`transition-colors ${
            isSaved ? 'text-[#EA6100]' : 'text-gray-400 hover:text-[#EA6100]'
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
                  className="w-full bg-gray-900 text-white px-3 py-2 pr-10 rounded-lg border border-gray-700 focus:ring-2 focus:ring-[#EA6100] focus:border-transparent focus:outline-none text-sm"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 transition-colors ${
                    commentText.trim() ? 'text-[#EA6100]' : 'text-gray-600'
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
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-900 rounded-lg p-2">
                      <h4 className="text-xs font-medium text-white mb-1">
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

export default MobilePostCard;