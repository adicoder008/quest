import { getGeminiItinerary, fetchNearbyHotels, parseItineraryToPlaces } from './placesService';

async function main() {
  try {
    // Fetch itinerary from Gemini API
    const itineraryText = await getGeminiItinerary(
      'Mangalore',
      'Goa',
      '2025-04-15 to 2025-04-17',
      2,
      'train',
      2000,
      'budget',
      'beaches, nightlife, seafood'
    );

    // Parse itinerary text to extract places
    const places = parseItineraryToPlaces(itineraryText);

    // Fetch nearby hotels for each place
    const placesWithHotels = await Promise.all(
      places.map(async (place) => {
        if (place.type === 'hotel') {
          const nearbyHotels = await fetchNearbyHotels(place.lat, place.lng);
          return { ...place, nearbyHotels };
        }
        return place;
      })
    );

    console.log('Places with Hotels:', placesWithHotels);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();