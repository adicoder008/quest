// File: components/quest/QuestGridCard.tsx
import Link from 'next/link';
import React from 'react';
import { Calendar, Trash2 } from 'lucide-react';

// Using the same Quest type for consistency
interface Quest {
  id: string;
  destination: string;
  coverImageUrl: string;
  startDate?: string;
  endDate?: string;
}

interface QuestGridCardProps {
  quest: Quest;
  onDelete?: (questId: string) => void;
}

const formatDateRange = (start?: string, end?: string) => {
  if (!start || !end) return 'Date not set';
  const startDate = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endDate = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${startDate} - ${endDate}`;
};


export const QuestGridCard = ({ quest, onDelete }: QuestGridCardProps) => {
  return (
    <div className="relative group block overflow-hidden rounded-xl">
      <Link href={`/quest/${quest.id}`} className="block h-full">
        <div className="relative aspect-[4/5] w-full">
          {/* Image */}
          <img
            src={quest.coverImageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'}
            alt={`Quest to ${quest.destination}`}
            className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="text-lg font-bold drop-shadow-md">
              {quest.destination}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-gray-200 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Calendar size={12} />
              <span>{formatDateRange(quest.startDate, quest.endDate)}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Delete Button - Only visible on hover */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(quest.id);
          }}
          className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 backdrop-blur-sm"
          title="Delete Quest"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
};