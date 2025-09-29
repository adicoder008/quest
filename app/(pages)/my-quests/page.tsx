// File: app/my-quests/page.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { questService } from '@/lib/questService';
import { ArrowLeft, MapPin, Calendar, PlusCircle } from 'lucide-react';
import Link from 'next/link';

// Define a type for your quest data for better type safety
interface Quest {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  
  // Add other quest properties here
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
          // Use the new backend function
          const userQuests = await questService.getUserQuests(user.uid);
          setQuests(userQuests);
        } catch (error) {
          console.error("Failed to fetch quests:", error);
        }
        setQuestsLoading(false);
      };
      fetchQuests();
    }
  }, [user, loading, router]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
        <button onClick={() => router.push('/quest')} className="p-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">My Quests</h1>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {quests.length > 0 ? (
          <div className="space-y-4">
            {quests.map((quest) => (
              <Link href={`/quest/${quest.id}`} key={quest.id}>
                <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-orange-500 transition-colors cursor-pointer">
                  <h2 className="text-lg font-bold text-white mb-2">{quest.destination}</h2>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      <span>{formatDate(quest.startDate)} - {formatDate(quest.endDate)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
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