// File: app/quest/[questId]/page.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { questService } from '@/lib/questService';
import { MobileFlowCard } from '@/components/quest/MobileFlowCard';
import { Map, Calendar, ArrowLeft } from 'lucide-react';

const QuestViewPage = () => {
  const [user, loading] = useAuthState(auth);
  const [quest, setQuest] = useState<any>(null);
  const [questLoading, setQuestLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const questId = params.questId as string;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
    } else if (questId) {
      const loadQuest = async () => {
        try {
          const questData = await questService.getQuest(user.uid, questId);
          setQuest(questData);
        } catch (error) {
          console.error('Error loading quest:', error);
        }
        setQuestLoading(false);
      };
      loadQuest();
    }
  }, [user, loading, questId, router]);

  if (loading || questLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-xl font-bold mb-2">Quest Not Found</h2>
        <p className="text-gray-400">The quest you're looking for doesn't exist.</p>
        <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black bg-opacity-80 backdrop-blur-sm p-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold">{quest.destination}</h1>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Calendar size={12} />
            <span>{new Date(quest.startDate).toLocaleDateString()} - {new Date(quest.endDate).toLocaleDateString()}</span>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="p-4">
        {quest.itinerary?.days?.map((day: any, dayIndex: number) => (
          <div key={dayIndex} className="mb-8">
            <h2 className="text-2xl font-bold mb-2 text-orange-400">Day {day.day}</h2>
            <p className="text-lg text-gray-300 mb-4">{day.title}</p>
            
            <div className="relative pl-6">
              {/* Timeline Vertical Line */}
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-700"></div>
              
              {day.activities?.map((activity: any, activityIndex: number) => (
                <MobileFlowCard 
                  key={activity.id || activityIndex} 
                  activity={activity} 
                />
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default QuestViewPage;