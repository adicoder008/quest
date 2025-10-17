// File: app/quest/page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { MapPin, Calendar, Sparkles, Plus, Folder, ArrowLeft, ArrowRight, X } from 'lucide-react';
import Header from '@/components/phoneComponents/header';
import Footer from '@/components/phoneComponents/Footer';
import Navbar from '@/components/Nav';
import PhotoBasedQuestCreation from '@/components/quest/PhotoBasedQuestCreation';
import LayoutWrapper from '@/components/LayoutWrapper';

interface PlaceData {
  coordinates: { lat: number; lng: number };
  fullAddress: string;
  placeId: string;
  types: string[];
}

interface TripData {
  destination: string;
  startDate: string;
  endDate: string;
  destinationData?: PlaceData;
}

const PopularDestinationCard = ({ 
  imageUrl, 
  title, 
  subtitle 
}: { 
  imageUrl: string; 
  title: string; 
  subtitle: string;
}) => {
  return (
    <div className="relative flex-shrink-0 w-[216px] h-[224px] rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer">
      <img
        src={imageUrl}
        alt={title}
        className="absolute h-full w-full object-cover"
      />
      <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="absolute bottom-3 left-3 text-white">
        <p className="text-sm font-semibold leading-tight">{title}</p>
        <p className="text-xs text-gray-200">{subtitle}</p>
      </div>
    </div>
  );
};

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
      if ((window as any).google) {
        const service = new (window as any).google.maps.places.AutocompleteService();
        service.getPlacePredictions(
          {
            input,
            types: ['(cities)'],
          },
          (preds: any, status: any) => {
            setLoading(false);
            if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && preds) {
              setPredictions(preds.slice(0, 8));
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
      if ((window as any).google) {
        const map = new (window as any).google.maps.Map(document.createElement('div'));
        const service = new (window as any).google.maps.places.PlacesService(map);
        
        service.getDetails(
          {
            placeId,
            fields: ['name', 'geometry', 'formatted_address', 'types']
          },
          (place: any, status: any) => {
            if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && place) {
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

const LocationSearch = ({ value, onChange, placeholder }: { value: string, onChange: (value: string, data?: PlaceData) => void, placeholder: string }) => {
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
          aria-label={placeholder}
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
            aria-label="clear"
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
  const [isCreating, setIsCreating] = useState(false);
  const [showPhotoFlow, setShowPhotoFlow] = useState(false);
  const router = useRouter();

  const [tripData, setTripData] = useState<TripData>({
    destination: '',
    startDate: '',
    endDate: '',
  });

  const popularDestinations = [
    { title: "Catch the Sunrise", subtitle: "Nandi Hills", imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop" },
    { title: "Serene Backwaters", subtitle: "Kerala", imageUrl: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=800&h=600&fit=crop" },
    { title: "Majestic Forts", subtitle: "Rajasthan", imageUrl: "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=800&h=600&fit=crop" },
    { title: "Misty Mountains", subtitle: "Himachal", imageUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop" },
    { title: "Golden Sands", subtitle: "Rann of Kutch", imageUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156?w=800&h=600&fit=crop" },
    { title: "Lush Tea Gardens", subtitle: "Munnar", imageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&h=600&fit=crop" },
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  const steps = [
    { title: "Where are you going?", key: "destination" },
    { title: "When are you traveling?", key: "dates" },
  ];

  const handleDestinationChange = (destination: string, placeData?: PlaceData) => {
    setTripData(prev => ({ ...prev, destination, destinationData: placeData }));
  };

  const updateTripData = (key: keyof TripData, value: any) => {
    setTripData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowPhotoFlow(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  // Handle photo flow
  if (showPhotoFlow && isCreating) {
    if (!user) return null;
    return (
      <PhotoBasedQuestCreation
        userId={user.uid}
        destination={tripData.destination}
        startDate={tripData.startDate}
        endDate={tripData.endDate}
        onBack={() => {
          setShowPhotoFlow(false);
          setCurrentStep(steps.length - 1);
        }}
      />
    );
  }

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
  
  // Main quest options page
  if (!isCreating) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Desktop Navbar + Main content spacing */}
        <div className="hidden md:block">
          <Navbar user={user} onSignOut={() => {/* implement signout */}} />
          {/* Content container respects navbar widths: collapsed (md) 80px, expanded (xl) 280px */}
          <main className="md:pl-[80px] xl:pl-[280px]">
            {/* Hero Section */}
            <div className="relative h-[50vh] w-full flex items-center">
              <div className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop")'
                }}
              />

              <div className="relative container mx-auto px-8 flex flex-col justify-center items-end h-full">
                <h1 className="text-5xl font-bold mb-4 text-white text-right">Plan Your Next Quest!</h1>
                <p className="text-xl text-gray-200 mb-8 max-w-2xl text-right">
                  Create your own Quest from scratch or browse your saved Quests.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setIsCreating(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-orange-500/30 flex items-center gap-3"
                  >
                    <Plus className="w-6 h-6" />
                    Create Quest
                  </button>
                  <button
                    onClick={() => router.push('/my-quests')}
                    className="bg-white/10 backdrop-blur hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all border border-white/30 flex items-center gap-3"
                  >
                    <Folder className="w-6 h-6" />
                    My Quests
                  </button>
                </div>
              </div>
            </div>

            {/* Popular Destinations Section */}
            <div className="max-w-7xl mx-auto px-8 py-12">
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">Popular Destinations</h2>
                <p className="text-gray-400">Explore trending travel spots</p>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
                {popularDestinations.map((dest, index) => (
                  <PopularDestinationCard
                    key={index}
                    title={dest.title}
                    subtitle={dest.subtitle}
                    imageUrl={dest.imageUrl}
                  />
                ))}
              </div>
            </div>
          </main>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <Header />
          <main>
            <div className="relative h-[360px] w-full">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop")'
                }}
              />
              <div className="relative h-full flex flex-col justify-center items-center px-6">
                <h1 className="text-2xl font-bold mb-3 text-white text-center">Plan Your Next Quest!</h1>
                <p className="text-sm text-gray-200 mb-6 text-center">
                  Create your own Quest or browse your saved adventures.
                </p>
                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <button
                    onClick={() => setIsCreating(true)}
                    className="bg-orange-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Create Quest
                  </button>
                  <button
                    onClick={() => router.push('/my-quests')}
                    className="bg-white/10 backdrop-blur text-white py-3 rounded-xl font-semibold border border-white/30 flex items-center justify-center gap-2"
                  >
                    <Folder className="w-5 h-5" />
                    My Quests
                  </button>
                </div>
              </div>
            </div>

            <div className="px-4 py-6 mb-20">
              <div className="mb-4">
                <h2 className="text-xl font-bold mb-1">Popular Destinations</h2>
                <p className="text-sm text-gray-400">Explore trending travel spots</p>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {popularDestinations.map((dest, index) => (
                  <PopularDestinationCard
                    key={index}
                    title={dest.title}
                    subtitle={dest.subtitle}
                    imageUrl={dest.imageUrl}
                  />
                ))}
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  // Creation flow
  const currentStepData = steps[currentStep];

  return (
    <LayoutWrapper hasNavbar={true}>
      <div className="min-h-screen bg-black text-white md:pl-[80px] xl:pl-[280px]">
        {/* Desktop Layout */}
        <div className="hidden md:block">
          <Navbar user={user} onSignOut={() => {/* implement signout */}} />
          <div className="max-w-4xl mx-auto px-8 py-6">
            {/* Progress bar */}
            <div className="mb-12">
              <div className="flex justify-between mb-3">
                <span className="text-lg text-gray-400">Create Quest</span>
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

            <div className="mb-12">
              {currentStepData.key === 'destination' && (
                <div className="max-w-2xl">
                  <LocationSearch
                    value={tripData.destination}
                    onChange={handleDestinationChange}
                    placeholder="Where are you going?"
                  />
                </div>
              )}

              {currentStepData.key === 'dates' && (
                <div className="grid grid-cols-2 gap-6 max-w-2xl">
                  <div>
                    <label className="block text-base text-gray-400 mb-3">Select Start Date</label>
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
            </div>

            <div className="flex gap-6">
              {currentStep > 0 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-8 py-4 border-2 border-gray-600 rounded-xl text-gray-300 hover:border-gray-500 transition-all text-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
              ) : (
                <button
                  onClick={() => setIsCreating(false)}
                  className="flex items-center gap-2 px-8 py-4 border-2 border-gray-600 rounded-xl text-gray-300 hover:border-gray-500 transition-all text-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Cancel
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={
                  (currentStepData.key === 'destination' && !tripData.destination) ||
                  (currentStepData.key === 'dates' && (!tripData.startDate || !tripData.endDate))
                }
                className="flex items-center gap-2 px-8 py-4 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed ml-auto text-lg"
              >
                {currentStep === steps.length - 1 ? 'Upload Photos' : 'Next'}
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
                <span className="text-sm text-gray-400">Create Quest</span>
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

            <div className="mb-8">
              {currentStepData.key === 'destination' && (
                <LocationSearch
                  value={tripData.destination}
                  onChange={handleDestinationChange}
                  placeholder="Where are you going?"
                />
              )}

              {currentStepData.key === 'dates' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Select Start Date</label>
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
            </div>

            <div className="flex gap-4 mb-20">
              {currentStep > 0 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-600 rounded-xl text-gray-300 hover:border-gray-500 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <button
                  onClick={() => setIsCreating(false)}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-600 rounded-xl text-gray-300 hover:border-gray-500 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Cancel
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={
                  (currentStepData.key === 'destination' && !tripData.destination) ||
                  (currentStepData.key === 'dates' && (!tripData.startDate || !tripData.endDate))
                }
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
              >
                {currentStep === steps.length - 1 ? 'Upload Photos' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </LayoutWrapper>
  );
};

export default QuestPage;

