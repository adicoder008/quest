// app/quest/page.tsx - Updated with Source and Destination
'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { MapPin, Calendar, Users, Plane, Train, Bus, Car, Ship, DollarSign, ArrowLeft, ArrowRight, Plus, X } from 'lucide-react';
import { questAPI } from '@/lib/questService';
import EditableItinerary from '../../../components/quest/ActivityCard';


interface PlaceData {
  coordinates: { lat: number; lng: number };
  fullAddress: string;
  placeId: string;
  types: string[];
}

interface TripData {
  source: string;
  destination: string;
  startDate: string;
  endDate: string;
  transportMode: string[];
  tripType: string;
  preferences: string[];
  budget: number;
  sourceData?: PlaceData;
  destinationData?: PlaceData;
}

// Google Places Autocomplete Hook
const useGooglePlaces = () => {
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [loading, setLoading] = useState(false);

  const searchPlaces = async (input: string) => {
    if (!input || input.length < 3) {
      setPredictions([]);
      return;
    }

    setLoading(true);
    try {
      if (window.google) {
        const service = new google.maps.places.AutocompleteService();
        service.getPlacePredictions(
          {
            input,
            types: ['(cities)'],
          },
          (predictions, status) => {
            setLoading(false);
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              setPredictions(predictions.slice(0, 8));
            } else {
              setPredictions([]);
            }
          }
        );
      }
    } catch (error) {
      setLoading(false);
      console.error('Error fetching place predictions:', error);
    }
  };

  const getPlaceDetails = async (placeId: string): Promise<any> => {
    return new Promise((resolve) => {
      if (window.google) {
        const map = new google.maps.Map(document.createElement('div'));
        const service = new google.maps.places.PlacesService(map);
        
        service.getDetails(
          {
            placeId,
            fields: ['name', 'geometry', 'formatted_address', 'types']
          },
          (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && place) {
              resolve({
                name: place.name || '',
                coordinates: {
                  lat: place.geometry?.location?.lat() || 0,
                  lng: place.geometry?.location?.lng() || 0
                },
                formatted_address: place.formatted_address || '',
                types: place.types || []
              });
            } else {
              resolve(null);
            }
          }
        );
      }
    });
  };

  return { predictions, loading, searchPlaces, getPlaceDetails, clearPredictions: () => setPredictions([]) };
};

// Location Search Component (Reusable for Source and Destination)
const LocationSearch = ({ value, onChange, onLocationSelected, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const { predictions, loading, searchPlaces, getPlaceDetails, clearPredictions } = useGooglePlaces();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue, undefined); // Clear placeData when typing
    
    if (newValue.length >= 3) {
      setIsOpen(true);
      searchPlaces(newValue);
    } else {
      setIsOpen(false);
      clearPredictions();
    }
  };

  const handlePlaceSelect = async (prediction: google.maps.places.AutocompletePrediction) => {
    try {
      const placeDetails = await getPlaceDetails(prediction.place_id);
      
      if (placeDetails) {
        const locationName = prediction.structured_formatting.main_text;
        setInputValue(locationName);
        onChange(locationName, {
          coordinates: placeDetails.coordinates,
          fullAddress: placeDetails.formatted_address,
          placeId: prediction.place_id,
          types: placeDetails.types
        });
        
        if (onLocationSelected) {
          onLocationSelected(locationName);
        }
      }
    } catch (error) {
      console.error('Error getting place details:', error);
    }
    
    setIsOpen(false);
    clearPredictions();
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (inputValue.length >= 3) setIsOpen(true);
          }}
          className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-600 focus:border-orange-500 focus:outline-none"
        />
        {inputValue && (
          <button
            onClick={() => {
              setInputValue('');
              onChange('', undefined);
              setIsOpen(false);
              clearPredictions();
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-white" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          {loading && <div className="p-4 text-center text-gray-400">Loading...</div>}
          {!loading && predictions.length > 0 && predictions.map((p) => (
            <button
              key={p.place_id}
              onClick={() => handlePlaceSelect(p)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700 text-left"
            >
              <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <div>
                <div className="font-medium text-white">{p.structured_formatting.main_text}</div>
                <div className="text-sm text-gray-400">{p.structured_formatting.secondary_text}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};


const QuestPage = () => {
  const [user, loading] = useAuthState(auth);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAITrip, setIsAITrip] = useState<boolean | null>(null);
  const [questLoading, setQuestLoading] = useState(false);
  const [currentQuest, setCurrentQuest] = useState<any>(null);
  const router = useRouter();

  const [tripData, setTripData] = useState<TripData>({
    source: '',
    destination: '',
    startDate: '',
    endDate: '',
    transportMode: [],
    tripType: '',
    preferences: [],
    budget: 10000
  });

  const [interestOptions, setInterestOptions] = useState([
    'Adventure', 'Food', 'Art', 'Hidden gems', 'History', 'Nature',
    'Nightlife', 'Culture attraction', 'Shopping', 'Drinks'
  ]);
  const [loadingpreferences, setLoadingpreferences] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const steps = [
    { title: "Where are you traveling from and to?", key: "locations" },
    { title: "Got dates in mind?", key: "dates" },
    { title: "How would you like to travel?", key: "transport" },
    { title: "Who are you taking?", key: "tripType" },
    { title: "Tell us what you're interested in?", key: "preferences" },
    { title: "What is your budget for this trip?", key: "budget" }
  ];

  const transportOptions = [
    { id: 'flight', label: 'Flight', icon: Plane },
    { id: 'train', label: 'Train', icon: Train },
    { id: 'bus', label: 'Bus', icon: Bus },
    { id: 'vehicle', label: 'Car', icon: Car },
    { id: 'ship', label: 'Ship', icon: Ship }
  ];

  const tripTypeOptions = [
    { id: 'solo', label: 'Flying Solo', icon: '✈️' },
    { id: 'partner', label: 'A Partner', icon: '💑' },
    { id: 'friends', label: 'Friends', icon: '👥' },
    { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' }
  ];

  const fetchDestinationpreferences = async (destination: string) => {
    setLoadingpreferences(true);
    try {
      const response = await fetch(`/api/destination-suggestions/${encodeURIComponent(destination)}`);
      const data = await response.json();
      if (data.success && data.suggestions?.length) {
        setInterestOptions(data.suggestions);
      }
    } catch (error) {
      console.error('Error fetching destination preferences:', error);
    }
    setLoadingpreferences(false);
  };
  
  const handleSourceChange = (source: string, placeData?: PlaceData) => {
    setTripData(prev => ({ ...prev, source, sourceData: placeData }));
  };

  const handleDestinationChange = (destination: string, placeData?: PlaceData) => {
    setTripData(prev => ({ ...prev, destination, destinationData: placeData }));
  };
  
  const handleDestinationSelected = (destination: string) => {
    fetchDestinationpreferences(destination);
  };

  const updateTripData = (key: keyof TripData, value: any) => {
    setTripData(prev => ({ ...prev, [key]: value }));
  };

  const toggleTransport = (transportId: string) => {
    const updated = tripData.transportMode.includes(transportId)
      ? tripData.transportMode.filter(id => id !== transportId)
      : [...tripData.transportMode, transportId];
    updateTripData('transportMode', updated);
  };

  const toggleInterest = (interest: string) => {
    const updated = tripData.preferences.includes(interest)
      ? tripData.preferences.filter(i => i !== interest)
      : [...tripData.preferences, interest];
    updateTripData('preferences', updated);
  };

  const handleQuestGeneration = async (questData: TripData) => {
    setQuestLoading(true);
    try {
      // Use the text name for source, not the detailed data object
      const dataToSend = {
        ...questData,
        uid: user?.uid,
        source: questData.source, // Ensure source is the string name
        destination: questData.destination, // Ensure destination is the string name
      };
      const result = await questAPI.generateQuest(dataToSend);
      if (result.success) {
        setCurrentQuest({ ...result.itinerary, questId: result.questId, tripData: questData });
      }
    } catch (error) {
      console.error('Error generating quest:', error);
    }
    setQuestLoading(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      if (isAITrip) {
        handleQuestGeneration(tripData);
      } else {
        createBlankItinerary();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const createBlankItinerary = () => {
    const startDate = new Date(tripData.startDate);
    const endDate = new Date(tripData.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const blankDays = [];
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      blankDays.push({
        day: i + 1,
        date: currentDate.toISOString().split('T')[0],
        title: `Day ${i + 1}`,
        activities: [
          {
            type: 'text',
            time: 'Morning',
            title: 'Morning Activity',
            description: 'Add your morning plans here'
          },
          {
            type: 'text',
            time: 'Afternoon',
            title: 'Afternoon Activity',
            description: 'Add your afternoon plans here'
          },
          {
            type: 'text',
            time: 'Evening',
            title: 'Evening Activity',
            description: 'Add your evening plans here'
          },
          {
            type: 'text',
            time: 'Night',
            title: 'Night Activity',
            description: 'Add your night plans here'
          }
        ]
      });
    }
    
    setCurrentQuest({
      days: blankDays,
      tripData: tripData
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (questLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Generating your perfect quest...</p>
        </div>
      </div>
    );
  }

 if (currentQuest) {
  return (
    <EditableItinerary 
      itinerary={currentQuest} 
      tripData={currentQuest.tripData || {}} 
      questId={currentQuest.questId}
      user={user}
    />
  );
}

  if (isAITrip === null) {
    return (
      <div className="min-h-screen bg-black text-white relative">
        

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">Q</span>
            </div>
            <span className="ml-2 text-orange-500 font-bold">Quest</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
            <span className="text-white text-sm">👤</span>
          </div>
        </div>

        {/* Background Image */}
        <div className="relative px-4 py-8">
          <div className="bg-cover bg-center h-64 rounded-3xl mb-8" style={{
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center")'
          }}>
            <div className="flex flex-col justify-center items-center h-full text-center p-6">
              <h1 className="text-2xl font-bold mb-2">Choose your next Quest!</h1>
              <p className="text-gray-300 text-sm">Create your own Quest with AI, or choose from your saved Quests and edit.</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <button
              onClick={() => setIsAITrip(true)}
              className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold text-lg"
            >
              Create Quest with AI
            </button>
            <button
              onClick={() => setIsAITrip(false)}
              className="w-full border border-gray-600 text-white py-4 rounded-xl font-semibold text-lg"
            >
              Create Quest from scratch
            </button>
             {/* --- NEW BUTTON ADDED HERE --- */}
            <button
              onClick={() => router.push('/my-quests')}
              className="w-full border-2 border-orange-500 text-orange-500 py-4 rounded-xl font-semibold text-lg hover:bg-orange-500/10 transition-colors"
            >
              My Quests
            </button>
            {/* --- END OF NEW BUTTON --- */}

          </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Popular Quests</h2>
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-white">Goa</span>
                  </div>
                  <p className="text-xs text-gray-400">Feb 2026 • ⭐ 4.5 4 day trip</p>
                </div>
                <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">⋯</span>
                </div>
              </div>
            </div>
          </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800">
          <div className="flex justify-around py-3">
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 mb-1">🏠</div>
              <span className="text-xs text-gray-400">Home</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 mb-1">🔍</div>
              <span className="text-xs text-gray-400">Explore</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 mb-1">➕</div>
              <span className="text-xs text-gray-400">Post</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 mb-1">📍</div>
              <span className="text-xs text-orange-500">Quest</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 mb-1">👤</div>
              <span className="text-xs text-gray-400">Account</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-black text-white relative">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">Q</span>
          </div>
          <span className="ml-2 text-orange-500 font-bold">Quest</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
          <span className="text-white text-sm">👤</span>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-400">Quest with AI</span>
            <span className="text-sm text-gray-400">{currentStep + 1}/{steps.length}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-8">{currentStepData.title}</h1>

        {/* Step content */}
        <div className="mb-8">
          {currentStepData.key === 'locations' && (
            <div className="space-y-4">
              <LocationSearch
                value={tripData.source}
                onChange={handleSourceChange}
                placeholder="Where are you starting from?"
              />
              <LocationSearch
                value={tripData.destination}
                onChange={handleDestinationChange}
                onLocationSelected={handleDestinationSelected}
                placeholder="Where are you going?"
              />
            </div>
          )}

          {currentStepData.key === 'dates' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Select start Date</label>
                <input
                  type="date"
                  value={tripData.startDate}
                  onChange={(e) => updateTripData('startDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-600 focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Select End Date</label>
                <input
                  type="date"
                  value={tripData.endDate}
                  onChange={(e) => updateTripData('endDate', e.target.value)}
                  min={tripData.startDate || new Date().toISOString().split('T')[0]}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-600 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {currentStepData.key === 'transport' && (
            <div className="grid grid-cols-2 gap-4">
              {transportOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = tripData.transportMode.includes(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleTransport(option.id)}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      isSelected 
                        ? 'border-orange-500 bg-orange-500/10' 
                        : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? 'text-orange-500' : 'text-gray-400'}`} />
                    <span className="text-sm">{option.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {currentStepData.key === 'tripType' && (
            <div className="grid grid-cols-2 gap-4">
              {tripTypeOptions.map((option) => {
                const isSelected = tripData.tripType === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => updateTripData('tripType', option.id)}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      isSelected 
                        ? 'border-orange-500 bg-orange-500/10' 
                        : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <span className="text-sm">{option.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {currentStepData.key === 'preferences' && (
            <div>
              {loadingpreferences ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  <span className="ml-3 text-gray-400">Loading preferences for {tripData.destination}...</span>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {interestOptions.map((interest) => {
                      const isSelected = tripData.preferences.includes(interest);
                      return (
                        <button
                          key={interest}
                          onClick={() => toggleInterest(interest)}
                          className={`px-4 py-2 rounded-full text-sm transition-all ${
                            isSelected 
                              ? 'bg-orange-500 text-white' 
                              : 'bg-gray-800 text-gray-300 border border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                  <button className="flex items-center gap-2 text-orange-500 text-sm hover:text-orange-400 transition-colors">
                    <Plus className="w-4 h-4" />
                    Add Interest +
                  </button>
                </>
              )}
            </div>
          )}

          {currentStepData.key === 'budget' && (
            <div>
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">per person per night</label>
                <div className="text-center">
                  <span className="text-3xl font-bold">₹ {tripData.budget.toLocaleString()}</span>
                </div>
              </div>
              <input
                type="range"
                min="1000"
                max="100000"
                step="1000"
                value={tripData.budget}
                onChange={(e) => updateTripData('budget', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>₹ 1,000</span>
                <span>₹ 1,00,000</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-4 mb-20">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-3 border border-gray-600 rounded-xl text-gray-300 hover:border-gray-500 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={
              (currentStepData.key === 'locations' && (!tripData.source || !tripData.destination)) ||
              (currentStepData.key === 'dates' && (!tripData.startDate || !tripData.endDate)) ||
              (currentStepData.key === 'transport' && tripData.transportMode.length === 0) ||
              (currentStepData.key === 'tripType' && !tripData.tripType) ||
              loadingpreferences
            }
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
          >
            {currentStep === steps.length - 1 ? 'Generate Quest' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800">
        <div className="flex justify-around py-3">
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 mb-1">🏠</div>
            <span className="text-xs text-gray-400">Home</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 mb-1">🔍</div>
            <span className="text-xs text-gray-400">Explore</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 mb-1">➕</div>
            <span className="text-xs text-gray-400">Post</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 mb-1">📍</div>
            <span className="text-xs text-orange-500">Quest</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 mb-1">👤</div>
            <span className="text-xs text-gray-400">Account</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

// Final Itinerary View Component matching the mobile design
const ItineraryView = ({ itinerary, tripData }) => {
  const [selectedDay, setSelectedDay] = useState(0);

  return (
    <div className="min-h-screen bg-black text-white">
 
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">Q</span>
          </div>
          <span className="ml-2 text-orange-500 font-bold">Quest</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
          <span className="text-white text-sm">👤</span>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Final planned trip</h1>
          <button className="text-gray-400">
            <span className="text-lg">⋯</span>
          </button>
        </div>

        {/* Trip Info */}
        <div className="bg-gray-900 rounded-xl p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2">{tripData.destination}</h2>
          <p className="text-sm text-gray-400 mb-4">
            {tripData.startDate} to {tripData.endDate} • {tripData.tripType} • {tripData.transportMode?.join(', ')}
          </p>
          
          {/* Transport Options */}
          {itinerary.transportOptions?.flights && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">Flight Options:</h3>
              {itinerary.transportOptions.flights.slice(0, 1).map((flight, index) => (
                <div key={index} className="bg-blue-900/20 rounded-lg p-3 border border-blue-500/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{flight.airline}</p>
                      <p className="text-xs text-gray-400">{flight.flightNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{flight.price}</p>
                      <p className="text-xs text-gray-400">{flight.duration}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    <span>{flight.departureTime} → {flight.arrivalTime}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Day selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {itinerary.days?.map((day, index) => (
            <button
              key={index}
              onClick={() => setSelectedDay(index)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium ${
                selectedDay === index 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-800 text-gray-300'
              }`}
            >
              Day {day.day}
            </button>
          ))}
        </div>

        {/* Selected day content */}
        {itinerary.days?.[selectedDay] && (
          <div className="mb-20">
            <h3 className="text-lg font-semibold mb-4">
              {itinerary.days[selectedDay].title}
            </h3>
            
            <div className="space-y-4">
              {itinerary.days[selectedDay].activities.map((activity, index) => (
                <div key={index} className="bg-gray-900 rounded-xl overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded">
                        {activity.time}
                      </span>
                    </div>
                    <h4 className="font-semibold mb-2">{activity.title}</h4>
                    <p className="text-sm text-gray-400 mb-3">{activity.description}</p>
                    
                    {activity.imageUrl && (
                      <img 
                        src={activity.imageUrl} 
                        alt={activity.title}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    )}
                    
                    {activity.type === 'hotels' && activity.hotels && (
                      <div className="space-y-3">
                        {activity.hotels.map((hotel, hotelIndex) => (
                          <div key={hotelIndex} className="bg-gray-800 rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h5 className="font-semibold">{hotel.name}</h5>
                                <p className="text-xs text-gray-400">{hotel.location}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-green-400">{hotel.price}</p>
                                <p className="text-xs text-gray-400">{hotel.rating} • {hotel.ratingCount}</p>
                              </div>
                            </div>
                            {hotel.imageUrl && (
                              <img 
                                src={hotel.imageUrl} 
                                alt={hotel.name}
                                className="w-full h-24 object-cover rounded"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800">
        <div className="flex justify-around py-3">
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 mb-1">🏠</div>
            <span className="text-xs text-gray-400">Home</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 mb-1">🔍</div>
            <span className="text-xs text-gray-400">Explore</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 mb-1">➕</div>
            <span className="text-xs text-gray-400">Post</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 mb-1">📍</div>
            <span className="text-xs text-orange-500">Quest</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 mb-1">👤</div>
            <span className="text-xs text-gray-400">Account</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestPage;