'use client'
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  X, 
  MapPin, 
  Calendar, 
  ArrowLeft, 
  ArrowRight, 
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Trash2,
  DollarSign,
  Car,
  Info
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
  uploadedUrl?: any;
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
  const [currentStep, setCurrentStep] = useState<'upload' | 'organize' | 'details'>('upload');
  const [photos, setPhotos] = useState<PhotoWithMetadata[]>([]);
  const [dayGroups, setDayGroups] = useState<DayGrouping[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [currentDetailIndex, setCurrentDetailIndex] = useState(0);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [exifToast, setExifToast] = useState<{ show: boolean; count: number }>({ show: false, count: 0 });
  const [selectedCoverPhotoId, setSelectedCoverPhotoId] = useState<string | null>(null);


  // Calculate number of days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dayCount = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1);

  // Initialize day groups
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

  // Handle file selection with EXIF extraction
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) return false;
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });
    

    // Create photo objects with EXIF extraction
    const newPhotosPromises = validFiles.map(async (file) => {
      const preview = URL.createObjectURL(file);
      const photoId = `${Date.now()}-${Math.random().toString(36)}`;
      
      // Try to extract location from EXIF
      let location: PhotoWithMetadata['location'] | undefined;
      try {
        const exifLocation = await extractLocationFromPhoto(file);
        if (exifLocation) {
          location = exifLocation;
          console.log(`📍 Auto-detected location for ${file.name}:`, exifLocation.name);
        }
      } catch (error) {
        console.log(`No location data in ${file.name}`);
      }
      
      return {
        id: photoId,
        file,
        preview,
        uploadStatus: 'pending' as const,
        location
      };
    });

    const newPhotos = await Promise.all(newPhotosPromises);
    setPhotos(prev => [...prev, ...newPhotos]);
    
    // Show toast if locations were detected
    const photosWithLocation = newPhotos.filter(p => p.location);
    if (photosWithLocation.length > 0) {
      setExifToast({ show: true, count: photosWithLocation.length });
      setTimeout(() => {
        setExifToast({ show: false, count: 0 });
      }, 4000);
    }
  }, []);

  // Upload photos with compression
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
          uploadedUrl: url,
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

  // Remove photo
  const removePhoto = (photoId: string) => {
    setPhotos(prev => {
      const photo = prev.find(p => p.id === photoId);
      if (photo) URL.revokeObjectURL(photo.preview);
      return prev.filter(p => p.id !== photoId);
    });
    
    // Also remove from day groups
    setDayGroups(prev => prev.map(group => ({
      ...group,
      photos: group.photos.filter(p => p.id !== photoId)
    })));
  };

  // Assign photo to day - FIXED LOGIC
  const assignPhotoToDay = (photoId: string, day: number) => {
    const photoToMove = photos.find(p => p.id === photoId);
    if (!photoToMove) return;

    // Create the updated photo object first to ensure data consistency
    const updatedPhoto = { ...photoToMove, dayAssigned: day };

    // Update the master photos list with the new object
    setPhotos(prev => prev.map(p => 
      p.id === photoId ? updatedPhoto : p
    ));

    // Update the day groups using the same updated photo object
    setDayGroups(prev => {
      // Create a new copy, removing the photo from any group it might already be in
      const newGroups = prev.map(group => ({
        ...group,
        photos: group.photos.filter(p => p.id !== photoId)
      }));

      // Find the target group to add the photo to
      const targetGroup = newGroups.find(g => g.day === day);
      
      if (targetGroup) {
        // Push the fully updated photo object
        targetGroup.photos.push(updatedPhoto);
      }

      return newGroups;
    });
  };

  // Reorder photos within a day
  const reorderPhotosInDay = (day: number, fromIndex: number, toIndex: number) => {
    setDayGroups(prev => prev.map(group => {
      if (group.day !== day) return group;
      
      const newPhotos = [...group.photos];
      const [removed] = newPhotos.splice(fromIndex, 1);
      newPhotos.splice(toIndex, 0, removed);
      
      return { ...group, photos: newPhotos };
    }));
  };

  // Update photo details
  const updatePhotoDetails = (photoId: string, updates: Partial<PhotoWithMetadata>) => {
    setPhotos(prev => prev.map(p => 
      p.id === photoId ? { ...p, ...updates } : p
    ));
    
    setDayGroups(prev => prev.map(group => ({
      ...group,
      photos: group.photos.map(p => p.id === photoId ? { ...p, ...updates } : p)
    })));
  };

  // Get all photos that need details
  const photosNeedingDetails = React.useMemo(() => {
    const allPhotos = dayGroups.flatMap(group => group.photos);
    return allPhotos.filter(p => p.dayAssigned && p.uploadStatus === 'success');
  }, [dayGroups]);

  // Create quest
 // Create quest
const handleCreateQuest = async () => {
  setCreating(true);
  
  try {
    // Build itinerary from day groups
    const itineraryData = {
      days: dayGroups.map(group => ({
        day: group.day,
        date: group.date,
        title: `Day ${group.day} in ${destination}`,
        activities: group.photos.map((photo, idx) => ({
          time: `${8 + idx * 2}:00`,
          title: photo.title || `Stop ${idx + 1}`,
          description: photo.description || '',
          location: photo.location ? {
            name: photo.location.name,
            coordinates: photo.location.coordinates,
            placeId: photo.location.placeId
          } : undefined,
          media: photo.uploadedUrl ? [{
            type: 'image' as const,
            url: photo.uploadedUrl,
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
      title: `Trip to ${destination}` // ADD A TITLE
    };

    const coverImage = photos.length > 0 && photos[0].uploadedUrl 
      ? photos[0].file 
      : undefined;

    const getCoverImageFile = (): File | undefined => {
        if (selectedCoverPhotoId) {
            const coverPhoto = photos.find(p => p.id === selectedCoverPhotoId);
            return coverPhoto?.file;
        }
        // Default to first photo
        return photos.length > 0 ? photos[0].file : undefined;
        };

    const result = await questService.createQuest(
    userId, 
    questPayload, 
    itineraryData,
    getCoverImageFile(), // Use the selected or first photo
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

  // Render upload step
  const renderUploadStep = () => (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Upload Your Travel Photos</h2>
        <p className="text-gray-400">Upload all the photos from your trip to {destination}</p>
      </div>

      {/* Upload Area */}
      <label className="block mb-8">
        <div className="border-2 border-dashed border-gray-600 rounded-2xl p-12 text-center hover:border-orange-500 transition-colors cursor-pointer bg-gray-900/50">
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-white mb-2">Click to upload or drag and drop</p>
          <p className="text-sm text-gray-400">PNG, JPG, WEBP up to 10MB each</p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </label>

      {/* Photos Grid */}
      {photos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">
              {photos.length} photo{photos.length !== 1 ? 's' : ''} selected
            </h3>
            {photos.some(p => p.uploadStatus === 'pending') && (
              <button
                onClick={uploadPhotos}
                disabled={uploading}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload All'
                )}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.map(photo => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.preview}
                  alt="Travel photo"
                  className="w-full h-48 object-cover rounded-lg"
                />
                
                {/* Status Overlay */}
                <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {photo.uploadStatus === 'pending' && (
                    <span className="text-white text-sm">Pending</span>
                  )}
                  {photo.uploadStatus === 'uploading' && (
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
                      <span className="text-white text-sm">{photo.uploadProgress}%</span>
                    </div>
                  )}
                  {photo.uploadStatus === 'success' && (
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  )}
                  {photo.uploadStatus === 'error' && (
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  )}
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-12">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-600 text-white rounded-xl hover:border-gray-500 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        
        <button
          onClick={() => {
            if (photos.some(p => p.uploadStatus !== 'success')) {
              alert('Please upload all photos before continuing');
              return;
            }
            setCurrentStep('organize');
          }}
          disabled={photos.length === 0 || photos.some(p => p.uploadStatus !== 'success')}
          className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Continue
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  // Render organize step
  const renderOrganizeStep = () => (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Organize Photos by Day</h2>
        <p className="text-gray-400">Drag photos to the correct day and arrange them in order</p>
      </div>

      {/* Day Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {dayGroups.map(group => (
          <button
            key={group.day}
            onClick={() => setSelectedDay(group.day)}
            className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedDay === group.day
                ? 'bg-orange-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Day {group.day}
            {group.photos.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {group.photos.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Select Cover Photo</h3>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
            {photos.map(photo => (
            <button
                key={photo.id}
                onClick={() => setSelectedCoverPhotoId(photo.id)}
                className={`relative hover:scale-105 transition-transform ${
                selectedCoverPhotoId === photo.id ? 'ring-4 ring-orange-500' : ''
                }`}
            >
                <img
                src={photo.preview}
                alt="Cover option"
                className="w-full h-24 object-cover rounded-lg"
                />
                {selectedCoverPhotoId === photo.id && (
                <div className="absolute inset-0 bg-orange-500/30 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                )}
            </button>
            ))}
        </div>
        </div>

      {/* Current Day Content */}
      <div className="bg-gray-900 rounded-2xl p-6 mb-6 min-h-[400px]">
        <h3 className="text-xl font-semibold text-white mb-4">
          Day {selectedDay} - {new Date(dayGroups[selectedDay - 1]?.date).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </h3>

        {dayGroups[selectedDay - 1]?.photos.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No photos assigned to this day yet</p>
            <p className="text-sm text-gray-500 mt-2">Select photos from below to add them</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {dayGroups[selectedDay - 1]?.photos.map((photo, idx) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.preview}
                  alt={`Stop ${idx + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {idx + 1}
                </div>
                <button
                  onClick={() => {
                    const photoToRemove = photo.id;
                    setDayGroups(prev => prev.map(g => ({
                      ...g,
                      photos: g.photos.filter(p => p.id !== photoToRemove)
                    })));
                    setPhotos(prev => prev.map(p => 
                      p.id === photoToRemove ? { ...p, dayAssigned: undefined } : p
                    ));
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unassigned Photos */}
      <div className="bg-gray-900 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Unassigned Photos ({photos.filter(p => !p.dayAssigned).length})
        </h3>
        
        {photos.filter(p => !p.dayAssigned).length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-400">All photos have been organized!</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
            {photos.filter(p => !p.dayAssigned).map(photo => (
              <button
                key={photo.id}
                onClick={() => assignPhotoToDay(photo.id, selectedDay)}
                className="relative group hover:scale-105 transition-transform"
              >
                <img
                  src={photo.preview}
                  alt="Unassigned"
                  className="w-full h-24 object-cover rounded-lg border-2 border-gray-700 hover:border-orange-500"
                />
                <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-medium">Add to Day {selectedDay}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setCurrentStep('upload')}
          className="px-6 py-3 border border-gray-600 text-white rounded-xl hover:border-gray-500 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        
        <button
          onClick={() => {
            if (photos.some(p => !p.dayAssigned)) {
              if (!confirm('Some photos are not assigned. Continue anyway?')) return;
            }
            setCurrentDetailIndex(0); // Reset index when moving to details
            setCurrentStep('details');
          }}
          disabled={dayGroups.every(g => g.photos.length === 0)}
          className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Add Details
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  // Render details step
  const renderDetailsStep = () => {
    const currentPhoto = photosNeedingDetails[currentDetailIndex];
    
    if (photosNeedingDetails.length === 0) {
      return (
        <div className="max-w-2xl mx-auto text-center py-20">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-white text-2xl font-bold mb-2">No Photos to Add Details For</h2>
          <p className="text-gray-400 mb-6">It looks like no photos were organized into days. Please go back and assign photos.</p>
          <button
            onClick={() => setCurrentStep('organize')}
            className="px-6 py-3 border border-gray-600 text-white rounded-xl hover:border-gray-500 transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Organize
          </button>
        </div>
      );
    }
    
    if (!currentPhoto) {
      // This can happen if the index is out of bounds, handle gracefully
      return (
         <div className="max-w-2xl mx-auto text-center py-20">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-white text-2xl font-bold mb-2">All Details Added!</h2>
          <p className="text-gray-400 mb-6">You're ready to create your quest.</p>
           <button
              onClick={handleCreateQuest}
              disabled={creating}
              className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              {creating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Quest...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Create Quest
                </>
              )}
            </button>
        </div>
      )
    }

    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-white">Add Photo Details</h2>
            <span className="text-gray-400">
              {currentDetailIndex + 1} of {photosNeedingDetails.length}
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentDetailIndex + 1) / photosNeedingDetails.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 mb-6">
          <div className="relative">
            <img
              src={currentPhoto.preview}
              alt="Current location"
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
            {currentPhoto.location && (
              <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium shadow-lg">
                <MapPin className="w-4 h-4" />
                Auto-detected
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Location - Required */}
            <div>
              <label className="flex items-center gap-2 text-white font-medium mb-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                Location <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowLocationModal(true)}
                className="w-full bg-gray-800 text-left text-white px-4 py-3 rounded-lg border border-gray-700 hover:border-orange-500 focus:border-orange-500 focus:outline-none transition-colors"
              >
                {currentPhoto.location?.name || 'Click to search location...'}
              </button>
              {currentPhoto.location?.name && (
                <p className="text-xs text-gray-400 mt-1">
                  {currentPhoto.location.name}
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="flex items-center gap-2 text-white font-medium mb-2">
                <Info className="w-5 h-5 text-blue-500" />
                Title
              </label>
              <input
                type="text"
                placeholder="Give this place a title"
                value={currentPhoto.title || ''}
                onChange={(e) => updatePhotoDetails(currentPhoto.id, { title: e.target.value })}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-white font-medium mb-2 block">Description</label>
              <textarea
                placeholder="Tell us about this place..."
                value={currentPhoto.description || ''}
                onChange={(e) => updatePhotoDetails(currentPhoto.id, { description: e.target.value })}
                rows={3}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none resize-none"
              />
            </div>

            {/* Budget */}
            <div>
              <label className="flex items-center gap-2 text-white font-medium mb-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                Approximate Cost (₹)
              </label>
              <input
                type="number"
                placeholder="0"
                value={currentPhoto.budget || ''}
                onChange={(e) => updatePhotoDetails(currentPhoto.id, { budget: parseInt(e.target.value) || 0 })}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
              />
            </div>

            {/* Transport Mode */}
            <div>
              <label className="flex items-center gap-2 text-white font-medium mb-2">
                <Car className="w-5 h-5 text-purple-500" />
                How did you get here?
              </label>
              <select
                value={currentPhoto.transportMode || 'walking'}
                onChange={(e) => updatePhotoDetails(currentPhoto.id, { transportMode: e.target.value })}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
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
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => {
              if (currentDetailIndex > 0) {
                setCurrentDetailIndex(currentDetailIndex - 1);
              } else {
                setCurrentStep('organize');
              }
            }}
            className="px-6 py-3 border border-gray-600 text-white rounded-xl hover:border-gray-500 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          {currentDetailIndex < photosNeedingDetails.length - 1 ? (
            <button
              onClick={() => {
                if (!currentPhoto.location?.name) {
                  alert('Please add a location before continuing');
                  return;
                }
                setCurrentDetailIndex(currentDetailIndex + 1);
              }}
              className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleCreateQuest}
              disabled={creating || !currentPhoto.location?.name}
              className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {creating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Quest...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Create Quest
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white py-8 px-4">
      {currentStep === 'upload' && renderUploadStep()}
      {currentStep === 'organize' && renderOrganizeStep()}
      {currentStep === 'details' && renderDetailsStep()}
      
      <LocationSearchModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationSelect={(location) => {
          const currentPhoto = photosNeedingDetails[currentDetailIndex];
          if (currentPhoto) {
            updatePhotoDetails(currentPhoto.id, { location });
          }
        }}
        initialValue={photosNeedingDetails[currentDetailIndex]?.location?.name}
      />
      
      {/* EXIF Detection Toast */}
      {exifToast.show && (
        <div className="fixed bottom-8 right-8 z-50 animate-slide-up">
          <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-green-500">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">Locations Auto-Detected!</p>
              <p className="text-sm text-green-100">
                Found location data in {exifToast.count} photo{exifToast.count > 1 ? 's' : ''}
              </p>
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
      `}</style>
    </div>
  );
};

export default PhotoBasedQuestCreation;


