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
}

const MyQuestsPage = () => {
  const [user, loading] = useAuthState(auth);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [questsLoading, setQuestsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
    } else {
      const fetchQuests = async () => {
        try {
          // IMPORTANT: Ensure this service fetches all needed fields for the cards
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
        {quests.length > 0 ? (
          // Responsive Grid Layout
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {quests.map((quest) => (
              <QuestGridCard key={quest.id} quest={quest} />
            ))}
          </div>
        ) : (
          // "No Quests" message remains the same
          <div className="text-center py-20">
            <MapPin size={48} className="mx-auto text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Quests Yet</h2>
            <p className="text-gray-400 mb-6">You haven't created any quests. Let's plan your next adventure!</p>
            <Link href="/quest">
              <button className="flex items-center gap-2 mx-auto px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all">
                <PlusCircle size={20} />
                Create a New Quest
              </button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyQuestsPage;