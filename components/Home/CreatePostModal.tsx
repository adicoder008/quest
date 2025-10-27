'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Image as ImageIcon, MapPin, Tag, RotateCw, ZoomIn, ZoomOut, Sliders, Loader2 } from 'lucide-react';
import { createPost, POST_TYPES } from '@/lib/postService';
import GooglePlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-google-places-autocomplete-next';
import { useUserProfile } from '@/hooks/useUserProfile';

interface CreatePostModalProps {
    onClose: () => void;
    user: {
        uid: string;
        displayName?: string;
        photoURL?: string;
    };
}

interface ImageAdjustments {
    brightness: number;
    contrast: number;
    saturation: number;
    rotation: number;
    scale: number;
    positionX: number;
    positionY: number;
}

const CreatePostModal = ({ onClose, user }: CreatePostModalProps) => {
    const [text, setText] = useState('');
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [location, setLocation] = useState(null);
    const [locationString, setLocationString] = useState('');
    const [tags, setTags] = useState('');
    const [loading, setLoading] = useState(false);
    const [showTagInput, setShowTagInput] = useState(false);
    const [showAdjustments, setShowAdjustments] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageAdjustments, setImageAdjustments] = useState<ImageAdjustments>({
        brightness: 100,
        contrast: 100,
        saturation: 100,
        rotation: 0,
        scale: 1,
        positionX: 0,
        positionY: 0
    });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);

    // Instagram 4:5 ratio dimensions
    const TARGET_WIDTH = 1080;
    const TARGET_HEIGHT = 1350;
    const ASPECT_RATIO = 4 / 5;

    // Reset adjustments when switching images
    useEffect(() => {
        setImageAdjustments({
            brightness: 100,
            contrast: 100,
            saturation: 100,
            rotation: 0,
            scale: 1,
            positionX: 0,
            positionY: 0
        });
    }, [currentImageIndex]);

    const handleLocationSelect = async (place: any) => {
        if (!place) {
            setLocation(null);
            setLocationString('');
            return;
        }
        
        setLocation(place); // <-- Saves the full place object
        setLocationString(place.label); // <-- Saves the string for the post

        // You can also get lat/lng if you need it
        try {
            const results = await geocodeByAddress(place.label);
            const latLng = await getLatLng(results[0]);
            console.log("Selected Location Lat/Lng:", latLng);
            // You could save latLng to your post here
        } catch (error) {
            console.error("Error getting lat/lng:", error);
        }
    };

    // Process image with adjustments
    const processImage = useCallback((file: File, adjustments: ImageAdjustments): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (typeof event.target?.result === 'string') {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        canvas.width = TARGET_WIDTH;
                        canvas.height = TARGET_HEIGHT;
                        
                        if (ctx) {
                            // Fill with black background
                            ctx.fillStyle = '#000000';
                            ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
                            
                            // Apply filters
                            ctx.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`;
                            
                            // Calculate dimensions to fit the image
                            const imgRatio = img.width / img.height;
                            let drawWidth, drawHeight;
                            
                            if (imgRatio > ASPECT_RATIO) {
                                // Image is wider - fit by height
                                drawHeight = TARGET_HEIGHT;
                                drawWidth = drawHeight * imgRatio;
                            } else {
                                // Image is taller - fit by width
                                drawWidth = TARGET_WIDTH;
                                drawHeight = drawWidth / imgRatio;
                            }
                            
                            // Apply scale
                            drawWidth *= adjustments.scale;
                            drawHeight *= adjustments.scale;
                            
                            // Calculate position with adjustments
                            let x = (TARGET_WIDTH - drawWidth) / 2 + adjustments.positionX;
                            let y = (TARGET_HEIGHT - drawHeight) / 2 + adjustments.positionY;
                            
                            // Apply rotation
                            ctx.save();
                            ctx.translate(TARGET_WIDTH / 2, TARGET_HEIGHT / 2);
                            ctx.rotate((adjustments.rotation * Math.PI) / 180);
                            ctx.translate(-TARGET_WIDTH / 2, -TARGET_HEIGHT / 2);
                            
                            ctx.drawImage(img, x, y, drawWidth, drawHeight);
                            ctx.restore();
                        }
                        
                        resolve(canvas.toDataURL('image/jpeg', 0.92));
                    };
                    img.src = event.target.result;
                }
            };
            reader.readAsDataURL(file);
        });
    }, []);

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Limit to 10 images
        const newFiles = files.slice(0, 10 - selectedImages.length);
        
        // Generate previews
        const previews = await Promise.all(
            newFiles.map(file => processImage(file, imageAdjustments))
        );

        setSelectedImages(prev => [...prev, ...newFiles]);
        setImagePreviews(prev => [...prev, ...previews]);
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        if (currentImageIndex >= selectedImages.length - 1) {
            setCurrentImageIndex(Math.max(0, currentImageIndex - 1));
        }
    };

    const handleAdjustmentChange = async (key: keyof ImageAdjustments, value: number) => {
        const newAdjustments = { ...imageAdjustments, [key]: value };
        setImageAdjustments(newAdjustments);

        // Update preview for current image
        if (selectedImages[currentImageIndex]) {
            const newPreview = await processImage(selectedImages[currentImageIndex], newAdjustments);
            setImagePreviews(prev => {
                const updated = [...prev];
                updated[currentImageIndex] = newPreview;
                return updated;
            });
        }
    };

    const handleZoomIn = () => {
        const newScale = Math.min(imageAdjustments.scale + 0.1, 3);
        handleAdjustmentChange('scale', newScale);
    };

    const handleZoomOut = () => {
        const newScale = Math.max(imageAdjustments.scale - 0.1, 1);
        handleAdjustmentChange('scale', newScale);
    };

    const handleRotate = () => {
        const newRotation = (imageAdjustments.rotation + 90) % 360;
        handleAdjustmentChange('rotation', newRotation);
    };

    // Mouse drag handlers for panning
    const handleMouseDown = (e: React.MouseEvent) => {
        if (imageAdjustments.scale <= 1) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - imageAdjustments.positionX, y: e.clientY - imageAdjustments.positionY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
        // Limit panning based on scale
        const maxPan = 200 * (imageAdjustments.scale - 1);
        const limitedX = Math.max(-maxPan, Math.min(maxPan, newX));
        const limitedY = Math.max(-maxPan, Math.min(maxPan, newY));
        
        setImageAdjustments(prev => ({ ...prev, positionX: limitedX, positionY: limitedY }));
    };

    const handleMouseUp = async () => {
        if (isDragging) {
            setIsDragging(false);
            // Update preview after dragging
            if (selectedImages[currentImageIndex]) {
                const newPreview = await processImage(selectedImages[currentImageIndex], imageAdjustments);
                setImagePreviews(prev => {
                    const updated = [...prev];
                    updated[currentImageIndex] = newPreview;
                    return updated;
                });
            }
        }
    };

    // Touch handlers for mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        if (imageAdjustments.scale <= 1 || e.touches.length !== 1) return;
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({ x: touch.clientX - imageAdjustments.positionX, y: touch.clientY - imageAdjustments.positionY });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || e.touches.length !== 1) return;
        const touch = e.touches[0];
        const newX = touch.clientX - dragStart.x;
        const newY = touch.clientY - dragStart.y;
        
        const maxPan = 200 * (imageAdjustments.scale - 1);
        const limitedX = Math.max(-maxPan, Math.min(maxPan, newX));
        const limitedY = Math.max(-maxPan, Math.min(maxPan, newY));
        
        setImageAdjustments(prev => ({ ...prev, positionX: limitedX, positionY: limitedY }));
    };

    const handleTouchEnd = async () => {
        if (isDragging) {
            setIsDragging(false);
            if (selectedImages[currentImageIndex]) {
                const newPreview = await processImage(selectedImages[currentImageIndex], imageAdjustments);
                setImagePreviews(prev => {
                    const updated = [...prev];
                    updated[currentImageIndex] = newPreview;
                    return updated;
                });
            }
        }
    };

    const resetAdjustments = () => {
        handleAdjustmentChange('brightness', 100);
        handleAdjustmentChange('contrast', 100);
        handleAdjustmentChange('saturation', 100);
        handleAdjustmentChange('rotation', 0);
        handleAdjustmentChange('scale', 1);
        handleAdjustmentChange('positionX', 0);
        handleAdjustmentChange('positionY', 0);
    };

    const handlePost = async () => {
        if (!text.trim() || !locationString.trim()) {
            alert('Please add text and location for your post');
            return;
        }

        if (selectedImages.length === 0) {
            alert('Please add at least one image');
            return;
        }

        setLoading(true);

        try {
            const tagsArray = tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);

            // Process all images with their adjustments
            const processedImages = await Promise.all(
                selectedImages.map((file, index) => {
                    return processImage(file, imageAdjustments);
                })
            );

            // Convert base64 to blobs
            const imageBlobs = await Promise.all(
                processedImages.map(async (base64) => {
                    const response = await fetch(base64);
                    return response.blob();
                })
            );

            const processedImageFiles = await Promise.all(
                selectedImages.map(async (file, index) => {
                    // Get the base64 string from your canvas processing
                    // (This function is in your CreatePostModal.tsx)
                    const base64 = await processImage(file, imageAdjustments); 
                    
                    // Fetch the base64 string to get a blob
                    const response = await fetch(base64);
                    const blob = await response.blob();

                    // Get original base name and create a new file name
                    const baseName = file.name.replace(/\.[^/.]+$/, '');
                    // Your processImage function creates 'image/jpeg'
                    const newFileName = `${baseName}_processed.jpeg`; 

                    // 2. Create a new FILE object from the Blob
                    // This attaches the .name property that imageService needs
                    const newFile = new File([blob], newFileName, {
                        type: 'image/jpeg',
                        lastModified: file.lastModified,
                    });

                    return newFile; // This is now a File object
                })
            );

            await createPost({
                uid: user.uid,
                userName: user.displayName || 'Anonymous',
                userProfilePic : user.photoURL || '',
                text: text.trim(),
                imageFiles : processedImageFiles,
                location: locationString.trim(),
                topics: tagsArray,
                type: POST_TYPES.REGULAR
            });

            onClose();
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <div className="flex items-center gap-3 flex-1">
                        <h2 className="text-xl font-semibold text-white">Create Post</h2>
                        
                        <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3 flex-1">
           
            
            {/* Location Input in Header - REPLACED */}
            <div className="flex items-center gap-2 flex-1 max-w-xs z-[60]"> {/* Added z-index for dropdown */}
                <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0" />
                
                {/* --- THIS IS THE NEW COMPONENT --- */}
                <GooglePlacesAutocomplete
                    apiKey={process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || ''}
                    
                    selectProps={{
                        value: location,
                        onChange: handleLocationSelect,
                        placeholder: 'Add location...',
                        styles: {
                            control: (provided: any) => ({
                                ...provided,
                                backgroundColor: '#1f2937', // bg-gray-800
                                border: '1px solid #374151', // border-gray-700
                                borderRadius: '0.5rem', // rounded-lg
                                minHeight: '38px',
                                boxShadow: 'none',
                                '&:hover': {
                                    borderColor: '#f97316' // focus:border-orange-400
                                }
                            }),
                            input: (provided: any) => ({
                                ...provided,
                                color: '#ffffff', // text-white
                                fontSize: '0.875rem', // text-sm
                            }),
                            singleValue: (provided: any) => ({
                                ...provided,
                                color: '#ffffff', // text-white
                                fontSize: '0.875rem', // text-sm
                            }),
                            placeholder: (provided: any) => ({
                                ...provided,
                                color: '#6b7280', // placeholder-gray-500
                                fontSize: '0.875rem', // text-sm
                            }),
                            menu: (provided: any) => ({
                                ...provided,
                                backgroundColor: '#1f2937', // bg-gray-800
                                borderRadius: '0.5rem',
                                zIndex: 9999
                            }),
                            option: (provided: any, state: { isFocused: any; }) => ({
                                ...provided,
                                backgroundColor: state.isFocused ? '#374151' : 'transparent', // bg-gray-700 on focus
                                color: '#ffffff', // text-white
                                fontSize: '0.875rem', // text-sm
                                cursor: 'pointer'
                            }),
                        }
                    }}
                />
            </div>
        </div>
        
        <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
            <X className="w-5 h-5" />
        </button>
    </div>
                    </div>
                    
                    <button
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Caption Input */}
                    <textarea
                        placeholder="What's on your mind?"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={3}
                        className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none resize-none text-lg"
                    />

                    {/* Image Controls - Only show when images are selected */}
                    {imagePreviews.length > 0 && (
                        <div className="space-y-3">
                            {/* Quick Controls */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleZoomOut}
                                        disabled={imageAdjustments.scale <= 1}
                                        className="p-2 bg-gray-800 rounded-lg text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        title="Zoom Out"
                                    >
                                        <ZoomOut className="w-5 h-5" />
                                    </button>
                                    <span className="text-sm text-gray-400 min-w-[60px] text-center">
                                        {imageAdjustments.scale.toFixed(1)}x
                                    </span>
                                    <button
                                        onClick={handleZoomIn}
                                        disabled={imageAdjustments.scale >= 3}
                                        className="p-2 bg-gray-800 rounded-lg text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        title="Zoom In"
                                    >
                                        <ZoomIn className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={handleRotate}
                                        className="p-2 bg-gray-800 rounded-lg text-white hover:bg-gray-700 transition-colors ml-2"
                                        title="Rotate"
                                    >
                                        <RotateCw className="w-5 h-5" />
                                    </button>
                                </div>
                                
                                <button
                                    onClick={() => setShowAdjustments(!showAdjustments)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                                        showAdjustments ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                                >
                                    <Sliders className="w-4 h-4" />
                                    <span className="text-sm">Adjust</span>
                                </button>
                            </div>

                            {imageAdjustments.scale > 1 && (
                                <div className="text-xs text-gray-400 bg-gray-800/50 rounded-lg p-2 text-center">
                                    💡 Drag the image to reposition when zoomed
                                </div>
                            )}

                            {/* Advanced Adjustments */}
                            {showAdjustments && (
                                <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-semibold text-gray-300">Advanced Settings</h3>
                                        <button
                                            onClick={resetAdjustments}
                                            className="text-xs text-orange-400 hover:text-orange-300"
                                        >
                                            Reset All
                                        </button>
                                    </div>

                                    {/* Brightness */}
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">
                                            Brightness: {imageAdjustments.brightness}%
                                        </label>
                                        <input
                                            type="range"
                                            min="50"
                                            max="150"
                                            value={imageAdjustments.brightness}
                                            onChange={(e) => handleAdjustmentChange('brightness', Number(e.target.value))}
                                            className="w-full accent-orange-500"
                                        />
                                    </div>

                                    {/* Contrast */}
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">
                                            Contrast: {imageAdjustments.contrast}%
                                        </label>
                                        <input
                                            type="range"
                                            min="50"
                                            max="150"
                                            value={imageAdjustments.contrast}
                                            onChange={(e) => handleAdjustmentChange('contrast', Number(e.target.value))}
                                            className="w-full accent-orange-500"
                                        />
                                    </div>

                                    {/* Saturation */}
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">
                                            Saturation: {imageAdjustments.saturation}%
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="200"
                                            value={imageAdjustments.saturation}
                                            onChange={(e) => handleAdjustmentChange('saturation', Number(e.target.value))}
                                            className="w-full accent-orange-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                        <div className={`grid ${imagePreviews.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                            {imagePreviews.map((preview, index) => (
                                <div 
                                    key={index} 
                                    className={`relative cursor-pointer rounded-lg overflow-hidden ${
                                        index === currentImageIndex ? 'ring-2 ring-orange-400' : ''
                                    }`}
                                    onClick={() => setCurrentImageIndex(index)}
                                >
                                    <div 
                                        ref={index === currentImageIndex ? imageContainerRef : null}
                                        className="relative w-full bg-black select-none"
                                        style={{ paddingBottom: '125%' }}
                                        onMouseDown={index === currentImageIndex ? handleMouseDown : undefined}
                                        onMouseMove={index === currentImageIndex ? handleMouseMove : undefined}
                                        onMouseUp={index === currentImageIndex ? handleMouseUp : undefined}
                                        onMouseLeave={index === currentImageIndex ? handleMouseUp : undefined}
                                        onTouchStart={index === currentImageIndex ? handleTouchStart : undefined}
                                        onTouchMove={index === currentImageIndex ? handleTouchMove : undefined}
                                        onTouchEnd={index === currentImageIndex ? handleTouchEnd : undefined}
                                    >
                                        <img 
                                            src={preview} 
                                            alt={`Preview ${index + 1}`} 
                                            className="absolute inset-0 w-full h-full object-contain"
                                            draggable={false}
                                        />
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeImage(index);
                                        }}
                                        className="absolute top-2 right-2 w-7 h-7 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center text-white transition-colors z-10"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    {imagePreviews.length > 1 && (
                                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                            {index + 1}/{imagePreviews.length}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add Photos Button - Prominent when no images */}
                    {imagePreviews.length === 0 && (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full border-2 border-dashed border-gray-700 rounded-xl p-12 flex flex-col items-center justify-center gap-3 hover:border-orange-400 hover:bg-gray-800/30 transition-all group"
                        >
                            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                                <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-white" />
                            </div>
                            <div className="text-center">
                                <p className="text-white font-medium mb-1">Add Photos</p>
                                <p className="text-sm text-gray-400">Click to upload images</p>
                            </div>
                        </button>
                    )}

                    {/* Additional Options */}
                    {imagePreviews.length > 0 && imagePreviews.length < 10 && (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex items-center justify-center gap-2 py-3 border border-gray-700 rounded-lg text-orange-400 hover:bg-gray-800 transition-colors"
                        >
                            <ImageIcon className="w-5 h-5" />
                            <span>Add More Photos ({imagePreviews.length}/10)</span>
                        </button>
                    )}

                    {/* Tags */}
                    <div className="space-y-2">
                        <button
                            onClick={() => setShowTagInput(!showTagInput)}
                            className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors"
                        >
                            <Tag className="w-5 h-5" />
                            <span>{showTagInput || tags ? 'Edit Tags' : 'Add Tags'}</span>
                        </button>
                        
                        {showTagInput && (
                            <input
                                type="text"
                                placeholder="travel, adventure, nature..."
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                            />
                        )}
                    </div>
                </div>

                {/* Footer - Post Button */}
                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={handlePost}
                        disabled={loading || !text.trim() || !locationString.trim() || selectedImages.length === 0}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold py-3 rounded-xl transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Posting...</span>
                            </>
                        ) : (
                            <span>Post</span>
                        )}
                    </button>
                    {(!text.trim() || !locationString.trim() || selectedImages.length === 0) && (
                        <p className="text-xs text-gray-500 text-center mt-2">
                            {!text.trim() ? 'Add caption' : !locationString.trim() ? 'Add location' : 'Add at least one photo'}
                        </p>
                    )}
                </div>

                {/* Hidden File Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple 
                    onChange={handleImageSelect}
                    className="hidden"
                />
            </div>
        </div>
    );
};

export default CreatePostModal;