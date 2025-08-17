import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase.cjs';
import { LoadScript, Autocomplete } from '@react-google-maps/api';
import { FiPlus, FiTrash2, FiImage, FiMapPin, FiTag } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../ui/LoadingSpinner';


const CreateQuest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [autocomplete, setAutocomplete] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Quest form state
  const [quest, setQuest] = useState({
    title: '',
    description: '',
    coverImage: '',
    tags: [],
    privacy: 'public',
    flowCards: []
  });

  // Current card being edited
  const [currentCard, setCurrentCard] = useState({
    title: '',
    description: '',
    location: null,
    images: [],
    tags: [],
    timestamp: null
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuest(prev => ({ ...prev, [name]: value }));
  };

  // Handle card input changes
  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCard(prev => ({ ...prev, [name]: value }));
  };

  // Handle location selection
  const handleLocationSelect = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        setCurrentCard(prev => ({
          ...prev,
          location: {
            name: place.name,
            address: place.formatted_address,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          }
        }));
      }
    }
  };

  // Add a new flow card
  const addFlowCard = () => {
    if (!currentCard.title || !currentCard.location) {
      toast.error('Please add a title and location for this stop');
      return;
    }

    setQuest(prev => ({
      ...prev,
      flowCards: [
        ...prev.flowCards,
        {
          ...currentCard,
          timestamp: currentCard.timestamp || new Date()
        }
      ]
    }));

    // Reset current card
    setCurrentCard({
      title: '',
      description: '',
      location: null,
      images: [],
      tags: [],
      timestamp: null
    });
  };

  // Remove a flow card
  const removeFlowCard = (index) => {
    setQuest(prev => ({
      ...prev,
      flowCards: prev.flowCards.filter((_, i) => i !== index)
    }));
  };

  // Handle image upload (simplified - you'd implement actual upload)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // In a real app, you'd upload these to storage and get URLs
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setCurrentCard(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  };

  // Handle tag addition
  const addTag = (type, value) => {
    if (type === 'quest') {
      setQuest(prev => ({
        ...prev,
        tags: [...prev.tags, value]
      }));
    } else {
      setCurrentCard(prev => ({
        ...prev,
        tags: [...prev.tags, value]
      }));
    }
  };

  // Remove tag
  const removeTag = (type, index) => {
    if (type === 'quest') {
      setQuest(prev => ({
        ...prev,
        tags: prev.tags.filter((_, i) => i !== index)
      }));
    } else {
      setCurrentCard(prev => ({
        ...prev,
        tags: prev.tags.filter((_, i) => i !== index)
      }));
    }
  };

  // Submit the quest
  const submitQuest = async () => {
    if (!quest.title || quest.flowCards.length === 0) {
      toast.error('Please add a title and at least one flow card');
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;
      
      const questData = {
        ...quest,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user.uid,
        likes: [],
        saves: [],
        followers: [],
        views: 0,
        likesCount: 0,
        savesCount: 0,
        followersCount: 0,
        // In a real app, you'd upload images to storage and replace these with URLs
        coverImage: quest.coverImage || 'https://via.placeholder.com/800x400',
        flowCards: quest.flowCards.map(card => ({
          ...card,
          // Replace with actual image URLs after upload
          images: card.images.length > 0 ? card.images : ['https://via.placeholder.com/400x300']
        }))
      };

      const docRef = await addDoc(collection(db, 'quest'), questData);
      toast.success('Quest created successfully!');
      navigate(`/quest/${docRef.id}`);
    } catch (error) {
      console.error('Error creating quest:', error);
      toast.error('Failed to create quest');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <h1 className="text-2xl font-bold">Create New Quest</h1>
          <p className="mt-2">Document your journey and share it with others</p>
        </div>

        {/* Main Form */}
        <div className="p-6">
          {/* Basic Info */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Quest Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                <input
                  type="text"
                  name="title"
                  value={quest.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="My Awesome Adventure"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Privacy</label>
                <select
                  name="privacy"
                  value={quest.privacy}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="friends">Friends Only</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={quest.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="Tell us about your quest..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setQuest(prev => ({
                        ...prev,
                        coverImage: URL.createObjectURL(file)
                      }));
                    }
                  }}
                  className="w-full"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {quest.tags.map((tag, index) => (
                    <span key={index} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {tag}
                      <button 
                        type="button"
                        onClick={() => removeTag('quest', index)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Add tag (e.g. #Adventure)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value) {
                        addTag('quest', e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="flex-1 p-2 border rounded-l-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Add tag (e.g. #Adventure)"]');
                      if (input.value) {
                        addTag('quest', input.value);
                        input.value = '';
                      }
                    }}
                    className="bg-blue-500 text-white px-4 rounded-r-md hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Flow Cards */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Journey Stops</h2>
            {quest.flowCards.length > 0 && (
              <div className="mb-6 space-y-4">
                {quest.flowCards.map((card, index) => (
                  <div key={index} className="border rounded-lg p-4 relative">
                    <button
                      type="button"
                      onClick={() => removeFlowCard(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 />
                    </button>
                    <h3 className="font-medium">{card.title}</h3>
                    {card.location && (
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <FiMapPin className="mr-1" /> {card.location.name}
                      </p>
                    )}
                    {card.description && (
                      <p className="text-gray-700 mt-2">{card.description}</p>
                    )}
                    {card.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {card.tags.map((tag, i) => (
                          <span key={i} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Add New Stop</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stop Title*</label>
                  <input
                    type="text"
                    name="title"
                    value={currentCard.title}
                    onChange={handleCardInputChange}
                    className="w-full p-2 border rounded-md"
                    placeholder="Day 1: Arrival in Tokyo"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="timestamp"
                    value={currentCard.timestamp ? new Date(currentCard.timestamp).toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      setCurrentCard(prev => ({
                        ...prev,
                        timestamp: e.target.value ? new Date(e.target.value) : null
                      }));
                    }}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                
                <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Location*</label>
          <LoadScript
            googleMapsApiKey="AIzaSyD3ZFwUynLIrpQ0P4Uvmwohv-E15WJHCuo"
            libraries={["places"]}  // REQUIRED for Autocomplete
            onLoad={() => setMapLoaded(true)}
          >
            {mapLoaded && (
              <Autocomplete
                onLoad={(auto) => setAutocomplete(auto)}
                onPlaceChanged={handleLocationSelect}
                fields={['name', 'formatted_address', 'geometry']}
              >
                <input
                  type="text"
                  placeholder="Search for a place"
                  className="w-full p-2 border rounded-md"
                />
              </Autocomplete>
            )}
          </LoadScript>
          {currentCard.location && (
            <div className="mt-2 p-2 bg-gray-50 rounded-md">
              <p className="font-medium">{currentCard.location.name}</p>
              <p className="text-sm text-gray-600">{currentCard.location.address}</p>
            </div>
          )}
        </div>

                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={currentCard.description}
                    onChange={handleCardInputChange}
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    placeholder="What happened at this stop?"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="w-full"
                  />
                  {currentCard.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {currentCard.images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`Preview ${i}`}
                          className="w-20 h-20 object-cover rounded-md"
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {currentCard.tags.map((tag, index) => (
                      <span key={index} className="flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                        {tag}
                        <button 
                          type="button"
                          onClick={() => removeTag('card', index)}
                          className="ml-1 text-gray-600 hover:text-gray-800"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Add tag (e.g. #Temple)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target.value) {
                          addTag('card', e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="flex-1 p-2 border rounded-l-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Add tag (e.g. #Temple)"]');
                        if (input.value) {
                          addTag('card', input.value);
                          input.value = '';
                        }
                      }}
                      className="bg-gray-200 text-gray-800 px-4 rounded-r-md hover:bg-gray-300"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
              
              <button
                type="button"
                onClick={addFlowCard}
                className="mt-4 flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                <FiPlus /> Add This Stop
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 border rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitQuest}
              disabled={!quest.title || quest.flowCards.length === 0}
              className={`px-6 py-2 rounded-md ${(!quest.title || quest.flowCards.length === 0) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'}`}
            >
              Create Quest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuest;