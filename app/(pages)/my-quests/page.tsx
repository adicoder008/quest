// File: app/my-quests/page.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import questService from '@/lib/questService';
import { ArrowLeft, MapPin, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { QuestGridCard } from '../../../components/quest/QuestGridCard'; // <-- Import the new GRID card

// Expanded the Quest type to include all data needed for the grid card
interface Quest {
  id: string;
  destination: string;
  description: string;
  coverImageUrl: string;
  startDate: string;
  endDate: string;
  createdAt: any;
  isPublic?: boolean; // Added isPublic
}

const MyQuestsPage = () => {
  const [user, loading] = useAuthState(auth);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [questsLoading, setQuestsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'public' | 'private'>('all');
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
    } else {
      const fetchQuests = async () => {
        try {
          const userQuests = await questService.getUserQuests(user.uid);
          setQuests(userQuests as unknown as Quest[]);
        } catch (error) {
          console.error("Failed to fetch quests:", error);
        }
        setQuestsLoading(false);
      };
      fetchQuests();
    }
  }, [user, loading, router]);

  const handleDeleteQuest = async (questId: string) => {
    if (!user || !confirm('Are you sure you want to delete this quest? This action cannot be undone.')) return;

    // Optimistic update
    setQuests(prev => prev.filter(q => q.id !== questId));

    try {
      const result = await questService.deleteQuest(questId, user.uid);
      if (!result.success) {
        // Revert if failed
        alert('Failed to delete quest: ' + result.error);
        const userQuests = await questService.getUserQuests(user.uid);
        setQuests(userQuests as unknown as Quest[]);
      }
    } catch (error) {
      console.error('Error deleting quest:', error);
      alert('An error occurred while deleting the quest.');
    }
  };

  const filteredQuests = quests.filter(quest => {
    if (activeTab === 'all') return true;

    if (activeTab === 'public') {
      return quest.isPublic === true;
    }
    if (activeTab === 'private') {
      return !quest.isPublic;
    }
    return true;
  });

  if (loading || questsLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black bg-opacity-80 backdrop-blur-sm p-4 flex items-center gap-4 border-b border-gray-800">
        <button onClick={() => router.push('/quest')} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">My Quests</h1>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-800 pb-2">
          {(['all', 'public', 'private'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm font-medium transition-colors relative ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Create New Card - Always First */}
          <Link href="/quest" className="group block h-full">
            <div className="aspect-[4/5] w-full rounded-xl border-2 border-dashed border-gray-800 hover:border-orange-500/50 flex flex-col items-center justify-center bg-gray-900/30 hover:bg-gray-900/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-gray-800 group-hover:bg-orange-500/20 flex items-center justify-center mb-3 transition-colors">
                <PlusCircle size={24} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
              </div>
              <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">Create New Quest</span>
            </div>
          </Link>

          {/* Quest Cards */}
          {filteredQuests.map((quest) => (
            <QuestGridCard
              key={quest.id}
              quest={quest}
              onDelete={handleDeleteQuest}
            />
          ))}
        </div>

        <div className="text-center py-20 col-span-full">
          <p className="text-gray-500">
            {activeTab === 'all' ? 'No quests found.' : `No ${activeTab} quests found.`}
          </p>
        </div>
      </main>
    </div>
  );
};

export default MyQuestsPage;