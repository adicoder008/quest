// File: components/quest/MobileFlowCard.tsx
'use client'
import React from 'react';
import { Clock, Hotel, Utensils, Camera, MapPin, Edit, Trash2 } from 'lucide-react';

// Define the Activity type
interface Activity {
  title: string;
  time: string;
  description: string;
  imageUrl?: string;
}

// Define props interface
interface MobileFlowCardProps {
  activity: Activity;
}

// A helper to pick an icon based on the activity title
const getActivityIcon = (title: string = '') => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('hotel') || lowerTitle.includes('check-in')) return <Hotel size={18} />;
  if (lowerTitle.includes('lunch') || lowerTitle.includes('dinner') || lowerTitle.includes('breakfast') || lowerTitle.includes('food')) return <Utensils size={18} />;
  if (lowerTitle.includes('beach') || lowerTitle.includes('view') || lowerTitle.includes('photo')) return <Camera size={18} />;
  return <MapPin size={18} />;
};

export const MobileFlowCard: React.FC<MobileFlowCardProps> = ({ activity }) => {
  const canEdit = false; // Set to true to show edit/delete buttons

  return (
    <div className="relative mb-6">
      {/* Timeline Dot */}
      <div className="absolute -left-[18px] top-1.5 w-4 h-4 bg-orange-500 rounded-full border-4 border-black"></div>
      
      <div className="bg-gray-900 rounded-xl overflow-hidden">
        {activity.imageUrl && (
          <img src={activity.imageUrl} alt={activity.title} className="w-full h-40 object-cover" />
        )}
        
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 text-orange-400">
                {getActivityIcon(activity.title)}
                <span className="font-semibold text-sm uppercase">{activity.time}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{activity.title}</h3>
              <p className="text-sm text-gray-400">{activity.description}</p>
            </div>
            {canEdit && (
              <div className="flex gap-2">
                <button className="p-2 text-gray-400 hover:text-white">
                  <Edit size={16} />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};