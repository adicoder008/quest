const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Google Places API Key
const GOOGLE_API_KEY = 'AIzaSyD3ZFwUynLIrpQ0P4Uvmwohv-E15WJHCuo'; // Replace with your API key

// Google Gemini API Key
const GEMINI_API_KEY = 'AIzaSyDzaUYWfmTyEpUYGvLRjnlwJ7_ZKNXEt8Y'; // Replace with your Gemini API key

/**
 * Fetches detailed hotel information using Google Places API.
 */
async function fetchDetailedHotels(lat, lng, checkInDate, checkOutDate, budget) {
  try {
    // Step 1: Get basic hotel listings using Nearby Search
    const nearbyResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
      {
        params: {
          location: `${lat},${lng}`,
          radius: 10000, // Search within 10 km
          type: 'lodging', // Fetch hotels
          key: GOOGLE_API_KEY,
        },
      }
    );

    const hotelBasicInfo = nearbyResponse.data.results;

    // Step 2: Get detailed information for each hotel using Place Details API
    const detailedHotels = await Promise.all(
      hotelBasicInfo.map(async (hotel) => {
        const detailsResponse = await axios.get(
          `https://maps.googleapis.com/maps/api/place/details/json`,
          {
            params: {
              place_id: hotel.place_id,
              fields: 'name,place_id,formatted_address,formatted_phone_number,website,url,rating,user_ratings_total,reviews,price_level,photos,opening_hours,geometry',
              key: GOOGLE_API_KEY,
            },
          }
        );

        const hotelDetails = detailsResponse.data.result;

        // Step 3: Get booking links if available using the new Hotel Booking endpoint
        let bookingLinks = [];
        let priceInfo = null;

        if (checkInDate && checkOutDate) {
          try {
            const bookingResponse = await axios.get(
              `https://maps.googleapis.com/maps/api/place/hotels/details`,
              {
                params: {
                  place_id: hotel.place_id,
                  language: 'en',
                  check_in_date: checkInDate,
                  check_out_date: checkOutDate,
                  key: GOOGLE_API_KEY,
                },
              }
            );

            if (bookingResponse.data && bookingResponse.data.booking_links) {
              bookingLinks = bookingResponse.data.booking_links.map((link) => ({
                provider: link.provider_name,
                url: link.url,
                price: link.price ? link.price.amount : null,
                currency: link.price ? link.price.currency : null,
              }));

              // Filter by budget if specified
              if (budget) {
                bookingLinks = bookingLinks.filter((link) => {
                  return !link.price || link.price <= budget;
                });
              }

              // Get the lowest price
              if (bookingLinks.length > 0) {
                const prices = bookingLinks
                  .filter((link) => link.price)
                  .map((link) => link.price);

                if (prices.length > 0) {
                  priceInfo = {
                    minPrice: Math.min(...prices),
                    maxPrice: Math.max(...prices),
                    currency: bookingLinks[0].currency,
                  };
                }
              }
            }
          } catch (bookingError) {
            console.warn(`Booking details not available for ${hotel.name}:`, bookingError.message);
          }
        }

        // Process photos to get URLs
        const photos = hotelDetails.photos
          ? hotelDetails.photos.map((photo) => ({
              url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`,
              attributions: photo.html_attributions,
            }))
          : [];

        // Process reviews
        const reviews = hotelDetails.reviews
          ? hotelDetails.reviews.map((review) => ({
              author: review.author_name,
              rating: review.rating,
              text: review.text,
              time: review.time,
              relativeTime: review.relative_time_description,
            }))
          : [];

        return {
          id: hotel.place_id,
          name: hotelDetails.name,
          address: hotelDetails.formatted_address,
          phone: hotelDetails.formatted_phone_number,
          website: hotelDetails.website,
          googleMapsUrl: hotelDetails.url,
          lat: hotelDetails.geometry.location.lat,
          lng: hotelDetails.geometry.location.lng,
          rating: hotelDetails.rating,
          totalRatings: hotelDetails.user_ratings_total,
          priceLevel: hotelDetails.price_level, // 0-4 scale, where 0 is free and 4 is very expensive
          priceInfo: priceInfo,
          bookingLinks: bookingLinks,
          photos: photos,
          reviews: reviews,
          openingHours: hotelDetails.opening_hours ? hotelDetails.opening_hours.weekday_text : null,
          type: 'hotel',
        };
      })
    );

    return detailedHotels;
  } catch (error) {
    console.error('Error fetching detailed hotels:', error.message);
    throw error;
  }
}

/**
 * Fetches itinerary data from the Gemini API.
 */
async function getGeminiItinerary(source, destination, dateRange, days, transport, budget, accommodationType, preferences) {
  try {
    // Parse dateRange to extract check-in and check-out dates
    const dates = dateRange.split(' to ');
    const checkInDate = dates[0];
    const checkOutDate = dates.length > 1 ? dates[1] : '';

    const prompt = `Create a Morning, Afternoon, Evening, Night schedule (not time wise) for ${days}-day travel itinerary from ${source} to ${destination} for travel dates ${dateRange} considering transport mode ${transport} and accommodationType ${accommodationType} and budget per night excluding transportation is ${budget} rupees and preferences ${preferences}.

For EACH activity mentioned, include real and accurate GPS coordinates in the following format that can be easily extracted:
Location Name: [latitude], [longitude]

Also, suggest good areas to stay based on the itinerary with real GPS coordinates in this format:
Recommended Stay Area: [area name]: [latitude], [longitude]

At the end of the itinerary, include a separate section titled "LOCATION COORDINATES" with a list of all important locations in this exact format:
Day 1 Morning: [latitude], [longitude]
Day 1 Afternoon: [latitude], [longitude]
Day 1 Evening: [latitude], [longitude]
Day 1 Night: [latitude], [longitude]
Day 2 Morning: [latitude], [longitude]
... and so on for all days.

Make sure to provide REAL and ACCURATE coordinates that correspond to actual places in ${destination} that match the activities in the itinerary.

Include check-in date ${checkInDate} and check-out date ${checkOutDate} in the itinerary.`;

    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY } }
    );

    return response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No itinerary generated';
  } catch (error) {
    console.error('Error in Gemini API:', error.message);
    throw error;
  }
}

/**
 * API Endpoint to generate itinerary and fetch hotels.
 */
app.post('/api/generate-itinerary', async (req, res) => {
  const { source, destination, dateRange, days, transport, budget, accommodationType, preferences } = req.body;

  try {
    // Step 1: Generate itinerary using Gemini API
    const itineraryText = await getGeminiItinerary(
      source,
      destination,
      dateRange,
      days,
      transport,
      budget,
      accommodationType,
      preferences
    );

    // Step 2: Extract coordinates from Day 1 Morning in the itinerary
    const day1MorningMatch = itineraryText.match(/Day 1 Morning: ([-+]?[0-9]*\.?[0-9]+), ([-+]?[0-9]*\.?[0-9]+)/);
    if (!day1MorningMatch) {
      return res.status(400).json({ error: 'Could not extract coordinates from Day 1 Morning' });
    }

    const destinationLat = parseFloat(day1MorningMatch[1]);
    const destinationLng = parseFloat(day1MorningMatch[2]);

    // Step 3: Fetch hotels using the extracted coordinates
    const hotels = await fetchDetailedHotels(
      destinationLat,
      destinationLng,
      dateRange.split(' to ')[0],
      dateRange.split(' to ')[1],
      budget
    );

    res.json({
      itinerary: itineraryText,
      hotels: hotels,
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});