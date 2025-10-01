// File: app/quest/page.tsx

'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { MapPin, Calendar, Users, Plane, Train, Bus, Car, Ship, DollarSign, ArrowLeft, ArrowRight, Plus, X } from 'lucide-react';
import questService from '../../../lib/questService';
import Header from '@/components/phoneComponents/header';
import Footer from '@/components/phoneComponents/Footer';
import Navbar from '@/components/Nav';

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

// Location Search Component
const LocationSearch = ({ value, onChange, onLocationSelected, placeholder }: { value: string, onChange: (value: string, data?: PlaceData) => void, onLocationSelected?: (value: string) => void, placeholder: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const { predictions, loading, searchPlaces, getPlaceDetails, clearPredictions } = useGooglePlaces();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue, undefined);
    
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
      router.push('/auth');
    }
  }, [user, loading, router]);

  const aiTripSteps = [
    { title: "Where are you traveling from and to?", key: "locations" },
    { title: "Got dates in mind?", key: "dates" },
    { title: "How would you like to travel?", key: "transport" },
    { title: "Who are you taking?", key: "tripType" },
    { title: "Tell us what you're interested in?", key: "preferences" },
    { title: "What is your budget for this trip?", key: "budget" }
  ];

  const scratchTripSteps = [
    { title: "Where are you traveling from and to?", key: "locations" },
    { title: "Got dates in mind?", key: "dates" },
  ];
  
  const steps = isAITrip ? aiTripSteps : scratchTripSteps;

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
      const suggestions = await questService.getDestinationSuggestions(destination);
      if (suggestions.length > 0) {
        setInterestOptions(suggestions);
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
    if (isAITrip) {
      fetchDestinationpreferences(destination);
    }
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

  const handleAIGuestGeneration = async () => {
    if (!user) return;
    setQuestLoading(true);
    try {
      const apiResult = await questService.generateQuest({ ...tripData, uid: user.uid });
      if (!apiResult.success || !apiResult.itinerary) {
        throw new Error("Failed to get itinerary from AI");
      }

      const questPayload = { ...tripData, itinerary: apiResult.itinerary };

      const createResult = await questService.createQuest(user.uid, questPayload);
      if (createResult.success) {
        router.push(`/quest/${createResult.questId}`);
      } else {
        throw new Error("Failed to save the created quest.");
      }
    } catch (error) {
      console.error('Error in AI quest creation flow:', error);
      setQuestLoading(false);
    }
  };

  const createBlankItinerary = async () => {
    if (!user) return;
    setQuestLoading(true);
    try {
      const startDate = new Date(tripData.startDate);
      const endDate = new Date(tripData.endDate);
      const timeDiff = endDate.getTime() - startDate.getTime();
      const dayCount = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1);
    
      const blankDays = Array.from({ length: dayCount }, (_, i) => {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        return {
          day: i + 1,
          date: currentDate.toISOString().split('T')[0],
          title: `Day ${i + 1} in ${tripData.destination}`,
          activities: []
        };
      });

      const questPayload = { ...tripData, itinerary: { days: blankDays } };

      const result = await questService.createQuest(user.uid, questPayload);
      if (result.success) {
        router.push(`/quest/${result.questId}`);
      } else {
        throw new Error("Failed to save blank quest.");
      }
    } catch (error) {
      console.error('Error creating blank itinerary:', error);
      setQuestLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      if (isAITrip) {
        await handleAIGuestGeneration();
      } else {
        await createBlankItinerary();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
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
          <p>Conjuring up your next adventure...</p>
        </div>
      </div>
    );
  }
  
  if (isAITrip === null) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Desktop Layout */}
        <div className="hidden md:block">
          <Navbar />
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Hero */}
              <div className="space-y-6">
                <div className="bg-cover bg-center h-96 rounded-3xl" style={{
                  backgroundImage: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center")'
                }}>
                  <div className="flex flex-col justify-center items-center h-full text-center p-8">
                    <h1 className="text-4xl font-bold mb-4">Choose your next Quest!</h1>
                    <p className="text-gray-300 text-lg max-w-md">Create your own Quest with AI, or choose from your saved Quests and edit.</p>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-2xl p-6">
                  <h2 className="text-xl font-semibold mb-4">Popular Quests</h2>
                  <div className="bg-gray-800 rounded-xl p-5 hover:bg-gray-750 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-5 h-5 text-orange-500" />
                          <span className="text-lg text-white font-medium">Goa</span>
                        </div>
                        <p className="text-sm text-gray-400">Feb 2026 • ⭐ 4.5 • 4 day trip</p>
                      </div>
                      <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xl">⋯</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Actions */}
              <div className="flex flex-col justify-center space-y-4">
                <button
                  onClick={() => setIsAITrip(true)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 rounded-2xl font-semibold text-xl transition-colors shadow-lg hover:shadow-orange-500/50"
                >
                  Create Quest with AI
                </button>
                <button
                  onClick={() => setIsAITrip(false)}
                  className="w-full border-2 border-gray-600 hover:border-gray-500 text-white py-6 rounded-2xl font-semibold text-xl transition-colors"
                >
                  Create Quest from scratch
                </button>
                <button
                  onClick={() => router.push('/my-quests')}
                  className="w-full border-2 border-orange-500 text-orange-500 py-6 rounded-2xl font-semibold text-xl hover:bg-orange-500/10 transition-colors"
                >
                  My Quests
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <Header />
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
              <button
                onClick={() => router.push('/my-quests')}
                className="w-full border-2 border-orange-500 text-orange-500 py-4 rounded-xl font-semibold text-lg hover:bg-orange-500/10 transition-colors"
              >
                My Quests
              </button>
            </div>
          </div>

          <div className="mb-20 px-4">
            <h2 className="text-lg font-semibold mb-4">Popular Quests</h2>
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-white">Goa</span>
                  </div>
                  <p className="text-xs text-gray-400">Feb 2026 • ⭐ 4.5 • 4 day trip</p>
                </div>
                <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">⋯</span>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Desktop Layout */}
      <div className="hidden md:block">
        <Navbar />
        <div className="max-w-4xl mx-auto px-8 py-6">
          {/* Progress bar */}
          <div className="mb-12">
            <div className="flex justify-between mb-3">
              <span className="text-lg text-gray-400">{isAITrip ? "Quest with AI" : "Create Quest"}</span>
              <span className="text-lg text-gray-400">{currentStep + 1}/{steps.length}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3">
              <div 
                className="bg-orange-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-12">{currentStepData.title}</h1>

          {/* Step content */}
          <div className="mb-12">
            {currentStepData.key === 'locations' && (
              <div className="space-y-6 max-w-2xl">
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
              <div className="grid grid-cols-2 gap-6 max-w-2xl">
                <div>
                  <label className="block text-base text-gray-400 mb-3">Select start Date</label>
                  <input
                    type="date"
                    value={tripData.startDate}
                    onChange={(e) => updateTripData('startDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-gray-800 text-white px-4 py-4 rounded-xl border border-gray-600 focus:border-orange-500 focus:outline-none text-lg"
                  />
                </div>
                <div>
                  <label className="block text-base text-gray-400 mb-3">Select End Date</label>
                  <input
                    type="date"
                    value={tripData.endDate}
                    onChange={(e) => updateTripData('endDate', e.target.value)}
                    min={tripData.startDate || new Date().toISOString().split('T')[0]}
                    className="w-full bg-gray-800 text-white px-4 py-4 rounded-xl border border-gray-600 focus:border-orange-500 focus:outline-none text-lg"
                  />
                </div>
              </div>
            )}

            {currentStepData.key === 'transport' && (
              <div className="grid grid-cols-3 lg:grid-cols-5 gap-6 max-w-3xl">
                {transportOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = tripData.transportMode.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => toggleTransport(option.id)}
                      className={`p-8 rounded-2xl border-2 transition-all hover:scale-105 ${
                        isSelected 
                          ? 'border-orange-500 bg-orange-500/10' 
                          : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                      }`}
                    >
                      <Icon className={`w-10 h-10 mx-auto mb-3 ${isSelected ? 'text-orange-500' : 'text-gray-400'}`} />
                      <span className="text-base">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {currentStepData.key === 'tripType' && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-3xl">
                {tripTypeOptions.map((option) => {
                  const isSelected = tripData.tripType === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => updateTripData('tripType', option.id)}
                      className={`p-8 rounded-2xl border-2 transition-all hover:scale-105 ${
                        isSelected 
                          ? 'border-orange-500 bg-orange-500/10' 
                          : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-4xl mb-3">{option.icon}</div>
                      <span className="text-base">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {currentStepData.key === 'preferences' && (
              <div className="max-w-3xl">
                {loadingpreferences ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
                    <span className="ml-4 text-gray-400 text-lg">Loading preferences for {tripData.destination}...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-3 mb-6">
                      {interestOptions.map((interest) => {
                        const isSelected = tripData.preferences.includes(interest);
                        return (
                          <button
                            key={interest}
                            onClick={() => toggleInterest(interest)}
                            className={`px-6 py-3 rounded-full text-base transition-all hover:scale-105 ${
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
                    <button className="flex items-center gap-2 text-orange-500 text-base hover:text-orange-400 transition-colors">
                      <Plus className="w-5 h-5" />
                      Add Interest +
                    </button>
                  </>
                )}
              </div>
            )}

            {currentStepData.key === 'budget' && (
              <div className="max-w-2xl">
                <div className="mb-8">
                  <label className="block text-base text-gray-400 mb-4">per person per night</label>
                  <div className="text-center">
                    <span className="text-5xl font-bold">₹ {tripData.budget.toLocaleString()}</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={tripData.budget}
                  onChange={(e) => updateTripData('budget', parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-800 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-3">
                  <span>₹ 1,000</span>
                  <span>₹ 1,00,000</span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-6">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-8 py-4 border-2 border-gray-600 rounded-xl text-gray-300 hover:border-gray-500 transition-all text-lg"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={
                (currentStepData.key === 'locations' && (!tripData.source || !tripData.destination)) ||
                (currentStepData.key === 'dates' && (!tripData.startDate || !tripData.endDate)) ||
                (isAITrip && currentStepData.key === 'transport' && tripData.transportMode.length === 0) ||
                (isAITrip && currentStepData.key === 'tripType' && !tripData.tripType) ||
                loadingpreferences
              }
              className="flex items-center gap-2 px-8 py-4 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed ml-auto text-lg"
            >
              {currentStep === steps.length - 1 ? (isAITrip ? 'Generate Quest' : 'Create Quest') : 'Next'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <Header />
        <div className="px-4 py-4">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">{isAITrip ? "Quest with AI" : "Create Quest"}</span>
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
                (isAITrip && currentStepData.key === 'transport' && tripData.transportMode.length === 0) ||
                (isAITrip && currentStepData.key === 'tripType' && !tripData.tripType) ||
                loadingpreferences
              }
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
            >
              {currentStep === steps.length - 1 ? (isAITrip ? 'Generate Quest' : 'Create Quest') : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <Footer />
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

export default QuestPage;