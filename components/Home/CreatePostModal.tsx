'use client';
import { useState, useRef, useMemo } from 'react';
import { X, Image, MapPin, Tag, Users } from 'lucide-react';
import { createPost, POST_TYPES } from '@/lib/postService';

interface CreatePostModalProps {
    onClose: () => void;
    user: {
        uid: string;
        displayName?: string;
        photoURL?: string;
    };
}

const CreatePostModal = ({ onClose, user }: CreatePostModalProps) => {
    const [text, setText] = useState(''); // This serves as the caption
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [location, setLocation] = useState(''); // Location is now mandatory
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
            
            setSelectedImages((prev) => [...prev, ...newFiles]);

            const newPreviews: string[] = [];
            newFiles.forEach(file => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (typeof event.target?.result === 'string') {
                        newPreviews.push(event.target.result);
                        if (newPreviews.length === newFiles.length) {
                            setImagePreviews((prev) => [...prev, ...newPreviews]);
                        }
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
            // This interface defines the shape of data sent to the createPost function.
            interface PostData {
                uid: string;
                userName: string;
                userProfilePic: string;
                text: string;
                postType: string;
                location: string;
                topics: string[];
                imageFiles: File[]; // Use plural to send the whole array
            }

            const postData: PostData = {
                uid: user.uid,
                userName: user.displayName || 'Anonymous',
                userProfilePic: user.photoURL || '',
                text: text.trim(), 
                postType: POST_TYPES.REGULAR,
                location: location.trim(),
                topics: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                imageFiles: selectedImages, // Pass the whole array of files
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
                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                        <div className={`grid ${imagePreviews.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="relative">
                                    <img 
                                        src={preview} 
                                        alt={`Preview ${index + 1}`} 
                                        className={`w-full h-40 object-cover rounded-lg ${imagePreviews.length === 1 ? 'h-64' : 'h-40'}`}
                                    />
                                    <button
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
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
                    
                    {/* Add Image Button (now part of the footer options) */}
                    <div className="border-t border-gray-700 pt-4">
                        <h3 className="text-sm font-semibold text-gray-400 mb-3">ADD TO YOUR POST</h3>
                         <div className="space-y-3">
                            {/* Add Image */}
                             <div className="flex items-center gap-3">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors"
                                >
                                    <Image className="w-5 h-5" />
                                    <span>Add Photos</span>
                                </button>
                            </div>
                            
                            {/* Location (Now always visible) */}
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

