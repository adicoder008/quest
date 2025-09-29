import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import { useGooglePlaces } from '@/hooks/useGooglePlaces';

interface DestinationSearchProps {
  value: string;
  onChange: (destination: string, placeData?: any) => void;
  onDestinationSelected: (destination: string) => void;
}

const DestinationSearch: React.FC<DestinationSearchProps> = ({
  value,
  onChange,
  onDestinationSelected
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { predictions, loading, searchPlaces, getPlaceDetails, clearPredictions } = useGooglePlaces();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        clearPredictions();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [clearPredictions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    
    if (newValue.length >= 3) {
      setIsOpen(true);
      searchPlaces(newValue);
    } else {
      setIsOpen(false);
      clearPredictions();
    }
  };

  const handlePlaceSelect = async (prediction: any) => {
    try {
      const placeDetails = await getPlaceDetails(prediction.place_id);
      
      if (placeDetails) {
        const destinationName = prediction.structured_formatting.main_text;
        setInputValue(destinationName);
        onChange(destinationName, {
          coordinates: placeDetails.coordinates,
          fullAddress: placeDetails.formatted_address,
          placeId: prediction.place_id,
          types: placeDetails.types
        });
        
        // Trigger interest generation for this destination
        onDestinationSelected(destinationName);
      }
    } catch (error) {
      console.error('Error getting place details:', error);
    }
    
    setIsOpen(false);
    clearPredictions();
  };

  const clearInput = () => {
    setInputValue('');
    onChange('');
    setIsOpen(false);
    clearPredictions();
    inputRef.current?.focus();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          placeholder="Search destinations..."
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (inputValue.length >= 3) {
              setIsOpen(true);
              searchPlaces(inputValue);
            }
          }}
          className="w-full bg-gray-800 text-white pl-10 pr-10 py-3 rounded-xl border border-gray-600 focus:border-orange-500 focus:outline-none"
        />
        
        {inputValue && (
          <button
            onClick={clearInput}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-white" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            </div>
          )}
          
          {!loading && predictions.length === 0 && inputValue.length >= 3 && (
            <div className="px-4 py-3 text-gray-400 text-sm">
              No destinations found
            </div>
          )}
          
          {!loading && predictions.map((prediction) => (
            <button
              key={prediction.place_id}
              onClick={() => handlePlaceSelect(prediction)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors text-left"
            >
              <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-white truncate">
                  {prediction.structured_formatting.main_text}
                </div>
                <div className="text-sm text-gray-400 truncate">
                  {prediction.structured_formatting.secondary_text}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DestinationSearch;