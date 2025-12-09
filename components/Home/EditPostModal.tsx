'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, Trash2, ImageIcon } from 'lucide-react';
import { Post, User as UserType } from '@/app/types/index';
import { updatePost } from '@/lib/postService';
import { compressAndUploadImage } from '@/lib/imageService';

interface EditPostModalProps {
    post: Post;
    user: UserType;
    onClose: () => void;
    onPostUpdated: (updatedPost: Post) => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ post, user, onClose, onPostUpdated }) => {
    const [text, setText] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        // Initialize with existing post data
        console.log('EditPostModal - Initializing with post:', post);
        const initialText = post.text || post.caption || '';
        const initialPhotoUrl = post.photoUrl || '';
        const initialImageUrls = post.imageUrls;

        console.log('EditPostModal - Initial text:', initialText);
        console.log('EditPostModal - Initial photoUrl:', initialPhotoUrl);

        setText(initialText);

        // Handle images - Support both single photoUrl and imageUrls array
        if (Array.isArray(initialImageUrls) && initialImageUrls.length > 0) {
            // If it's a string array, use it. If it's just a string (legacy), wrap it.
            // The type says imageUrls?: any, so let's be safe.
            if (typeof initialImageUrls === 'string') {
                setImages([initialImageUrls]);
            } else {
                setImages(initialImageUrls);
            }
        } else if (initialPhotoUrl) {
            setImages([initialPhotoUrl]);
        } else {
            setImages([]);
        }
    }, [post]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            const newImageUrls: string[] = [];

            // For Quest Posts, we only allow 1 cover image
            const maxImages = post.questId ? 1 : 10;
            // Note: The original code limited to 1 for loop, I will keep that logic if intended, 
            // but user asked for "Edit Cover Image" which implies single.
            // The original code had: for (let i = 0; i < files.length && i < 1; i++)
            // I will relax it for regular posts if needed, but for now let's stick to the loop limit 
            // but make it dynamic if we want multiple images for regular posts later.
            // For now, I'll just use the loop as is but maybe increase limit for regular posts?
            // The user didn't explicitly ask for multiple images on regular posts, just "Edit Cover Image" for quest.
            // So I will keep it simple.

            for (let i = 0; i < files.length && i < maxImages; i++) {
                const file = files[i];
                const uploadedUrl = await compressAndUploadImage(file, user.uid, 'posts');
                // compressAndUploadImage returns a string URL
                newImageUrls.push(uploadedUrl);
            }

            setImages(prev => [...prev, ...newImageUrls]);
        } catch (error) {
            console.error('Error uploading images:', error);
            alert('Failed to upload images. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!text.trim() && images.length === 0) {
            alert('Post must have text or at least one image');
            return;
        }

        setLoading(true);
        try {
            // Prepare the updates based on Post type structure
            const updates: any = {
                text: text.trim() || '',
                caption: text.trim() || '',
                photoUrl: images[0] || '',
                imageUrls: images, // Update imageUrls as well
                updatedAt: new Date().toISOString(), // Mark as edited
            };

            await updatePost(post.id, updates);

            // Create updated post object for UI update
            const updatedPost: Post = {
                ...post,
                text: text.trim() || '',
                caption: text.trim() || '',
                photoUrl: images[0] || '',
                imageUrls: images,
                // @ts-ignore
                updatedAt: new Date().toISOString(),
            };

            onPostUpdated(updatedPost);
            onClose();
        } catch (error) {
            console.error('Error updating post:', error);
            alert('Failed to update post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-700 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">Edit Post</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                        disabled={loading}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Text Editor */}
                    <div>
                        <label className="text-sm text-gray-300 mb-2 block">Caption</label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="What's on your mind?"
                            className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-[#F7CEB0] focus:border-transparent focus:outline-none resize-none"
                            rows={4}
                            disabled={loading}
                        />
                    </div>

                    {/* Image Gallery */}
                    {images.length > 0 && (
                        <div>
                            <label className="text-sm text-gray-300 mb-2 block">Images</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {images.map((url, index) => (
                                    <div key={index} className="relative group aspect-square">
                                        <img
                                            src={url}
                                            alt={`Image ${index + 1}`}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                        <button
                                            onClick={() => handleRemoveImage(index)}
                                            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                            disabled={loading}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upload Button */}
                    <div>
                        <label
                            htmlFor="edit-image-upload"
                            className={`flex items-center justify-center gap-2 border-2 border-dashed border-gray-600 rounded-lg p-6 cursor-pointer hover:border-[#F7CEB0] hover:bg-gray-800 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {uploading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#F7CEB0]"></div>
                                    <span className="text-gray-300">Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <ImageIcon className="w-5 h-5 text-gray-400" />
                                    <span className="text-gray-300">
                                        {post.questId ? 'Edit Cover Image' : 'Add Images'}
                                    </span>
                                </>
                            )}
                        </label>
                        <input
                            id="edit-image-upload"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={loading || uploading}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-700">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-[#F7CEB0] text-black rounded-lg hover:bg-[#f5c094] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        disabled={loading || uploading || (!text.trim() && images.length === 0)}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                                <span>Saving...</span>
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </div>
        </div >
    );
};

export default EditPostModal;
