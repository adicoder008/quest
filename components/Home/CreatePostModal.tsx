'use client';

import { useState, useRef } from 'react';
import { X, Image, Target, Type, MapPin, Tag, Users } from 'lucide-react';
import { createPost, POST_TYPES } from '../../lib/postService';

interface CreatePostModalProps {
  onClose: () => void;
  user: {
    uid: string;
    displayName?: string;
    photoURL?: string;
    // Add other user properties if needed
  };
}

const CreatePostModal = ({ onClose, user }: CreatePostModalProps) => {
  const [postType, setPostType] = useState('normal');
  const [contentType, setContentType] = useState('text'); // 'text', 'photo', 'photo_text'
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  
  // Quest-specific fields
  const [questTitle, setQuestTitle] = useState('');
  const [questDescription, setQuestDescription] = useState('');
  
  // Event-specific fields
  const [eventTitle, setEventTitle] = useState('');
  const [eventSubtitle, setEventSubtitle] = useState('');
  const [eventPrice, setEventPrice] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setImagePreview(event.target.result);
        }
      };
      reader.readAsDataURL(file);
      
      if (contentType === 'text') {
        setContentType('photo');
      }
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (contentType === 'photo') {
      setContentType('text');
    } else if (contentType === 'photo_text') {
      setContentType('text');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!user?.uid) {
      alert('Please log in to create a post');
      return;
    }

    // Validation
    if (contentType === 'text' && !text.trim()) {
      alert('Please add some text');
      return;
    }
    if (contentType === 'photo' && !selectedImage) {
      alert('Please select an image');
      return;
    }
    if (contentType === 'photo_text' && (!text.trim() || !selectedImage)) {
      alert('Please add both text and image');
      return;
    }

    if (postType === 'quest' && !questTitle.trim()) {
      alert('Please add a quest title');
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
        location: string | null;
        topics: string[];
        imageFile: File | null;
        caption: string;
        questContext?: {
          questTitle: string;
          description: string;
          questId: string;
        };
        eventTitle?: string;
        eventSubtitle?: string;
        eventPrice?: string;
      }

      const postData: PostData = {
        uid: user.uid,
        userName: user.displayName || 'Anonymous',
        userProfilePic: user.photoURL || '',
        text: text.trim(),
        postType: postType === 'normal' ? POST_TYPES.REGULAR : 
                 postType === 'quest' ? POST_TYPES.QUEST_COMPLETION : POST_TYPES.EVENT,
        location: location.trim() || null,
        topics: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        imageFile: selectedImage,
        caption: text.trim()
      };

      // Add quest-specific data
      if (postType === 'quest') {
        postData.questContext = {
          questTitle: questTitle.trim(),
          description: questDescription.trim(),
          questId: `quest_${Date.now()}` // You might want to generate this differently
        };
      }

      // Add event-specific data
      if (postType === 'event') {
        postData.eventTitle = eventTitle.trim();
        postData.eventSubtitle = eventSubtitle.trim();
        postData.eventPrice = eventPrice.trim();
        postData.postType = POST_TYPES.EVENT;
      }

      await createPost(postData);
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canPost = () => {
    if (loading) return false;
    
    switch (contentType) {
      case 'text':
        return text.trim().length > 0;
      case 'photo':
        return selectedImage !== null;
      case 'photo_text':
        return text.trim().length > 0 && selectedImage !== null;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex">
      <div className="w-full bg-gray-900 text-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <button onClick={onClose} className="text-white">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-semibold">
            {postType === 'normal' ? 'Add Post' : 
             postType === 'quest' ? 'Quest Complete' : 'New Event'}
          </h2>
          <button
            onClick={handleSubmit}
            disabled={!canPost()}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              canPost() 
                ? 'bg-peach-200 text-gray-900 hover:bg-peach-300' 
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>

        {/* Post Type Selector */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex gap-2">
            <button
              onClick={() => setPostType('normal')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                postType === 'normal' ? 'bg-peach-200 text-gray-900' : 'bg-gray-800 text-white'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => setPostType('quest')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                postType === 'quest' ? 'bg-peach-200 text-gray-900' : 'bg-gray-800 text-white'
              }`}
            >
              Quest
            </button>
            <button
              onClick={() => setPostType('event')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                postType === 'event' ? 'bg-peach-200 text-gray-900' : 'bg-gray-800 text-white'
              }`}
            >
              Event
            </button>
          </div>
        </div>

        {/* Content Type Selector */}
        {postType === 'normal' && (
          <div className="p-4 border-b border-gray-700">
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => {
                  setContentType('photo');
                  fileInputRef.current?.click();
                }}
                className={`flex flex-col items-center gap-2 px-6 py-4 rounded-lg transition-colors ${
                  contentType === 'photo' ? 'bg-gray-700' : 'bg-gray-800'
                }`}
              >
                <Image className="w-8 h-8" />
                <span className="text-sm">Gallery</span>
              </button>
              <button
                onClick={() => setContentType('text')}
                className={`flex flex-col items-center gap-2 px-6 py-4 rounded-lg transition-colors ${
                  contentType === 'text' ? 'bg-gray-700' : 'bg-gray-800'
                }`}
              >
                <Type className="w-8 h-8" />
                <span className="text-sm">Text</span>
              </button>
              <button
                onClick={() => setContentType('quest')}
                className={`flex flex-col items-center gap-2 px-6 py-4 rounded-lg transition-colors ${
                  contentType === 'quest' ? 'bg-gray-700' : 'bg-gray-800'
                }`}
              >
                <Target className="w-8 h-8" />
                <span className="text-sm">Quest</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 p-4 space-y-4">
          {/* Quest Fields */}
          {postType === 'quest' && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Quest title..."
                value={questTitle}
                onChange={(e) => setQuestTitle(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-peach-200"
              />
              <textarea
                placeholder="Quest description..."
                value={questDescription}
                onChange={(e) => setQuestDescription(e.target.value)}
                rows={2}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-peach-200 resize-none"
              />
            </div>
          )}

          {/* Event Fields */}
          {postType === 'event' && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Event title..."
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-peach-200"
              />
              <input
                type="text"
                placeholder="Event subtitle..."
                value={eventSubtitle}
                onChange={(e) => setEventSubtitle(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-peach-200"
              />
              <input
                type="text"
                placeholder="Price (optional)..."
                value={eventPrice}
                onChange={(e) => setEventPrice(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-peach-200"
              />
            </div>
          )}

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-64 object-cover rounded-lg"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Text Input */}
          {(contentType === 'text' || contentType === 'photo_text' || postType !== 'normal') && (
            <textarea
              placeholder={
                postType === 'quest' ? 'Share your quest completion...' :
                postType === 'event' ? 'Tell people about this event...' :
                'What\'s on your mind?'
              }
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none resize-none text-lg"
            />
          )}

          {/* Additional Options */}
          <div className="space-y-3">
            {/* Location */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowLocationInput(!showLocationInput)}
                className="flex items-center gap-2 text-peach-200"
              >
                <MapPin className="w-5 h-5" />
                <span>Add Location</span>
              </button>
            </div>
            
            {showLocationInput && (
              <input
                type="text"
                placeholder="Add location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-peach-200"
              />
            )}

            {/* Tags */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowTagInput(!showTagInput)}
                className="flex items-center gap-2 text-peach-200"
              >
                <Tag className="w-5 h-5" />
                <span>Add Tags</span>
              </button>
            </div>
            
            {showTagInput && (
              <input
                type="text"
                placeholder="Add tags (comma separated)..."
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-peach-200"
              />
            )}
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default CreatePostModal;