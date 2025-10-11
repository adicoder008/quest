// src/components/quest/LocationSearchModal.tsx
import React, { useState, useEffect } from 'react';
import { MapPin, X, Loader2, Search } from 'lucide-react';

interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: {
    name: string;
    coordinates: { lat: number; lng: number };
    placeId: string;
    fullAddress: string;
  }) => void;
  initialValue?: string;
}

const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  initialValue = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.length < 3) {
      setPredictions([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchPlaces(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const searchPlaces = async (input: string) => {
    if (!window.google) return;

    setSearching(true);
    try {
      const service = new google.maps.places.AutocompleteService();
      service.getPlacePredictions(
        { input },
        (predictions, status) => {
          setSearching(false);
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setPredictions(predictions);
          } else {
            setPredictions([]);
          }
        }
      );
    } catch (error) {
      console.error('Error fetching predictions:', error);
      setSearching(false);
    }
  };

  const handleSelectPlace = async (prediction: google.maps.places.AutocompletePrediction) => {
    setLoading(true);
    try {
      const map = new google.maps.Map(document.createElement('div'));
      const service = new google.maps.places.PlacesService(map);

      service.getDetails(
        {
          placeId: prediction.place_id,
          fields: ['name', 'geometry', 'formatted_address', 'place_id']
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            onLocationSelect({
              name: place.name || prediction.structured_formatting.main_text,
              coordinates: {
                lat: place.geometry?.location?.lat() || 0,
                lng: place.geometry?.location?.lng() || 0
              },
              placeId: place.place_id || prediction.place_id,
              fullAddress: place.formatted_address || ''
            });
            onClose();
          }
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Error getting place details:', error);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold text-white">Search Location</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for a place..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full bg-gray-800 text-white pl-12 pr-4 py-4 rounded-xl border border-gray-700 focus:border-orange-500 focus:outline-none text-lg"
            />
            {searching && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500 animate-spin" />
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
          ) : predictions.length > 0 ? (
            <div className="space-y-2">
              {predictions.map((prediction) => (
                <button
                  key={prediction.place_id}
                  onClick={() => handleSelectPlace(prediction)}
                  className="w-full flex items-start gap-3 p-4 hover:bg-gray-800 rounded-xl transition-colors text-left"
                >
                  <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white mb-1">
                      {prediction.structured_formatting.main_text}
                    </div>
                    <div className="text-sm text-gray-400 truncate">
                      {prediction.structured_formatting.secondary_text}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : searchQuery.length > 0 && !searching ? (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No places found</p>
              <p className="text-sm text-gray-500 mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Start typing to search</p>
              <p className="text-sm text-gray-500 mt-1">Enter at least 3 characters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationSearchModal;