import React, { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Edit3, Save, X, Clock, MapPin, DollarSign, GripVertical } from 'lucide-react';

// Types for Activity and ActivityCard props
type Hotel = {
  name: string;
  location?: string;
  price?: string;
  rating?: string;
  amenities?: string[];
};

type Activity = {
  id?: string;
  type: string;
  time: string;
  title: string;
  description: string;
  location?: string;
  duration?: string;
  estimatedCost?: string;
  imageUrl?: string;
  hotels?: Hotel[];
};

type ActivityCardProps = {
  activity: Activity;
  index: number;
  dayIndex: number;
  onEdit: (dayIndex: number, activityIndex: number, updatedActivity: Activity) => void;
  onDelete: (dayIndex: number, activityIndex: number) => void;
  onMoveUp: (dayIndex: number, activityIndex: number) => void;
  onMoveDown: (dayIndex: number, activityIndex: number) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onAddAfter: (dayIndex: number, activityIndex: number) => void;
};

// Individual Activity Card Component with Google Forms style
const ActivityCard: React.FC<ActivityCardProps> = ({ 
  activity, 
  index, 
  dayIndex, 
  onEdit, 
  onDelete, 
  onMoveUp, 
  onMoveDown, 
  canMoveUp, 
  canMoveDown,
  onAddAfter 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedActivity, setEditedActivity] = useState({ ...activity });

  const handleSave = () => {
    onEdit(dayIndex, index, editedActivity);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedActivity({ ...activity });
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Card Header with Controls */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1 cursor-grab">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded font-medium">
            {activity.time}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Reorder buttons */}
          <button
            onClick={() => onMoveUp(dayIndex, index)}
            disabled={!canMoveUp}
            className={`p-1 rounded hover:bg-gray-100 ${!canMoveUp ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ChevronUp className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => onMoveDown(dayIndex, index)}
            disabled={!canMoveDown}
            className={`p-1 rounded hover:bg-gray-100 ${!canMoveDown ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </button>
          
          {/* Edit button */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 rounded hover:bg-gray-100"
          >
            <Edit3 className="w-4 h-4 text-gray-600" />
          </button>
          
          {/* Delete button */}
          <button
            onClick={() => onDelete(dayIndex, index)}
            className="p-1 rounded hover:bg-red-50 text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        {isEditing ? (
          // Edit Mode
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={editedActivity.title}
                onChange={(e) => setEditedActivity(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={editedActivity.description}
                onChange={(e) => setEditedActivity(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <select
                  value={editedActivity.time}
                  onChange={(e) => setEditedActivity(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input
                  type="text"
                  value={editedActivity.duration || ''}
                  onChange={(e) => setEditedActivity(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="2-3 hours"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={editedActivity.location || ''}
                  onChange={(e) => setEditedActivity(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                <input
                  type="text"
                  value={editedActivity.estimatedCost || ''}
                  onChange={(e) => setEditedActivity(prev => ({ ...prev, estimatedCost: e.target.value }))}
                  placeholder="₹ 500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4 inline mr-1" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
              >
                <Save className="w-4 h-4 inline mr-1" />
                Save
              </button>
            </div>
          </div>
        ) : (
          // View Mode
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">{activity.title}</h4>
            <p className="text-gray-700 text-sm mb-3 leading-relaxed">{activity.description}</p>
            
            <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
              {activity.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{activity.location}</span>
                </div>
              )}
              {activity.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{activity.duration}</span>
                </div>
              )}
              {activity.estimatedCost && (
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-green-600 font-medium">{activity.estimatedCost}</span>
                </div>
              )}
            </div>

            {activity.imageUrl && (
              <img 
                src={activity.imageUrl} 
                alt={activity.title}
                className="w-full h-32 object-cover rounded-md mb-3"
              />
            )}
            
            {activity.type === 'hotels' && activity.hotels && (
              <div className="space-y-2">
                {activity.hotels.map((hotel, hotelIndex) => (
                  <div key={hotelIndex} className="bg-gray-50 rounded-md p-3 border">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-medium text-gray-900">{hotel.name}</h5>
                        <p className="text-xs text-gray-600">{hotel.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">{hotel.price}</p>
                        <p className="text-xs text-gray-500">{hotel.rating}</p>
                      </div>
                    </div>
                    {hotel.amenities && (
                      <div className="flex flex-wrap gap-1">
                        {hotel.amenities.slice(0, 3).map((amenity, i) => (
                          <span key={i} className="text-xs bg-white text-gray-600 px-2 py-1 rounded">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Add Button Below Card */}
      <div className="flex justify-center -mb-3">
        <button
          onClick={() => onAddAfter(dayIndex, index)}
          className="bg-white border-2 border-orange-500 text-orange-500 rounded-full p-2 hover:bg-orange-50 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Add New Activity Modal
const AddActivityModal = ({ isOpen, onClose, onAdd, timeSlot = 'Morning' }) => {
  const [newActivity, setNewActivity] = useState({
    type: 'text',
    time: timeSlot,
    title: '',
    description: '',
    location: '',
    duration: '',
    estimatedCost: ''
  });

  const handleSubmit = () => {
    if (newActivity.title && newActivity.description) {
      onAdd(newActivity);
      setNewActivity({
        type: 'text',
        time: timeSlot,
        title: '',
        description: '',
        location: '',
        duration: '',
        estimatedCost: ''
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Add New Activity</h3>
          
          <div className="space-y-4" onKeyPress={handleKeyPress}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
              <select
                value={newActivity.type}
                onChange={(e) => setNewActivity(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="text">General Activity</option>
                <option value="image">Sightseeing</option>
                <option value="restaurant">Restaurant</option>
                <option value="hotels">Accommodation</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={newActivity.title}
                onChange={(e) => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={newActivity.description}
                onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <select
                  value={newActivity.time}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input
                  type="text"
                  value={newActivity.duration}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="2-3 hours"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={newActivity.location}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                <input
                  type="text"
                  value={newActivity.estimatedCost}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, estimatedCost: e.target.value }))}
                  placeholder="₹ 500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!newActivity.title || !newActivity.description}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Activity
              </button>
            </div>
          </div>
        </div>
      </div>
  </div>
);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Add New Activity</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
              <select
                value={newActivity.type}
                onChange={(e) => setNewActivity(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="text">General Activity</option>
                <option value="image">Sightseeing</option>
                <option value="restaurant">Restaurant</option>
                <option value="hotels">Accommodation</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={newActivity.title}
                onChange={(e) => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={newActivity.description}
                onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <select
                  value={newActivity.time}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input
                  type="text"
                  value={newActivity.duration}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="2-3 hours"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={newActivity.location}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                <input
                  type="text"
                  value={newActivity.estimatedCost}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, estimatedCost: e.target.value }))}
                  placeholder="₹ 500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newActivity.title || !newActivity.description}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Activity
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main Editable Itinerary Component
type EditableItineraryProps = {
  itinerary: {
    days: Array<{
      day: number;
      title: string;
      date: string;
      activities: Activity[];
    }>;
  };
  tripData: {
    uid: string;
    destination: string;
    budget?: number;
    transportMode?: string[];
    companion?: string;
    questId?: string;
  };
};

const EditableItinerary: React.FC<EditableItineraryProps> = ({ itinerary, tripData }) => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [days, setDays] = useState(itinerary?.days || []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addAfterIndex, setAddAfterIndex] = useState(null);

  const handleEditActivity = (dayIndex, activityIndex, updatedActivity) => {
    const newDays = [...days];
    newDays[dayIndex].activities[activityIndex] = updatedActivity;
    setDays(newDays);
  };

  const handleDeleteActivity = (dayIndex, activityIndex) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      const newDays = [...days];
      newDays[dayIndex].activities.splice(activityIndex, 1);
      setDays(newDays);
    }
  };

  const handleMoveUp = (dayIndex, activityIndex) => {
    if (activityIndex > 0) {
      const newDays = [...days];
      const activities = newDays[dayIndex].activities;
      [activities[activityIndex], activities[activityIndex - 1]] = 
      [activities[activityIndex - 1], activities[activityIndex]];
      setDays(newDays);
    }
  };

  const handleMoveDown = (dayIndex, activityIndex) => {
    const newDays = [...days];
    const activities = newDays[dayIndex].activities;
    if (activityIndex < activities.length - 1) {
      [activities[activityIndex], activities[activityIndex + 1]] = 
      [activities[activityIndex + 1], activities[activityIndex]];
      setDays(newDays);
    }
  };

  const handleAddAfter = (dayIndex, activityIndex) => {
    setAddAfterIndex({ dayIndex, activityIndex });
    setShowAddModal(true);
  };

  const handleAddActivity = (newActivity) => {
    if (addAfterIndex) {
      const newDays = [...days];
      newDays[addAfterIndex.dayIndex].activities.splice(
        addAfterIndex.activityIndex + 1, 
        0, 
        { ...newActivity, id: Date.now().toString() }
      );
      setDays(newDays);
    }
    setShowAddModal(false);
    setAddAfterIndex(null);
  };

  // TODO: Replace the following lines with your actual user and questId retrieval logic 
  const user =  tripData?.uid || 'no-uid' // Replace with actual user object or context
  // Try to get questId from itinerary or tripData if available
  const questId = tripData?.questId || 'demo-quest-id';

  const handleSaveItinerary = async () => {
    try {
      const response = await fetch(`/api/user/${user?.uid}/quests/${questId}/itinerary`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ days })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Itinerary saved successfully!');
      } else {
        alert(`Failed to save: ${result.error}`);
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving itinerary');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Edit Your Quest</h1>
              <p className="text-sm text-gray-600">{tripData.destination}</p>
            </div>
            <button
              onClick={handleSaveItinerary}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
            >
              Save Quest
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 pb-20">
        {/* Trip Summary Card */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6 shadow-sm">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Duration:</span>
              <p className="font-medium">{days.length} days</p>
            </div>
            <div>
              <span className="text-gray-600">Budget:</span>
              <p className="font-medium">₹ {tripData.budget?.toLocaleString()}/night</p>
            </div>
            <div>
              <span className="text-gray-600">Transport:</span>
              <p className="font-medium">{tripData.transportMode?.join(', ')}</p>
            </div>
            <div>
              <span className="text-gray-600">Companion:</span>
              <p className="font-medium capitalize">{tripData.companion}</p>
            </div>
          </div>
        </div>

        {/* Day selector */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {days.map((day, index) => (
              <button
                key={index}
                onClick={() => setSelectedDay(index)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedDay === index 
                    ? 'bg-orange-500 text-white shadow-md' 
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-300 hover:shadow-sm'
                }`}
              >
                Day {day.day}
              </button>
            ))}
          </div>
        </div>

        {/* Selected day content */}
        {days[selectedDay] && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {days[selectedDay].title}
              </h2>
              <p className="text-gray-600 text-sm">
                {new Date(days[selectedDay].date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {/* Activities with spacing */}
            <div className="space-y-6">
              {days[selectedDay].activities.map((activity, index) => (
                <div key={`${selectedDay}-${index}`}>
                  <ActivityCard
                    activity={activity}
                    index={index}
                    dayIndex={selectedDay}
                    onEdit={handleEditActivity}
                    onDelete={handleDeleteActivity}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    onAddAfter={handleAddAfter}
                    canMoveUp={index > 0}
                    canMoveDown={index < days[selectedDay].activities.length - 1}
                  />
                </div>
              ))}
              
              {/* Final Add Button */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => handleAddAfter(selectedDay, days[selectedDay].activities.length - 1)}
                  className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-dashed border-orange-300 text-orange-500 rounded-lg hover:bg-orange-50 hover:border-orange-400 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Add New Activity to Day {days[selectedDay].day}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Activity Modal */}
      <AddActivityModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setAddAfterIndex(null);
        }}
        onAdd={handleAddActivity}
      />

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default EditableItinerary;