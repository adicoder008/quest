const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDoc , deleteDoc } = require('firebase/firestore');
const axios = require('axios');
const { createApi } = require('unsplash-js');
const nodeFetch = require('node-fetch');


require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyA_twhvY5KQs9uVCpx-iUv9Zgdf_M8BV4w');

// Initialize Unsplash
// Replace your current Unsplash initialization with this:
console.log('UNSPLASH_ACCESS_KEY present:', !!process.env.UNSPLASH_ACCESS_KEY);

const unsplash = createApi({
  accessKey:'96VdYVjIZ1tecK39L0CZ70laOo_3ZBpj4BxcavMA8IY', // Add a fallback for debugging
  fetch: nodeFetch,
  headers: {
    'Accept-Version': 'v1'
  }
});


// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBwvrGmFmVwjmXS8B7WXyoBHBLPv5eGnng",
  authDomain: "onquest-bdc27.firebaseapp.com",
  projectId: "onquest-bdc27",
  storageBucket: "onquest-bdc27.firebasestorage.app",
  messagingSenderId: "903211586009",
  appId: "1:903211586009:web:5917214d0a1d7c081ec9c8",
  measurementId: "G-47YDKS1VHH"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Updated validation function to accept arrays for transportMode and tripType
const validateTripData = (tripData) => {
  const { uid, source, destination, startDate, endDate, transportMode, tripType, preferences } = tripData;

  if (!uid || typeof uid !== 'string') {
    throw new Error('Invalid uid');
  }
  if (!source || typeof source !== 'string') {
    throw new Error('Invalid source');
  }
  if (!destination || typeof destination !== 'string') {
    throw new Error('Invalid destination');
  }
  if (!startDate || isNaN(new Date(startDate).getTime())) {
    throw new Error('Invalid startDate');
  }
  if (!endDate || isNaN(new Date(endDate).getTime())) {
    throw new Error('Invalid endDate');
  }
  if (!transportMode || !Array.isArray(transportMode)) {
    throw new Error('Invalid transportMode - must be an array');
  }
  if (!tripType || !Array.isArray(tripType)) {
    throw new Error('Invalid tripType - must be an array');
  }
  if (!Array.isArray(preferences)) {
    throw new Error('Invalid preferences - must be an array');
  }
};

app.get('/test-unsplash', async (req, res) => {
  try {
    const test = await unsplash.photos.getRandom({
      query: 'travel',
      count: 1
    });
    
    if(test.errors) {
      return res.status(400).json({ 
        error: 'Unsplash Error', 
        details: test.errors[0] 
      });
    }
    
    res.json({ 
      success: true,
      photo: test.response.urls.regular 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Unsplash Failed', 
      details: error.message 
    });
  }
});
// Add this temporary route to debug your Unsplash setup
app.get('/debug-unsplash', async (req, res) => {
  try {
    console.log('Checking Unsplash access key:', process.env.UNSPLASH_ACCESS_KEY ? 'Exists' : 'MISSING');
    
    const test = await unsplash.photos.getRandom({
      query: 'test',
      count: 1
    });
    
    res.json({
      status: 'Success',
      config: unsplash.configuration,
      response: test
    });
  } catch (error) {
    console.error('Full Unsplash error:', error);
    res.status(500).json({
      error: error.message,
      config: unsplash?.configuration,
      stack: error.stack
    });
  }
});
const generateTransportOptions = async (transportModes, source, destination, date) => {
  const transportOptions = {};
  const priorityOrder = ['flight', 'train', 'bus','ship', 'vehicle']; // Preference order

  // Process in preference order
  for (const mode of priorityOrder) {
    if (transportModes.includes(mode)) {
      try {
        switch (mode) {
          case 'flight':
            transportOptions.flights = await generateFlightOptions(source, destination, date);
            break;
          case 'train':
            transportOptions.trains = await generateTrainOptions(source, destination, date);
            break;
          case 'bus':
            transportOptions.buses = await generateBusOptions(source, destination, date);
            break;
          case 'vehicle':
            transportOptions.vehicles = {
              type: 'personal_vehicle',
              estimatedTime: await generateDrivingTime(source, destination),
              routeSuggestions: await generateRouteSuggestions(source, destination)
            };
            break;
        }
      } catch (error) {
        console.error(`Error generating ${mode} options:`, error);
        // Continue to next transport mode even if one fails
      }
    }
  }

  return transportOptions;
};

// Transport-specific generation functions
const generateFlightOptions = async (source, destination, date) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Generate 4-5 realistic flight options from ${source} to ${destination} on ${date}.
                   Include: departureCity, arrivalCity, airline, flightNumber, price (INR), departureTime, arrivalTime, duration.
                   Format as JSON array. Ensure valid JSON format with no markdown or additional text. Example:
                   [
                     { 
                        airline: "IndiGo",
                        flightNumber: "6E 5102",
                        price: "₹ 7,250",
                        departureDate: departureDate,
                        departureTime: "20:00",
                        departureCity: Mangalore(IXE),
                        duration: "2h 35m",
                        arrivalDate: "2025-10-15",
                        arrivalTime: "22:35",
                        arrivalCity: Delhi(DEL),
                                  }
                   ]`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Enhanced JSON extraction and parsing
    console.log('Raw flight response:', text); // For debugging
    
    // Extract JSON array from response
    let jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON array found in response');
    }
    
    let jsonText = jsonMatch[0];
    // Remove any comments that might be in the JSON
    jsonText = jsonText.replace(/\/\*[\s\S]*?\*\//g, '');
    
    try {
      return JSON.parse(jsonText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'for text:', jsonText);
      // Return a fallback response if parsing fails
      return [
        { 
          "departureCity": "Error parsing response",
          "arrivalCity": "Error parsing response",
          "departureDate": date,
          "arrivalDate": date,
          "departureTime": "N/A",
          "arrivalTime": "N/A",
          "duration": "N/A",
          "airline": "Default Airline",
          "flightNumber": "Error parsing response",
          "price": "₹ N/A",
          "departureTime": "N/A",
          "arrivalTime": "N/A",
          "duration": "N/A"
        }
      ];
    }
  } catch (error) {
    console.error('Flight options generation failed:', error);
    // Return a fallback response
    return [
      {
        "airline": "Default Airline",
        "flightNumber": "Error generating options",
        "price": "₹ N/A",
        "departureTime": "N/A",
        "arrivalTime": "N/A", 
        "duration": "N/A"
      }
    ];
  }
};
const generateTrainOptions = async (source, destination, date) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = `Generate 4 realistic train options from ${source} to ${destination} around ${date}.
                 Include: trainName, trainNumber, departureTime, arrivalTime, duration, fare.
                 Format as JSON array. Example:
                 [{
                   "trainName": "Rajdhani Express",
                   "trainNumber": "12301",
                   "departureTime": "16:35",
                   "arrivalTime": "08:15",
                   "duration": "15h 40m",
                   "fare": "₹ 1,860"
                 }]`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log('Raw flight response:', text); // For debugging
    
    // Extract JSON array from response
    let jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON array found in response');
    }
    
    let jsonText = jsonMatch[0];
    // Remove any comments that might be in the JSON
    jsonText = jsonText.replace(/\/\*[\s\S]*?\*\//g, '');
    
    try {
      return JSON.parse(jsonText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'for text:', jsonText);
      // Return a fallback response if parsing fails
      return [
        { 
          "departureCity": "Error parsing response",
          "arrivalCity": "Error parsing response",
          "departureDate": date,
          "arrivalDate": date,
          "departureTime": "N/A",
          "arrivalTime": "N/A",
          "duration": "N/A",
          "airline": "Default Airline",
          "flightNumber": "Error parsing response",
          "price": "₹ N/A",
          "departureTime": "N/A",
          "arrivalTime": "N/A",
          "duration": "N/A"
        }
      ];
    }
  
};

const generateBusOptions = async (source, destination, date) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Generate 4 realistic bus options from ${source} to ${destination} around ${date}.
                 Include: operator, type (AC/non-AC), departureTime, arrivalTime, duration, fare.
                 Format as JSON array. Example:
                 [{
                   "operator": "SR Travels",
                   "type": "AC Sleeper",
                   "departureTime": "22:00",
                   "arrivalTime": "06:00",
                   "duration": "8h",
                   "fare": "₹ 1,200"
                 }]`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
};

const generateDrivingTime = async (source, destination) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Estimate driving time from ${source} to ${destination} by car.
                 Return as string like "8 hours 30 minutes".`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

const generateRouteSuggestions = async (source, destination) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Suggest 2-3 best driving routes from ${source} to ${destination}.
                 Format as JSON array with route descriptions.`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
};	

app.post('/api/generate-itinerary', async (req, res) => {
  let tripRef;

  try {
    const { uid, source, destination, startDate, endDate, transportMode, tripType, preferences } = req.body;

    // Validate trip data
    validateTripData(req.body);

    // Generate trip ID and reference
    const tripId = `trip_${Date.now()}`;
    tripRef = doc(db, 'users', uid, 'trips', tripId);

    // Store basic trip data
    await setDoc(tripRef, {
      uid,
      source,
      destination,
      startDate,
      endDate,
      transportMode,
      tripType,
      preferences,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'generating'
    });

    // Generate itinerary with Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `
    Create a detailed day-by-day itinerary for a trip to ${destination} from ${source}.
    Trip details:
    - Start date: ${startDate}
    - End date: ${endDate}
    - Transportation mode: ${transportMode.join(', ')}
    - Trip type: ${tripType.join(', ')}
    - Interests: ${preferences.join(', ')}
    
    Please format the response as a JSON object with the following structure:
    {
      "days": [
        {
          "day": 1,
          "date": "YYYY-MM-DD",
          "title": "Day title (e.g. Arrival & Exploration)",
          "activities": [
            {
              "type": "text" | "image" | "hotels",
              "time": "Morning/Afternoon/Evening/Night",
              "title": "Activity title",
              "description": "Brief description",
              "imageQuery": "search query for Unsplash (e.g. 'Taj Mahal sunset')", 
              "hotels": [
                {
                  "name": "Hotel name",
                  "location": "Location",
                  "price": "₹ 2,039",
                  "rating": "3.8/5",
                  "ratingCount": "40 Ratings",
                  "imageQuery": "search query for hotel image"
                }
              ]
            }
          ]
        }
      ]
    }
    
    Rules:
    1. Use "type": "text" for simple text cards
    2. Use "type": "image" for activities with visual appeal (provide imageQuery)
    3. Use "type": "hotels" for accommodation options
    4. Don't include image URLs - we'll fetch them separately
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    // Improved JSON parsing
    let itinerary;
    try {
      // First try direct parse
      itinerary = JSON.parse(responseText);
    } catch (e1) {
      try {
        // Try removing markdown code blocks
        const cleanText = responseText.replace(/^```json|```$/g, '').trim();
        itinerary = JSON.parse(cleanText);
      } catch (e2) {
        try {
          // Try extracting JSON from text
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            itinerary = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No valid JSON found in response');
          }
        } catch (e3) {
          console.error('Original response:', responseText);
          throw new Error(`Failed to parse response after multiple attempts: ${e3.message}`);
        }
      }
    }

    // Validate itinerary structure
    if (!itinerary?.days || !Array.isArray(itinerary.days)) {
      throw new Error('Invalid itinerary structure - missing days array');
    }

    // Process images from Unsplash
    console.log('Fetching images from Unsplash...');
    for (const day of itinerary.days) {
      for (const activity of day.activities) {
        if (activity.type === 'image' && activity.imageQuery) {
          try {
            const unsplashResponse = await unsplash.photos.getRandom({
              query: activity.imageQuery,
              count: 1
            });

            if (unsplashResponse.type === 'error') {
              console.error('Unsplash error:', unsplashResponse.errors[0]);
              activity.imageUrl = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
            } else {
              const photo = Array.isArray(unsplashResponse.response) 
                ? unsplashResponse.response[0] 
                : unsplashResponse.response;
              
              activity.imageUrl = photo.urls.regular;
              activity.imageAttribution = {
                photographer: photo.user.name,
                profileLink: photo.user.links.html
              };
            }
          } catch (unsplashError) {
            console.error('Failed to fetch from Unsplash:', unsplashError);
            activity.imageUrl = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
          }
        }

        // Process hotel images
        if (activity.type === 'hotels' && activity.hotels) {
          for (const hotel of activity.hotels) {
            if (hotel.imageQuery) {
              try {
                const unsplashResponse = await unsplash.photos.getRandom({
                  query: `${hotel.name} ${hotel.location} hotel`,
                  count: 1
                });

                if (!unsplashResponse.errors) {
                  const photo = Array.isArray(unsplashResponse.response) 
                    ? unsplashResponse.response[0] 
                    : unsplashResponse.response;
                  hotel.imageUrl = photo.urls.regular;
                }
              } catch (error) {
                console.error('Failed to fetch hotel image:', error);
                hotel.imageUrl = 'https://via.placeholder.com/400x300?text=Hotel+Image';
              }
            }
          }
        }
      }
    }
    console.log('Itinerary generated successfully:', itinerary);

    const transportOptions = await generateTransportOptions(transportMode, source, destination, startDate);
    console.log('Transport options generated:', transportOptions);
    itinerary.transportOptions = transportOptions;

    // Final update with completed itinerary
    await setDoc(tripRef, {
      itinerary,
      transportOptions,
      status: 'completed',
      updatedAt: new Date().toISOString()
    }, { merge: true });

    res.json({ 
      success: true,
      tripId,
      itinerary
    });

  } catch (error) {
    console.error('Error:', error);
    
    if (tripRef) {
      await setDoc(tripRef, {
        error: error.message,
        status: 'failed',
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(e => console.error('Failed to update error status:', e));
    }

    res.status(500).json({
      error: 'Failed to generate itinerary',
      details: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
});

app.get('/api/trips/:uid/:tripId', async (req, res) => {
  const { uid, tripId } = req.params;
  
  try {
    const tripRef = doc(db, 'users', uid, 'trips', tripId);
    const tripSnap = await getDoc(tripRef);
    
    if (!tripSnap.exists()) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    res.json({ success: true, trip: tripSnap.data() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trip' });
  }
});

// Route to delete a trip
app.delete('/api/trips/:uid/:tripId', async (req, res) => {
  const { uid, tripId } = req.params;
  
  try {
    const tripRef = doc(db, 'users', uid, 'trips', tripId);
    const tripSnap = await getDoc(tripRef);
    
    if (!tripSnap.exists()) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    // Delete the trip document
    await deleteDoc(tripRef);
    
    res.json({ 
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ 
      error: 'Failed to delete trip',
      details: error.message 
    });
  }
});

// Route to get destination-based activity suggestions from Gemini
app.get('/api/suggestions/:destination', async (req, res) => {
  const { destination } = req.params;
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `
      I'm planning a trip to ${destination}. 
      Please generate 9 general short 1 word interests for tourists in ${destination} in JSON format.
      like: Adventures, Trekking , Beaches , Shopping , NightLife , Religious, Cuisines , Wild Life , Forts/Palaces , Road Trip , Must visits , Hidden Gems 
        any other options according to the destination.
      Format as: { "place": "Destination", "interests": ["interest 1", "interest 2", ...] }
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse the JSON response
    try {
      // Extract just the JSON part from the text
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : text;
      const suggestions = JSON.parse(jsonString);
      res.json(suggestions);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      res.status(500).json({ 
        error: 'Failed to parse suggestions', 
        rawResponse: text 
      });
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: 'Failed to get suggestions from Gemini' });
  }
});


// Route to share trip - generates a shareable link
app.post('/api/trip/:uid/:tripId/share', async (req, res) => {
  const { uid, tripId } = req.params;
  
  console.log('Creating shareable link for trip ID:', tripId, 'for user:', uid);
  
  try {
    const tripRef = doc(db, 'users', uid, 'trips', tripId); // Updated path
    const tripSnap = await getDoc(tripRef);
    
    if (!tripSnap.exists()) {
      console.log('Trip not found with ID:', tripId);
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    // Generate a sharing ID or use the trip ID directly
    const shareableLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared-trip/${uid}/${tripId}`;
    console.log('Generated shareable link:', shareableLink);
    
    // Update the trip document with sharing info
    try {
      await setDoc(tripRef, { 
        isShared: true,
        shareableLink,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      console.log('Updated trip with sharing info');
    } catch (updateError) {
      console.error('Error updating trip with sharing info:', updateError);
      return res.status(500).json({
        error: 'Failed to update trip with sharing information',
        details: updateError.message,
        stack: updateError.stack
      });
    }
    
    res.json({ 
      success: true,
      shareableLink
    });
  } catch (error) {
    console.error('Error generating shareable link:', error);
    res.status(500).json({ 
      error: 'Failed to generate shareable link',
      details: error.message,
      stack: error.stack
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});