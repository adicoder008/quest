// PASTE THIS ENTIRE FILE AS: app/quest/[questId]/page.tsx
// Complete working version with all features fixed

'use client'
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import questService from '@/lib/questService';
import { createPost } from '@/lib/postService';
import { Map, Calendar, ArrowLeft, Clock, MapPin as MapPinIcon, Filter, Edit3, Save, Copy, Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Share2, Send, X, Plane, Train, Bus, Car, Ship, Edit2 } from 'lucide-react';
import InteractiveMap from '../../../../components/quest/InteractiveMap';
import { useToast, ToastContainer } from '@/hooks/use-toast';
import { PostVisibilityModal } from '@/components/QuestPopups';
import { LocationInput } from '@/components/common/LocationInput';
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Flag } from 'lucide-react';
import { FaHeart } from 'react-icons/fa';
import { savePost, unsavePost, reportPost } from '@/lib/postService';
import {Quest} from '../../../types/index'
import { arrayRemove, arrayUnion, doc, getDoc, increment, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../../../lib/firebase.js';
import { VideoGenerationModal } from '@/components/quest/VideoGenerationModal';
import { Video } from 'lucide-react';
import OnQuestPeopleSection from '@/components/quest/OnQuestPeopleSection';


interface ActivityLocation {
  name: string;
  coordinates?: { lat: number; lng: number; };
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




const AddActivityModal = ({ isOpen, onClose, onAdd }: any) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('Morning');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{ name: string; coordinates?: { lat: number; lng: number } }>({ name: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setTime('Morning');
      setDescription('');
      setLocation({ name: '' });
      setImageFile(null);
      setImagePreview('');
    }
  }, [isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    const newActivity = {
      time: time,
      title: title.trim(),
      description: description.trim(),
      location: location,
      tags: [],
      collapsed: false,
      media: imagePreview ? [{ url: imagePreview, type: 'image' as const }] : []
    };

    onAdd(newActivity);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-xl max-w-md w-full border border-gray-700 my-8">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-bold text-white">Add New Activity</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Activity Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
              placeholder="e.g., Visit Temple, Lunch at Restaurant"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Time of Day *</label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none cursor-pointer"
            >
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
              <option value="Night">Night</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Location</label>
            <LocationInput
              value={location.name}
              onChange={(locationData) => setLocation(locationData)}
              placeholder="Search for a location..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Start typing to search with Google Places
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
              placeholder="Add details about this activity..."
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Add Image</label>
            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-orange-500 transition-colors bg-gray-800">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Plus size={32} className="text-gray-500 mb-2" />
                  <p className="text-sm text-gray-400">Click to upload image</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                  title="Remove image"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim()}
              className="flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditTitleModal = ({ isOpen, onClose, currentTitle, currentDestination, onSave }: any) => {
  const [title, setTitle] = useState(currentTitle);
  const [destination, setDestination] = useState(currentDestination);

  useEffect(() => {
    if (isOpen) {
      setTitle(currentTitle);
      setDestination(currentDestination);
    }
  }, [isOpen, currentTitle, currentDestination]);

  const handleSave = () => {
    if (title.trim() && destination.trim()) {
      onSave(title.trim(), destination.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl max-w-md w-full border border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-bold text-white">Edit Quest Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Destination</label>
            <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none" placeholder="e.g., Bali, Indonesia" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Quest Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none" placeholder="e.g., Amazing Bali Adventure" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium">Cancel</button>
            <button onClick={handleSave} disabled={!title.trim() || !destination.trim()} className="flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShareQuestModal = ({ isOpen, onClose, onShareToFeed }: any) => {
  if (!isOpen) return null;
  const questLink = typeof window !== 'undefined' ? window.location.href : '';
  const copyLink = () => {
    navigator.clipboard.writeText(questLink);
    alert("Link copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
        <h3 className="text-xl font-bold mb-4">Share this Quest</h3>
        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-2">Share a link to your quest:</p>
          <div className="flex gap-2">
            <input type="text" readOnly value={questLink} className="w-full bg-gray-900 text-gray-300 px-3 py-2 rounded-lg border border-gray-700" />
            <button onClick={copyLink} className="px-4 py-2 bg-orange-500 rounded-lg text-sm font-semibold flex items-center gap-2"><Copy size={16} /> Copy</button>
          </div>
        </div>
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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showEditTitleModal, setShowEditTitleModal] = useState(false);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [addActivityContext, setAddActivityContext] = useState<{ dayIndex: number; afterIndex: number } | null>(null);
  const { toasts, showToast, removeToast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [showVideoModal, setShowVideoModal] = useState(false);


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

  useEffect(() => {
    const fetchPostStats = async () => {
      if (quest?.associatedPostId && user?.uid) {
        try {
          const postRef = doc(db, 'posts', quest.associatedPostId);
          const postSnap = await getDoc(postRef);
          
          if (postSnap.exists()) {
            const postData = postSnap.data();
            setLikeCount(postData.likeCount || 0);
            setIsLiked(postData.likedBy?.includes(user.uid) || false);
          }
          
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setIsSaved(userData.savedPosts?.includes(quest.associatedPostId) || false);
          }
        } catch (error) {
          console.error('Error fetching post stats:', error);
        }
      }
    };

    fetchPostStats();
  }, [quest?.associatedPostId, user?.uid, quest]);


  const loadQuest = async () => {
    if (!user?.uid) {
      setQuestLoading(false);
      return;
    }
    setQuestLoading(true);
    try {
      const questData = await questService.getQuest(user.uid, questId);
      setQuest(questData as unknown as Quest);
      if (questData) {
        setEditedQuest(JSON.parse(JSON.stringify(questData)));
        const initialCollapsed = new Set<number>();
        questData.itinerary?.days?.forEach((_: any, index: number) => {
          if (index > 0) initialCollapsed.add(index);
        });
        setCollapsedDays(initialCollapsed);
      }
    } catch (error) {
      console.error('Error loading quest:', error);
      showToast('Failed to load quest', 'error');
    } finally {
      setQuestLoading(false);
    }
  };

  const userRole = quest?.members?.[user?.uid || ''];
  const canEdit = userRole === 'owner' || userRole === 'editor';
  const isOwner = userRole === 'owner';

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
      showToast('Quest saved successfully! ✓', 'success');
    } catch (error) {
      console.error('Error saving quest:', error);
      showToast('Failed to save quest', 'error');
    }
    setSaving(false);
  };

  const handleSaveTitle = async (newTitle: string, newDestination: string) => {
    if (!user?.uid || !quest) return;
    try {
      await questService.updateQuest(questId, user.uid, {
        title: newTitle,
        destination: newDestination,
        updatedAt: new Date().toISOString()
      });
      setQuest({ ...quest, title: newTitle, destination: newDestination });
      if (editedQuest) {
        setEditedQuest({ ...editedQuest, title: newTitle, destination: newDestination });
      }
      showToast('Quest details updated! ✓', 'success');
    } catch (error) {
      console.error('Error updating quest title:', error);
      showToast('Failed to update quest details', 'error');
    }
  };

  const handlePostQuest = async (visibility: 'public' | 'private', coverImage: File | null) => {
    if (!user?.uid || !quest) return;
    try {
      console.log(coverImage);
      const result = await questService.postQuestToFeed(questId, user.uid, visibility, coverImage);
      console.log(result);
      if (result.success) {
        if (visibility === 'public') {
          showToast('Quest posted to feed successfully! 🎉', 'success');
        } else {
          showToast('Quest saved privately ✓', 'success');
        }
        await loadQuest();
      } else {
        showToast(result.error || 'Failed to post quest', 'error');
      }
    } catch (error) {
      console.error('Error posting quest:', error);
      showToast('Failed to post quest', 'error');
    } finally {
      setShowPostModal(false);
    }
  };

  const handleCopyQuest = async () => {
    if (!user?.uid || !quest) return;
    try {
      const copiedQuest = {
        ...quest,
        title: `${quest.title} (Copy)`,
        members: { [user.uid]: 'owner' as const },
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
      const result = await questService.createQuest(user.uid, copiedQuest, undefined, undefined, flowCards);
      showToast('Quest copied successfully!', 'success');
      router.push(`/quest/${result.questId}`);
    } catch (error) {
      console.error('Error copying quest:', error);
      showToast('Failed to copy quest', 'error');
    }
  };

  const handleShareToFeed = async () => {
    if (!user || !quest) return;
    try {
      console.log("before create post: ", quest.coverImageUrl);
      await createPost({
        uid: user.uid,
        text: `Check out my Quest to ${quest.destination}! 🗺️`,
        photoUrl: quest.coverImageUrl,
        postType: 'quest_completion',
        questContext: {
          questId: questId,
          questTitle: quest.title || `An amazing journey to ${quest.destination}`,
          description: quest.destination,
          category: 'travel'
        }
      });
      
      showToast('Quest shared to feed!', 'success');
      setIsShareModalOpen(false);
    } catch (error) {
      console.error('Failed to share quest to feed', error);
      showToast('Failed to share quest', 'error');
    }
  };

  const openAddActivityModal = (dayIndex: number, afterIndex: number) => {
    setAddActivityContext({ dayIndex, afterIndex });
    setShowAddActivityModal(true);
  };

  const handleAddActivity = (activity: any) => {
    if (!editedQuest || !addActivityContext) return;
    const { dayIndex, afterIndex } = addActivityContext;
    const updated = { ...editedQuest };
    updated.itinerary.days[dayIndex].activities.splice(afterIndex + 1, 0, activity);
    setEditedQuest(updated);
    setShowAddActivityModal(false);
    setAddActivityContext(null);
    showToast('Activity added successfully!', 'success');
  };

  const deleteActivity = (dayIndex: number, activityIndex: number) => {
    if (!editedQuest) return;
    const updated = { ...editedQuest };
    updated.itinerary.days[dayIndex].activities.splice(activityIndex, 1);
    setEditedQuest(updated);
    showToast('Activity deleted', 'info');
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
    updated.itinerary.days[dayIndex].activities[activityIndex].collapsed = !updated.itinerary.days[dayIndex].activities[activityIndex].collapsed;
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
    if (toIndex < 0 || toIndex >= editedQuest.itinerary.days[dayIndex].activities.length) return;
    const updated = { ...editedQuest };
    const activities = updated.itinerary.days[dayIndex].activities;
    const [movedItem] = activities.splice(fromIndex, 1);
    activities.splice(toIndex, 0, movedItem);
    setEditedQuest(updated);
    showToast('Activity reordered', 'info');
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
    return <div className="min-h-screen bg-black text-white flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div></div>;
  }

  if (!quest) {
    return <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center p-4"><h2 className="text-xl font-bold mb-2">Quest Not Found</h2><p className="text-gray-400">The quest you're looking for doesn't exist.</p><button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg">Go Back</button></div>;
  }

  const displayQuest = isEditMode ? editedQuest : quest;
  if (!displayQuest) return null;

  // Fix: Properly extract activities with coordinates and add date
  const allActivitiesWithCoords = displayQuest.itinerary?.days?.flatMap((day: any) => 
    (day.activities || [])
      .filter((a: any) => a.location?.coordinates?.lat && a.location?.coordinates?.lng)
      .map((a: any) => ({ ...a, date: day.date })) // Add day date to each activity
  ) || [];
  
  const dayActivitiesWithCoords = mapFilter !== 'all' && displayQuest.itinerary?.days?.[mapFilter]
    ? (displayQuest.itinerary.days[mapFilter].activities || [])
        .filter((a: any) => a.location?.coordinates?.lat && a.location?.coordinates?.lng)
        .map((a: any) => ({ ...a, date: displayQuest.itinerary.days[mapFilter].date }))
    : [];

  

    const handleLike = async () => {
      if (!user?.uid || !quest?.associatedPostId) return;
      
      try {
        const postRef = doc(db, 'posts', quest.associatedPostId);
        
        if (isLiked) {
          await updateDoc(postRef, {
            likedBy: arrayRemove(user.uid),
            likeCount: increment(-1)
          });
          setIsLiked(false);
          setLikeCount(prev => Math.max(0, prev - 1));
        } else {
          await updateDoc(postRef, {
            likedBy: arrayUnion(user.uid),
            likeCount: increment(1)
          });
          setIsLiked(true);
          setLikeCount(prev => prev + 1);
        }
      } catch (error) {
        console.error('Error toggling like:', error);
        showToast('Failed to update like', 'error');
      }
    };

    const handleSaveQuest = async () => {
      if (!user?.uid || !quest?.associatedPostId) return;
      
      try {
        if (isSaved) {
          await unsavePost(quest.associatedPostId, user.uid);
          setIsSaved(false);
          showToast('Removed from saved', 'info');
        } else {
          await savePost(quest.associatedPostId, user.uid);
          setIsSaved(true);
          showToast('Saved successfully', 'success');
        }
      } catch (error) {
        console.error('Error toggling save:', error);
        showToast('Failed to update save status', 'error');
      }
    };

    const handleCommentNavigate = () => {
      if (quest?.associatedPostId) {
        router.push(`/feed?scrollTo=${quest.associatedPostId}&openComments=true`);
      }
    };

    const handleReportQuest = async () => {
      if (!user?.uid || !quest?.associatedPostId || !reportReason) {
        showToast('Please select a reason', 'error');
        return;
      }
      
      try {
        await reportPost(quest.associatedPostId, user.uid, reportReason, reportDescription);
        showToast('Quest reported successfully', 'success');
        setShowReportModal(false);
        setShowMoreMenu(false);
        setReportReason('');
        setReportDescription('');
      } catch (error) {
        console.error('Error reporting quest:', error);
        showToast('Failed to report quest', 'error');
      }
    };

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20 lg:pb-0">
      <AddActivityModal 
        isOpen={showAddActivityModal} 
        onClose={() => {
          setShowAddActivityModal(false);
          setAddActivityContext(null);
        }}
        onAdd={handleAddActivity}
      />
      <EditTitleModal isOpen={showEditTitleModal} onClose={() => setShowEditTitleModal(false)} currentTitle={quest.title} currentDestination={quest.destination} onSave={handleSaveTitle} />
      <ShareQuestModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} onShareToFeed={handleShareToFeed} />

      <header className="sticky top-0 z-20 bg-gray-950/80 border-b border-gray-800 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <ArrowLeft size={20} />
                </button>
                <div>
                <div className="flex items-center gap-2">
                    <h1 className="text-lg md:text-xl font-bold truncate max-w-[150px] md:max-w-xs">
                    {quest.destination}
                    </h1>
                    {canEdit && !isEditMode && (
                    <button 
                        onClick={() => setShowEditTitleModal(true)} 
                        className="p-1 hover:bg-gray-800 rounded transition-colors" 
                        title="Edit quest details"
                    >
                        <Edit2 size={16} className="text-gray-400 hover:text-orange-500" />
                    </button>
                    )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                    <Calendar size={12} />
                    <span>
                    {new Date(quest.startDate).toLocaleDateString()} - {new Date(quest.endDate).toLocaleDateString()}
                    </span>
                </div>
                </div>
            </div>
            
            {/* ACTION BUTTONS - Different for Owner vs Viewer */}
            <div className="flex items-center gap-2">
                {isOwner ? (
                /* OWNER VIEW - Share and Edit */
                <>  <button 
                      onClick={() => setShowVideoModal(true)} 
                      className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm"
                    >
                      <Video size={16} />
                      <span>Generate Video</span>
                    </button>
                    <button 
                    onClick={() => setIsShareModalOpen(true)} 
                    className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                    >
                    <Share2 size={16} />
                    <span className="hidden md:inline">Share</span>
                    </button>
                    {!isEditMode && (
                    <button 
                        onClick={() => setIsEditMode(true)} 
                        className="flex items-center gap-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors text-sm"
                    >
                        <Edit3 size={16} />
                        <span className="hidden md:inline">Edit</span>
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
                </>
                ) : quest.isPostedToFeed && quest.associatedPostId ? (
                /* VIEWER VIEW - Like, Comment, Save, More */
                <>
                    <button 
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                        isLiked 
                        ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' 
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    }`}
                    >
                    <FaHeart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                    <span className="hidden md:inline">{likeCount}</span>
                    </button>
                    
                    <button 
                    onClick={handleSaveQuest}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                        isSaved 
                        ? 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30' 
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    }`}
                    >
                    <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
                    <span className="hidden md:inline">Save</span>
                    </button>
                    
                    <div className="relative">
                    <button 
                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                    >
                        <MoreHorizontal size={16} />
                    </button>
                    
                    {/* More Menu Dropdown */}
                    {showMoreMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg border border-gray-700 shadow-xl z-50">
                        <button
                            onClick={() => {
                            setIsShareModalOpen(true);
                            setShowMoreMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors text-white text-left rounded-t-lg"
                        >
                            <Share2 size={16} />
                            <span>Share</span>
                        </button>
                        
                        <button
                            onClick={() => {
                            handleCommentNavigate();
                            setShowMoreMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors text-white text-left"
                        >
                            <MessageCircle size={16} />
                            <span>Comment</span>
                        </button>
                        
                        <button
                            onClick={() => {
                            setShowReportModal(true);
                            setShowMoreMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors text-red-500 text-left rounded-b-lg"
                        >
                            <Flag size={16} />
                            <span>Report</span>
                        </button>
                        </div>
                    )}
                    </div>
                </>
                ) : !canEdit ? (
                /* Non-owner viewing private quest - just Copy button */
                <button 
                    onClick={handleCopyQuest} 
                    className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                >
                    <Copy size={16} />
                    <span className="hidden md:inline">Copy</span>
                </button>
                ) : null}
            </div>
            </div>
        </div>
        </header>

        {showMoreMenu && (
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowMoreMenu(false)}
            />
          )}

      {/* Mobile View - Map toggle in header, horizontal cards AFTER map, NO overlaps */}
        <div className="lg:hidden">
          {/* COMPACT HEADER with Map Toggle - Only show when NOT in edit mode */}
          {!isEditMode && (
            <div className="sticky top-[65px] z-10 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800">
              <div className="px-4 py-2 flex items-center justify-between">
                {/* Map toggle button */}
                <button 
                  onClick={() => setShowMap(!showMap)} 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium text-sm ${
                    showMap 
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      :'bg-orange-500 text-white'
                  }`}
                >
                  <Map size={18} />
                  <span>{showMap ? 'List View' : 'Map View'}</span>
                </button>
                
                {/* Day filters (only show when map is visible) */}
                {showMap && (
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                    <button 
                      onClick={() => { setMapFilter('all'); setSelectedDay(0); }} 
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        mapFilter === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      All
                    </button>
                    {displayQuest.itinerary?.days?.map((day: any, index: number) => (
                      <button 
                        key={index} 
                        onClick={() => { setMapFilter(index); setSelectedDay(index); }} 
                        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          mapFilter === index ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        D{day.day}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MAP VIEW - Map at top, horizontal cards BELOW (not overlaying) */}
          {showMap && !isEditMode ? (
            <>
              {/* Map Container - Fixed height, no overlays */}
              <div className="h-[52vh]">
                <InteractiveMap 
                  flowCards={mapFilter === 'all' ? allActivitiesWithCoords : dayActivitiesWithCoords} 
                  activeIndex={activeCardIndex} 
                  onPinClick={(index: number) => setActiveCardIndex(index)} 
                />
              </div>
              
              {/* Horizontal Scrollable Cards - AFTER map (below it), NO overlap */}
              {(mapFilter === 'all' ? allActivitiesWithCoords : dayActivitiesWithCoords).length > 0 && (
                <div className="bg-gray-950 border-t-2 border-gray-800 p-4">
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory -mx-4 px-4">
                    {(mapFilter === 'all' ? allActivitiesWithCoords : dayActivitiesWithCoords).map((activity: any, index: number) => (
                      <div 
                        key={index}
                        onClick={() => setActiveCardIndex(index)}
                        className={`flex-shrink-0 w-72 snap-center transition-all cursor-pointer ${
                          activeCardIndex === index 
                            ? ' scale-[1.02]' 
                            : ' hover:opacity-100'
                        }`}
                      >
                        <MapActivityCard activity={activity} isActive={activeCardIndex === index} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : !isEditMode ? (
            /* LIST VIEW - Only show when map is hidden */
            <div className="pt-4">
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
                        <p className="text-xs text-gray-400">{new Date(day.date).toDateString()}</p>
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
                            {(activity.type === 'travel' || activity.title?.toLowerCase().includes('travel from')) ? (
                              <TravelActivityCard activity={activity} isEditMode={isEditMode} />
                            ) : (
                              <GoogleFormActivityCard 
                                activity={activity} 
                                isEditMode={isEditMode} 
                                dayIndex={dayIndex} 
                                activityIndex={activityIndex} 
                                totalActivities={day.activities.length} 
                                onDelete={() => deleteActivity(dayIndex, activityIndex)} 
                                onUpdate={(field: string, value: any) => updateActivity(dayIndex, activityIndex, field, value)} 
                                onToggleCollapse={() => toggleCollapse(dayIndex, activityIndex)} 
                                onDragStart={handleDragStart} 
                                onDragOver={handleDragOver} 
                                onDrop={handleDrop} 
                                onMoveUp={() => moveActivity(dayIndex, activityIndex, activityIndex - 1)} 
                                onMoveDown={() => moveActivity(dayIndex, activityIndex, activityIndex + 1)} 
                              />
                            )}
                            {isEditMode && (
                              <div className="flex justify-center items-center gap-2 -my-2 relative z-10">
                                <button 
                                  onClick={() => openAddActivityModal(dayIndex, activityIndex)} 
                                  className="p-2 bg-gray-800 hover:bg-orange-500 rounded-full transition-all group" 
                                  title="Add activity"
                                >
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
          ) : (
            /* EDIT MODE - Show full itinerary list */
            <div className="pt-4">
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
                        <p className="text-xs text-gray-400">{new Date(day.date).toDateString()}</p>
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
                            {(activity.type === 'travel' || activity.title?.toLowerCase().includes('travel from')) ? (
                              <TravelActivityCard activity={activity} isEditMode={isEditMode} />
                            ) : (
                              <GoogleFormActivityCard 
                                activity={activity} 
                                isEditMode={isEditMode} 
                                dayIndex={dayIndex} 
                                activityIndex={activityIndex} 
                                totalActivities={day.activities.length} 
                                onDelete={() => deleteActivity(dayIndex, activityIndex)} 
                                onUpdate={(field: string, value: any) => updateActivity(dayIndex, activityIndex, field, value)} 
                                onToggleCollapse={() => toggleCollapse(dayIndex, activityIndex)} 
                                onDragStart={handleDragStart} 
                                onDragOver={handleDragOver} 
                                onDrop={handleDrop} 
                                onMoveUp={() => moveActivity(dayIndex, activityIndex, activityIndex - 1)} 
                                onMoveDown={() => moveActivity(dayIndex, activityIndex, activityIndex + 1)} 
                              />
                            )}
                            {isEditMode && (
                              <div className="flex justify-center items-center gap-2 -my-2 relative z-10">
                                <button 
                                  onClick={() => openAddActivityModal(dayIndex, activityIndex)} 
                                  className="p-2 bg-gray-800 hover:bg-orange-500 rounded-full transition-all group" 
                                  title="Add activity"
                                >
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
          )}
        </div>

      <div className="hidden lg:flex max-w-[100vw] mx-auto h-[calc(100vh-65px)] overflow-hidden">
        {/* LEFT SIDE - Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 scroll-smooth">
          <div className="max-w-4xl mx-auto p-4 md:p-6 pr-8 md:pr-12">
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
                    <p className="text-sm text-gray-400">{new Date(day.date).toDateString()}</p>
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
                        {(activity.type === 'travel' || activity.title?.toLowerCase().includes('travel from')) ? (
                          <TravelActivityCard activity={activity} isEditMode={isEditMode} />
                        ) : (
                          <GoogleFormActivityCard 
                            activity={activity} 
                            isEditMode={isEditMode} 
                            dayIndex={dayIndex} 
                            activityIndex={activityIndex} 
                            totalActivities={day.activities.length} 
                            onDelete={() => deleteActivity(dayIndex, activityIndex)} 
                            onUpdate={(field: string, value: any) => updateActivity(dayIndex, activityIndex, field, value)} 
                            onToggleCollapse={() => toggleCollapse(dayIndex, activityIndex)} 
                            onDragStart={handleDragStart} 
                            onDragOver={handleDragOver} 
                            onDrop={handleDrop} 
                            onMoveUp={() => moveActivity(dayIndex, activityIndex, activityIndex - 1)} 
                            onMoveDown={() => moveActivity(dayIndex, activityIndex, activityIndex + 1)} 
                          />
                        )}
                        {isEditMode && (
                          <div className="flex justify-center items-center gap-2 -my-2 relative z-10">
                            <button 
                              onClick={() => openAddActivityModal(dayIndex, activityIndex)} 
                              className="p-2 bg-gray-800 hover:bg-orange-500 rounded-full transition-all group" 
                              title="Add activity"
                            >
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

            <div className="mt-8">
              <OnQuestPeopleSection 
                quest={displayQuest} 
                userId={user?.uid || ''} 
              />
            </div>
            
            {/* Extra padding at bottom */}
            <div className="h-20"></div>
          </div>
        </div>
        
        {/* RIGHT SIDE - Sticky Map & Button Panel */}
        {!isEditMode && (
          <div className="w-2/5 min-w-[400px] max-w-[600px] border-l border-gray-800 flex flex-col h-full bg-gray-950">
            {/* Filter buttons - fixed at top */}
            <div className="p-4 border-b border-gray-800 flex-shrink-0 bg-gray-950">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 pb-2">
                <Filter size={16} className="text-gray-400 flex-shrink-0" />
                <button 
                  onClick={() => setMapFilter('all')} 
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    mapFilter === 'all' 
                      ? 'bg-orange-500 text-white shadow-lg' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  All Days
                </button>
                {displayQuest.itinerary?.days?.map((day: any, index: number) => (
                  <button 
                    key={index} 
                    onClick={() => setMapFilter(index)} 
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      mapFilter === index 
                        ? 'bg-orange-500 text-white shadow-lg' 
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Day {day.day}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Map - takes all remaining space */}
            <div className="flex-1 overflow-hidden">
              <InteractiveMap 
                flowCards={mapFilter === 'all' ? allActivitiesWithCoords : dayActivitiesWithCoords} 
                activeIndex={activeCardIndex} 
                onPinClick={(index: number) => setActiveCardIndex(index)} 
              />
            </div>
            
            {/* Post Quest button - fixed at bottom */}
            {isOwner && !quest.isPostedToFeed && (
              <div className="p-4 border-t border-gray-800 flex-shrink-0 bg-gray-950">
                <button
                  onClick={() => setShowPostModal(true)}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl transition-all text-base font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Send size={20} />
                  <span>Post Quest to Feed</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Floating Action Button for Mobile & Tablet */}
      {isOwner && !isEditMode && !quest.isPostedToFeed && (
        <div className="lg:hidden fixed bottom-6 right-6 z-30">
          <button
            onClick={() => setShowPostModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-full transition-all shadow-2xl hover:scale-105 active:scale-95"
          >
            <Send size={20} className="text-white" />
            <span className="font-semibold text-white">Post Quest</span>
          </button>
        </div>
      )}

      
      <PostVisibilityModal 
        isOpen={showPostModal} 
        onClose={() => setShowPostModal(false)} 
        onPost={handlePostQuest} 
        questTitle={quest.destination} 
        hasCoverImage={!!quest.coverImageUrl} 
      />

      {showVideoModal && user && quest && (
      <VideoGenerationModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        questId={questId}
        questData={{
          destination: quest.destination,
          userName: user.displayName || 'Traveler',
          userProfilePic: user.photoURL || '',
          coverImageUrl: quest.coverImageUrl || '',
          itinerary: quest.itinerary,
          title: quest.title
        }}
        uid={user.uid}
      />
    )}

      {showReportModal && (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
        <div className="bg-gray-900 rounded-lg w-full max-w-md border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Report Quest</h3>
            <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Reason</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="">Select a reason</option>
                <option value="spam">Spam</option>
                <option value="harassment">Harassment</option>
                <option value="inappropriate">Inappropriate Content</option>
                <option value="false_info">False Information</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-300 mb-2 block">Additional Details (Optional)</label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Provide more details..."
                className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none"
                rows={3}
              />
            </div>

            <button
              onClick={handleReportQuest}
              disabled={!reportReason}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Report
            </button>
          </div>
        </div>
      </div>
    )}
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { 
          display: none; 
        } 
        .scrollbar-hide { 
          -ms-overflow-style: none; 
          scrollbar-width: none; 
        }
      `}</style>
    </div>
  );
};

// Map Activity Card for horizontal scroll
const MapActivityCard = ({ activity }: any) => {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-xl border border-gray-700 h-full cursor-pointer hover:scale-105 transition-transform">
      {activity.media?.[0]?.url && (
        <div className="relative h-32 overflow-hidden">
          <img src={activity.media[0].url} alt={activity.title} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          {activity.time && (
            <div className="absolute top-2 right-2 bg-black/75 px-2 py-1 rounded-full flex items-center gap-1">
              <Clock size={12} className="text-orange-400" />
              <span className="text-xs font-medium text-white">{activity.time}</span>
            </div>
          )}
        </div>
      )}
      <div className="p-3 space-y-2">
        {!activity.media?.[0]?.url && activity.time && (
          <div className="inline-flex items-center gap-1 bg-gray-800 px-2 py-1 rounded-full">
            <Clock size={12} className="text-orange-400" />
            <span className="text-xs font-medium text-gray-300">{activity.time}</span>
          </div>
        )}
        <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">{activity.title}</h3>
        {activity.location?.name && (
          <div className="flex items-start gap-1.5 text-gray-400">
            <MapPinIcon size={13} className="flex-shrink-0 mt-0.5 text-orange-400" />
            <span className="text-xs leading-relaxed line-clamp-1">{activity.location.name}</span>
          </div>
        )}
        {activity.description && (
          <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{activity.description}</p>
        )}
      </div>
    </div>
  );
};

const TravelActivityCard = ({ activity, isEditMode }: any) => {
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
      <div className="bg-orange-500/10 p-3 rounded-full">{getIcon()}</div>
      <div className="flex-1">
        <h3 className="font-semibold text-white">{activity.title}</h3>
        {activity.description && <p className="text-sm text-gray-400">{activity.description}</p>}
      </div>
    </div>
  );
};

// UPDATED GoogleFormActivityCard Component
// Fixed mobile edit controls and added image management

const GoogleFormActivityCard = ({ 
  activity, 
  isEditMode, 
  dayIndex, 
  activityIndex, 
  totalActivities, 
  onDelete, 
  onUpdate, 
  onToggleCollapse, 
  onDragStart, 
  onDragOver, 
  onDrop, 
  onMoveUp, 
  onMoveDown 
}: any) => {
  const isCollapsed = activity.collapsed || false;
  const [isHovered, setIsHovered] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setImagePreview(imageUrl);
        // Update activity with new image
        onUpdate('media', [{ url: imageUrl, type: 'image' }]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image removal
  const handleRemoveImage = () => {
    setImagePreview('');
    onUpdate('media', []);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle add image button click
  const handleAddImageClick = () => {
    fileInputRef.current?.click();
  };

  const currentImage = activity.media?.[0]?.url || imagePreview;

  return (
    <div 
      draggable={isEditMode} 
      onDragStart={(e) => onDragStart(e, dayIndex, activityIndex)} 
      onDragOver={onDragOver} 
      onDrop={(e) => onDrop(e, dayIndex, activityIndex)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative mb-4 bg-gray-900 rounded-xl border-2 transition-all ${
        isEditMode ? 'border-gray-700 hover:border-orange-500 focus-within:border-orange-500' : 'border-transparent'
      }`}
    >
      {/* MOBILE EDIT CONTROLS - Floating on the right side, always visible in edit mode */}
      {isEditMode && (
        <>
          {/* Mobile Controls - Visible only on mobile/tablet */}
          <div className="lg:hidden absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
            <div className="flex flex-col gap-1 bg-white/5 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-gray-700">
              <button
                onClick={onMoveUp}
                disabled={activityIndex === 0}
                className={`p-2 rounded transition-colors ${
                  activityIndex === 0
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-orange-500 active:bg-gray-600'
                }`}
                title="Move up"
              >
                <ChevronUp size={16} />
              </button>
              <button
                onClick={onMoveDown}
                disabled={activityIndex === totalActivities - 1}
                className={`p-2 rounded transition-colors ${
                  activityIndex === totalActivities - 1
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-orange-500 active:bg-gray-600'
                }`}
                title="Move down"
              >
                <ChevronDown size={16} />
              </button>
            </div>
          </div>

          {/* Desktop Controls - Hover activated */}
          <div className="hidden lg:block">
            {(isHovered) && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full flex items-center gap-2 pl-2 z-10">
                {/* 6-Dot Drag Handle */}
                <button 
                  className="cursor-grab active:cursor-grabbing bg-gray-800 rounded-lg p-2 shadow-lg border border-gray-700 hover:bg-gray-700 transition-colors touch-none"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="text-gray-500">
                    <circle cx="7" cy="5" r="1.5" />
                    <circle cx="13" cy="5" r="1.5" />
                    <circle cx="7" cy="10" r="1.5" />
                    <circle cx="13" cy="10" r="1.5" />
                    <circle cx="7" cy="15" r="1.5" />
                    <circle cx="13" cy="15" r="1.5" />
                  </svg>
                </button>

                {/* Up/Down Arrows */}
                <div className="flex flex-col gap-1 bg-gray-800 rounded-lg p-1 shadow-lg border border-gray-700">
                  <button
                    onClick={onMoveUp}
                    disabled={activityIndex === 0}
                    className={`p-1.5 rounded transition-colors ${
                      activityIndex === 0
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-400 hover:bg-gray-700 hover:text-orange-500 active:bg-gray-600'
                    }`}
                    title="Move up"
                  >
                    <ChevronUp size={18} />
                  </button>
                  <button
                    onClick={onMoveDown}
                    disabled={activityIndex === totalActivities - 1}
                    className={`p-1.5 rounded transition-colors ${
                      activityIndex === totalActivities - 1
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-400 hover:bg-gray-700 hover:text-orange-500 active:bg-gray-600'
                    }`}
                    title="Move down"
                  >
                    <ChevronDown size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3 flex-1 pr-8 lg:pr-0">
          {isCollapsed ? (
            <div className="flex-1">
              <h3 className="font-semibold text-white">{activity.title}</h3>
              <p className="text-xs text-gray-400 mt-1 font-bold">{activity.time}</p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-orange-400" />
              <span className="text-sm text-gray-400 font-bold">{activity.time}</span>
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

      {!isCollapsed && (
        <div className="p-4 space-y-4">
          {/* Image Section with Edit Controls */}
          {isEditMode ? (
            <div>
              <label className="block text-sm text-gray-400 mb-2">Activity Image</label>
              {currentImage ? (
                <div className="relative h-48 rounded-lg overflow-hidden bg-gray-800 group">
                  <img 
                    src={currentImage} 
                    alt={activity.title} 
                    className="w-full h-full object-cover" 
                  />
                  {/* Image Controls Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={handleRemoveImage}
                      className="p-3 bg-red-500 hover:bg-red-600 rounded-full transition-colors shadow-lg"
                      title="Remove image"
                    >
                      <Trash2 size={20} className="text-white" />
                    </button>
                    <button
                      onClick={handleAddImageClick}
                      className="p-3 bg-orange-500 hover:bg-orange-600 rounded-full transition-colors shadow-lg"
                      title="Change image"
                    >
                      <Edit2 size={20} className="text-white" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleAddImageClick}
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-orange-500 transition-colors bg-gray-800/50 group"
                >
                  <Plus size={40} className="text-gray-500 group-hover:text-orange-500 transition-colors mb-2" />
                  <p className="text-sm text-gray-400 group-hover:text-orange-400 transition-colors">
                    Click to add image
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                </button>
              )}
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          ) : (
            // View Mode - Show image if exists
            currentImage && (
              <div className="relative h-48 rounded-lg overflow-hidden bg-gray-800">
                <img 
                  src={currentImage} 
                  alt={activity.title} 
                  className="w-full h-full object-cover" 
                  onError={(e) => { (e.currentTarget.parentElement as HTMLElement)?.remove(); }} 
                />
              </div>
            )
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
                <select
                  value={activity.time || 'Morning'}
                  onChange={(e) => onUpdate('time', e.target.value)}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none font-bold cursor-pointer"
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                </select>
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
                <LocationInput
                  value={activity.location?.name || ''}
                  onChange={(locationData) => onUpdate('location', locationData)}
                  placeholder="Search for a location..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Start typing to search with Google Places
                </p>
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