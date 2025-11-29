import React from 'react';
import { PlacesAutocomplete } from './PlacesAutocomplete';
import { PlaceSuggestion } from '@/hooks/usePlacesAutocomplete';

interface LocationInputProps {
  value: string;
  onChange: (location: { name: string; coordinates?: { lat: number; lng: number } }) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export const LocationInput = ({
  value,
  onChange,
  placeholder = "Search for a place...",
  className = "",
  required = false
}: LocationInputProps) => {

  const handleSelect = async (suggestion: PlaceSuggestion) => {
    // We need to fetch details to get coordinates, as the autocomplete suggestion
    // might not have them directly (depending on the field mask used in the hook).
    // The previous implementation used Google Maps JS API to get details.
    // Here we can use our server-side API if we have one for details, or just pass the name
    // if coordinates are not strictly required immediately, or fetch them here.

    // For now, to maintain compatibility with the prop signature which expects coordinates,
    // we should ideally fetch them. However, the new hook uses the Autocomplete API which
    // returns a prediction.

    // Let's check if we have a place details endpoint.
    // Based on previous grep, we saw `app/api/place-details/route.ts`.

    try {
      const response = await fetch('/api/place-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId: suggestion.placePrediction.placeId }),
      });

      if (response.ok) {
        const details = await response.json();
        onChange({
          name: suggestion.placePrediction.structuredFormat.mainText.text,
          coordinates: details.place.location // Corrected property access
        });
      } else {
        // Fallback if details fail
        onChange({
          name: suggestion.placePrediction.structuredFormat.mainText.text
        });
      }
    } catch (error) {
      console.error("Failed to fetch place details", error);
      onChange({
        name: suggestion.placePrediction.structuredFormat.mainText.text
      });
    }
  };

  const handleChange = (newValue: string) => {
    // If the user types manually, we just update the name.
    // We don't have coordinates for partial input.
    onChange({ name: newValue });
  };

  return (
    <PlacesAutocomplete
      value={value}
      onChange={handleChange}
      onSelect={handleSelect}
      placeholder={placeholder}
      className={className}
      required={required}
    />
  );
};