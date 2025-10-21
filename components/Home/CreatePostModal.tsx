'use client';
import { useState, useRef, useCallback } from 'react';
import { X, Image as ImageIcon, MapPin, Tag, Users, Crop, Maximize, RotateCw, ZoomIn, ZoomOut, Sliders } from 'lucide-react';
import { createPost, POST_TYPES } from '@/lib/postService';

interface CreatePostModalProps {
    onClose: () => void;
    user: {
        uid: string;
        displayName?: string;
        photoURL?: string;
    };
}

type ImageMode = 'crop' | 'fit';

interface ImageAdjustments {
    brightness: number;
    contrast: number;
    saturation: number;
    rotation: number;
    zoom: number;
}

const CreatePostModal = ({ onClose, user }: CreatePostModalProps) => {
    const [text, setText] = useState('');
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [imageMode, setImageMode] = useState<ImageMode>('crop');
    const [location, setLocation] = useState('');
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
        zoom: 1
    });
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Process image with adjustments
    const processImage = useCallback((file: File, adjustments: ImageAdjustments = imageAdjustments): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (typeof event.target?.result === 'string') {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        // Instagram 4:5 ratio dimensions
                        const targetRatio = 4 / 5;
                        const imgRatio = img.width / img.height;
                        
                        let canvasWidth, canvasHeight;
                        let sourceX = 0, sourceY = 0, sourceWidth = img.width, sourceHeight = img.height;
                        
                        // Max dimensions (keeping 4:5 ratio)
                        const maxWidth = 1080;
                        const maxHeight = 1350;
                        
                        if (imageMode === 'crop') {
                            // Crop to 4:5 ratio
                            if (imgRatio > targetRatio) {
                                sourceWidth = img.height * targetRatio;
                                sourceX = (img.width - sourceWidth) / 2;
                            } else {
                                sourceHeight = img.width / targetRatio;
                                sourceY = (img.height - sourceHeight) / 2;
                            }
                            
                            if (sourceWidth > maxWidth) {
                                canvasWidth = maxWidth;
                                canvasHeight = maxHeight;
                            } else {
                                canvasWidth = sourceWidth;
                                canvasHeight = sourceHeight;
                            }
                        } else {
                            // Fit mode
                            if (imgRatio > targetRatio) {
                                canvasWidth = Math.min(img.width, maxWidth);
                                canvasHeight = canvasWidth / targetRatio;
                            } else {
                                canvasHeight = Math.min(img.height, maxHeight);
                                canvasWidth = canvasHeight * targetRatio;
                            }
                        }
                        
                        canvas.width = canvasWidth;
                        canvas.height = canvasHeight;
                        
                        if (ctx) {
                            // Apply filters
                            ctx.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`;
                            
                            if (imageMode === 'fit') {
                                ctx.fillStyle = '#000000';
                                ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                                
                                const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height) * adjustments.zoom;
                                const scaledWidth = img.width * scale;
                                const scaledHeight = img.height * scale;
                                const x = (canvasWidth - scaledWidth) / 2;
                                const y = (canvasHeight - scaledHeight) / 2;
                                
                                // Apply rotation
                                if (adjustments.rotation !== 0) {
                                    ctx.save();
                                    ctx.translate(canvasWidth / 2, canvasHeight / 2);
                                    ctx.rotate((adjustments.rotation * Math.PI) / 180);
                                    ctx.translate(-canvasWidth / 2, -canvasHeight / 2);
                                }
                                
                                ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
                                
                                if (adjustments.rotation !== 0) {
                                    ctx.restore();
                                }
                            } else {
                                // Apply rotation for crop mode
                                if (adjustments.rotation !== 0) {
                                    ctx.save();
                                    ctx.translate(canvasWidth / 2, canvasHeight / 2);
                                    ctx.rotate((adjustments.rotation * Math.PI) / 180);
                                    ctx.translate(-canvasWidth / 2, -canvasHeight / 2);
                                }
                                
                                const scale = adjustments.zoom;
                                const zoomedWidth = sourceWidth * scale;
                                const zoomedHeight = sourceHeight * scale;
                                const offsetX = (sourceWidth - zoomedWidth) / 2;
                                const offsetY = (sourceHeight - zoomedHeight) / 2;
                                
                                ctx.drawImage(
                                    img,
                                    sourceX + offsetX, sourceY + offsetY, zoomedWidth, zoomedHeight,
                                    0, 0, canvasWidth, canvasHeight
                                );
                                
                                if (adjustments.rotation !== 0) {
                                    ctx.restore();
                                }
                            }
                        }
                        
                        resolve(canvas.toDataURL('image/jpeg', 0.92));
                    };
                    img.src = event.target.result;
                }
            };
            reader.readAsDataURL(file);
        });
    }, [imageMode, imageAdjustments]);

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        if (files.length > 0) {
            const newFiles = files.filter(file => 
                !selectedImages.some(existingFile => 
                    existingFile.name === file.name && existingFile.size === file.size
                )
            );
            
            // Process each image
            for (const file of newFiles) {
                const reader = new FileReader();
                
                reader.onload = (event) => {
                    if (typeof event.target?.result === 'string') {
                        const img = new Image();
                        
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            
                            if (!ctx) return;
                            
                            // Instagram 4:5 ratio
                            const targetRatio = 4 / 5; // 0.8
                            const imgRatio = img.width / img.height;
                            
                            let canvasWidth: number, canvasHeight: number;
                            let sourceX = 0, sourceY = 0;
                            let sourceWidth = img.width, sourceHeight = img.height;
                            
                            const maxWidth = 1080;
                            const maxHeight = 1350;
                            
                            if (imageMode === 'crop') {
                                // CROP MODE: Cut parts to fit
                                console.log('CROP MODE ACTIVE');
                                
                                if (imgRatio > targetRatio) {
                                    // Wider image - crop width
                                    sourceWidth = img.height * targetRatio;
                                    sourceX = (img.width - sourceWidth) / 2;
                                    console.log(`Cropping width: ${sourceX} to ${sourceX + sourceWidth}`);
                                } else {
                                    // Taller image - crop height
                                    sourceHeight = img.width / targetRatio;
                                    sourceY = (img.height - sourceHeight) / 2;
                                    console.log(`Cropping height: ${sourceY} to ${sourceY + sourceHeight}`);
                                }
                                
                                canvasWidth = Math.min(sourceWidth, maxWidth);
                                canvasHeight = Math.min(sourceHeight, maxHeight);
                                
                            } else {
                                // FIT MODE: Add padding
                                console.log('FIT MODE ACTIVE');
                                
                                if (imgRatio > targetRatio) {
                                    canvasWidth = Math.min(img.width, maxWidth);
                                    canvasHeight = canvasWidth / targetRatio;
                                } else {
                                    canvasHeight = Math.min(img.height, maxHeight);
                                    canvasWidth = canvasHeight * targetRatio;
                                }
                            }
                            
                            canvas.width = canvasWidth;
                            canvas.height = canvasHeight;
                            
                            console.log('Canvas size:', canvasWidth, 'x', canvasHeight);
                            
                            if (imageMode === 'fit') {
                                // Black background for fit mode
                                ctx.fillStyle = '#000000';
                                ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                                
                                // Center the image
                                const scale = Math.min(
                                    canvasWidth / img.width,
                                    canvasHeight / img.height
                                );
                                const scaledWidth = img.width * scale;
                                const scaledHeight = img.height * scale;
                                const x = (canvasWidth - scaledWidth) / 2;
                                const y = (canvasHeight - scaledHeight) / 2;
                                
                                ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
                            } else {
                                // Crop mode - draw cropped section
                                ctx.drawImage(
                                    img,
                                    sourceX, sourceY, sourceWidth, sourceHeight,
                                    0, 0, canvasWidth, canvasHeight
                                );
                            }
                            
                            // Convert to blob
                            canvas.toBlob((blob) => {
                                if (blob) {
                                    const processedFile = new File([blob], file.name, {
                                        type: 'image/jpeg',
                                        lastModified: Date.now()
                                    });
                                    
                                    setSelectedImages((prev) => [...prev, processedFile]);
                                    setImagePreviews((prev) => [...prev, canvas.toDataURL('image/jpeg', 0.92)]);
                                }
                            }, 'image/jpeg', 0.92);
                        };
                        
                        img.src = event.target.result;
                    }
                };
                
                reader.readAsDataURL(file);
            }
            
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeImage = (indexToRemove: number) => {
        setSelectedImages(prev => prev.filter((_, index) => index !== indexToRemove));
        setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
        
        if (indexToRemove === currentImageIndex && currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
        }
    };

    const reprocessImages = () => {
        if (selectedImages.length === 0) return;
        
        console.log('Reprocessing with mode:', imageMode);
        setImagePreviews([]);
        
        // Reprocess all images with new mode
        selectedImages.forEach((file) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                if (typeof event.target?.result === 'string') {
                    const img = new Image();
                    
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        if (!ctx) return;
                        
                        const targetRatio = 4 / 5;
                        const imgRatio = img.width / img.height;
                        
                        let canvasWidth: number, canvasHeight: number;
                        let sourceX = 0, sourceY = 0;
                        let sourceWidth = img.width, sourceHeight = img.height;
                        
                        const maxWidth = 1080;
                        const maxHeight = 1350;
                        
                        if (imageMode === 'crop') {
                            if (imgRatio > targetRatio) {
                                sourceWidth = img.height * targetRatio;
                                sourceX = (img.width - sourceWidth) / 2;
                            } else {
                                sourceHeight = img.width / targetRatio;
                                sourceY = (img.height - sourceHeight) / 2;
                            }
                            
                            canvasWidth = Math.min(sourceWidth, maxWidth);
                            canvasHeight = Math.min(sourceHeight, maxHeight);
                            
                        } else {
                            if (imgRatio > targetRatio) {
                                canvasWidth = Math.min(img.width, maxWidth);
                                canvasHeight = canvasWidth / targetRatio;
                            } else {
                                canvasHeight = Math.min(img.height, maxHeight);
                                canvasWidth = canvasHeight * targetRatio;
                            }
                        }
                        
                        canvas.width = canvasWidth;
                        canvas.height = canvasHeight;
                        
                        if (imageMode === 'fit') {
                            ctx.fillStyle = '#000000';
                            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                            
                            const scale = Math.min(
                                canvasWidth / img.width,
                                canvasHeight / img.height
                            );
                            const scaledWidth = img.width * scale;
                            const scaledHeight = img.height * scale;
                            const x = (canvasWidth - scaledWidth) / 2;
                            const y = (canvasHeight - scaledHeight) / 2;
                            
                            ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
                        } else {
                            ctx.drawImage(
                                img,
                                sourceX, sourceY, sourceWidth, sourceHeight,
                                0, 0, canvasWidth, canvasHeight
                            );
                        }
                        
                        setImagePreviews((prev) => [...prev, canvas.toDataURL('image/jpeg', 0.92)]);
                    };
                    
                    img.src = event.target.result;
                }
            };
            
            reader.readAsDataURL(file);
        });
    };

    const handleAdjustmentChange = async (key: keyof ImageAdjustments, value: number) => {
        const newAdjustments = { ...imageAdjustments, [key]: value };
        setImageAdjustments(newAdjustments);
        
        if (selectedImages[currentImageIndex]) {
            const preview = await processImage(selectedImages[currentImageIndex], newAdjustments);
            setImagePreviews(prev => {
                const updated = [...prev];
                updated[currentImageIndex] = preview;
                return updated;
            });
        }
    };

    const resetAdjustments = () => {
        setImageAdjustments({
            brightness: 100,
            contrast: 100,
            saturation: 100,
            rotation: 0,
            zoom: 1
        });
    };

    const handlePost = async () => {
        if (!text.trim() && selectedImages.length === 0) {
            alert('Please add some content to your post');
            return;
        }

        if (!location.trim()) {
            alert('Please add a location');
            return;
        }

        setLoading(true);
        try {
            // Convert data URLs back to Files for upload
            const processedFiles: File[] = [];
            for (let i = 0; i < imagePreviews.length; i++) {
                const response = await fetch(imagePreviews[i]);
                const blob = await response.blob();
                const file = new File([blob], selectedImages[i].name, {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                });
                processedFiles.push(file);
            }

            await createPost({
                uid: user.uid,
                userName: user.displayName || 'Anonymous',
                userProfilePic: user.photoURL || '',
                text: text.trim(),
                imageFiles: processedFiles,
                location: location.trim(),
                topics: tags.split(',').map(t => t.trim()).filter(Boolean),
                postType: POST_TYPES.REGULAR
            });

            onClose();
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const canPost = (text.trim() !== '' || selectedImages.length > 0) && location.trim() !== '';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="relative w-full max-w-2xl max-h-[90vh] bg-gray-900 rounded-xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-white text-xl font-semibold">Create Post</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-800">
                    <div className="flex items-center gap-2">
                        {selectedImages.length > 0 && (
                            <button
                                onClick={() => setShowAdjustments(!showAdjustments)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
                                    showAdjustments
                                        ? 'bg-orange-400 text-black font-medium'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                <Sliders className="w-4 h-4" />
                                Adjust
                            </button>
                        )}
                    </div>
                    <button
                        onClick={handlePost}
                        disabled={!canPost || loading}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            canPost 
                                ? 'bg-orange-400 text-black hover:bg-orange-300' 
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {loading ? 'Posting...' : 'Post'}
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {/* Image Mode Toggle */}
                    {selectedImages.length > 0 && (
                        <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-lg">
                            <span className="text-sm text-gray-400">Display:</span>
                            <button
                                onClick={() => setImageMode('crop')}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
                                    imageMode === 'crop'
                                        ? 'bg-orange-400 text-black font-medium'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                <Crop className="w-4 h-4" />
                                Crop
                            </button>
                            <button
                                onClick={() => setImageMode('fit')}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
                                    imageMode === 'fit'
                                        ? 'bg-orange-400 text-black font-medium'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                <Maximize className="w-4 h-4" />
                                Fit
                            </button>
                        </div>
                    )}

                    {/* Image Adjustment Panel */}
                    {showAdjustments && selectedImages.length > 0 && (
                        <div className="bg-gray-800 p-4 rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-white">Image Adjustments</h3>
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
                                    className="w-full"
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
                                    className="w-full"
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
                                    className="w-full"
                                />
                            </div>

                            {/* Zoom */}
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">
                                    Zoom: {imageAdjustments.zoom.toFixed(1)}x
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="3"
                                    step="0.1"
                                    value={imageAdjustments.zoom}
                                    onChange={(e) => handleAdjustmentChange('zoom', Number(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            {/* Rotation */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleAdjustmentChange('rotation', (imageAdjustments.rotation - 90) % 360)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 rounded-md text-sm text-gray-300 hover:bg-gray-600"
                                >
                                    <RotateCw className="w-4 h-4 transform -scale-x-100" />
                                    Rotate Left
                                </button>
                                <button
                                    onClick={() => handleAdjustmentChange('rotation', (imageAdjustments.rotation + 90) % 360)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 rounded-md text-sm text-gray-300 hover:bg-gray-600"
                                >
                                    <RotateCw className="w-4 h-4" />
                                    Rotate Right
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                        <div className={`grid ${imagePreviews.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                            {imagePreviews.map((preview, index) => (
                                <div 
                                    key={index} 
                                    className={`relative cursor-pointer ${index === currentImageIndex ? 'ring-2 ring-orange-400' : ''}`}
                                    onClick={() => setCurrentImageIndex(index)}
                                >
                                    <div className="relative w-full" style={{ paddingBottom: '125%' }}>
                                        <img 
                                            src={preview} 
                                            alt={`Preview ${index + 1}`} 
                                            className="absolute inset-0 w-full h-full object-cover rounded-lg"
                                        />
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeImage(index);
                                        }}
                                        className="absolute top-2 right-2 w-7 h-7 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center text-white transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Caption Input */}
                    <textarea
                        placeholder="What's on your mind?"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={4}
                        className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none resize-none text-lg"
                    />
                    
                    {/* Add to Post Section */}
                    <div className="border-t border-gray-700 pt-4">
                        <h3 className="text-sm font-semibold text-gray-400 mb-3">ADD TO YOUR POST</h3>
                        <div className="space-y-3">
                            {/* Add Image */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors"
                                >
                                    <ImageIcon className="w-5 h-5" />
                                    <span>Add Photos</span>
                                </button>
                            </div>
                            
                            {/* Location */}
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-orange-400" />
                                <input
                                    type="text"
                                    placeholder="Add location (Required)..."
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                                />
                            </div>

                            {/* Tags */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowTagInput(!showTagInput)}
                                    className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors"
                                >
                                    <Tag className="w-5 h-5" />
                                    <span>{showTagInput || tags ? 'Edit Tags' : 'Add Tags'}</span>
                                </button>
                            </div>
                            
                            {showTagInput && (
                                <input
                                    type="text"
                                    placeholder="Add tags (comma separated)..."
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                                />
                            )}
                        </div>
                    </div>
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