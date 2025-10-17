"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserData } from '@/lib/firebaseSerive';
import questService from '@/lib/questService';
import { ArrowLeft, MapPin, Users, Calendar } from 'lucide-react';
import { Quest } from '@/app/types';

const AllQuestsPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'public' | 'private' | 'saved'>('public');
  const [myQuests, setMyQuests] = useState<Quest[]>([]);
  const [savedQuests, setSavedQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          await fetchUserQuests(currentUser.uid);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserQuests = async (uid: string) => {
    try {
      const quests = await questService.getUserQuests(uid);
      setMyQuests(quests);
      
      // TODO: Implement saved quests functionality
      setSavedQuests([]);
    } catch (error) {
      console.error('Error fetching user quests:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#F7CEB0] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const publicQuests = myQuests.filter(q => q.isPublic);
  const privateQuests = myQuests.filter(q => !q.isPublic);
  const currentQuests = activeTab === 'public' ? publicQuests : activeTab === 'private' ? privateQuests : savedQuests;

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Header */}
      <div className='sticky top-0 z-10 bg-black border-b border-gray-700'>
        <div className='flex items-center gap-4 px-5 py-4'>
          <button 
            onClick={() => router.back()}
            className='text-white hover:text-[#F7CEB0] transition-colors'
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className='text-2xl font-semibold text-white'>All Quests</h1>
        </div>

        {/* Tabs */}
        <div className='flex gap-2 px-5 pb-3 overflow-x-auto scrollbar-hide'>
          <button
            onClick={() => setActiveTab('public')}
            className={`py-2 px-4 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'public'
                ? 'bg-[#F7CEB0] text-black'
                : 'bg-[#292929] text-gray-400 hover:bg-[#3a3a3a]'
            }`}
          >
            Public ({publicQuests.length})
          </button>
          <button
            onClick={() => setActiveTab('private')}
            className={`py-2 px-4 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'private'
                ? 'bg-[#F7CEB0] text-black'
                : 'bg-[#292929] text-gray-400 hover:bg-[#3a3a3a]'
            }`}
          >
            Private ({privateQuests.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`py-2 px-4 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'saved'
                ? 'bg-[#F7CEB0] text-black'
                : 'bg-[#292929] text-gray-400 hover:bg-[#3a3a3a]'
            }`}
          >
            Saved ({savedQuests.length})
          </button>
        </div>
      </div>

      {/* Quests List */}
      <div className='p-5 pb-20'>
        {currentQuests.length > 0 ? (
          <div className='grid grid-cols-1 gap-4'>
            {currentQuests.map(quest => (
              <QuestCard 
                key={quest.id} 
                quest={quest} 
                onClick={() => router.push(`/quest/${quest.id}`)} 
              />
            ))}
          </div>
        ) : (
          <div className='text-center py-12'>
            <div className='bg-[#292929] rounded-xl p-8'>
              <p className='text-gray-400 text-lg mb-2'>
                {activeTab === 'public' ? 'No public quests' : 
                 activeTab === 'private' ? 'No private quests' : 
                 'No saved quests'}
              </p>
              <p className='text-gray-500 text-sm mb-4'>
                {activeTab === 'saved' 
                  ? 'Save quests to view them here' 
                  : 'Create your first quest to get started'}
              </p>
              {activeTab !== 'saved' && (
                <button
                  onClick={() => router.push('/quest/create')}
                  className='bg-[#F7CEB0] text-black px-6 py-3 rounded-lg font-medium hover:bg-[#f5c094] transition-colors'
                >
                  Create Quest
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Quest Card Component
const QuestCard: React.FC<{ quest: Quest; onClick: () => void }> = ({ quest, onClick }) => {
  const memberCount = Object.keys(quest.members || {}).length;
  const startDate = new Date(quest.startDate);
  const endDate = new Date(quest.endDate);
  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div 
      onClick={onClick}
      className='bg-[#292929] rounded-xl overflow-hidden cursor-pointer hover:bg-[#3a3a3a] transition-colors border border-gray-700'
    >
      <div className='relative h-48'>
        <img
          src={quest.coverImageUrl as any || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600'}
          alt={quest.title}
          className='w-full h-full object-cover'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent' />
        
        {/* Quest Type Badge */}
        <div className='absolute top-3 right-3'>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            quest.isPublic 
              ? 'bg-[#F7CEB0] text-black' 
              : 'bg-gray-800 text-white'
          }`}>
            {quest.isPublic ? 'Public' : 'Private'}
          </span>
        </div>

        {/* Quest Title */}
        <div className='absolute bottom-0 left-0 right-0 p-4'>
          <h3 className='text-white font-bold text-xl mb-2'>{quest.title}</h3>
          <div className='flex items-center gap-2 text-gray-200'>
            <MapPin size={16} />
            <span className='text-sm'>{quest.destination}</span>
          </div>
        </div>
      </div>

      <div className='p-4'>
        <div className='grid grid-cols-3 gap-4 mb-3'>
          <div className='flex items-center gap-2 text-gray-400'>
            <Calendar size={16} />
            <div>
              <p className='text-xs'>Duration</p>
              <p className='text-white text-sm font-medium'>{duration} {duration === 1 ? 'day' : 'days'}</p>
            </div>
          </div>

          <div className='flex items-center gap-2 text-gray-400'>
            <Users size={16} />
            <div>
              <p className='text-xs'>Members</p>
              <p className='text-white text-sm font-medium'>{memberCount}</p>
            </div>
          </div>

          <div className='text-gray-400'>
            <p className='text-xs'>Transport</p>
            <p className='text-white text-sm font-medium'>
              {quest.transportMode?.slice(0, 2).join(', ') || 'N/A'}
            </p>
          </div>
        </div>

        <div className='flex items-center justify-between pt-3 border-t border-gray-700'>
          <div className='text-sm'>
            <span className='text-gray-400'>Dates: </span>
            <span className='text-white'>
              {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {' '}
              {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllQuestsPage;