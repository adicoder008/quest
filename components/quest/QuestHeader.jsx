// src/components/quest/QuestHeader.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Bookmark, Copy, Share, UserPlus, Calendar, MapPin, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ShareModal from './ShareModal';
import { FaPlus } from 'react-icons/fa'; // Correct import


const QuestHeader = ({ 
  quest, 
  isLiked, 
  isSaved, 
  isFollowing, 
  onLike, 
  onSave, 
  onFollow, 
  onDuplicate,
  currentUser 
}) => {
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);

  const formatDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return null;
    
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isValid(start) || !isValid(end)) return null;
      
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } catch (e) {
      console.error('Error calculating duration:', e);
      return null;
    }
  };

  const safeFormatDistance = (date) => {
    if (!date) return 'Unknown time';
    
    let parsedDate;
    
    // Handle Firestore Timestamp
    if (date.toDate && typeof date.toDate === 'function') {
      parsedDate = date.toDate();
    } 
    // Handle string dates
    else if (typeof date === 'string') {
      parsedDate = new Date(date);
    }
    // Already a Date object
    else if (date instanceof Date) {
      parsedDate = date;
    }
    
    if (!parsedDate || !isValid(parsedDate)) {
      console.error('Invalid date:', date);
      return 'Unknown time';
    }
    
    return formatDistanceToNow(parsedDate, { addSuffix: true });
  };

  const calculateDistance = (flowCards) => {
    // Simple distance calculation - in a real app you'd use a proper distance API
    if (!flowCards || flowCards.length < 2) return null;
    
    let totalDistance = 0;
    for (let i = 1; i < flowCards.length; i++) {
      const prev = flowCards[i - 1];
      const curr = flowCards[i];
      
      if (prev.location?.coordinates && curr.location?.coordinates) {
        // Haversine formula for rough distance calculation
        const R = 6371; // Earth's radius in km
        const dLat = (curr.location.coordinates.lat - prev.location.coordinates.lat) * Math.PI / 180;
        const dLon = (curr.location.coordinates.lng - prev.location.coordinates.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(prev.location.coordinates.lat * Math.PI / 180) * 
                  Math.cos(curr.location.coordinates.lat * Math.PI / 180) * 
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        totalDistance += distance;
      }
    }
    
    return totalDistance > 0 ? `${Math.round(totalDistance)} km` : null;
  };

  const duration = formatDuration(quest.startDate, quest.endDate);
  const distance = calculateDistance(quest.flowCards);

  return (
    <>
      <div className="relative">
        {/* Cover Image */}
        <div className="h-64 md:h-80 lg:h-96 relative overflow-hidden">
          {quest.coverImage ? (
            <img 
              src={quest.coverImage} 
              alt={quest.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-40" />
          
          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
            <div className="max-w-7xl mx-auto w-full">
              {/* Tags */}
              {quest.tags && quest.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {quest.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm cursor-pointer hover:bg-opacity-30 transition-all"
                      onClick={() => navigate(`/explore?tag=${encodeURIComponent(tag)}`)}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {quest.title}
              </h1>
              
              {/* Metadata Row */}
              <div className="flex flex-wrap items-center gap-4 text-sm opacity-90">
                {/* Creator */}
                <div 
                  className="flex items-center gap-2 cursor-pointer hover:opacity-100 transition-opacity"
                  onClick={() => navigate(`/profile/${quest.createdBy}`)}
                >
                  <img 
                    src={quest.creatorInfo?.avatar || '/default-avatar.png'} 
                    alt={quest.creatorInfo?.username}
                    className="w-6 h-6 rounded-full"
                  />
                  <span>@{quest.creatorInfo?.username}</span>
                </div>
                
                {/* Co-owners */}
                {quest.coOwners && quest.coOwners.length > 0 && (
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    <span>+{quest.coOwners.length} co-owner{quest.coOwners.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
                
                {/* Date */}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{safeFormatDistance(quest.createdAt)}</span>

                </div>
                
                {/* Duration & Distance */}
                {(duration || distance) && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {[duration, distance].filter(Boolean).join(' • ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{quest.views || 0} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{quest.likesCount || 0} likes</span>
              </div>
              <div className="flex items-center gap-1">
                <Bookmark className="w-4 h-4" />
                <span>{quest.savesCount || 0} saves</span>
              </div>
              <div className="flex items-center gap-1">
                <UserPlus className="w-4 h-4" />
                <span>{quest.followersCount || 0} followers</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={onLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                  isLiked 
                    ? 'bg-red-50 border-red-200 text-red-600' 
                    : 'bg-white border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-600'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{isLiked ? 'Liked' : 'Like'}</span>
              </button>
              
              <button
                onClick={onSave}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                  isSaved 
                    ? 'bg-blue-50 border-blue-200 text-blue-600' 
                    : 'bg-white border-gray-200 text-gray-600 hover:border-blue-200 hover:text-blue-600'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
              
              <button
                onClick={onFollow}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                  isFollowing 
                    ? 'bg-green-50 border-green-200 text-green-600' 
                    : 'bg-white border-gray-200 text-gray-600 hover:border-green-200 hover:text-green-600'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>{isFollowing ? 'Following' : 'Follow'}</span>
              </button>
              
              <button
                onClick={onDuplicate}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-purple-200 hover:text-purple-600 transition-all"
              >
                <Copy className="w-4 h-4" />
                <span>Duplicate</span>
              </button>
              
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-300 transition-all"
              >
                <Share className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Share Modal */}
      <ShareModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        quest={quest}
      />
    </>
  );
};

export default QuestHeader;