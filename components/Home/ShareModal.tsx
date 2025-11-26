'use client';

import React, { useState } from 'react';
import { X, Copy, Share2, MessageCircle, Mail } from 'lucide-react';
import { Post } from '@/app/types/index';

interface ShareModalProps {
  post: Post;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ post, onClose }) => {
  const [copied, setCopied] = useState(false);
  const postUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/post/${post.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `${post.userName}'s post`,
          text: post.caption || 'Check out this post!',
          url: postUrl,
        });
        onClose();
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out this post from ${post.userName}`);
    const body = encodeURIComponent(`${post.caption || 'Check out this post!'}\n\n${postUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-end md:items-center justify-center">
      <div className="bg-gray-900 w-full md:w-[500px] md:rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-white font-semibold text-lg">Share Post</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post Preview */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <img 
              src={post.userProfilePic || '/default-avatar.png'} 
              alt={post.userName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="text-white font-medium text-sm">{post.userName}</p>
              {post.location && (
                <p className="text-gray-400 text-xs">{post.location}</p>
              )}
            </div>
          </div>
          
          {post.caption && (
            <p className="text-gray-300 text-sm line-clamp-2">{post.caption}</p>
          )}
        </div>

        {/* Share Options */}
        <div className="p-4">
          <div className="space-y-2">
            {/* Native Share */}
            {typeof navigator.share === 'function' && (
              <button
                onClick={handleNativeShare}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg flex items-center gap-3 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span className="font-medium">Share via...</span>
              </button>
            )}

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg flex items-center gap-3 transition-colors"
            >
              <Copy className="w-5 h-5" />
              <span className="font-medium">
                {copied ? 'Link Copied!' : 'Copy Link'}
              </span>
            </button>

            {/* Email */}
            <button
              onClick={shareViaEmail}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg flex items-center gap-3 transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span className="font-medium">Share via Email</span>
            </button>
          </div>

          {/* URL Display */}
          <div className="mt-4 p-3 bg-gray-800 rounded-lg">
            <p className="text-gray-400 text-xs mb-1">Post URL</p>
            <p className="text-white text-sm break-all">{postUrl}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;