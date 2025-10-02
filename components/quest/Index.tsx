'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import questService from '@/lib/questService';
import { MapPin, Calendar, Users, Plane, Train, Bus, Car, Ship, DollarSign, ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import EditableItinerary from '../../components/quest/ActivityCard'

interface TripData {
  uid?: string;
  destination: string;
  startDate: string;
  endDate: string;
  transportMode: string[];
  companion: string;
  interests: string[];
  budget: number;
}

interface Activity {
  type: string;
  time: string;
  title: string;
  description: string;
  imageUrl?: string;
  hotels?: Hotel[];
}

interface Hotel {
  name: string;
  location: string;
  price: string;
  rating: string;
  ratingCount?: string;
  imageUrl?: string;
}

interface Day {
  day: number;
  date: string;
  title: string;
  activities: Activity[];
}

interface Itinerary {
  days: Day[];
  transportOptions?: {
    flights?: Flight[];
  };
}

interface Flight {
  airline: string;
  flightNumber: string;
  price: string;
  duration: string;
  departureTime: string;
  arrivalTime: string;
}

const QuestPage = () => {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAITrip, setIsAITrip] = useState<boolean | null>(null);
  const [tripData, setTripData] = useState<TripData>({
    destination: '',
    startDate: '',
    endDate: '',
    transportMode: [],
    companion: '',
    interests: [],
    budget: 10000
  });
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  const steps = [
    { title: "What is ur destination?", key: "destination" },
    { title: "Got dates in mind?", key: "dates" },
    { title: "How would you like to travel?", key: "transport" },
    { title: "Who are you taking?", key: "companion" },
    { title: "Tell us what you're interested in?", key: "interests" },
    { title: "What is your budget for this trip?", key: "budget" }
  ];

  const transportOptions = [
    { id: 'flight', label: 'Flight', icon: Plane },
    { id: 'train', label: 'Train', icon: Train },
    { id: 'bus', label: 'Bus', icon: Bus },
    { id: 'vehicle', label: 'Car', icon: Car },
    { id: 'ship', label: 'Ship', icon: Ship }
  ];

  const companionOptions = [
    { id: 'solo', label: 'Flying Solo', icon: '✈️' },
    { id: 'partner', label: 'A Partner', icon: '💑' },
    { id: 'friends', label: 'Friends', icon: '👥' },
    { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' }
  ];

  const interestOptions = [
    'Adventure', 'Food', 'Art', 'Hidden gems', 'History', 'Nature',
    'Nightlife', 'Culture attraction', 'Drinks'
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      if (isAITrip) {
        generateAIItinerary();
      } else {
        createBlankItinerary();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateAIItinerary = async () => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-quest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: user.uid,
          source: 'Current Location',
          destination: tripData.destination,
          startDate: tripData.startDate,
          endDate: tripData.endDate,
          transportMode: tripData.transportMode,
          tripType: [tripData.companion],
          preferences: tripData.interests,
          budget: tripData.budget
        })
      });

      const result = await response.json();
      if (result.success) {
        // Extract flowCards from itinerary
        const flowCards = result.itinerary?.days?.flatMap((day: Day) => 
          day.activities?.map((activity: Activity) => ({
            location: { name: activity.description || '', coordinates: { lat: 0, lng: 0 } },
            title: activity.title || '',
            description: activity.description || '',
            time: activity.time || '',
            type: activity.type || 'text',
          })) || []
        ) || [];

        const questPayload = { 
          ...tripData, 
          uid: user.uid,
          itinerary: result.itinerary 
        };

        const createResult = await questService.createQuest(
          user.uid, 
          questPayload,
          null as any, // No cover image file
          flowCards
        );

        if (createResult.success) {
          router.push(`/quest/${createResult.questId}`);
        } else {
          console.error('Failed to create quest');
          setItinerary(result.itinerary);
        }
      }
    } catch (error) {
      console.error('Error generating itinerary:', error);
      createBlankItinerary();
    }
    setIsLoading(false);
  };

  const createBlankItinerary = () => {
    if (!user?.uid) return;

    const startDate = new Date(tripData.startDate);
    const endDate = new Date(tripData.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const blankDays: Day[] = [];
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
    
    setItinerary({ days: blankDays });
  };

  const updateTripData = (key: keyof TripData, value: any) => {
    setTripData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleTransport = (transportId: string) => {
    const current = tripData.transportMode;
    const updated = current.includes(transportId)
      ? current.filter(id => id !== transportId)
      : [...current, transportId];
    updateTripData('transportMode', updated);
  };

  const toggleInterest = (interest: string) => {
    const current = tripData.interests;
    const updated = current.includes(interest)
      ? current.filter(i => i !== interest)
      : [...current, interest];
    updateTripData('interests', updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Generating your perfect itinerary...</p>
        </div>
      </div>
    );
  }

  if (itinerary) {
    return <EditableItinerary itinerary={itinerary} tripData={{ ...tripData, uid: user?.uid || '' }} />;
  }

  if (isAITrip === null) {
    return (
      <div className="min-h-screen bg-black text-white relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-black"></div>
        <div className="relative z-10 px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Choose your next Quest!</h1>
              <p className="text-gray-400">Create your own Quest with AI, or choose from your saved Quests and edit.</p>
            </div>

            <div className="space-y-4 mb-8">
              <button
                onClick={() => setIsAITrip(true)}
                className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
              >
                Create Quest with AI
              </button>
              <button
                onClick={() => setIsAITrip(false)}
                className="w-full border border-gray-600 text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
              >
                Create Quest from scratch
              </button>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Popular Quests</h2>
              <div className="bg-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      <span className="text-sm">Goa</span>
                    </div>
                    <p className="text-xs text-gray-400">Feb 2026 • 4.5 4 day trip</p>
                  </div>
                  <button className="text-gray-400">
                    <span className="text-lg">⋯</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-black text-white relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-black"></div>
      <div className="relative z-10 px-4 py-8">
        <div className="max-w-md mx-auto">
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
            {currentStepData.key === 'destination' && (
              <div>
                <input
                  type="text"
                  placeholder="Search"
                  value={tripData.destination}
                  onChange={(e) => updateTripData('destination', e.target.value)}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-600 focus:border-orange-500 focus:outline-none"
                />
                <div className="mt-4 space-y-2">
                  <div 
                    onClick={() => updateTripData('destination', 'London, UK')}
                    className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-700"
                  >
                    <MapPin className="w-5 h-5 text-orange-500" />
                    <span>London, UK</span>
                  </div>
                  <div 
                    onClick={() => updateTripData('destination', 'Goa, India')}
                    className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-700"
                  >
                    <MapPin className="w-5 h-5 text-orange-500" />
                    <span>Goa, India</span>
                  </div>
                </div>
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
                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-600 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Select End Date</label>
                  <input
                    type="date"
                    value={tripData.endDate}
                    onChange={(e) => updateTripData('endDate', e.target.value)}
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

            {currentStepData.key === 'companion' && (
              <div className="grid grid-cols-2 gap-4">
                {companionOptions.map((option) => {
                  const isSelected = tripData.companion === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => updateTripData('companion', option.id)}
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

            {currentStepData.key === 'interests' && (
              <div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {interestOptions.map((interest) => {
                    const isSelected = tripData.interests.includes(interest);
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
                <button className="flex items-center gap-2 text-orange-500 text-sm">
                  <Plus className="w-4 h-4" />
                  Add Interest +
                </button>
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
          <div className="flex gap-4">
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
                (currentStepData.key === 'destination' && !tripData.destination) ||
                (currentStepData.key === 'dates' && (!tripData.startDate || !tripData.endDate)) ||
                (currentStepData.key === 'transport' && tripData.transportMode.length === 0) ||
                (currentStepData.key === 'companion' && !tripData.companion)
              }
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
            >
              {currentStep === steps.length - 1 ? 'Generate Quest' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </button>
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

export default QuestPage;