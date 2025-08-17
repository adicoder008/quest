import React, { useState, useEffect, useRef } from 'react';
import { auth , db } from '../../lib/firebase.js';
import { getCurrentUserData } from '../../lib/authService.js';
import { onAuthStateChanged } from 'firebase/auth';
import { useLoadScript } from '@react-google-maps/api';
import { CiSearch } from "react-icons/ci";
import { createPost } from '../../lib/postService';
import { POST_TYPES } from '../../lib/postService';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const libraries = ['places'];
const googleMapsApiKey = "AIzaSyD3ZFwUynLIrpQ0P4Uvmwohv-E15WJHCuo";

export const CreatePost = ({ onPostCreated }) => {
  // State management
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [postType, setPostType] = useState(POST_TYPES.REGULAR);
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [location, setLocation] = useState('');
  const [topics, setTopics] = useState([]);
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [eventDetails, setEventDetails] = useState({
    startTime: '',
    endTime: '',
    maxParticipants: ''
  });
  const [questContext, setQuestContext] = useState({
    questId: '',
    placesVisited: 0,
    daysTaken: 0
  });

  // Refs
  const autocompleteRef = useRef(null);
  const fileInputRef = useRef(null);
  const topicInputRef = useRef(null);

  // Google Maps
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey,
    libraries,
  });

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const userDetails = await getCurrentUserData();
          setUserData(userDetails);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle place selection
  const onLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.formatted_address) {
        setLocation(place.formatted_address);
      }
    }
  };

  // Form handlers
  const handleOpenPostModal = () => {
    setIsPostModalOpen(true);
    setIsLocationModalOpen(false);
  };

  const handleClosePostModal = () => {
    setIsPostModalOpen(false);
    resetForm();
  };

  const handleOpenLocationModal = () => {
    setIsLocationModalOpen(true);
    setIsPostModalOpen(false);
  };

  const handleCloseLocationModal = () => {
    setIsLocationModalOpen(false);
  };

  const handleBackToPost = () => {
    setIsLocationModalOpen(false);
    setIsPostModalOpen(true);
  };

  const resetForm = () => {
    setText('');
    setImageFile(null);
    setImagePreview('');
    setLocation('');
    setTopics([]);
    setTaggedUsers([]);
    setPostType(POST_TYPES.REGULAR);
    setEventDetails({
      startTime: '',
      endTime: '',
      maxParticipants: ''
    });
    setQuestContext({
      questId: '',
      placesVisited: 0,
      daysTaken: 0
    });
  };

  const handleAddTopic = (e) => {
    e.preventDefault();
    const topic = topicInputRef.current.value.trim();
    if (topic && !topics.includes(topic)) {
      setTopics([...topics, topic]);
      topicInputRef.current.value = '';
    }
  };

  const handleRemoveTopic = (topicToRemove) => {
    setTopics(topics.filter(topic => topic !== topicToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text) {
      alert('Please enter some text for your post');
      return;
    }
  
    try {
      const postData = {
        uid: user.uid,
        userName: user.displayName,
        userPhoto: user.photoURL,
        text,
        imageFile,
        location,
        postType,
        topics,
        taggedUsers,
        createdAt: serverTimestamp(),
        ...(postType === POST_TYPES.EVENT && { eventDetails }),
        ...(postType === POST_TYPES.QUEST_COMPLETION && { questContext })
      };
  
      // First create the post
      const postRef = await createPost(postData);
      
      // If it's an event, also add to events collection
      if (postType === POST_TYPES.EVENT) {
        const eventData = {
          ...eventDetails,
          postId: postRef.id, // Reference to the original post
          createdBy: {
            uid: user.uid,
            name: userData.displayName,
            photoURL: user.photoURL
          },
          location,
          description: text,
          imageUrl: imagePreview,
          participants: [], // Initialize empty participants list
          createdAt: serverTimestamp()
        };
        
        // Add to events collection
        await addDoc(collection(db, 'events'), eventData);
      }
  
      if (onPostCreated) {
        onPostCreated();
      }
      
      handleClosePostModal();
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    }
  };

  // UI Components
  const Avatar = ({ src, alt, className = "w-10 h-10 rounded-full object-cover" }) => (
    <img 
      src={src || "/default-avatar.png"}
      alt={alt} 
      className={className} 
    />
  );

  const Button = ({ children, variant = "default", className = "", onClick = () => {}, ...props }) => {
      const baseClasses = "font-medium leading-[150%]";
      const variantClasses = variant === "primary" 
        ? "bg-blue-500 text-white" 
        : "bg-gray-200 text-gray-800";
      
      return (
        <button 
          className={`${baseClasses} ${variantClasses} ${className} rounded px-4 py-2`}
          onClick={onClick}
          {...props}
        >
          {children}
        </button>
      );
    };

  const ActionButton = ({ icon, label, onClick }) => (
    <button 
      className="box-border flex items-center gap-2 text-gray-700 text-sm hover:bg-gray-100 px-3 py-2 rounded"
      onClick={onClick}
    >
      {icon === "image" && (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM5 19V5H19V19H5ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="currentColor"/>
        </svg>
      )}
      {icon === "video" && (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 10.5V7C17 6.45 16.55 6 16 6H4C3.45 6 3 6.45 3 7V17C3 17.55 3.45 18 4 18H16C16.55 18 17 17.55 17 17V13.5L21 17.5V6.5L17 10.5Z" fill="currentColor"/>
        </svg>
      )}
      {icon === "location" && (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
        </svg>
      )}
      <span>{label}</span>
    </button>
  );

  const OptionButton = ({ icon, label, onClick }) => (
    <div 
      className="self-stretch rounded-lg bg-white border border-gray-300 flex items-center justify-between py-2 px-3 text-sm cursor-pointer hover:bg-gray-50"
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <img className="w-5 h-5" alt="" src={icon} />
        <div className="font-medium text-gray-700">{label}</div>
      </div>
      <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );

  if (loading) {
    return <div className="min-h-screen bg-white">Loading...</div>;
  }

  return (
    <>
      {/* Create Post Trigger */}
      <div className="border bg-white mb-4 p-3 rounded-lg border-gray-300 shadow-sm">
        <div className="flex items-center gap-3 px-2 py-1">
          <Avatar
            src={user?.photoURL}
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
          <button 
            onClick={handleOpenPostModal}
            className="flex-grow border text-gray-500 bg-white px-3 py-2 rounded-lg border-gray-300 text-left hover:bg-gray-50"
          >
            Share your travel experience...
          </button>
        </div>

        <div className="flex justify-between items-center gap-1 mt-3 p-2 border-t border-gray-200">
          <ActionButton icon="image" label="Photo" onClick={handleOpenPostModal} />
          <ActionButton icon="video" label="Video" onClick={handleOpenPostModal} />
          <ActionButton icon="location" label="Location" onClick={handleOpenLocationModal} />
        </div>
      </div>

      {/* Create Post Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between py-2">
                <h2 className="text-lg font-semibold text-gray-800">Create Post</h2>
                <button onClick={handleClosePostModal} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Divider */}
              <div className="border-t border-gray-200 my-2" />
              
              {/* User Info */}
              <div className="flex items-center gap-3 py-2">
                <Avatar 
                  src={user?.photoURL}
                  alt="User Profile"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="font-medium text-gray-800">{userData?.displayName || 'User'}</div>
                  <div className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-0.5 text-xs">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#4B5563" />
                      <path d="M12 16V12M12 8H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Public</span>
                  </div>
                </div>
              </div>
              
              {/* Post Content */}
              <form onSubmit={handleSubmit}>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="What's on your mind?"
                  rows={4}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                />
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-3">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-80 w-full object-contain rounded-lg border border-gray-200"
                    />
                  </div>
                )}
                
                {/* Post Type Selector */}
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Post Type</label>
                  <select
                    value={postType}
                    onChange={(e) => setPostType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value={POST_TYPES.REGULAR}>Regular Post</option>
                    <option value={POST_TYPES.EVENT}>Event</option>
                    <option value={POST_TYPES.SPONSORED}>Sponsored</option>
                    <option value={POST_TYPES.QUEST_COMPLETION}>Quest Completion</option>
                  </select>
                </div>
                
                {/* Event Details (conditional) */}
                {postType === POST_TYPES.EVENT && (
                  <div className="mt-3 space-y-3">
                    <h3 className="font-medium text-gray-700">Event Details</h3>
                    <div>
                      <label className="block text-sm text-gray-500">Start Time</label>
                      <input
                        type="datetime-local"
                        value={eventDetails.startTime}
                        onChange={(e) => setEventDetails({...eventDetails, startTime: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500">End Time</label>
                      <input
                        type="datetime-local"
                        value={eventDetails.endTime}
                        onChange={(e) => setEventDetails({...eventDetails, endTime: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500">Max Participants</label>
                      <input
                        type="number"
                        value={eventDetails.maxParticipants}
                        onChange={(e) => setEventDetails({...eventDetails, maxParticipants: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        min="1"
                      />
                    </div>
                  </div>
                )}
                
                {/* Quest Completion Details (conditional) */}
                {postType === POST_TYPES.QUEST_COMPLETION && (
                  <div className="mt-3 space-y-3">
                    <h3 className="font-medium text-gray-700">Quest Completion</h3>
                    <div>
                      <label className="block text-sm text-gray-500">Quest ID</label>
                      <input
                        type="text"
                        value={questContext.questId}
                        onChange={(e) => setQuestContext({...questContext, questId: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        placeholder="Enter quest ID"
                      />
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-sm text-gray-500">Places Visited</label>
                        <input
                          type="number"
                          value={questContext.placesVisited}
                          onChange={(e) => setQuestContext({...questContext, placesVisited: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                          min="1"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm text-gray-500">Days Taken</label>
                        <input
                          type="number"
                          value={questContext.daysTaken}
                          onChange={(e) => setQuestContext({...questContext, daysTaken: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                          min="1"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Topics */}
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topics</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      ref={topicInputRef}
                      placeholder="Add a topic"
                      className="flex-1 p-2 border border-gray-300 rounded-lg"
                    />
                    <button 
                      type="button"
                      onClick={handleAddTopic}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                  {topics.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {topics.map(topic => (
                        <div key={topic} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center">
                          {topic}
                          <button 
                            type="button"
                            onClick={() => handleRemoveTopic(topic)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                      title="Add photo"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM5 19V5H19V19H5ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="currentColor"/>
                      </svg>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenLocationModal}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                      title="Add location"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
                      </svg>
                    </button>
                  </div>
                  <Button 
                    type="submit"
                    variant="primary"
                    className="px-6"
                  >
                    Post
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between py-2">
                <h2 className="text-lg font-semibold text-gray-800">Add Location</h2>
                <button onClick={handleCloseLocationModal} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Divider */}
              <div className="border-t border-gray-200 my-2" />
              
              {/* Location Input */}
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Location</label>
                <div className="relative">
                  <CiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  {isLoaded && (
                    <input
                      type="text"
                      placeholder="Enter a location"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      ref={(ref) => {
                        if (ref && isLoaded) {
                          const autocomplete = new window.google.maps.places.Autocomplete(ref, {
                            types: ['geocode']
                          });
                          autocomplete.addListener('place_changed', () => {
                            const place = autocomplete.getPlace();
                            if (place.formatted_address) {
                              setLocation(place.formatted_address);
                            }
                          });
                        }
                      }}
                    />
                  )}
                </div>
              </div>
              
              {/* Divider with 'or' */}
              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-300" />
                <span className="px-3 text-gray-500">or</span>
                <div className="flex-1 border-t border-gray-300" />
              </div>
              
              {/* Current Location Button */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        // Reverse geocode to get address
                        if (isLoaded) {
                          const geocoder = new window.google.maps.Geocoder();
                          geocoder.geocode(
                            { location: { lat: position.coords.latitude, lng: position.coords.longitude } },
                            (results, status) => {
                              if (status === 'OK' && results[0]) {
                                setLocation(results[0].formatted_address);
                              }
                            }
                          );
                        }
                      },
                      (error) => {
                        console.error("Error getting location:", error);
                        alert("Could not get your current location");
                      }
                    );
                  } else {
                    alert("Geolocation is not supported by your browser");
                  }
                }}
              >
                <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
                </svg>
                <span>Use Current Location</span>
              </button>
              
              {/* Action Buttons */}
              <div className="mt-6 flex justify-between">
                <Button 
                  type="button"
                  variant="default"
                  onClick={handleBackToPost}
                  className="px-6"
                >
                  Back
                </Button>
                <Button 
                  type="button"
                  variant="primary"
                  onClick={() => {
                    handleBackToPost();
                  }}
                  className="px-6"
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreatePost;