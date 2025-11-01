// components/QuestPopups/index.tsx - COMPLETELY REWRITTEN

import React, { useState, useRef } from 'react';
import { X, Upload, Globe, Lock, AlertCircle, Crop } from 'lucide-react';
import ReactCrop, { Crop as CropType } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface CoverImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  questTitle: string;
}

export const CoverImageModal = ({ 
  isOpen, 
  onClose, 
  onUpload, 
  questTitle 
}: CoverImageModalProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropType>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0
  });
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'original' | 'square' | 'landscape' | 'portrait'>('landscape');
  
  const imageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Aspect ratio presets (same as regular posts)
  const aspectRatios = {
    original: undefined,
    square: 1, // 1:1
    landscape: 16 / 9, // 16:9
    portrait: 4 / 5 // 4:5
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
        // Reset crop when new image is selected
        setCrop({
          unit: '%',
          width: 100,
          height: 100,
          x: 0,
          y: 0
        });
        setCroppedImageUrl(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAspectRatioChange = (ratio: typeof aspectRatio) => {
    setAspectRatio(ratio);
    // Reset crop to fit new aspect ratio
    setCrop({
      unit: '%',
      width: 100,
      height: 100,
      x: 0,
      y: 0
    });
    setCroppedImageUrl(null);
  };

  const getCroppedImg = async (): Promise<File> => {
    return new Promise((resolve, reject) => {
      if (!imageRef.current || !crop.width || !crop.height) {
        reject(new Error('No image or crop data'));
        return;
      }

      const image = imageRef.current;
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      
      // Calculate crop dimensions
      const pixelCrop = {
        x: (crop.x / 100) * image.width * scaleX,
        y: (crop.y / 100) * image.height * scaleY,
        width: (crop.width / 100) * image.width * scaleX,
        height: (crop.height / 100) * image.height * scaleY
      };

      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          const file = new File([blob], selectedImage?.name || 'cropped-image.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(file);
        },
        'image/jpeg',
        0.92 // Compression quality
      );
    });
  };

  const handleApplyCrop = async () => {
    try {
      const croppedFile = await getCroppedImg();
      const reader = new FileReader();
      reader.onloadend = () => {
        setCroppedImageUrl(reader.result as string);
      };
      reader.readAsDataURL(croppedFile);
      setSelectedImage(croppedFile);
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) return;
    
    setUploading(true);
    try {
      // If cropped, the selectedImage already contains the cropped file
      await onUpload(selectedImage);
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImageSrc(null);
    setCroppedImageUrl(null);
    setCrop({
      unit: '%',
      width: 100,
      height: 100,
      x: 0,
      y: 0
    });
    setAspectRatio('landscape');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full border border-gray-700 my-8">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-bold text-white">Add Cover Image</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <p className="text-gray-300 text-sm mb-4">
            Add a cover image for <span className="text-orange-500 font-semibold">"{questTitle}"</span>
          </p>

          {!imageSrc ? (
            /* Upload Area */
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-16 hover:border-orange-500 transition-all duration-200 bg-gray-800 hover:bg-gray-750">
                <div className="flex flex-col items-center gap-4 text-gray-400">
                  <Upload size={56} className="text-orange-500" />
                  <div className="text-center">
                    <span className="text-lg font-medium text-white block mb-2">
                      Click to upload cover image
                    </span>
                    <p className="text-sm text-gray-400">
                      PNG, JPG up to 5MB • Best quality: 1920x1080
                    </p>
                  </div>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          ) : (
            <div className="space-y-4">
              {/* Aspect Ratio Selector */}
              <div className="bg-gray-800 rounded-lg p-4">
                <label className="text-sm text-gray-300 font-medium mb-3 block">
                  Select Aspect Ratio
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => handleAspectRatioChange('landscape')}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      aspectRatio === 'landscape'
                        ? 'border-orange-500 bg-orange-500 bg-opacity-20 text-white'
                        : 'border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-xs font-medium">Landscape</div>
                    <div className="text-[10px] text-gray-500 mt-1">16:9</div>
                  </button>
                  
                  <button
                    onClick={() => handleAspectRatioChange('square')}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      aspectRatio === 'square'
                        ? 'border-orange-500 bg-orange-500 bg-opacity-20 text-white'
                        : 'border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-xs font-medium">Square</div>
                    <div className="text-[10px] text-gray-500 mt-1">1:1</div>
                  </button>
                  
                  <button
                    onClick={() => handleAspectRatioChange('portrait')}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      aspectRatio === 'portrait'
                        ? 'border-orange-500 bg-orange-500 bg-opacity-20 text-white'
                        : 'border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-xs font-medium">Portrait</div>
                    <div className="text-[10px] text-gray-500 mt-1">4:5</div>
                  </button>
                  
                  <button
                    onClick={() => handleAspectRatioChange('original')}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      aspectRatio === 'original'
                        ? 'border-orange-500 bg-orange-500 bg-opacity-20 text-white'
                        : 'border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-xs font-medium">Original</div>
                    <div className="text-[10px] text-gray-500 mt-1">Free</div>
                  </button>
                </div>
              </div>

              {/* Image Cropper */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm text-gray-300 font-medium">
                    Crop & Adjust Image
                  </label>
                  <button
                    onClick={handleApplyCrop}
                    className="flex items-center gap-2 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg transition-colors"
                  >
                    <Crop size={14} />
                    Apply Crop
                  </button>
                </div>
                
                <div className="relative rounded-lg overflow-hidden bg-black">
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    aspect={aspectRatios[aspectRatio]}
                  >
                    <img
                      ref={imageRef}
                      src={imageSrc}
                      alt="Crop preview"
                      className="max-h-[500px] w-full object-contain"
                      onLoad={() => {
                        // Set initial crop to full image
                        if (imageRef.current) {
                          setCrop({
                            unit: '%',
                            width: 100,
                            height: 100,
                            x: 0,
                            y: 0
                          });
                        }
                      }}
                    />
                  </ReactCrop>
                </div>
              </div>

              {/* Preview with Quest Title Overlay */}
              {croppedImageUrl && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <label className="text-sm text-gray-300 font-medium mb-3 block">
                    Preview (How it will appear in feed)
                  </label>
                  <div className="relative rounded-lg overflow-hidden aspect-video max-h-[400px]">
                    <img 
                      src={croppedImageUrl} 
                      alt="Final preview" 
                      className="w-full h-full object-cover" 
                    />
                    {/* Quest Title Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h4 className="text-white font-bold text-xl drop-shadow-lg line-clamp-2">
                        {questTitle}
                      </h4>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={imageSrc ? handleReset : onClose}
              className="flex-1 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              {imageSrc ? 'Change Image' : 'Skip'}
            </button>
            
            {imageSrc && (
              <button
                onClick={handleUpload}
                disabled={!croppedImageUrl || uploading}
                className="flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  'Upload & Post'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================
   POST VISIBILITY MODAL (unchanged)
   ============================================ */

interface PostVisibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPost: (visibility: 'public' | 'private', coverImage: File | null) => Promise<void>;
  questTitle: string;
  hasCoverImage: boolean;
}

export const PostVisibilityModal = ({ 
  isOpen, 
  onClose, 
  onPost, 
  questTitle, 
  hasCoverImage 
}: PostVisibilityModalProps) => {
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [showCoverModal, setShowCoverModal] = useState(false);

  const handlePost = () => {
    if (!hasCoverImage && visibility === 'public') {
      setShowCoverModal(true);
    } else {
      onPost(visibility, null);
      onClose();
    }
  };

  const handleCoverUpload = async (file: File) => {
    setShowCoverModal(false);
    await onPost(visibility, file);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-xl max-w-sm w-full border border-gray-700">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="text-lg font-bold text-white">Post Quest</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            <p className="text-gray-300 text-sm mb-6">
              Share <span className="text-orange-500 font-semibold">"{questTitle}"</span> with the community
            </p>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => setVisibility('public')}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  visibility === 'public'
                    ? 'border-orange-500 bg-orange-500 bg-opacity-10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${visibility === 'public' ? 'bg-orange-500' : 'bg-gray-700'}`}>
                    <Globe size={20} className="text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-white font-medium">Public</h4>
                    <p className="text-gray-400 text-xs">Share with everyone on the feed</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setVisibility('private')}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  visibility === 'private'
                    ? 'border-blue-500 bg-blue-500 bg-opacity-10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${visibility === 'private' ? 'bg-blue-500' : 'bg-gray-700'}`}>
                    <Lock size={20} className="text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-white font-medium">Private</h4>
                    <p className="text-gray-400 text-xs">Only save to your profile</p>
                  </div>
                </div>
              </button>
            </div>

            {visibility === 'public' && !hasCoverImage && (
              <div className="mb-4 p-3 bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-30 rounded-lg">
                <p className="text-yellow-500 text-xs flex items-start gap-2">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>A cover image is required to post publicly. You'll be able to crop and adjust it in the next step.</span>
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handlePost}
                className={`flex-1 py-3 rounded-lg transition-colors font-medium ${
                  visibility === 'public'
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {visibility === 'public' ? 'Next' : 'Save Quest'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <CoverImageModal
        isOpen={showCoverModal}
        onClose={() => setShowCoverModal(false)}
        onUpload={handleCoverUpload}
        questTitle={questTitle}
      />
    </>
  );
};