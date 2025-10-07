// File: app/quest/[questId]/page.tsx - Google Forms Style Edit Mode
'use client'
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import questService from '@/lib/questService';
import { createPost } from '@/lib/postService';
import { Map, Calendar, ArrowLeft, Clock, MapPin as MapPinIcon, Filter, Edit3, Save, Copy, Globe, Lock, Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Share2, Send, X, Plane, Train, Bus, Car, Ship } from 'lucide-react';
import InteractiveMap from '../../../../components/quest/InteractiveMap';

interface ActivityLocation {
  name: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface ActivityMedia {
  url: string;
  type: 'image' | 'video';
}

interface Activity {
  time: string;
  title: string;
  description: string;
  location: ActivityLocation;
  tags: string[];
  collapsed: boolean;
  media?: ActivityMedia[];
  type?: 'travel' | 'activity';
}

interface Day {
  day: number;
  date: string;
  title: string;
  activities: Activity[];
}

export interface Quest {
  id: string;
  destination: string;
  title: string;
  startDate: string;
  endDate: string;
  members: { [key: string]: 'owner' | 'editor' | 'viewer' };
  isPublic: boolean;
  copiedFrom?: string;
  itinerary: {
    days: Day[];
  };
}


const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, message: string }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full">
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        <p className="text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 rounded-lg">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-orange-500 rounded-lg">Confirm</button>
        </div>
      </div>
    </div>
  );
};

const ShareQuestModal = ({ isOpen, onClose, onShareToFeed }: { isOpen: boolean, onClose: () => void, onShareToFeed: () => void }) => {
  if (!isOpen) return null;

  const questLink = typeof window !== 'undefined' ? window.location.href : '';

  const copyLink = () => {
    navigator.clipboard.writeText(questLink);
    // Ideally, you'd show a toast notification here
    alert("Link copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold mb-4">Share this Quest</h3>

        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-2">Share a link to your quest:</p>
          <div className="flex gap-2">
            <input type="text" readOnly value={questLink} className="w-full bg-gray-900 text-gray-300 px-3 py-2 rounded-lg border border-gray-700" />
            <button onClick={copyLink} className="px-4 py-2 bg-orange-500 rounded-lg text-sm font-semibold flex items-center gap-2">
              <Copy size={16} /> Copy
            </button>
          </div>
        </div>

        <button
          onClick={onShareToFeed}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold flex items-center justify-center gap-2"
        >
          <Send size={16} />
          Post to Feed
        </button>
      </div>
    </div>
  );
};


const QuestViewPage = () => {
  const [user, loading] = useAuthState(auth);
  const [quest, setQuest] = useState<Quest | null>(null);
  const [questLoading, setQuestLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [mapFilter, setMapFilter] = useState<'all' | number>('all');
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedQuest, setEditedQuest] = useState<Quest | null>(null);
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [collapsedDays, setCollapsedDays] = useState<Set<number>>(new Set());
  const [isConfirmingPublish, setIsConfirmingPublish] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const params = useParams();
  const router = useRouter();
  const questId = params.questId as string;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/auth');
    } else if (questId) {
      loadQuest();
    }
  }, [user, loading, questId, router]);

  const loadQuest = async () => {
    if (!user?.uid) {
      setQuestLoading(false);
      return;
    }
    setQuestLoading(true);
    try {
      const questData = await questService.getQuest(user.uid, questId);
      // Casting the incoming data to the Quest type
      setQuest(questData as Quest);
      if (questData) {
        setEditedQuest(JSON.parse(JSON.stringify(questData)));
        // Collapse all days except the first one initially
        const initialCollapsed = new Set<number>();
        questData.itinerary?.days?.forEach((_: any, index: number) => {
          if (index > 0) initialCollapsed.add(index);
        });
        setCollapsedDays(initialCollapsed);
      }
    } catch (error) {
      console.error('Error loading quest:', error);
    } finally {
      setQuestLoading(false);
    }
  };

  const userRole = quest?.members?.[user?.uid || ''];
  const canEdit = userRole === 'owner' || userRole === 'editor';
  const isOwner = userRole === 'owner';
  const isPublic = quest?.isPublic || false;

  const handleSave = async () => {
    if (!user?.uid || !editedQuest) return;
    setSaving(true);
    try {
      await questService.updateQuest(questId, user.uid, {
        itinerary: editedQuest.itinerary,
        updatedAt: new Date().toISOString()
      });
      setQuest(editedQuest);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error saving quest:', error);
      alert('Failed to save changes');
    }
    setSaving(false);
  };

  const confirmPublish = async () => {
    if (!user?.uid || !quest) return;
    try {
      await questService.updateQuest(questId, user.uid, { isPublic: !isPublic });
      setQuest({ ...quest, isPublic: !isPublic });
    } catch (error) {
      console.error('Error publishing quest:', error);
    }
    setIsConfirmingPublish(false);
  };


  const handleCopyQuest = async () => {
    if (!user?.uid || !quest) return;
    try {
      const copiedQuest = {
        ...quest,
        title: `${quest.title} (Copy)`,
        members: { [user.uid]: 'owner' },
        isPublic: false,
        copiedFrom: questId

      };
      delete (copiedQuest as any).id;
      const flowCards = quest?.itinerary?.days?.flatMap((day: any) =>
        day.activities?.map((activity: any) => ({
          location: activity.location,
          title: activity.title,
          description: activity.description,
          time: activity.time,
        })) || []
      ) || [];
      const result = await questService.createQuest(user.uid, copiedQuest, null as any, flowCards);
      router.push(`/quest/${result.questId}`);
    } catch (error) {
      console.error('Error copying quest:', error);
      alert('Failed to copy quest');
    }
  };

  const handleShareToFeed = async () => {
    if (!user || !quest) return;
    try {
      const firstImage = quest.itinerary?.days
        ?.flatMap((d: any) => d.activities)
        .find((a: any) => a.media?.[0]?.url)?.media[0].url;

      await createPost({
        authorId: user.uid,
        content: `Check out my Quest to ${quest.destination}!`,
        questId: questId,
        questTitle: quest.destination,
        questImage: firstImage || '',
        createdAt: new Date().toISOString(),
      });
      alert('Quest shared to your feed!');
      setIsShareModalOpen(false);
    } catch (error) {
      console.error('Failed to share quest to feed', error);
      alert('Failed to share quest.');
    }
  };

  const addActivityBetween = (dayIndex: number, afterIndex: number) => {
    if (!editedQuest) return;
    const newActivity: Activity = {
      time: 'Morning',
      title: 'New Activity',
      description: 'Add description here',
      location: { name: '' },
      tags: [],
      collapsed: false
    };
    const updated = { ...editedQuest };
    updated.itinerary.days[dayIndex].activities.splice(afterIndex + 1, 0, newActivity);
    setEditedQuest(updated);
  };

  const deleteActivity = (dayIndex: number, activityIndex: number) => {
    if (!editedQuest) return;
    const updated = { ...editedQuest };
    updated.itinerary.days[dayIndex].activities.splice(activityIndex, 1);
    setEditedQuest(updated);
  };

  const updateActivity = (dayIndex: number, activityIndex: number, field: string, value: any) => {
    if (!editedQuest) return;
    const updated = { ...editedQuest };
    (updated.itinerary.days[dayIndex].activities[activityIndex] as any)[field] = value;
    setEditedQuest(updated);
  };

  const toggleCollapse = (dayIndex: number, activityIndex: number) => {
    if (!editedQuest) return;
    const updated = { ...editedQuest };
    const activity = updated.itinerary.days[dayIndex].activities[activityIndex];
    activity.collapsed = !activity.collapsed;
    setEditedQuest(updated);
  };

  const toggleDayCollapse = (dayIndex: number) => {
    const newCollapsed = new Set(collapsedDays);
    if (newCollapsed.has(dayIndex)) {
      newCollapsed.delete(dayIndex);
    } else {
      newCollapsed.add(dayIndex);
    }
    setCollapsedDays(newCollapsed);
  };

  const moveActivity = (dayIndex: number, fromIndex: number, toIndex: number) => {
    if (!editedQuest) return;
    const updated = { ...editedQuest };
    const activities = updated.itinerary.days[dayIndex].activities;
    const [movedItem] = activities.splice(fromIndex, 1);
    activities.splice(toIndex, 0, movedItem);
    setEditedQuest(updated);
  };

  const handleDragStart = (e: React.DragEvent, dayIndex: number, activityIndex: number) => {
    setDraggedItem({ dayIndex, activityIndex });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dayIndex: number, activityIndex: number) => {
    e.preventDefault();
    if (draggedItem && draggedItem.dayIndex === dayIndex) {
      moveActivity(dayIndex, draggedItem.activityIndex, activityIndex);
    }
    setDraggedItem(null);
  };

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
        <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg">Go Back</button>
      </div>
    );
  }

  const displayQuest = isEditMode ? editedQuest : quest;
  if (!displayQuest) return null; // Add a guard clause

  const allActivitiesWithCoords = displayQuest.itinerary?.days?.flatMap((d: any) => d.activities || []).filter((a: any) => a.location?.coordinates) || [];
  const dayActivitiesWithCoords = (mapFilter !== 'all' && displayQuest.itinerary?.days?.[mapFilter]?.activities?.filter((a: any) => a.location?.coordinates)) || [];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <ConfirmationDialog
        isOpen={isConfirmingPublish}
        onClose={() => setIsConfirmingPublish(false)}
        onConfirm={confirmPublish}
        title={isPublic ? "Make Quest Private?" : "Make Quest Public?"}
        message={isPublic ? "This will make your quest only visible to you and its members." : "This will make your quest visible to everyone. Are you sure?"}
      />
      <ShareQuestModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShareToFeed={handleShareToFeed}
      />

      {/* Header */}
      <header className="sticky top-0 z-20 bg-gray-950/80 border-b border-gray-800 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-lg md:text-xl font-bold truncate max-w-[150px] md:max-w-xs">{quest.destination}</h1>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                  <Calendar size={12} />
                  <span>{new Date(quest.startDate).toLocaleDateString()} - {new Date(quest.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setIsShareModalOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm">
                <Share2 size={16} />
                <span className="hidden md:inline">Share</span>
              </button>

              {!canEdit && (
                <button onClick={handleCopyQuest} className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm">
                  <Copy size={16} />
                  <span className="hidden md:inline">Copy</span>
                </button>
              )}

              {isOwner && (
                <button onClick={() => setIsConfirmingPublish(true)} className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm">
                  {isPublic ? <Lock size={16} className="text-green-400" /> : <Globe size={16} />}
                  <span className="hidden md:inline">{isPublic ? 'Public' : 'Private'}</span>
                </button>
              )}

              {canEdit && !isEditMode && (
                <button onClick={() => setIsEditMode(true)} className="flex items-center gap-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors text-sm">
                  <Edit3 size={16} />
                  <span className="hidden md:inline">Edit</span>
                </button>
              )}

              {isEditMode && (
                <>
                  <button onClick={() => { setIsEditMode(false); setEditedQuest(JSON.parse(JSON.stringify(quest))); }}
                    className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm">
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm disabled:opacity-50">
                    <Save size={16} />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </>
              )}

              {!isEditMode && (
                <button
                  onClick={() => setShowMap(!showMap)}
                  className={`p-2 rounded-lg transition-colors md:hidden ${showMap ? 'bg-orange-500 text-white' : 'bg-gray-800'}`}
                >
                  <Map size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="md:hidden">
        {/* Mobile Map Modal */}
        {showMap && !isEditMode && (
          <div className="border-b-2 border-orange-500">
            <div className="p-3 bg-gray-900 border-b border-gray-800">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <Filter size={16} className="text-gray-400 flex-shrink-0" />
                <button
                  onClick={() => { setMapFilter('all'); setSelectedDay(0); }}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${mapFilter === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-300'}`}>
                  All Days
                </button>
                {displayQuest.itinerary?.days?.map((day: any, index: number) => (
                  <button key={index} onClick={() => { setMapFilter(index); setSelectedDay(index); }}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${mapFilter === index ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-300'}`}>
                    Day {day.day}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[40vh]">
              <InteractiveMap
                flowCards={mapFilter === 'all' ? allActivitiesWithCoords : dayActivitiesWithCoords}
                activeIndex={activeCardIndex}
                onPinClick={(index: number) => setActiveCardIndex(index)}
              />
            </div>
          </div>
        )}

        <div className="pt-4">
          {showMap && !isEditMode ? (
            <div className="p-4">
              <h2 className="text-xl font-bold text-orange-400">
                {displayQuest.itinerary?.days?.[selectedDay]?.title || `Day ${selectedDay + 1}`}
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                {new Date(displayQuest.itinerary?.days?.[selectedDay]?.date).toDateString()}
              </p>

              <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                <div className="flex gap-4" style={{ width: 'max-content' }}>
                  {displayQuest.itinerary?.days?.[selectedDay]?.activities?.map((activity: any, index: number) => (
                    <div key={index} className="w-80 flex-shrink-0">
                      {(activity.type === 'travel' || activity.title?.toLowerCase().includes('travel from'))
                        ? <TravelActivityCard activity={activity} isEditMode={false} />
                        : <HorizontalActivityCard activity={activity} />
                      }
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4">
              {displayQuest.itinerary?.days?.map((day: any, dayIndex: number) => (
                <div key={dayIndex} className="mb-8">
                  <button onClick={() => toggleDayCollapse(dayIndex)} className="flex items-center gap-3 mb-4 w-full text-left hover:bg-gray-900 p-2 rounded-lg transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center font-bold text-sm shadow-lg">{day.day}</div>
                    <div className="flex-1"><h2 className="text-lg font-bold">{day.title}</h2><p className="text-xs text-gray-400">{new Date(day.date).toDateString()}</p></div>
                    {collapsedDays.has(dayIndex) ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronUp size={20} className="text-gray-400" />}
                  </button>

                  {!collapsedDays.has(dayIndex) && (
                    <div className="space-y-0 pl-2">
                      {day.activities?.map((activity: any, activityIndex: number) => (
                        <React.Fragment key={activityIndex}>
                          {(activity.type === 'travel' || activity.title?.toLowerCase().includes('travel from')) ? (
                            <TravelActivityCard activity={activity} isEditMode={isEditMode} />
                          ) : (
                            <GoogleFormActivityCard
                              activity={activity} isEditMode={isEditMode} dayIndex={dayIndex} activityIndex={activityIndex}
                              onDelete={() => deleteActivity(dayIndex, activityIndex)}
                              onUpdate={(field: string, value: any) => updateActivity(dayIndex, activityIndex, field, value)}
                              onToggleCollapse={() => toggleCollapse(dayIndex, activityIndex)}
                              onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop}
                            />
                          )}
                          {isEditMode && (
                            <div className="flex justify-center items-center gap-2 -my-2 relative z-10">
                              <button onClick={() => addActivityBetween(dayIndex, activityIndex)} className="p-2 bg-gray-800 hover:bg-orange-500 rounded-full transition-all group" title="Add activity">
                                <Plus size={20} className="text-gray-400 group-hover:text-white" />
                              </button>
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Content */}
      <div className="hidden md:flex max-w-7xl mx-auto">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 md:p-6">
            {displayQuest.itinerary?.days?.map((day: any, dayIndex: number) => (
              <div key={dayIndex} className="mb-8">
                <button onClick={() => toggleDayCollapse(dayIndex)} className="flex items-center gap-3 mb-6 w-full text-left hover:bg-gray-900 p-3 rounded-lg transition-colors">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center font-bold shadow-lg">{day.day}</div>
                  <div className="flex-1"><h2 className="text-xl font-bold">{day.title}</h2><p className="text-sm text-gray-400">{new Date(day.date).toDateString()}</p></div>
                  {collapsedDays.has(dayIndex) ? <ChevronDown size={24} className="text-gray-400" /> : <ChevronUp size={24} className="text-gray-400" />}
                </button>
                {!collapsedDays.has(dayIndex) && (
                  <div className="space-y-0">
                    {day.activities?.map((activity: any, activityIndex: number) => (
                      <React.Fragment key={activityIndex}>
                        {(activity.type === 'travel' || activity.title?.toLowerCase().includes('travel from')) ? (
                          <TravelActivityCard activity={activity} isEditMode={isEditMode} />
                        ) : (
                          <GoogleFormActivityCard
                            activity={activity} isEditMode={isEditMode} dayIndex={dayIndex} activityIndex={activityIndex}
                            onDelete={() => deleteActivity(dayIndex, activityIndex)}
                            onUpdate={(field: string, value: any) => updateActivity(dayIndex, activityIndex, field, value)}
                            onToggleCollapse={() => toggleCollapse(dayIndex, activityIndex)}
                            onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop}
                          />
                        )}
                        {isEditMode && (
                          <div className="flex justify-center items-center gap-2 -my-2 relative z-10">
                            <button onClick={() => addActivityBetween(dayIndex, activityIndex)} className="p-2 bg-gray-800 hover:bg-orange-500 rounded-full transition-all group" title="Add activity">
                              <Plus size={20} className="text-gray-400 group-hover:text-white" />
                            </button>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {!isEditMode && (
          <div className="hidden lg:block w-2/5 border-l border-gray-800 sticky top-[65px] h-[calc(100vh-65px)]">
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <Filter size={16} className="text-gray-400 flex-shrink-0" />
                <button onClick={() => setMapFilter('all')}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${mapFilter === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-300'}`}>
                  All Days
                </button>
                {displayQuest.itinerary?.days?.map((day: any, index: number) => (
                  <button key={index} onClick={() => setMapFilter(index)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${mapFilter === index ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-300'}`}>
                    Day {day.day}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[calc(100%-4rem)]">
              <InteractiveMap
                flowCards={mapFilter === 'all' ? allActivitiesWithCoords : dayActivitiesWithCoords}
                activeIndex={activeCardIndex}
                onPinClick={(index: number) => setActiveCardIndex(index)}
              />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};
const TravelActivityCard = ({ activity, isEditMode }: { activity: any, isEditMode: boolean }) => {
  const getIcon = () => {
    const title = activity.title.toLowerCase();
    if (title.includes('fly') || title.includes('flight')) return <Plane size={24} className="text-orange-400" />;
    if (title.includes('train')) return <Train size={24} className="text-orange-400" />;
    if (title.includes('bus')) return <Bus size={24} className="text-orange-400" />;
    if (title.includes('drive') || title.includes('car')) return <Car size={24} className="text-orange-400" />;
    if (title.includes('ferry') || title.includes('ship')) return <Ship size={24} className="text-orange-400" />;
    return <Plane size={24} className="text-orange-400" />;
  };

  return (
    <div className={`relative mb-4 bg-gray-900 rounded-xl border-2 p-4 flex items-center gap-4 ${isEditMode ? 'border-gray-700' : 'border-transparent'}`}>
      <div className="bg-orange-500/10 p-3 rounded-full">
        {getIcon()}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-white">{activity.title}</h3>
        {activity.description && <p className="text-sm text-gray-400">{activity.description}</p>}
      </div>
    </div>
  );
};

const HorizontalActivityCard = ({ activity }: { activity: any }) => {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-xl border border-gray-700 h-full">
      {activity.media?.[0]?.url && (
        <div className="relative h-48 overflow-hidden">
          <img src={activity.media[0].url} alt={activity.title} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          {activity.time && (
            <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Clock size={13} className="text-orange-400" />
              <span className="text-xs font-medium text-white">{activity.time}</span>
            </div>
          )}
        </div>
      )}
      <div className="p-4 space-y-3">
        {!activity.media?.[0]?.url && activity.time && (
          <div className="inline-flex items-center gap-1.5 bg-gray-800 px-3 py-1.5 rounded-full">
            <Clock size={13} className="text-orange-400" />
            <span className="text-xs font-medium text-gray-300">{activity.time}</span>
          </div>
        )}
        <h3 className="text-lg font-bold text-white leading-snug">{activity.title}</h3>
        {activity.location?.name && (
          <div className="flex items-start gap-2 text-gray-400">
            <MapPinIcon size={15} className="flex-shrink-0 mt-0.5 text-orange-400" />
            <span className="text-sm leading-relaxed">{activity.location.name}</span>
          </div>
        )}
        {activity.description && (
          <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">{activity.description}</p>
        )}
        {activity.tags && activity.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {activity.tags.slice(0, 3).map((tag: string, i: number) => (
              <span key={i} className="px-2.5 py-1 bg-gray-800/80 text-xs text-gray-300 rounded-full border border-gray-700">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const GoogleFormActivityCard = ({ activity, isEditMode, dayIndex, activityIndex, onDelete, onUpdate, onToggleCollapse, onDragStart, onDragOver, onDrop }: any) => {
  const isCollapsed = activity.collapsed;

  return (
    <div draggable={isEditMode} onDragStart={(e) => onDragStart(e, dayIndex, activityIndex)} onDragOver={onDragOver} onDrop={(e) => onDrop(e, dayIndex, activityIndex)}
      className={`relative mb-4 bg-gray-900 rounded-xl border-2 transition-all ${isEditMode ? 'border-gray-700 hover:border-orange-500 focus-within:border-orange-500' : 'border-transparent'}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3 flex-1">
          {isEditMode && <button className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-800 rounded"><GripVertical size={20} className="text-gray-500" /></button>}
          {isCollapsed ? (
            <div className="flex-1"><h3 className="font-semibold text-white">{activity.title}</h3><p className="text-xs text-gray-400 mt-1">{activity.time}</p></div>
          ) : (
            <div className="flex items-center gap-2"><Clock size={16} className="text-orange-400" /><span className="text-sm text-gray-400 font-medium">{activity.time}</span></div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isEditMode && (
            <>
              <button onClick={onToggleCollapse} className="p-2 hover:bg-gray-800 rounded-lg transition-colors" title={isCollapsed ? "Expand" : "Collapse"}>
                {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              </button>
              <button onClick={onDelete} className="p-2 hover:bg-red-900/30 rounded-lg transition-colors" title="Delete activity">
                <Trash2 size={20} className="text-red-400" />
              </button>
            </>
          )}
        </div>
      </div>
      {!isCollapsed && (
        <div className="p-4 space-y-4">
          {activity.media?.[0]?.url && (
            <div className="relative h-48 rounded-lg overflow-hidden bg-gray-800">
              <img src={activity.media[0].url} alt={activity.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.parentElement?.remove(); }} />
            </div>
          )}
          {isEditMode ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Title</label>
                <input type="text" value={activity.title} onChange={(e) => onUpdate('title', e.target.value)} className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none" placeholder="Activity title" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Time</label>
                <input type="text" value={activity.time || ''} onChange={(e) => onUpdate('time', e.target.value)} className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none" placeholder="e.g., Morning, 9:00 AM" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea value={activity.description} onChange={(e) => onUpdate('description', e.target.value)} className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none" placeholder="Describe the activity" rows={4} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Location</label>
                <input type="text" value={activity.location?.name || ''} onChange={(e) => onUpdate('location', { ...activity.location, name: e.target.value })} className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none" placeholder="Location name" />
              </div>
            </div>
          ) : (
            <>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{activity.title}</h3>
                {activity.location?.name && (<div className="flex items-center gap-2 text-gray-400 mb-3"><MapPinIcon size={16} className="text-orange-400" /><span className="text-sm">{activity.location.name}</span></div>)}
              </div>
              {activity.description && (<p className="text-gray-300 leading-relaxed">{activity.description}</p>)}
              {activity.tags && activity.tags.length > 0 && (<div className="flex flex-wrap gap-2">{activity.tags.map((tag: string, i: number) => (<span key={i} className="px-3 py-1 bg-gray-800 text-xs text-gray-300 rounded-full border border-gray-700">{tag}</span>))}</div>)}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestViewPage;