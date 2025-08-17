// hooks/useItineraryPlaces.ts
import { useEffect, useState } from 'react';
import { getGeminiItinerary, fetchNearbyHotels, parseItineraryToPlaces } from '../components/services/placesService';

export const useItineraryPlaces = (source, destination, dateRange, days, transport, budget, accommodationType, preferences) => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItineraryAndHotels = async () => {
      try {
        const itineraryText = await getGeminiItinerary(source, destination, dateRange, days, transport, budget, accommodationType, preferences);
        const parsedPlaces = parseItineraryToPlaces(itineraryText);
        const placesWithHotels = await Promise.all(
          parsedPlaces.map(async (place) => {
            if (place.type === 'hotel') {
              const nearbyHotels = await fetchNearbyHotels(place.lat, place.lng);
              return { ...place, nearbyHotels };
            }
            return place;
          })
        );
        setPlaces(placesWithHotels);
        setLoading(false);
      } catch (err) {
        setError('Failed to load itinerary and hotel data');
        setLoading(false);
      }
    };

    fetchItineraryAndHotels();
  }, [source, destination, dateRange, days, transport, budget, accommodationType, preferences]);

  return { places, loading, error };
};