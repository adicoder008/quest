// File: app/quest/[questId]/page.tsx - Google Forms Style Edit Mode
'use client'
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import questService from '@/lib/questService';
import { Map, Calendar, ArrowLeft, Clock, MapPin as MapPinIcon, Filter, Edit3, Save, Copy, Globe, Lock, Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import InteractiveMap from '../../../../components/quest/InteractiveMap';

const QuestViewPage = () => {
  const [user, loading] = useAuthState(auth);
  const [quest, setQuest] = useState<any>(null);
  const [questLoading, setQuestLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [mapFilter, setMapFilter] = useState<'all' | number>('all');
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedQuest, setEditedQuest] = useState<any>(null);
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [collapsedDays, setCollapsedDays] = useState<Set<number>>(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9])); // All days collapsed except day 0
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
    try {
      const questData = await questService.getQuest(user.uid, questId);
      setQuest(questData);
      setEditedQuest(JSON.parse(JSON.stringify(questData)));
    } catch (error) {
      console.error('Error loading quest:', error);
    }
    setQuestLoading(false);
  };

  const userRole = quest?.members?.[user?.uid];
  const canEdit = userRole === 'owner' || userRole === 'editor';
  const isOwner = userRole === 'owner';
  const isPublic = quest?.isPublic || false;

  const handleSave = async () => {
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

  const handlePublish = async () => {
    try {
      await questService.updateQuest(questId, user.uid, { isPublic: !isPublic });
      setQuest({ ...quest, isPublic: !isPublic });
    } catch (error) {
      console.error('Error publishing quest:', error);
    }
  };

  const handleCopyQuest = async () => {
    try {
      const copiedQuest = {
        ...quest,
        title: `${quest.title} (Copy)`,
        members: { [user.uid]: 'owner' },
        isPublic: false,
        copiedFrom: questId
      };
      delete copiedQuest.id;
      const result = await questService.createQuest(user.uid, copiedQuest);
      router.push(`/quest/${result.questId}`);
    } catch (error) {
      console.error('Error copying quest:', error);
      alert('Failed to copy quest');
    }
  };

  const addActivityBetween = (dayIndex: number, afterIndex: number) => {
    const newActivity = {
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
    const updated = { ...editedQuest };
    updated.itinerary.days[dayIndex].activities.splice(activityIndex, 1);
    setEditedQuest(updated);
  };

  const updateActivity = (dayIndex: number, activityIndex: number, field: string, value: any) => {
    const updated = { ...editedQuest };
    updated.itinerary.days[dayIndex].activities[activityIndex][field] = value;
    setEditedQuest(updated);
  };

  const toggleCollapse = (dayIndex: number, activityIndex: number) => {
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

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-gray-950 border-b border-gray-800 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">{quest.destination}</h1>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                  <Calendar size={12} />
                  <span>{new Date(quest.startDate).toLocaleDateString()} - {new Date(quest.endDate).toLocaleDateString()}</span>
                  {isPublic && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-green-400">
                        <Globe size={12} />
                        Public
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!canEdit && (
                <button onClick={handleCopyQuest} className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm">
                  <Copy size={16} />
                  <span className="hidden md:inline">Copy</span>
                </button>
              )}
              
              {isOwner && (
                <button onClick={handlePublish} className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm">
                  {isPublic ? <Lock size={16} /> : <Globe size={16} />}
                  <span className="hidden md:inline">{isPublic ? 'Private' : 'Publish'}</span>
                </button>
              )}
              
              {canEdit && !isEditMode && (
                <button onClick={() => setIsEditMode(true)} className="flex items-center gap-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors text-sm">
                  <Edit3 size={16} />
                  Edit
                </button>
              )}
              
              {isEditMode && (
                <>
                  <button
                    onClick={() => {
                      setIsEditMode(false);
                      setEditedQuest(JSON.parse(JSON.stringify(quest)));
                    }}
                    className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm disabled:opacity-50"
                  >
                    <Save size={16} />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </>
              )}
              
              {!isEditMode && (
                <button
                  onClick={() => setShowMap(!showMap)}
                  className={`p-2 rounded-lg transition-colors md:hidden ${showMap ? 'bg-orange-500' : 'bg-gray-800'}`}
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
                  onClick={() => setMapFilter('all')}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    mapFilter === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-300'
                  }`}
                >
                  All Days
                </button>
                {displayQuest.itinerary?.days?.map((day: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setMapFilter(index)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      mapFilter === index ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-300'
                    }`}
                  >
                    Day {day.day}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-[40vh]">
              <InteractiveMap
                flowCards={mapFilter === 'all' 
                  ? displayQuest.itinerary?.days?.flatMap((d: any) => d.activities) || []
                  : displayQuest.itinerary?.days?.[mapFilter]?.activities || []}
                activeIndex={activeCardIndex}
                onPinClick={(index: number) => setActiveCardIndex(index)}
              />
            </div>
          </div>
        )}
        

        {/* Mobile Content */}
        {showMap && !isEditMode ? (
          // Horizontal scroll view when map is shown
          <div className="p-4">
            <div className="mb-4">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-3">
                {displayQuest.itinerary?.days?.map((day: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDay(index)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedDay === index ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-300'
                    }`}
                  >
                    Day {day.day}
                  </button>
                ))}
              </div>
              
              <h2 className="text-xl font-bold text-orange-400 mt-4">
                {displayQuest.itinerary?.days?.[selectedDay]?.title || `Day ${selectedDay + 1}`}
              </h2>
              <p className="text-sm text-gray-400">
                {displayQuest.itinerary?.days?.[selectedDay]?.date}
              </p>
            </div>

            <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              <div className="flex gap-4" style={{ width: 'max-content' }}>
                {displayQuest.itinerary?.days?.[selectedDay]?.activities?.map((activity: any, index: number) => (
                  <div key={index} className="w-80 flex-shrink-0">
                    <HorizontalActivityCard activity={activity} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Vertical timeline view
          <div className="p-4">
            {displayQuest.itinerary?.days?.map((day: any, dayIndex: number) => (
              <div key={dayIndex} className="mb-8">
                <button
                  onClick={() => toggleDayCollapse(dayIndex)}
                  className="flex items-center gap-3 mb-4 w-full text-left hover:bg-gray-900 p-2 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center font-bold text-sm shadow-lg">
                    {day.day}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold">{day.title}</h2>
                    <p className="text-xs text-gray-400">{day.date}</p>
                  </div>
                  {collapsedDays.has(dayIndex) ? (
                    <ChevronDown size={20} className="text-gray-400" />
                  ) : (
                    <ChevronUp size={20} className="text-gray-400" />
                  )}
                </button>

                {!collapsedDays.has(dayIndex) && (
                  <div className="space-y-0 pl-2">
                    {day.activities?.map((activity: any, activityIndex: number) => (
                      <React.Fragment key={activityIndex}>
                        <GoogleFormActivityCard
                          activity={activity}
                          isEditMode={isEditMode}
                          dayIndex={dayIndex}
                          activityIndex={activityIndex}
                          onDelete={() => deleteActivity(dayIndex, activityIndex)}
                          onUpdate={(field, value) => updateActivity(dayIndex, activityIndex, field, value)}
                          onToggleCollapse={() => toggleCollapse(dayIndex, activityIndex)}
                          onDragStart={handleDragStart}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                        />
                        
                        {isEditMode && (
                          <div className="flex justify-center items-center gap-2 -my-2 relative z-10">
                            {activityIndex > 0 && (
                              <button
                                onClick={() => moveActivity(dayIndex, activityIndex, activityIndex - 1)}
                                className="p-2 bg-gray-800 hover:bg-blue-500 rounded-full transition-all group"
                                title="Move up"
                              >
                                <ChevronUp size={20} className="text-gray-400 group-hover:text-white" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => addActivityBetween(dayIndex, activityIndex)}
                              className="p-2 bg-gray-800 hover:bg-orange-500 rounded-full transition-all group"
                              title="Add activity"
                            >
                              <Plus size={20} className="text-gray-400 group-hover:text-white" />
                            </button>
                            
                            {activityIndex < day.activities.length - 1 && (
                              <button
                                onClick={() => moveActivity(dayIndex, activityIndex, activityIndex + 1)}
                                className="p-2 bg-gray-800 hover:bg-blue-500 rounded-full transition-all group"
                                title="Move down"
                              >
                                <ChevronDown size={20} className="text-gray-400 group-hover:text-white" />
                              </button>
                            )}
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

      {/* Desktop Content */}
      <div className="hidden md:flex">
        {/* Left/Main Column */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 md:p-6">
            {displayQuest.itinerary?.days?.map((day: any, dayIndex: number) => (
              <div key={dayIndex} className="mb-8">
                <button
                  onClick={() => toggleDayCollapse(dayIndex)}
                  className="flex items-center gap-3 mb-6 w-full text-left hover:bg-gray-900 p-3 rounded-lg transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center font-bold shadow-lg">
                    {day.day}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold">{day.title}</h2>
                    <p className="text-sm text-gray-400">{day.date}</p>
                  </div>
                  {collapsedDays.has(dayIndex) ? (
                    <ChevronDown size={24} className="text-gray-400" />
                  ) : (
                    <ChevronUp size={24} className="text-gray-400" />
                  )}
                </button>

                {!collapsedDays.has(dayIndex) && (
                  <div className="space-y-0">
                    {day.activities?.map((activity: any, activityIndex: number) => (
                      <React.Fragment key={activityIndex}>
                        <GoogleFormActivityCard
                          activity={activity}
                          isEditMode={isEditMode}
                          dayIndex={dayIndex}
                          activityIndex={activityIndex}
                          onDelete={() => deleteActivity(dayIndex, activityIndex)}
                          onUpdate={(field, value) => updateActivity(dayIndex, activityIndex, field, value)}
                          onToggleCollapse={() => toggleCollapse(dayIndex, activityIndex)}
                          onDragStart={handleDragStart}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                        />
                        
                        {/* Add/Move buttons between cards */}
                        {isEditMode && (
                          <div className="flex justify-center items-center gap-2 -my-2 relative z-10">
                            {activityIndex > 0 && (
                              <button
                                onClick={() => moveActivity(dayIndex, activityIndex, activityIndex - 1)}
                                className="p-2 bg-gray-800 hover:bg-blue-500 rounded-full transition-all group"
                                title="Move up"
                              >
                                <ChevronUp size={20} className="text-gray-400 group-hover:text-white" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => addActivityBetween(dayIndex, activityIndex)}
                              className="p-2 bg-gray-800 hover:bg-orange-500 rounded-full transition-all group"
                              title="Add activity"
                            >
                              <Plus size={20} className="text-gray-400 group-hover:text-white" />
                            </button>
                            
                            {activityIndex < day.activities.length - 1 && (
                              <button
                                onClick={() => moveActivity(dayIndex, activityIndex, activityIndex + 1)}
                                className="p-2 bg-gray-800 hover:bg-blue-500 rounded-full transition-all group"
                                title="Move down"
                              >
                                <ChevronDown size={20} className="text-gray-400 group-hover:text-white" />
                              </button>
                            )}
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div> {/* This closing div was missing */}

        {/* Right Column - Map (Desktop only, hidden in edit mode) */}
        {!isEditMode && (
          <div className="hidden lg:block w-2/5 border-l border-gray-800 sticky top-16 h-[calc(100vh-4rem)]">
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <Filter size={16} className="text-gray-400 flex-shrink-0" />
                <button
                  onClick={() => setMapFilter('all')}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    mapFilter === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-300'
                  }`}
                >
                  All Days
                </button>
                {displayQuest.itinerary?.days?.map((day: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setMapFilter(index)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      mapFilter === index ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-300'
                    }`}
                  >
                    Day {day.day}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[calc(100%-4rem)]">
              <InteractiveMap
                flowCards={mapFilter === 'all' 
                  ? displayQuest.itinerary?.days?.flatMap((d: any) => d.activities) || []
                  : displayQuest.itinerary?.days?.[mapFilter]?.activities || []}
                activeIndex={activeCardIndex}
                onPinClick={(index: number) => setActiveCardIndex(index)}
              />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};
const HorizontalActivityCard = ({ activity }: { activity: any }) => {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-xl border border-gray-700 h-full">
      {activity.media?.[0]?.url && (
        <div className="relative h-48 overflow-hidden">
          <img src={activity.media[0].url} alt={activity.title} className="w-full h-full object-cover" />
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
// Google Forms Style Activity Card
const GoogleFormActivityCard = ({ 
  activity, 
  isEditMode, 
  dayIndex, 
  activityIndex,
  onDelete, 
  onUpdate, 
  onToggleCollapse,
  onDragStart,
  onDragOver,
  onDrop
}: any) => {
  const isCollapsed = activity.collapsed;

  return (
    <div
      draggable={isEditMode}
      onDragStart={(e) => onDragStart(e, dayIndex, activityIndex)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, dayIndex, activityIndex)}
      className={`relative mb-4 bg-gray-900 rounded-xl border-2 transition-all ${
        isEditMode 
          ? 'border-gray-700 hover:border-orange-500 cursor-move' 
          : 'border-transparent'
      }`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3 flex-1">
          {isEditMode && (
            <button className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-800 rounded">
              <GripVertical size={20} className="text-gray-500" />
            </button>
          )}
          
          {isCollapsed ? (
            <div className="flex-1">
              <h3 className="font-semibold text-white">{activity.title}</h3>
              <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-orange-400" />
              <span className="text-sm text-gray-400 font-medium">{activity.time}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isEditMode && (
            <>
              <button
                onClick={onToggleCollapse}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title={isCollapsed ? "Expand" : "Collapse"}
              >
                {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              </button>
              
              <button
                onClick={onDelete}
                className="p-2 hover:bg-red-900/30 rounded-lg transition-colors"
                title="Delete activity"
              >
                <Trash2 size={20} className="text-red-400" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Card Content */}
      {!isCollapsed && (
        <div className="p-4 space-y-4">
          {activity.media?.[0]?.url && (
            <div className="relative h-48 rounded-lg overflow-hidden">
              <img src={activity.media[0].url} alt={activity.title} className="w-full h-full object-cover" />
            </div>
          )}

          {isEditMode ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Title</label>
                <input
                  type="text"
                  value={activity.title}
                  onChange={(e) => onUpdate('title', e.target.value)}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
                  placeholder="Activity title"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Time</label>
                <input
                  type="text"
                  value={activity.time || ''}
                  onChange={(e) => onUpdate('time', e.target.value)}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
                  placeholder="e.g., Morning, 9:00 AM"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea
                  value={activity.description}
                  onChange={(e) => onUpdate('description', e.target.value)}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
                  placeholder="Describe the activity"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Location</label>
                <input
                  type="text"
                  value={activity.location?.name || ''}
                  onChange={(e) => onUpdate('location', { ...activity.location, name: e.target.value })}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
                  placeholder="Location name"
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{activity.title}</h3>
                {activity.location?.name && (
                  <div className="flex items-center gap-2 text-gray-400 mb-3">
                    <MapPinIcon size={16} className="text-orange-400" />
                    <span className="text-sm">{activity.location.name}</span>
                  </div>
                )}
              </div>

              {activity.description && (
                <p className="text-gray-300 leading-relaxed">{activity.description}</p>
              )}

              {activity.tags && activity.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {activity.tags.map((tag: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-gray-800 text-xs text-gray-300 rounded-full border border-gray-700">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};


export default QuestViewPage;