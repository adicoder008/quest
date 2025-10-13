// Create a reusable Google Places Location Input Component
// File: components/common/LocationInput.tsx

import React, { useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';

interface LocationInputProps {
  value: string;
  onChange: (location: { name: string; coordinates?: { lat: number; lng: number } }) => void;
  placeholder?: string;
  className?: string;
}

export const LocationInput = ({ 
  value, 
  onChange, 
  placeholder = "Search for a place...",
  className = ""
}: LocationInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    const initAutocomplete = () => {
      if (window.google && inputRef.current) {
        autocompleteRef.current = new google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ['establishment', 'geocode'],
            fields: ['name', 'geometry', 'formatted_address', 'place_id']
          }
        );

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          if (place && place.geometry) {
            onChange({
              name: place.name || place.formatted_address || '',
              coordinates: {
                lat: place.geometry.location?.lat() || 0,
                lng: place.geometry.location?.lng() || 0
              }
            });
          }
        });
      }
    };

    if (window.google) {
      initAutocomplete();
    } else {
      const checkGoogleMaps = setInterval(() => {
        if (window.google) {
          initAutocomplete();
          clearInterval(checkGoogleMaps);
        }
      }, 100);

      return () => clearInterval(checkGoogleMaps);
    }
  }, [onChange]);

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ name: e.target.value });
  };

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <MapPin size={16} className="text-orange-400" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleManualChange}
        className={`w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none ${className}`}
        placeholder={placeholder}
      />
    </div>
  );
};

// Update the GoogleFormActivityCard to use this component:
// In the edit mode location field, replace the input with:
