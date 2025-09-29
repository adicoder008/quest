import { useState, useCallback, useRef } from 'react';

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types: string[];
}

export const useGooglePlaces = () => {
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  // Initialize services
  const initializeServices = useCallback(() => {
    if (typeof window !== 'undefined' && window.google) {
      if (!autocompleteService.current) {
        autocompleteService.current = new google.maps.places.AutocompleteService();
      }
      if (!placesService.current) {
        const map = new google.maps.Map(document.createElement('div'));
        placesService.current = new google.maps.places.PlacesService(map);
      }
    }
  }, []);

  // Search for place predictions
  const searchPlaces = useCallback(async (input: string) => {
    if (!input || input.length < 3) {
      setPredictions([]);
      return;
    }

    initializeServices();
    
    if (!autocompleteService.current) {
      console.error('Google Places service not initialized');
      return;
    }

    setLoading(true);

    try {
      const request = {
        input,
        types: ['(cities)', 'establishment'], // Focus on cities and tourist attractions
        componentRestrictions: undefined, // Remove to allow worldwide search
      };

      autocompleteService.current.getPlacePredictions(
        request,
        (predictions, status) => {
          setLoading(false);
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setPredictions(predictions.slice(0, 8)); // Limit to 8 results
          } else {
            setPredictions([]);
          }
        }
      );
    } catch (error) {
      setLoading(false);
      console.error('Error fetching place predictions:', error);
    }
  }, [initializeServices]);

  // Get place details including coordinates
  const getPlaceDetails = useCallback(async (placeId: string): Promise<{
    name: string;
    coordinates: { lat: number; lng: number };
    formatted_address: string;
    types: string[];
  } | null> => {
    initializeServices();

    if (!placesService.current) {
      console.error('Places service not initialized');
      return null;
    }

    return new Promise((resolve) => {
      placesService.current!.getDetails(
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
    });
  }, [initializeServices]);

  return {
    predictions,
    loading,
    searchPlaces,
    getPlaceDetails,
    clearPredictions: () => setPredictions([])
  };
};
