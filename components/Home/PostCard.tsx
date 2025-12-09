'use client';

import React, { useState } from 'react';
import { MessageCircle, Bookmark, MoreHorizontal, MapPin, BookmarkCheck, Send } from 'lucide-react';
import { FaHeart } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { Post, User as UserType } from '@/app/types/index';

interface PostCardProps {
  post: Post;
  currentUser: UserType;
  onLike: () => void;
  onComment: (text: string) => void;
  onSave: () => void;
  onShare: () => void;
  onMenuClick: () => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  onLike,
  onComment,
  onSave,
  onShare,
  onMenuClick
}) => {
  const router = useRouter();
  const [commentText, setCommentText] = useState('');
  const [showFullCaption, setShowFullCaption] = useState(false);

  const isLiked = post.likedBy?.includes(currentUser.uid);
  const isSaved = post.isSaved;
  const likeCount = post.likeCount ?? 0;

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      onComment(commentText);
      setCommentText('');
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden mb-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => router.push(`/profile/${post.authorId}`)}
        >
          <img
            src={post.userProfilePic || '/default-avatar.png'}
            alt={post.userName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-white font-medium text-sm">{post.userName}</p>
              <p className="text-gray-500 text-xs">@{post.userName.toLowerCase().replace(/\s+/g, '')}</p>
            </div>
            {post.location && (
              <div className="flex items-center gap-1 text-gray-400 text-xs">
                <MapPin className="w-3 h-3" />
                <span>{post.location}</span>
              </div>
            )}
          </div>
        </div>
        <button onClick={onMenuClick} className="text-gray-400 hover:text-white transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Image */}
      {post.imageUrls && (
        <div className="w-full aspect-square bg-black">
          <img
            src={post.imageUrls}
            alt="Post content"
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => router.push(`/post/${post.id}`)}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-4 pt-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={onLike}
              className="hover:opacity-70 transition-opacity"
            >
              <FaHeart
                className={`w-6 h-6 ${isLiked ? 'fill-[#EA6100] text-[#EA6100]' : 'text-white'}`}
              />
            </button>
            <button
              onClick={() => router.push(`/post/${post.id}`)}
              className="hover:opacity-70 transition-opacity"
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={onShare}
              className="hover:opacity-70 transition-opacity"
            >
              <Send className="w-6 h-6 text-white" />
            </button>
          </div>
          <button
            onClick={onSave}
            className="hover:opacity-70 transition-opacity"
          >
            {isSaved ? (
              <BookmarkCheck className="w-6 h-6 text-[#F7CEB0]" />
            ) : (
              <Bookmark className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
        {/* Likes Count */}
        {likeCount > 0 && (
          <p className="text-white font-semibold text-sm mb-2">
            {formatCount(likeCount)} {likeCount === 1 ? 'like' : 'likes'}
          </p>
        )}


        {/* Caption */}
        {post.caption && (
          <div className="text-sm mb-2">
            <span className="text-white font-semibold mr-2">{post.userName}</span>
            {post.caption.length > 150 && !showFullCaption ? (
              <>
                <span className="text-white">{post.caption.slice(0, 150)}...</span>
                <button
                  onClick={() => setShowFullCaption(true)}
                  className="text-gray-400 ml-1 hover:text-gray-300 transition-colors"
                >
                  more
                </button>
              </>
            ) : (
              <span className="text-white">{post.caption}</span>
            )}
          </div>
        )}

        {/* Comments Count */}
        {(post.commentCount ?? 0) > 0 && (
          <button
            onClick={() => router.push(`/post/${post.id}`)}
            className="text-gray-400 text-sm mb-3 hover:text-gray-300 transition-colors block"
          >
            View all {post.commentCount ?? 0} {(post.commentCount ?? 0) === 1 ? 'comment' : 'comments'}
          </button>
        )}

        {/* Timestamp */}
        {post.createdAt && (
          <p className="text-gray-500 text-xs mb-3">
            {new Date(post.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        )}

        {/* Comment Input */}
        <div className="border-t border-gray-700 pt-3 pb-2">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.photoURL || '/default-avatar.png'}
              alt="Your avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder-gray-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
            />
            {commentText.trim() && (
              <button
                onClick={handleSubmitComment}
                className="text-[#F7CEB0] font-semibold text-sm hover:text-[#EA6100] transition-colors"
              >
                Post
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;