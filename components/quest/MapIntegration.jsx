// components/MapIntegration.jsx - Google Maps integration for quest locations
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Clock, DollarSign, Edit3, Plus, Trash2 } from 'lucide-react';

// Map component for displaying locations
const QuestMap = ({ activities, center, zoom = 12 }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    // Initialize Google Maps
    if (!window.google || !mapRef.current) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: center || { lat: 28.6139, lng: 77.2090 }, // Default to Delhi
      zoom: zoom,
      styles: [
        {
          "elementType": "geometry",
          "stylers": [{"color": "#212121"}]
        },
        {
          "elementType": "labels.icon",
          "stylers": [{"visibility": "off"}]
        },
        {
          "elementType": "labels.text.fill",
          "stylers": [{"color": "#757575"}]
        },
        {
          "elementType": "labels.text.stroke",
          "stylers": [{"color": "#212121"}]
        }
      ]
    });

    setMap(mapInstance);

    return () => {
      // Cleanup markers
      markers.forEach(marker => marker.setMap(null));
    };
  }, [center, zoom]);

  useEffect(() => {
    if (!map || !activities) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    // Create new markers for activities with locations
    const newMarkers = [];
    activities.forEach((activity, index) => {
      if (activity.location && activity.coordinates) {
        const marker = new window.google.maps.Marker({
          position: activity.coordinates,
          map: map,
          title: activity.title,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 0C6.716 0 0 6.716 0 15C0 26.25 15 40 15 40S30 26.25 30 15C30 6.716 23.284 0 15 0Z" fill="#f97316"/>
                <circle cx="15" cy="15" r="8" fill="white"/>
                <text x="15" y="20" text-anchor="middle" fill="#f97316" font-size="12" font-weight="bold">${index + 1}</text>
              </svg>
            `)}`,
            scaledSize: new window.google.maps.Size(30, 40)
          }
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="color: black; max-width: 250px;">
              <h3 style="margin: 0 0 8px 0; color: #f97316;">${activity.title}</h3>
              <p style="margin: 0 0 8px 0; font-size: 14px;">${activity.description}</p>
              <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #666;">
                <span>📍 ${activity.location}</span>
              </div>
              ${activity.estimatedCost ? `<div style="margin-top: 8px; font-weight: bold; color: #f97316;">${activity.estimatedCost}</div>` : ''}
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        newMarkers.push(marker);
      }
    });

    setMarkers(newMarkers);
  }, [map, activities]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-64 rounded-lg"
      style={{ minHeight: '256px' }}
    />
  );
};

// Enhanced itinerary view with map integration
export const EnhancedItineraryView = ({ itinerary, tripData, onUpdateActivity, onAddActivity, onDeleteActivity }) => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [editingActivity, setEditingActivity] = useState(null);
  const [showAddActivity, setShowAddActivity] = useState(false);

  // Get activities with coordinates for map
  const getActivitiesWithCoordinates = (dayActivities) => {
    return dayActivities.filter(activity => activity.coordinates || activity.location);
  };

  const handleEditActivity = (dayIndex, activityIndex, activity) => {
    setEditingActivity({ dayIndex, activityIndex, activity });
  };

  const handleSaveActivity = async (updatedActivity) => {
    if (editingActivity && onUpdateActivity) {
      await onUpdateActivity(
        editingActivity.dayIndex, 
        editingActivity.activityIndex, 
        updatedActivity
      );
      setEditingActivity(null);
    }
  };

  const handleAddNewActivity = async (newActivity) => {
    if (onAddActivity) {
      await onAddActivity(selectedDay, newActivity);
      setShowAddActivity(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">
                {itinerary.tripTitle || `Trip to ${tripData.destination}`}
              </h1>
              <p className="text-gray-400">{itinerary.overview}</p>
            </div>
            <button className="text-gray-400 hover:text-white">
              <Edit3 className="w-5 h-5" />
            </button>
          </div>

          {/* Trip Summary */}
          <div className="bg-gray-900 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <MapPin className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <p className="text-sm text-gray-400">Destination</p>
                <p className="font-semibold">{tripData.destination}</p>
              </div>
              <div className="text-center">
                <Clock className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <p className="text-sm text-gray-400">Dates</p>
                <p className="font-semibold">{tripData.startDate} - {tripData.endDate}</p>
              </div>
              <div className="text-center">
                <Users className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <p className="text-sm text-gray-400">Travelers</p>
                <p className="font-semibold">{tripData.travelers} People</p>
              </div>
              <div className="text-center">
                <DollarSign className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <p className="text-sm text-gray-400">Budget</p>
                <p className="font-semibold">{tripData.budget}</p>
              </div>
            </div>
            <div className="text-center">   
                <Navigation className="w-5 h-5 text-orange-500 mx-auto mb-1" />         
                <p className="text-sm text-gray-400">Transport</p>
                <p className="font-semibold">{tripData.transportation.join(', ')}</p>
            </div>
          </div>

          {/* Day Selector */}
          <div className="flex space-x-2 mb-6 overflow-x-auto">
            {itinerary.days.map((day, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-full ${selectedDay === index ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                onClick={() => setSelectedDay(index)}
              >
                Day {index + 1}
              </button>
            ))}
          </div>

          {/* Activities List */}
          <div className="mb-6">
            {itinerary.days[selectedDay] && itinerary.days[selectedDay].length > 0 ? (
              itinerary.days[selectedDay].map((activity, activityIndex) => (
                <div key={activityIndex} className="bg-gray-900 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{activity.title}</h3>
                      <p className="text-gray-400 mb-2">{activity.description}</p>
                      <div className="flex items-center text-sm text-gray-400 space-x-4">
                        {activity.location && (
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" /> {activity.location}
                          </span>
                        )}
                        {activity.time && (
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" /> {activity.time}
                          </span>
                        )}
                        {activity.estimatedCost && (
                          <span className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" /> {activity.estimatedCost}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        className="text-gray-400 hover:text-white"
                        onClick={() => handleEditActivity(selectedDay, activityIndex, activity)}
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => onDeleteActivity && onDeleteActivity(selectedDay, activityIndex)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button> 
                    </div>
                  </div>
                </div>
              ))
            ) : ( 
                <p className="text-gray-400">No activities planned for this day.</p>
            )}
            <button
              className="flex items-center text-orange-500 hover:text-orange-700 mt-2"
              onClick={() => setShowAddActivity(true)}
            >
              <Plus className="w-5 h-5 mr-1" /> Add Activity
            </button>
          </div>
          
          {/* Map Integration */}
            <div className="mb-6">
                <h2 className="text-xl font-bold mb-4">Map View</h2>
                <QuestMap
                    activities={getActivitiesWithCoordinates(itinerary.days[selectedDay] || [])}
                    center={tripData.center}
                    zoom={12}
                />
            </div>
        </div>
      </div>

      {/* Edit Activity Modal */}
      {editingActivity && (
        <ActivityModal
          activity={editingActivity.activity}
          onClose={() => setEditingActivity(null)}
          onSave={handleSaveActivity}
        />
      )}

      {/* Add Activity Modal */}
      {showAddActivity && (
        <ActivityModal
          onClose={() => setShowAddActivity(false)}
          onSave={handleAddNewActivity}
        />
      )}
    </div>
  );
};