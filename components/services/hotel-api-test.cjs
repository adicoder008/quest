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
const GEMINI_API_KEY = 'your-gemini-api-key'; // Replace with your Gemini API key

// Fetch nearby hotels from Google Places API
async function fetchNearbyHotels(latitude, longitude, radius = 5000) {
  const url = 'https://places.googleapis.com/v1/places:searchNearby';
  const requestBody = {
    includedTypes: ['lodging'],
    maxResultCount: 10,
    locationRestriction: {
      circle: {
        center: { latitude, longitude },
        radius
      }
    }
  };

  try {
    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'places.displayName,places.rating,places.userRatingCount,places.photos,places.formattedAddress,places.id'
      }
    });

    return response.data.places.map(place => ({
      id: place.id,
      name: place.displayName?.text || 'Unknown',
      rating: place.rating || 'N/A',
      ratingCount: place.userRatingCount || 'N/A',
      photo: place.photos?.[0]?.name || null,
      location: place.formattedAddress || 'Unknown',
      price: 'N/A' // Placeholder for price
    }));
  } catch (error) {
    console.error('Error fetching nearby hotels:', error.message);
    return [];
  }
}

// Fetch area summary for a specific place
async function fetchAreaSummary(placeId) {
  const url = `https://places.googleapis.com/v1/places/${placeId}:fetchAreaSummary`;
  const requestBody = {
    languageCode: 'en-US' // Language for the summary
  };

  try {
    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'areaSummary.contentBlocks'
      }
    });

    return response.data.areaSummary.contentBlocks;
  } catch (error) {
    console.error('Error fetching area summary:', error.message);
    return [];
  }
}

// Generate a summary from the area summary data
function generateSummary(contentBlocks) {
  let summary = '';

  contentBlocks.forEach(block => {
    summary += `**${block.topic}**: ${block.content.text}\n\n`;
  });

  return summary.trim();
}

// Fetch average price using Google Gemini API
async function fetchAveragePrice(hotelName, location) {
  const url = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';
  const prompt = `What is the average price per night for ${hotelName} in ${location}?`;

  try {
    const response = await axios.post(url, {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GEMINI_API_KEY
      }
    });

    const priceText = response.data.candidates[0].content.parts[0].text;
    const priceMatch = priceText.match(/\$\d+/); // Extract price from text
    return priceMatch ? priceMatch[0] : 'N/A';
  } catch (error) {
    console.error('Error fetching average price:', error.message);
    return 'N/A';
  }
}

// API Endpoint to fetch hotel data with summary and average price
app.get('/api/hotels', async (req, res) => {
  const { latitude, longitude, radius } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  try {
    // Fetch nearby hotels from Google Places API
    const hotels = await fetchNearbyHotels(parseFloat(latitude), parseFloat(longitude), parseInt(radius || 5000));

    // Fetch area summary and average price for each hotel
    const hotelsWithDetails = await Promise.all(hotels.map(async hotel => {
      const contentBlocks = await fetchAreaSummary(hotel.id);
      const summary = generateSummary(contentBlocks);
      const price = await fetchAveragePrice(hotel.name, hotel.location);

      return { ...hotel, summary, price };
    }));

    res.json(hotelsWithDetails);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});