// File: components/Feed/QuestPostCard.tsx
// YouTube Shorts style Quest post for feed

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical , HeartPulse} from 'lucide-react';
import { FaPlus, FaHeart, FaRegCommentDots, FaShareSquare, FaBookmark, FaRegBookmark} from 'react-icons/fa';

interface QuestPostCardProps {
  post: {
    id: string;
    uid: string;
    userName: string;
    userProfilePic: string;
    text: string; // Quest description
    photoUrl: string; // Cover image
    createdAt: any;
    likeCount: number;
    commentCount: number;
    shareCount: number;
    likedBy: string[];
    questContext?: {
      questId: string;
      questTitle: string;
      description: string;

    };
  };
  currentUser: any;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
  onMenu: () => void;
  isSaved?: boolean;
}

export const QuestPostCard = ({
  post,
  currentUser,
  onLike,
  onComment,
  onShare,
  onSave,
  onMenu,
  isSaved = false
}: QuestPostCardProps) => {
  const router = useRouter();
  const isLiked = post.likedBy?.includes(currentUser?.uid);

  const handleQuestClick = () => {
    if (post.questContext?.questId) {
      router.push(`/quest/${post.questContext.questId}`);
    }
  };

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

  return (
    <article className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-4">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <img
            src={post.userProfilePic || '/default-avatar.png'}
            alt={post.userName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="text-white font-medium text-sm">{post.userName}</h3>
            <p className="text-gray-400 text-xs">{formatTime(post.createdAt)}</p>
          </div>
        </div>
        <button
          onClick={onMenu}
          className="p-2 hover:bg-gray-800 rounded-full transition-colors"
        >
          <MoreVertical size={20} className="text-gray-400" />
        </button>
      </div>

      {/* Quest Description */}
      {post.text && (
        <div className="px-4 pb-3">
          <p className="text-white text-sm">{post.text}</p>
        </div>
      )}

      {/* YouTube Shorts Style Image with Quest Title */}
      <div 
        className="relative cursor-pointer group"
        onClick={handleQuestClick}
        style={{ height: '60vh', minHeight: '400px' }}
      >
        <img
          src={post.photoUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'}
          alt={post.questContext?.questTitle || 'Quest'}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800';
          }}
        />

        {/* Gradient Overlay - YouTube Shorts Style */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />

        {/* Quest Title at Bottom - YouTube Shorts Style */}
        <div className="absolute bottom-0 left-0 right-0 p-4 ">
          <div className="flex items-end justify-between">
            <div className="flex-1">
              <h2 className="text-white font-bold text-xl md:text-2xl drop-shadow-lg">
                {post.questContext?.questTitle || 'Amazing Adventure'}
              </h2>
              {post.questContext?.description && (
                <p className="text-gray-200 text-sm mt-1 drop-shadow-md line-clamp-2">
                  {post.questContext.description}
                </p>
              )}
            </div>

           

            {/* View Quest Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQuestClick();
              }}
              className="ml-3 bg-white text-black px-4 py-2 rounded-full font-semibold text-sm hover:bg-gray-200 transition-colors shadow-lg"
            >
              View Quest
            </button>
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
      </div>

      {/* Action Buttons - Same as regular post */}
      <div className="border-t border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={onLike}
              className={`flex items-center gap-2 transition-colors ${
                isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <HeartPulse size={22} className={isLiked ? 'fill-current' : ''} />
              <span className="text-sm font-medium">{post.likeCount || 0}</span>
            </button>

            <button
              onClick={onComment}
              className="flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors"
            >
              <FaRegCommentDots size={22} />
              <span className="text-sm font-medium">{post.commentCount || 0}</span>
            </button>

            <button
              onClick={onShare}
              className="flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors"
            >
              <FaShareSquare size={22} />
              <span className="text-sm font-medium">{post.shareCount || 0}</span>
            </button>
          </div>

          <button
            onClick={onSave}
            className={`transition-colors ${
              isSaved ? 'text-orange-500' : 'text-gray-400 hover:text-orange-500'
            }`}
          >
            <FaRegBookmark size={22} className={isSaved ? 'fill-current' : ''} />
          </button>
        </div>
      </div>
    </article>
  );
};

// Mobile version - even more YouTube Shorts style
export const MobileQuestPostCard = ({
  post,
  currentUser,
  onLike,
  onComment,
  onShare,
  onSave,
  onMenu,
  isSaved = false
}: QuestPostCardProps) => {
  const router = useRouter();
  const isLiked = post.likedBy?.includes(currentUser?.uid);

  const handleQuestClick = () => {
    if (post.questContext?.questId) {
      router.push(`/quest/${post.questContext.questId}`);
    }
  };

  return (
    <article className="bg-black border-b border-gray-800">
      {/* User Info */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <img
            src={post.userProfilePic || '/default-avatar.png'}
            alt={post.userName}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-white font-medium text-sm">{post.userName}</span>
        </div>
        <button onClick={onMenu} className="p-2">
          <MoreVertical size={18} className="text-gray-400" />
        </button>
      </div>

      {/* Description */}
      {post.text && (
        <div className="px-3 pb-2">
          <p className="text-white text-sm">{post.text}</p>
        </div>
      )}

      {/* YouTube Shorts Style Image */}
      <div
        className="relative"
        onClick={handleQuestClick}
        style={{ height: '60vh' }}
      >
        <img
          src={post.photoUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'}
          alt={post.questContext?.questTitle}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

        {/* Quest Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h2 className="text-white font-bold text-xl drop-shadow-lg mb-1">
            {post.questContext?.questTitle}
          </h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleQuestClick();
            }}
            className="bg-white text-black px-4 py-2 rounded-full font-semibold text-sm mt-2"
          >
            View Quest
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between p-3 border-t border-gray-800">
        <div className="flex items-center gap-5">
          <button onClick={onLike} className={isLiked ? 'text-red-500' : 'text-gray-400'}>
            <HeartPulse size={24} className={isLiked ? 'fill-current' : ''} />
          </button>
          <button onClick={onComment} className="text-gray-400">
            <FaRegCommentDots size={24} />
          </button>
          <button onClick={onShare} className="text-gray-400">
            <FaShareSquare size={24} />
          </button>
        </div>
        <button onClick={onSave} className={isSaved ? 'text-orange-500' : 'text-gray-400'}>
          <FaBookmark size={24} className={isSaved ? 'fill-current' : ''} />
        </button>
      </div>
    </article>
  );
};