// File: components/quest/QuestFeedCard.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Heart, MapPin, User } from 'lucide-react';

interface QuestFeedCardProps {
  quest: {
    id: string;
    destination: string;
    title: string;
    coverImageUrl?: string;
    startDate: string;
    endDate: string;
    likeCount?: number;
    owner: string;
    ownerName?: string;
    ownerPhoto?: string;
    createdAt: any;
  };
}

export const QuestFeedCard = ({ quest }: QuestFeedCardProps) => {
  const router = useRouter();
  
  const getDaysCount = () => {
    const start = new Date(quest.startDate);
    const end = new Date(quest.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTimeAgo = () => {
    if (!quest.createdAt) return 'Recently';
    const date = quest.createdAt.toDate ? quest.createdAt.toDate() : new Date(quest.createdAt);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div 
      onClick={() => router.push(`/quest/${quest.id}`)}
      className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-orange-500 transition-all cursor-pointer group shadow-xl"
    >
      {/* Cover Image Section */}
      <div className="relative h-80 overflow-hidden">
        <img
          src={quest.coverImageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400'}
          alt={quest.destination}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400';
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        
        {/* Quest Badge */}
        <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-orange-600 px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-lg">
          🗺️ Quest
        </div>

        {/* Like Badge */}
        {quest.likeCount && quest.likeCount > 0 && (
          <div className="absolute top-4 left-4 bg-black bg-opacity-60 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Heart size={14} className="text-red-500 fill-red-500" />
            <span className="text-white text-xs font-medium">{quest.likeCount}</span>
          </div>
        )}
        
        {/* Bottom Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-start gap-2 mb-2">
            <MapPin size={18} className="text-orange-400 flex-shrink-0 mt-0.5" />
            <h3 className="text-white font-bold text-xl leading-tight">{quest.destination}</h3>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-gray-200">
            <span className="flex items-center gap-1.5 bg-black bg-opacity-40 backdrop-blur-sm px-2.5 py-1 rounded-full">
              <Calendar size={14} />
              {getDaysCount()} days
            </span>
          </div>
        </div>
      </div>

      {/* Author & Action Section */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <img
              src={quest.ownerPhoto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + quest.owner}
              alt={quest.ownerName || 'User'}
              className="w-9 h-9 rounded-full object-cover border-2 border-gray-700"
            />
            <div>
              <p className="text-white text-sm font-medium">{quest.ownerName || 'Traveler'}</p>
              <p className="text-gray-400 text-xs">{getTimeAgo()}</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/quest/${quest.id}`);
          }}
          className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-semibold text-sm transition-all shadow-lg"
        >
          View Quest Details
        </button>
      </div>
    </div>
  );
};

// Quest Feed Grid Component
interface QuestFeedGridProps {
  quests: any[];
  title?: string;
}

export const QuestFeedGrid = ({ quests, title = "Featured Quests" }: QuestFeedGridProps) => {
  if (!quests || quests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No quests available yet</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-orange-500">🗺️</span>
        {title}
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {quests.map((quest) => (
          <QuestFeedCard key={quest.id} quest={quest} />
        ))}
      </div>
    </div>
  );
};