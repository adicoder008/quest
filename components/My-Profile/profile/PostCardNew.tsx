import React from "react";
import { Heart, MessageCircle, Send, Share2 } from "lucide-react";

export interface PostCardProps {
    postId: string;
    avatar: string;
    username: string;
    timeAgo: string;
    location: string;
    content: string;
    likes: number;
    comments: number;
    level?: string;
    isVerified?: boolean;
    images?: string[];
}

export const PostCard: React.FC<PostCardProps> = ({
    postId,
    avatar,
    username,
    timeAgo,
    location,
    content,
    likes,
    comments,
    level = "Scout",
    isVerified = false,
    images = []
}) => {
    const [currentLikes, setCurrentLikes] = React.useState(likes);
    const [isLiked, setIsLiked] = React.useState(false);

    const handleLike = () => {
        setCurrentLikes(isLiked ? currentLikes - 1 : currentLikes + 1);
        setIsLiked(!isLiked);
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
        return num.toString();
    };

    return (
        <div className="w-[318px] ">
            <div className="bg-[#1E1E1E] border-2 rounded-2xl border-white/10 p-4 w-[318px]">
                {/* User Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <img
                            src={avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"}
                            alt={`${username}'s avatar`}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-white font-semibold text-sm">{username}</span>
                                <span className="bg-[#f86f0a1a] text-[#f86f0a] text-xs px-2 py-0.5 rounded-full">
                                    {level}
                                </span>
                                {isVerified && (
                                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                <span>{timeAgo}</span>
                                <span>•</span>
                                <span>{location}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <p className="text-white text-sm leading-relaxed mb-3">
                    {content}
                </p>

                {/* Images - Responsive Grid */}
                {images.length > 0 && (
                    <div className="flex gap-2 mb-3">
                        {images.slice(0, 2).map((image, index) => (
                            <div key={index} className="flex-1 h-40 rounded-lg overflow-hidden bg-gray-800">
                                <img
                                    src={image}
                                    alt={`Post image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                )}

            </div>
            {/* Actions */}
            <div className="flex gap-4 items-center my-2 mb-4  border-[#2a2a2a]">
                <button
                    onClick={handleLike}
                    className="flex items-center gap-1.5 transition-colors"
                >
                    <Heart
                        size={20}
                        className={isLiked ? "fill-red-500 text-red-500" : "text-gray-400"}
                    />
                    <span className="text-white text-sm">{formatNumber(currentLikes)}</span>
                </button>
                <button className="flex items-center gap-1.5">
                    <MessageCircle size={20} className="text-gray-400" />
                    <span className="text-white text-sm">{formatNumber(comments)}</span>
                </button>
                <button className="">
                    <Send size={20} className="text-gray-400" />
                </button>
            </div>
        </div>

    );
};
