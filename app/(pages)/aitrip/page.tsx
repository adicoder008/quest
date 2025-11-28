'use client'
import React, { CSSProperties, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { MapPin, Calendar, Users, Plane, Train, Bus, Car, Ship, DollarSign, ArrowLeft, ArrowRight, Plus, X } from 'lucide-react';
import questService from '@/lib/questService';
import Header from '@/components/phoneComponents/header';
import Footer from '@/components/phoneComponents/Footer';
import Navbar from '@/components/LeftSideNav';
import { PlacesAutocomplete } from '@/components/common/PlacesAutocomplete';

const DESKTOP_MAIN_WIDTH = 40; // percentage of viewport width
const LEFT_NAV_WIDTH = 280;
const SIDEBAR_GAP = 0;

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

// Location Search Component
const LocationSearch = ({ value, onChange, onLocationSelected, placeholder }: { value: string, onChange: (value: string, data?: PlaceData) => void, onLocationSelected?: (value: string) => void, placeholder: string }) => {

  const handleSelect = async (suggestion: any) => {
    const locationName = suggestion.placePrediction.structuredFormat.mainText.text;

    try {
      const response = await fetch('/api/place-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId: suggestion.placePrediction.placeId }),
      });

      if (response.ok) {
        const data = await response.json();
        const place = data.place;

        onChange(locationName, {
          coordinates: {
            lat: place.location?.latitude || 0,
            lng: place.location?.longitude || 0
          },
          fullAddress: place.formattedAddress,
          placeId: suggestion.placePrediction.placeId,
          types: place.types
        });
      } else {
        // Fallback if details fail
        onChange(locationName, undefined);
      }
    } catch (error) {
      console.error("Failed to fetch place details", error);
      onChange(locationName, undefined);
    }

    if (onLocationSelected) {
      onLocationSelected(locationName);
    }
  };

  return (
    <PlacesAutocomplete
      value={value}
      onChange={(val) => onChange(val, undefined)}
      onSelect={handleSelect}
      placeholder={placeholder}
    />
  );
};

const AITripPlannerPage = () => {
  const [user, loading] = useAuthState(auth);
  const [currentStep, setCurrentStep] = useState(0);
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
      router.push('/');
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

  const handleAIGuestGeneration = async () => {
    if (!user) return;
    setQuestLoading(true);
    try {
      const apiResult = await questService.generateQuest({ ...tripData, uid: user.uid });
      if (apiResult.success && apiResult.questId) {
        router.push(`/quest/${apiResult.questId}`);
      } else {
        throw new Error(apiResult.error || "Failed to generate and create AI quest.");
      }
    } catch (error) {
      console.error('Error in AI quest creation flow:', error);
      alert(`Error creating quest: ${error instanceof Error ? error.message : String(error)}`);
      setQuestLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleAIGuestGeneration();
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
      <div className=" min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <div className="mt-4">
            <div className="h-6 overflow-hidden relative mx-auto w-full max-w-xs">
              <div className="text-gray-300 leading-6 animate-quest-lines">
                {[
                  'Conjuring up your next adventure...',
                  'Plotting the perfect route...',
                  'Scouting local gems...',
                  'Packing digital bags...'
                ].map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </div>
            </div>

            <style jsx>{`
              .animate-quest-lines {
                display: block;
                /* total height = number of lines * line height */
              }
              .animate-quest-lines > div {
                height: 1.5rem; /* matches the container (.h-6) */
                display: flex;
                align-items: center;
                justify-content: center;
              }
              @keyframes slide-quest {
                0% { transform: translateY(0%); }
                20% { transform: translateY(0%); }
                25% { transform: translateY(-100%); }
                45% { transform: translateY(-100%); }
                50% { transform: translateY(-200%); }
                70% { transform: translateY(-200%); }
                75% { transform: translateY(-300%); }
                95% { transform: translateY(-300%); }
                100% { transform: translateY(0%); }
              }
              .animate-quest-lines {
                animation: slide-quest 6s linear infinite;
              }
            `}</style>
          </div>
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep];
  const containerStartExpression = `calc((100vw - (${LEFT_NAV_WIDTH}px + ${SIDEBAR_GAP}px + ${DESKTOP_MAIN_WIDTH}vw)) / 2)`;
  const mainLeftExpression = `calc(${containerStartExpression} + ${LEFT_NAV_WIDTH + SIDEBAR_GAP}px)`;
  const desktopMainStyle: CSSProperties = {
    width: `${DESKTOP_MAIN_WIDTH}vw`,
    marginLeft: mainLeftExpression,
    marginRight: 'auto',
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Desktop Layout */}
      <div className="hidden md:block relative min-h-screen">
        <Navbar
          user={null}
          onSignOut={function (): void {
            throw new Error('Function not implemented.');
          }}
          style={{ left: containerStartExpression, right: 'auto', width: `${LEFT_NAV_WIDTH}px` }}
        />
        <div className="relative min-h-screen" style={desktopMainStyle}>
          <div className="border-x border-gray-800 min-h-screen px-8 py-6">
            {/* Progress bar */}
            <div className="mb-12">
              <div className="flex justify-between mb-3">
                <span className="text-lg text-gray-400">AI Trip Planner</span>
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
                        className={`p-8 rounded-2xl border-2 transition-all hover:scale-105 ${isSelected
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
                        className={`p-8 rounded-2xl border-2 transition-all hover:scale-105 ${isSelected
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
                              className={`px-6 py-3 rounded-full text-base transition-all hover:scale-105 ${isSelected
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
                    <div className="text-center relative">
                      <span className="text-5xl font-bold">₹ {tripData.budget.toLocaleString()}</span>
                      <button
                        onClick={() => {
                          const value = prompt('Enter budget amount:', tripData.budget.toString());
                          if (value && !isNaN(Number(value))) {
                            const numValue = Number(value);
                            if (numValue >= 500 && numValue <= 20000) {
                              updateTripData('budget', numValue);
                            } else {
                              alert('Please enter a value between ₹500 and ₹20,000');
                            }
                          }
                        }}
                        className="ml-4 inline-flex items-center text-gray-400 hover:text-orange-500 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="20000"
                    step="500"
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
                  (currentStepData.key === 'transport' && tripData.transportMode.length === 0) ||
                  (currentStepData.key === 'tripType' && !tripData.tripType) ||
                  loadingpreferences
                }
                className="flex items-center gap-2 px-8 py-4 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed ml-auto text-lg"
              >
                {currentStep === steps.length - 1 ? 'Generate Quest' : 'Next'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
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
              <span className="text-sm text-gray-400">AI Trip Planner</span>
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

          {/* Step content - Same as desktop but with mobile-optimized sizing */}
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
                      className={`p-6 rounded-xl border-2 transition-all ${isSelected
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
                      className={`p-6 rounded-xl border-2 transition-all ${isSelected
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
                            className={`px-4 py-2 rounded-full text-sm transition-all ${isSelected
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
                  min="500"
                  max="20000"
                  step="500"
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

export default AITripPlannerPage;