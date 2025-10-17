'use client';
import { useState, useRef, useMemo } from 'react';
import { X, Image as ImageIcon, MapPin, Tag, Users, Crop, Maximize } from 'lucide-react';
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

const CreatePostModal = ({ onClose, user }: CreatePostModalProps) => {
    const [text, setText] = useState('');
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [imageMode, setImageMode] = useState<ImageMode>('crop'); // 'crop' or 'fit'
    const [location, setLocation] = useState('');
    const [tags, setTags] = useState('');
    const [loading, setLoading] = useState(false);
    const [showTagInput, setShowTagInput] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        if (files.length > 0) {
            const newFiles = files.filter(file => 
                !selectedImages.some(existingFile => existingFile.name === file.name && existingFile.size === file.size)
            );
            
            // Process images with 4:5 ratio (Instagram style)
            newFiles.forEach(file => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (typeof event.target?.result === 'string') {
                        const img = new Image();
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            
                            // Instagram 4:5 ratio dimensions
                            const targetRatio = 4 / 5; // width / height
                            const imgRatio = img.width / img.height;
                            
                            let canvasWidth, canvasHeight;
                            let sourceX = 0, sourceY = 0, sourceWidth = img.width, sourceHeight = img.height;
                            
                            // Max dimensions (keeping 4:5 ratio)
                            const maxWidth = 1080;
                            const maxHeight = 1350;
                            
                            if (imageMode === 'crop') {
                                // Crop to 4:5 ratio
                                if (imgRatio > targetRatio) {
                                    // Image is wider - crop width
                                    sourceWidth = img.height * targetRatio;
                                    sourceX = (img.width - sourceWidth) / 2;
                                } else {
                                    // Image is taller - crop height
                                    sourceHeight = img.width / targetRatio;
                                    sourceY = (img.height - sourceHeight) / 2;
                                }
                                
                                // Set canvas to 4:5 ratio, respecting max dimensions
                                if (sourceWidth > maxWidth) {
                                    canvasWidth = maxWidth;
                                    canvasHeight = maxHeight;
                                } else {
                                    canvasWidth = sourceWidth;
                                    canvasHeight = sourceHeight;
                                }
                            } else {
                                // Fit mode - add padding to maintain 4:5 ratio
                                if (imgRatio > targetRatio) {
                                    // Image is wider - fit width
                                    canvasWidth = Math.min(img.width, maxWidth);
                                    canvasHeight = canvasWidth / targetRatio;
                                } else {
                                    // Image is taller - fit height
                                    canvasHeight = Math.min(img.height, maxHeight);
                                    canvasWidth = canvasHeight * targetRatio;
                                }
                            }
                            
                            canvas.width = canvasWidth;
                            canvas.height = canvasHeight;
                            
                            if (imageMode === 'fit') {
                                // Fill with black background
                                ctx!.fillStyle = '#000000';
                                ctx!.fillRect(0, 0, canvasWidth, canvasHeight);
                                
                                // Calculate position to center image
                                const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height);
                                const scaledWidth = img.width * scale;
                                const scaledHeight = img.height * scale;
                                const x = (canvasWidth - scaledWidth) / 2;
                                const y = (canvasHeight - scaledHeight) / 2;
                                
                                ctx?.drawImage(img, x, y, scaledWidth, scaledHeight);
                            } else {
                                // Crop mode
                                ctx?.drawImage(
                                    img,
                                    sourceX, sourceY, sourceWidth, sourceHeight,
                                    0, 0, canvasWidth, canvasHeight
                                );
                            }
                            
                            canvas.toBlob((blob) => {
                                if (blob) {
                                    const resizedFile = new File([blob], file.name, {
                                        type: 'image/jpeg',
                                        lastModified: Date.now()
                                    });
                                    
                                    setSelectedImages((prev) => [...prev, resizedFile]);
                                    setImagePreviews((prev) => [...prev, canvas.toDataURL('image/jpeg', 0.92)]);
                                }
                            }, 'image/jpeg', 0.92);
                        };
                        img.src = event.target.result;
                    }
                };
                reader.readAsDataURL(file);
            });
            
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeImage = (indexToRemove: number) => {
        const newImages = selectedImages.filter((_, index) => index !== indexToRemove);
        const newPreviews = imagePreviews.filter((_, index) => index !== indexToRemove);
        
        setSelectedImages(newImages);
        setImagePreviews(newPreviews);
        
        if (fileInputRef.current) {
             fileInputRef.current.value = '';
        }
    };

    const reprocessImages = () => {
        // Clear current previews
        setImagePreviews([]);
        
        // Reprocess all selected images with new mode
        selectedImages.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (typeof event.target?.result === 'string') {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        const targetRatio = 4 / 5;
                        const imgRatio = img.width / img.height;
                        
                        let canvasWidth, canvasHeight;
                        let sourceX = 0, sourceY = 0, sourceWidth = img.width, sourceHeight = img.height;
                        
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
                            
                            if (sourceWidth > maxWidth) {
                                canvasWidth = maxWidth;
                                canvasHeight = maxHeight;
                            } else {
                                canvasWidth = sourceWidth;
                                canvasHeight = sourceHeight;
                            }
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
                            ctx!.fillStyle = '#000000';
                            ctx!.fillRect(0, 0, canvasWidth, canvasHeight);
                            
                            const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height);
                            const scaledWidth = img.width * scale;
                            const scaledHeight = img.height * scale;
                            const x = (canvasWidth - scaledWidth) / 2;
                            const y = (canvasHeight - scaledHeight) / 2;
                            
                            ctx?.drawImage(img, x, y, scaledWidth, scaledHeight);
                        } else {
                            ctx?.drawImage(
                                img,
                                sourceX, sourceY, sourceWidth, sourceHeight,
                                0, 0, canvasWidth, canvasHeight
                            );
                        }
                        
                        setImagePreviews((prev) => {
                            const newPreviews = [...prev];
                            newPreviews[index] = canvas.toDataURL('image/jpeg', 0.92);
                            return newPreviews;
                        });
                    };
                    img.src = event.target.result;
                }
            };
            reader.readAsDataURL(file);
        });
    };
    
    const canPost = useMemo(() => {
        if (loading || !user?.uid) return false;
        
        const hasContent = text.trim().length > 0 || selectedImages.length > 0;
        const hasLocation = location.trim().length > 0;

        return hasContent && hasLocation;
    }, [loading, user?.uid, text, selectedImages, location]);

    const handleSubmit = async () => {
        if (!canPost) {
            alert('A location and either an image or a caption is required to post.');
            return;
        }

        if (!user || !user.uid) {
            console.error("Post submission blocked: User UID is missing.");
            return;
        }

        setLoading(true);

        try {
            interface PostData {
                uid: string;
                userName: string;
                userProfilePic: string;
                text: string;
                postType: string;
                location: string;
                topics: string[];
                imageFiles: File[];
            }

            const postData: PostData = {
                uid: user.uid,
                userName: user.displayName || 'Anonymous',
                userProfilePic: user.photoURL || '',
                text: text.trim(), 
                postType: POST_TYPES.REGULAR,
                location: location.trim(),
                topics: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                imageFiles: selectedImages,
            };

            await createPost(postData);
            onClose();
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-start">
            <div className="w-full max-w-lg md:mt-10 bg-gray-900 text-white flex flex-col h-full md:h-auto md:rounded-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <button onClick={onClose} className="text-white">
                        <X className="w-6 h-6" />
                    </button>
                    <h2 className="text-lg font-semibold">Add Post</h2>
                    <button
                        onClick={handleSubmit}
                        disabled={!canPost}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            canPost 
                                ? 'bg-orange-400 text-black hover:bg-orange-300' 
                                : 'bg-gray-600 cursor-not-allowed'
                        }`}
                    >
                        {loading ? 'Posting...' : 'Post'}
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {/* Image Mode Toggle - Only show if images are selected */}
                    {selectedImages.length > 0 && (
                        <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-lg">
                            <span className="text-sm text-gray-400">Image Display:</span>
                            <button
                                onClick={() => {
                                    setImageMode('crop');
                                    setTimeout(reprocessImages, 100);
                                }}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
                                    imageMode === 'crop'
                                        ? 'bg-orange-400 text-black font-medium'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                <Crop className="w-4 h-4" />
                                Crop (4:5)
                            </button>
                            <button
                                onClick={() => {
                                    setImageMode('fit');
                                    setTimeout(reprocessImages, 100);
                                }}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
                                    imageMode === 'fit'
                                        ? 'bg-orange-400 text-black font-medium'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                <Maximize className="w-4 h-4" />
                                Fit (4:5)
                            </button>
                        </div>
                    )}

                    {/* Image Previews - Now with 4:5 ratio */}
                    {imagePreviews.length > 0 && (
                        <div className={`grid ${imagePreviews.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="relative">
                                    <div className="relative w-full" style={{ paddingBottom: '125%' }}> {/* 4:5 ratio = 125% */}
                                        <img 
                                            src={preview} 
                                            alt={`Preview ${index + 1}`} 
                                            className="absolute inset-0 w-full h-full object-cover rounded-lg"
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 w-7 h-7 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center text-white transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Caption/Text Input */}
                    <textarea
                        placeholder="your words go here..."
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
                                    <span>Add Photos (4:5 ratio)</span>
                                </button>
                            </div>
                            
                            {/* Location (Required) */}
                            <div className="flex items-center gap-3">
                                 <MapPin className="w-5 h-5 text-orange-400" />
                                <input
                                    type="text"
                                    placeholder="Add location (Required)..."
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
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

                             <div className="flex items-center gap-3">
                                <button
                                    className="flex items-center gap-2 text-orange-400/50 cursor-not-allowed"
                                    disabled
                                >
                                    <Users className="w-5 h-5" />
                                    <span>Tag Friends (Coming Soon)</span>
                                </button>
                            </div>
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