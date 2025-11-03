'use client'
import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  X,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Trash2,
  DollarSign,
  Car,
  Info,
  Camera
} from 'lucide-react';
import { compressAndUploadImage } from '@/lib/imageService';
import questService from '@/lib/questService';
import { extractLocationFromPhoto } from '@/lib/exifExtractor';
import LocationSearchModal from './LocationSearchModal';
interface PhotoWithMetadata {
  id: string;
  file: File;
  preview: string;
  uploadStatus: 'pending' | 'uploading' | 'success' | 'error';
  imageUrl?: string;
  uploadProgress?: number;
  dayAssigned?: number;
  location?: {
    name: string;
    coordinates: { lat: number; lng: number };
    placeId: string;
  };
  title?: string;
  description?: string;
  budget?: number;
  transportMode?: string;
  isCollapsed?: boolean;
}
interface DayGrouping {
  day: number;
  date: string;
  photos: PhotoWithMetadata[];
}
interface PhotoQuestCreationProps {
  userId: string;
  destination: string;
  startDate: string;
  endDate: string;
  onBack: () => void;
}
const PhotoBasedQuestCreation: React.FC<PhotoQuestCreationProps> = ({
  userId,
  destination,
  startDate,
  endDate,
  onBack
}) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<'upload' | 'organize' | 'cover'>('upload');
  const [photos, setPhotos] = useState<PhotoWithMetadata[]>([]);
  const [dayGroups, setDayGroups] = useState<DayGrouping[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [currentPhotoForLocation, setCurrentPhotoForLocation] = useState<string | null>(null);
  const [exifToast, setExifToast] = useState<{ show: boolean; count: number }>({ show: false, count: 0 });
  const [selectedCoverPhotoId, setSelectedCoverPhotoId] = useState<string | null>(null);
  const [newCoverImage, setNewCoverImage] = useState<File | null>(null);
  const [newCoverPreview, setNewCoverPreview] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const photoRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dayCount = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1);
  React.useEffect(() => {
    const groups: DayGrouping[] = Array.from({ length: dayCount }, (_, i) => {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      return {
        day: i + 1,
        date: currentDate.toISOString().split('T')[0],
        photos: []
      };
    });
    setDayGroups(groups);
  }, [dayCount, startDate]);
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
   
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) return false;
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });
    const newPhotosPromises = validFiles.map(async (file) => {
      const preview = URL.createObjectURL(file);
      const photoId = `${Date.now()}-${Math.random().toString(36)}`;
     
      let location: PhotoWithMetadata['location'] | undefined;
      try {
        const exifLocation = await extractLocationFromPhoto(file);
        if (exifLocation) {
          location = exifLocation;
        }
      } catch (error) {
        console.log(`No location data in ${file.name}`);
      }
     
      return {
        id: photoId,
        file,
        preview,
        uploadStatus: 'pending' as const,
        location,
        isCollapsed: false
      };
    });
    const newPhotos = await Promise.all(newPhotosPromises);
    setPhotos(prev => [...prev, ...newPhotos]);
   
    const photosWithLocation = newPhotos.filter(p => p.location);
    if (photosWithLocation.length > 0) {
      setExifToast({ show: true, count: photosWithLocation.length });
      setTimeout(() => setExifToast({ show: false, count: 0 }), 4000);
    }
  }, []);
  const uploadPhotos = async () => {
    setUploading(true);
   
    const uploadPromises = photos.map(async (photo) => {
      if (photo.uploadStatus === 'success') return photo;
     
      try {
        setPhotos(prev => prev.map(p =>
          p.id === photo.id ? { ...p, uploadStatus: 'uploading' as const, uploadProgress: 0 } : p
        ));
        const url = await compressAndUploadImage(photo.file, 'quests', userId);
       
        const successUpdate = {
          uploadStatus: 'success' as const,
          imageUrl: url,
          uploadProgress: 100
        };
        setPhotos(prev => prev.map(p =>
          p.id === photo.id ? { ...p, ...successUpdate } : p
        ));
        return { ...photo, ...successUpdate };
      } catch (error) {
        console.error('Upload error:', error);
        setPhotos(prev => prev.map(p =>
          p.id === photo.id ? { ...p, uploadStatus: 'error' as const } : p
        ));
        return { ...photo, uploadStatus: 'error' as const };
      }
    });
    await Promise.all(uploadPromises);
    setUploading(false);
  };
  const removePhoto = (photoId: string) => {
    setPhotos(prev => {
      const photo = prev.find(p => p.id === photoId);
      if (photo) URL.revokeObjectURL(photo.preview);
      return prev.filter(p => p.id !== photoId);
    });
   
    setDayGroups(prev => prev.map(group => ({
      ...group,
      photos: group.photos.filter(p => p.id !== photoId)
    })));
    if (selectedCoverPhotoId === photoId) {
      setSelectedCoverPhotoId(null);
    }
  };
  const assignPhotoToDay = (photoId: string) => {
    const photoToMove = photos.find(p => p.id === photoId);
    if (!photoToMove) return;
    const updatedPhoto = { ...photoToMove, dayAssigned: selectedDay, isCollapsed: false };
    setPhotos(prev => prev.map(p =>
      p.id === photoId ? updatedPhoto : p
    ));
    setDayGroups(prev => {
      const newGroups = prev.map(group => ({
        ...group,
        photos: group.photos.filter(p => p.id !== photoId)
      }));
      const targetGroup = newGroups.find(g => g.day === selectedDay);
     
      if (targetGroup) {
        targetGroup.photos.push(updatedPhoto);
      }
      return newGroups;
    });
  };
  const updatePhotoDetails = (photoId: string, updates: Partial<PhotoWithMetadata>) => {
    setPhotos(prev => prev.map(p =>
      p.id === photoId ? { ...p, ...updates } : p
    ));
   
    setDayGroups(prev => prev.map(group => ({
      ...group,
      photos: group.photos.map(p => p.id === photoId ? { ...p, ...updates } : p)
    })));
  };
  const isCurrentDayValid = () => {
    const currentDayPhotos = dayGroups[selectedDay - 1]?.photos || [];
    if (currentDayPhotos.length === 0) return true;
   
    return currentDayPhotos.every(photo =>
      photo.location?.name &&
      photo.title?.trim() &&
      photo.description?.trim()
    );
  };
  const handleNext = async () => {
    if (!isCurrentDayValid()) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 4000);
      return;
    }
    if (selectedDay < dayCount) {
      setSelectedDay(selectedDay + 1);
    } else {
      // Go to cover selection
      setCurrentStep('cover');
      // Auto-select first photo if none selected
      if (!selectedCoverPhotoId && photos.length > 0) {
        setSelectedCoverPhotoId(photos[0].id);
      }
    }
  };
  const handlePrevious = () => {
    if (currentStep === 'cover') {
      setCurrentStep('organize');
      setSelectedDay(dayCount); // Go back to last day
    } else if (selectedDay > 1) {
      setSelectedDay(selectedDay - 1);
    } else {
      setCurrentStep('upload');
    }
  };
  const handleNewCoverImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Image too large. Maximum size is 10MB.');
      return;
    }
    setNewCoverImage(file);
    setNewCoverPreview(URL.createObjectURL(file));
    setSelectedCoverPhotoId(null); // Deselect existing photos
  };
  const handleCreateQuest = async () => {
    setCreating(true);
   
    try {
      const getTimeSlot = (idx: number) => {
        if (idx < 3) return 'Morning';
        if (idx < 6) return 'Afternoon';
        if (idx < 9) return 'Evening';
        return 'Night';
      };
      const getTimeForSlot = (slot: string, idx: number) => {
        switch(slot) {
          case 'Morning': return `${6 + idx}:00`;
          case 'Afternoon': return `${12 + idx}:00`;
          case 'Evening': return `${17 + idx}:00`;
          case 'Night': return `${20 + idx}:00`;
          default: return '12:00';
        }
      };
      const itineraryData = {
        days: dayGroups.map(group => ({
          day: group.day,
          date: group.date,
          title: `Day ${group.day} in ${destination}`,
          activities: group.photos.map((photo, idx) => ({
            timeSlot: getTimeSlot(idx),
            time: getTimeForSlot(getTimeSlot(idx), idx % 3),
            title: photo.title || `Stop ${idx + 1}`,
            description: photo.description || '',
            location: photo.location ? {
              name: photo.location.name,
              coordinates: photo.location.coordinates,
              placeId: photo.location.placeId
            } : undefined,
            media: photo.imageUrl ? [{
              type: 'image' as const,
              url: photo.imageUrl,
              caption: photo.title || ''
            }] : [],
            budget: photo.budget || 0,
            transportMode: photo.transportMode || 'walking'
          }))
        }))
      };
      const questPayload = {
        destination,
        startDate,
        endDate,
        source: '',
        transportMode: [],
        tripType: 'solo',
        preferences: [],
        budget: 0,
        title: `Trip to ${destination}`
      };
      // Determine cover image
      let coverImageFile: File | undefined;
      if (newCoverImage) {
        coverImageFile = newCoverImage;
      } else if (selectedCoverPhotoId) {
        const selectedPhoto = photos.find(p => p.id === selectedCoverPhotoId);
        coverImageFile = selectedPhoto?.file;
      } else if (photos.length > 0) {
        coverImageFile = photos[0].file;
      }
      const result = await questService.createQuest(
        userId,
        questPayload,
        itineraryData,
        coverImageFile,
        []
      );
     
      if (result.success && result.questId) {
        router.push(`/quest/${result.questId}`);
      } else {
        throw new Error('Failed to create quest');
      }
    } catch (error) {
      console.error('Error creating quest:', error);
      alert('Failed to create quest. Please try again.');
    } finally {
      setCreating(false);
    }
  };
  if (creating) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-orange-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Creating Your Quest</h2>
          <p className="text-sm sm:text-base text-gray-400">Organizing your journey...</p>
        </div>
      </div>
    );
  }
  const renderUploadStep = () => (
    <div className="max-w-4xl mx-auto pb-32 px-4 sm:px-0">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Upload Your Travel Photos</h2>
        <p className="text-sm sm:text-base text-gray-400">Upload all the photos from your trip to {destination}</p>
      </div>
      <label className="block mb-6 sm:mb-8">
        <div className="border-2 border-dashed border-gray-600 rounded-2xl p-8 sm:p-12 text-center hover:border-orange-500 transition-colors cursor-pointer bg-gray-900/50">
          <Upload className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg sm:text-xl text-white mb-2">Click to upload or drag and drop</p>
          <p className="text-xs sm:text-sm text-gray-400">PNG, JPG, WEBP up to 10MB each</p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </label>
      {photos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-white">
              {photos.length} photo{photos.length !== 1 ? 's' : ''} selected
            </h3>
            {photos.some(p => p.uploadStatus === 'pending') && (
              <button
                onClick={uploadPhotos}
                disabled={uploading}
                className="px-4 sm:px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Uploading...</span>
                  </>
                ) : (
                  'Upload All'
                )}
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {photos.map(photo => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.preview}
                  alt="Travel photo"
                  className="w-full h-32 sm:h-48 object-cover rounded-lg"
                />
               
                <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {photo.uploadStatus === 'pending' && (
                    <span className="text-white text-xs sm:text-sm">Pending</span>
                  )}
                  {photo.uploadStatus === 'uploading' && (
                    <div className="text-center">
                      <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-spin mx-auto mb-2" />
                      <span className="text-white text-xs sm:text-sm">{photo.uploadProgress}%</span>
                    </div>
                  )}
                  {photo.uploadStatus === 'success' && (
                    <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                  )}
                  {photo.uploadStatus === 'error' && (
                    <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                  )}
                </div>
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
  const renderOrganizeStep = () => {
    const currentDayPhotos = dayGroups[selectedDay - 1]?.photos || [];
    const unassignedPhotos = photos.filter(p => !p.dayAssigned && p.uploadStatus === 'success');
    return (
      <div className="max-w-6xl mx-auto pb-32 px-4 sm:px-0">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Day {selectedDay} of {dayCount}
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            {new Date(dayGroups[selectedDay - 1]?.date).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-gray-400">Quest Progress</span>
            <span className="text-xs sm:text-sm text-orange-500 font-medium">
              {selectedDay}/{dayCount} days
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(selectedDay / dayCount) * 100}%` }}
            />
          </div>
        </div>
                {unassignedPhotos.length > 0 && (
          <div className="bg-gray-900 rounded-2xl p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-4">
              Add Photos to This Day ({unassignedPhotos.length} remaining)
            </h3>
           
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
              {unassignedPhotos.map(photo => (
                <button
                  key={photo.id}
                  onClick={() => assignPhotoToDay(photo.id)}
                  className="relative group hover:scale-105 transition-transform"
                >
                  <img
                    src={photo.preview}
                    alt="Unassigned"
                    className="w-full h-20 sm:h-24 object-cover rounded-lg border-2 border-gray-700 hover:border-orange-500"
                  />
                  <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-medium px-1 text-center">Add</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="bg-gray-900 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">
            Photos for This Day ({currentDayPhotos.length})
          </h3>
          {currentDayPhotos.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-sm sm:text-base text-gray-400">No photos added yet</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">Select photos from below</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {currentDayPhotos.map((photo, idx) => (
                <div
                  key={photo.id}
                  ref={(el) => { photoRefs.current[photo.id] = el; }}
                  className="bg-gray-800 rounded-xl p-3 sm:p-4"
                >
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className="relative flex-shrink-0 w-full sm:w-32">
                      <img
                        src={photo.preview}
                        alt={`Stop ${idx + 1}`}
                        className="w-full h-48 sm:h-32 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {idx + 1}
                      </div>
                      <button
                        onClick={() => {
                          setDayGroups(prev => prev.map(g => ({
                            ...g,
                            photos: g.photos.filter(p => p.id !== photo.id)
                          })));
                          setPhotos(prev => prev.map(p =>
                            p.id === photo.id ? { ...p, dayAssigned: undefined } : p
                          ));
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    </div>
                    {photo.isCollapsed ? (
                      <div className="flex-1 space-y-2">
                        <h4 className="text-white font-medium text-sm sm:text-base">{photo.title}</h4>
                        <p className="text-gray-400 text-xs sm:text-sm flex items-center gap-1">
                          <MapPin className="w-4 h-4" /> {photo.location?.name}
                        </p>
                        <p className="text-gray-300 text-xs sm:text-sm">{photo.description}</p>
                        {photo.budget ? (
                          <p className="text-green-400 text-xs sm:text-sm flex items-center gap-1">
                            <DollarSign className="w-4 h-4" /> ₹{photo.budget}
                          </p>
                        ) : null}
                        {photo.transportMode ? (
                          <p className="text-purple-400 text-xs sm:text-sm flex items-center gap-1">
                            <Car className="w-4 h-4" /> {photo.transportMode}
                          </p>
                        ) : null}
                        <button
                          onClick={() => updatePhotoDetails(photo.id, { isCollapsed: false })}
                          className="text-blue-500 hover:text-blue-400 text-xs sm:text-sm font-medium"
                        >
                          Edit
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="flex items-center gap-2 text-white font-medium mb-2 text-xs sm:text-sm">
                            <MapPin className="w-4 h-4 text-orange-500" />
                            Location <span className="text-red-500">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentPhotoForLocation(photo.id);
                              setShowLocationModal(true);
                            }}
                            className={`w-full bg-gray-700 text-left text-white px-3 py-2 rounded-lg border ${
                              photo.location?.name
                                ? 'border-green-500'
                                : 'border-gray-600'
                            } hover:border-orange-500 focus:border-orange-500 focus:outline-none transition-colors text-xs sm:text-sm`}
                          >
                            {photo.location?.name || 'Click to search location...'}
                          </button>
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-white font-medium mb-2 text-xs sm:text-sm">
                            <Info className="w-4 h-4 text-blue-500" />
                            Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Give this place a title"
                            value={photo.title || ''}
                            onChange={(e) => updatePhotoDetails(photo.id, { title: e.target.value })}
                            className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none text-xs sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-white font-medium mb-2 block text-xs sm:text-sm">
                            Description <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            placeholder="Tell us about this place..."
                            value={photo.description || ''}
                            onChange={(e) => updatePhotoDetails(photo.id, { description: e.target.value })}
                            rows={2}
                            className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none resize-none text-xs sm:text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="flex items-center gap-2 text-white font-medium mb-2 text-xs">
                              <DollarSign className="w-4 h-4 text-green-500" />
                              Cost (₹)
                            </label>
                            <input
                              type="number"
                              placeholder="0"
                              value={photo.budget || ''}
                              onChange={(e) => updatePhotoDetails(photo.id, { budget: parseInt(e.target.value) || 0 })}
                              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none text-xs sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="flex items-center gap-2 text-white font-medium mb-2 text-xs">
                              <Car className="w-4 h-4 text-purple-500" />
                              Transport
                            </label>
                            <select
                              value={photo.transportMode || 'walking'}
                              onChange={(e) => updatePhotoDetails(photo.id, { transportMode: e.target.value })}
                              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none text-xs sm:text-sm"
                            >
                              <option value="walking">Walking</option>
                              <option value="car">Car</option>
                              <option value="bus">Bus</option>
                              <option value="train">Train</option>
                              <option value="flight">Flight</option>
                              <option value="bike">Bike</option>
                            </select>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            updatePhotoDetails(photo.id, { isCollapsed: true });
                            const currentIdx = currentDayPhotos.findIndex(p => p.id === photo.id);
                            const nextPhoto = currentDayPhotos[currentIdx + 1];
                            if (nextPhoto && !nextPhoto.isCollapsed) {
                              setTimeout(() => {
                                photoRefs.current[nextPhoto.id]?.scrollIntoView({ behavior: 'smooth' });
                              }, 300);
                            }
                          }}
                          disabled={!photo.location?.name || !photo.title?.trim() || !photo.description?.trim()}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };
  const renderCoverStep = () => (
    <div className="max-w-4xl mx-auto pb-32 px-4 sm:px-0">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Choose Cover Image</h2>
        <p className="text-sm sm:text-base text-gray-400">Select a photo or upload a new one as your quest cover</p>
      </div>
      {/* New Cover Image Upload */}
      <div className="mb-6 sm:mb-8">
        <label className="block cursor-pointer">
          <div className="border-2 border-dashed border-gray-600 rounded-2xl p-6 sm:p-8 text-center hover:border-orange-500 transition-colors bg-gray-900/50">
            <Camera className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <p className="text-base sm:text-lg text-white mb-2">Upload New Cover Image</p>
            <p className="text-xs sm:text-sm text-gray-400">Optional - Choose a different image for the cover</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleNewCoverImageSelect}
              className="hidden"
            />
          </div>
        </label>
        {newCoverPreview && (
          <div className="mt-4 relative">
            <img
              src={newCoverPreview}
              alt="New cover"
              className="w-full h-48 sm:h-64 object-cover rounded-xl border-4 border-orange-500"
            />
            <button
              onClick={() => {
                setNewCoverImage(null);
                setNewCoverPreview(null);
              }}
              className="absolute top-2 right-2 p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
            <div className="absolute bottom-2 left-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
              New Cover Selected ✓
            </div>
          </div>
        )}
      </div>
      {/* Existing Photos Grid */}
      {!newCoverImage && (
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Or Select from Uploaded Photos</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {photos.map(photo => (
              <button
                key={photo.id}
                onClick={() => setSelectedCoverPhotoId(photo.id)}
                className={`relative hover:scale-105 transition-transform ${
                  selectedCoverPhotoId === photo.id ? 'ring-4 ring-orange-500 scale-105' : ''
                }`}
              >
                <img
                  src={photo.preview}
                  alt="Cover option"
                  className="w-full h-32 sm:h-40 object-cover rounded-lg"
                />
                {selectedCoverPhotoId === photo.id && (
                  <div className="absolute inset-0 bg-orange-500/30 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
  return (
    <div className="min-h-screen bg-black text-white py-4 sm:py-8">
      {currentStep === 'upload' && renderUploadStep()}
      {currentStep === 'organize' && renderOrganizeStep()}
      {currentStep === 'cover' && renderCoverStep()}
     
      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 z-50 safe-bottom">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center gap-3">
            <button
              onClick={currentStep === 'upload' ? onBack : handlePrevious}
              className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-600 text-white rounded-xl hover:border-gray-500 transition-colors flex items-center gap-2 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
           
            {currentStep === 'upload' ? (
              <button
                onClick={() => {
                  if (photos.some(p => p.uploadStatus !== 'success')) {
                    alert('Please upload all photos before continuing');
                    return;
                  }
                  if (photos.length === 0) {
                    alert('Please add at least one photo');
                    return;
                  }
                  setCurrentStep('organize');
                }}
                disabled={photos.length === 0 || photos.some(p => p.uploadStatus !== 'success')}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base"
              >
                Continue
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            ) : currentStep === 'organize' ? (
              <button
                onClick={handleNext}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2 text-sm sm:text-base"
              >
                {selectedDay < dayCount ? (
                  <>
                    <span className="hidden sm:inline">Next Day</span>
                    <span className="sm:hidden">Next</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Choose Cover</span>
                    <span className="sm:hidden">Cover</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleCreateQuest}
                disabled={!selectedCoverPhotoId && !newCoverImage}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base"
              >
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                Create Quest
              </button>
            )}
          </div>
        </div>
      </div>
      <LocationSearchModal
        isOpen={showLocationModal}
        onClose={() => {
          setShowLocationModal(false);
          setCurrentPhotoForLocation(null);
        }}
        onLocationSelect={(location) => {
          if (currentPhotoForLocation) {
            updatePhotoDetails(currentPhotoForLocation, { location });
          }
        }}
        initialValue={
          currentPhotoForLocation
            ? photos.find(p => p.id === currentPhotoForLocation)?.location?.name
            : undefined
        }
      />
     
      {exifToast.show && (
        <div className="fixed bottom-20 sm:bottom-24 right-4 sm:right-8 z-50 animate-slide-up max-w-xs sm:max-w-sm">
          <div className="bg-green-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-green-500">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm sm:text-base">Locations Auto-Detected!</p>
              <p className="text-xs sm:text-sm text-green-100">
                Found in {exifToast.count} photo{exifToast.count > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {showWarning && (
        <div className="fixed bottom-20 sm:bottom-24 right-4 sm:right-8 z-50 animate-slide-up max-w-xs sm:max-w-sm">
          <div className="bg-red-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-red-500">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm sm:text-base">Missing Details</p>
              <p className="text-xs sm:text-sm text-red-100">Please enter title, location, and description for all photos</p>
            </div>
          </div>
        </div>
      )}
     
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .safe-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
};
export default PhotoBasedQuestCreation;