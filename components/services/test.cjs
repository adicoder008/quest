const axios = require('axios');

async function testBackend() {
  try {
    const response = await axios.post('http://localhost:5000/api/generate-itinerary', {
      source: 'Mumbai',
      destination: 'Goa',
      dateRange: '2025-12-01 to 2025-12-05',
      days: 4,
      transport: 'flight',
      budget: 5000,
      accommodationType: 'hotel',
      preferences: 'beach, nightlife',
      destinationLat: 15.2993,
      destinationLng: 74.124
    });

    console.log('Itinerary:', response.data.itinerary);
    console.log('Places:', response.data.places);
    console.log('Hotels:', response.data.hotels);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testBackend();