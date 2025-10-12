// File: components/QuestPopups/index.tsx
// Add this UPDATED CoverImageModal with adjustable height

import React, { useState } from 'react';
import { X, Upload, Globe, Lock, AlertCircle, ZoomIn, ZoomOut } from 'lucide-react';

interface CoverImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  questTitle: string;
}

export const CoverImageModal = ({ isOpen, onClose, onUpload, questTitle }: CoverImageModalProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageHeight, setImageHeight] = useState(60); // Default 60vh

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) return;
    setUploading(true);
    try {
      await onUpload(selectedImage);
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full border border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-bold text-white">Add Cover Image</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-300 text-sm mb-4">
            Add a stunning cover image for "{questTitle}"
          </p>

          {preview ? (
            <div className="mb-4">
              {/* Adjustable Preview */}
              <div 
                className="relative rounded-lg overflow-hidden bg-gray-800 mb-4"
                style={{ height: `${imageHeight}vh` }}
              >
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full h-full object-cover" 
                />
                
                {/* Quest Title Overlay (YouTube Shorts Style) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h4 className="text-white font-bold text-xl drop-shadow-lg">
                    {questTitle}
                  </h4>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => {
                    setPreview(null);
                    setSelectedImage(null);
                  }}
                  className="absolute top-3 right-3 bg-black bg-opacity-75 backdrop-blur-sm p-2 rounded-full hover:bg-opacity-90 transition-colors"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>

              {/* Height Adjuster */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-300 font-medium">
                    Adjust Image Height
                  </label>
                  <span className="text-sm text-orange-500 font-bold">
                    {imageHeight}vh
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setImageHeight(Math.max(30, imageHeight - 5))}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <ZoomOut size={18} className="text-gray-300" />
                  </button>
                  
                  <input
                    type="range"
                    min="30"
                    max="90"
                    step="5"
                    value={imageHeight}
                    onChange={(e) => setImageHeight(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  
                  <button
                    onClick={() => setImageHeight(Math.min(90, imageHeight + 5))}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <ZoomIn size={18} className="text-gray-300" />
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 mt-2 text-center">
                  This is how it will appear in the feed
                </p>
              </div>
            </div>
          ) : (
            <label className="block mb-4 cursor-pointer">
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-12 hover:border-orange-500 transition-colors">
                <div className="flex flex-col items-center gap-3 text-gray-400">
                  <Upload size={48} className="text-orange-500" />
                  <div className="text-center">
                    <span className="text-base font-medium">Click to upload cover image</span>
                    <p className="text-xs mt-1">PNG, JPG up to 5MB • Best: 1080x1920 (9:16)</p>
                  </div>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Skip
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedImage || uploading}
              className="flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload & Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Keep the PostVisibilityModal as is - it already works correctly
export const PostVisibilityModal = ({ 
  isOpen, 
  onClose, 
  onPost, 
  questTitle, 
  hasCoverImage 
}: any) => {
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
              Share "{questTitle}" with the community
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
                <p className="text-yellow-500 text-xs">
                  <AlertCircle size={14} className="inline mr-1" />
                  We recommend adding a cover image for better engagement
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
                {visibility === 'public' ? 'Post Quest' : 'Save Quest'}
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