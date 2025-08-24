'use client';

import { useState } from 'react';
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, MapPin } from 'lucide-react';
import CommentModal from './CommentModal';
import { Post, User } from '../../app/types/index';

interface PostCardProps {
  post: Post;
  onLike: () => void;
  onComment: (text: string) => Promise<void>;
  currentUser: User | null;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onComment, currentUser }) => {
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    onLike();
  };

  const formatTime = (timestamp: Date | undefined): string => {
    if (!timestamp) return '';
    
    const now = new Date();
    const postTime = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const diffMs = now.getTime() - postTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'now';
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  };

  const renderPostContent = () => {
    const { postType, text, photoUrl, location, questContext } = post;

    if (postType === 'quest_completion') {
      return (
        <div className="bg-gradient-to-r from-peach-200 to-orange-300 rounded-lg p-4 text-gray-900">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🎯</span>
            <span className="font-semibold">Quest Completed!</span>
          </div>
          {questContext && (
            <div className="text-sm mb-2">
              <div className="font-medium">{questContext.questTitle}</div>
              <div className="opacity-80">{questContext.description}</div>
            </div>
          )}
          {text && <p className="text-sm">{text}</p>}
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg overflow-hidden">
        {/* Location header for event posts */}
        {location && (
          <div className="flex items-center gap-2 p-3 border-b border-gray-100">
            <MapPin className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-semibold text-gray-800">{location}</span>
          </div>
        )}

        {/* Photo */}
        {photoUrl && (
          <div className="relative">
            <img 
              src={photoUrl} 
              alt="Post content" 
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        {/* Text content */}
        {text && (
          <div className="p-4">
            {postType === 'event' ? (
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  {post.eventTitle || 'Event'}
                </h3>
                <p className="text-gray-700 text-sm mb-2">{post.eventSubtitle}</p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">{text}</span>
                  {post.eventPrice && (
                    <div className="bg-gray-900 text-white px-3 py-1 rounded-full text-sm font-medium">
                      ₹ {post.eventPrice}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-800">{text}</p>
            )}
          </div>
        )}

        {/* Just photo case - no additional padding needed */}
        {photoUrl && !text && !location && <div className="h-2" />}
      </div>
    );
  };

  return (
    <div className="border-b border-gray-800 px-4 py-6">
      {/* User header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img 
              src={post.userProfilePic || '/default-avatar.png'} 
              alt={post.userName}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-peach-200 text-sm">{post.userName}</span>
          </div>
          <span className="text-white text-lg">{formatTime(post.createdAt)}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="text-white text-sm px-3 py-1 bg-transparent hover:bg-gray-800 rounded transition-colors">
            Follow
          </button>
          <MoreHorizontal className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Post content */}
      {renderPostContent()}

      {/* Actions */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-1 transition-colors ${liked ? 'text-red-500' : 'text-white'}`}
            >
              <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
            </button>
            <button 
              onClick={() => setShowComments(true)}
              className="text-white"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
            <button className="text-white">
              <Share className="w-6 h-6" />
            </button>
          </div>
          <button 
            onClick={() => setBookmarked(!bookmarked)}
            className={`transition-colors ${bookmarked ? 'text-peach-200' : 'text-white'}`}
          >
            <Bookmark className={`w-6 h-6 ${bookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Engagement stats */}
        {(post.likeCount > 0 || post.commentCount > 0) && (
          <div className="flex items-center gap-4 text-sm text-gray-400">
            {post.likeCount > 0 && (
              <span>{post.likeCount} likes</span>
            )}
            {post.commentCount > 0 && (
              <span>{post.commentCount} comments</span>
            )}
          </div>
        )}

        {/* User caption */}
        <div className="space-y-1">
          <div className="text-peach-200 text-sm">{post.userName} says...</div>
          {post.caption && (
            <div className="text-purple-300 text-sm">
              {post.caption}
            </div>
          )}
        </div>
      </div>

      {/* Comments Modal */}
      {showComments && (
        <CommentModal
          post={post}
          onClose={() => setShowComments(false)}
          onAddComment={onComment}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default PostCard;