// components/QuestPopups/index.tsx
import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Crop, Image as ImageIcon, Check } from 'lucide-react';
import ReactCrop, { Crop as CropType, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface PostQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPost: (coverImage: File | null, existingImageUrl?: string | null) => Promise<void>;
  questTitle: string;
  questImages: string[]; // Array of image URLs from the quest
}

export const PostQuestModal = ({
  isOpen,
  onClose,
  onPost,
  questTitle,
  questImages
}: PostQuestModalProps) => {
  const [step, setStep] = useState<'select' | 'crop' | 'preview'>('select');
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isCustomUpload, setIsCustomUpload] = useState(false);

  const [crop, setCrop] = useState<CropType>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setSelectedImageSrc(null);
      setSelectedImageFile(null);
      setCroppedImageUrl(null);
      setCroppedImageFile(null);
      setIsCustomUpload(false);
    }
  }, [isOpen]);

  // Handle file selection from upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImageFile(file);
      setIsCustomUpload(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImageSrc(reader.result as string);
        setStep('crop');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle selection from existing quest images
  const handleExistingImageSelect = async (url: string) => {
    // For existing images, we need to convert them to a format we can crop (if cross-origin issues allow)
    // Or just use them as is. For better UX, let's try to load them for cropping.
    setIsCustomUpload(false);
    setSelectedImageSrc(url);
    setSelectedImageFile(null); // It's a URL, not a File
    setStep('crop');
  };

  const getCroppedImg = async (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('No 2d context');
    }

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        0.95
      );
    });
  };

  const handleApplyCrop = async () => {
    if (!imageRef.current || !completedCrop) return;

    try {
      const blob = await getCroppedImg(imageRef.current, completedCrop);
      const file = new File([blob], 'cover-image.jpg', { type: 'image/jpeg' });
      const previewUrl = URL.createObjectURL(blob);

      setCroppedImageFile(file);
      setCroppedImageUrl(previewUrl);
      setStep('preview');
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to crop image. Please try again.');
    }
  };

  const handlePost = async () => {
    if (!croppedImageFile && !selectedImageSrc) return;

    setUploading(true);
    try {
      // If we have a cropped file (which we should always have if we went through cropping), use it.
      // If for some reason we skipped cropping (not implemented here but good for robustness), use original.

      if (croppedImageFile) {
        await onPost(croppedImageFile, null);
      } else if (!isCustomUpload && selectedImageSrc) {
        // Fallback: if they somehow didn't crop but selected an existing image
        await onPost(null, selectedImageSrc);
      }

      onClose();
    } catch (error) {
      console.error('Post error:', error);
      alert('Failed to post quest. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full border border-gray-700 my-8 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-700 shrink-0">
          <h3 className="text-lg font-bold text-white">
            {step === 'select' && 'Select Cover Image'}
            {step === 'crop' && 'Adjust Cover Image'}
            {step === 'preview' && 'Ready to Post'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={uploading}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {step === 'select' && (
            <div className="space-y-6">
              <p className="text-gray-300 text-sm">
                Choose a cover image for <span className="text-orange-500 font-semibold">"{questTitle}"</span>.
                This will be displayed on the public feed.
              </p>

              {/* Upload New */}
              <label className="block cursor-pointer group">
                <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 hover:border-orange-500 transition-all duration-200 bg-gray-800/50 hover:bg-gray-800 flex flex-col items-center gap-3">
                  <div className="p-3 bg-gray-800 rounded-full group-hover:bg-gray-700 transition-colors">
                    <Upload size={24} className="text-orange-500" />
                  </div>
                  <div className="text-center">
                    <span className="text-base font-medium text-white block">
                      Upload New Photo
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG up to 10MB
                    </p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              {/* Select from Quest */}
              {questImages.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                    <ImageIcon size={16} />
                    From this Quest
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {questImages.map((url, index) => (
                      <button
                        key={index}
                        onClick={() => handleExistingImageSelect(url)}
                        className="relative aspect-square rounded-lg overflow-hidden group border border-gray-800 hover:border-orange-500 transition-all"
                      >
                        <img
                          src={url}
                          alt={`Quest image ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'crop' && selectedImageSrc && (
            <div className="flex flex-col h-full">
              <p className="text-sm text-gray-400 mb-4">
                Drag to position. Cover images are fixed to <span className="text-white font-medium">4:5 portrait ratio</span> for best display.
              </p>

              <div className="flex-1 bg-black rounded-lg overflow-hidden flex items-center justify-center min-h-[300px]">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={4 / 5}
                  className="max-h-[60vh]"
                >
                  <img
                    ref={imageRef}
                    src={selectedImageSrc}
                    alt="Crop source"
                    className="max-h-[60vh] w-auto object-contain"
                    onLoad={(e) => {
                      // Center the crop initially
                      const { width, height } = e.currentTarget;
                      const cropWidth = Math.min(width, height * (4 / 5));
                      const cropHeight = cropWidth * (5 / 4);
                      const x = (width - cropWidth) / 2;
                      const y = (height - cropHeight) / 2;

                      setCrop({
                        unit: 'px',
                        width: cropWidth,
                        height: cropHeight,
                        x,
                        y
                      });
                    }}
                    crossOrigin="anonymous" // Try to handle CORS for existing images
                  />
                </ReactCrop>
              </div>

              <div className="flex gap-3 mt-6 shrink-0">
                <button
                  onClick={() => setStep('select')}
                  className="flex-1 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleApplyCrop}
                  className="flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Crop size={18} />
                  Preview
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && croppedImageUrl && (
            <div className="flex flex-col h-full items-center">
              <div className="relative w-full max-w-sm aspect-[4/5] rounded-xl overflow-hidden shadow-2xl mb-6 group">
                <img
                  src={croppedImageUrl}
                  alt="Final preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                  <div className="inline-block px-2 py-1 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider rounded mb-2">
                    Quest
                  </div>
                  <h4 className="text-white font-bold text-2xl leading-tight drop-shadow-md line-clamp-2">
                    {questTitle}
                  </h4>
                  <p className="text-gray-300 text-sm mt-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Public on Feed
                  </p>
                </div>
              </div>

              <div className="w-full max-w-sm space-y-3">
                <button
                  onClick={handlePost}
                  disabled={uploading}
                  className="w-full py-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all font-bold text-lg shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      Post to Feed
                      <Check size={20} />
                    </>
                  )}
                </button>

                <button
                  onClick={() => setStep('crop')}
                  disabled={uploading}
                  className="w-full py-3 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                >
                  Adjust Crop
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};