// File: app/api/generate-itinerary/route.ts

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createApi } from 'unsplash-js';
import nodeFetch from 'node-fetch';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import admin, { ServiceAccount } from 'firebase-admin';
import serviceAccount from '../../../serviceAccountKey.json'

// ===================================================================
// INITIALIZE SERVICES
// ===================================================================
// Make sure GEMINI_API_KEY and UNSPLASH_ACCESS_KEY are in your .env.local file

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount)
  });
}

const db = admin.firestore();

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY!,
  fetch: nodeFetch as any, // Use node-fetch for server-side requests
});

// ===================================================================
// HELPER FUNCTIONS (Moved from your Express file)
// ===================================================================

const validateTripData = (tripData: any) => {
  const { uid, source, destination, startDate, endDate, transportMode, tripType, preferences } = tripData;
  if (!uid || typeof uid !== 'string') throw new Error('Invalid uid');
  if (!source || typeof source !== 'string') throw new Error('Invalid source');
  if (!destination || typeof destination !== 'string') throw new Error('Invalid destination');
  if (!startDate || isNaN(new Date(startDate).getTime())) throw new Error('Invalid startDate');
  if (!endDate || isNaN(new Date(endDate).getTime())) throw new Error('Invalid endDate');
  if (!transportMode || !Array.isArray(transportMode)) throw new Error('Invalid transportMode');
  if (!tripType || typeof tripType !== 'string') throw new Error('Invalid tripType');
  if (!Array.isArray(preferences)) throw new Error('Invalid preferences');
};

const parseJsonResponse = (text: string) => {
  try {
    // Attempt to parse directly
    return JSON.parse(text);
  } catch (e) {
    // If direct parse fails, try to extract from markdown code block
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      return JSON.parse(match[1]);
    }
    throw new Error("Failed to parse JSON from response.");
  }
};

// Add your transport generation functions here (generateFlightOptions, etc.) if needed.
// For simplicity, they are omitted in this main route but can be added back following the same pattern.

// ===================================================================
// MAIN API ROUTE HANDLER
// ===================================================================

export async function POST(request: Request) {
  try {
    // 1. Get and validate the request body
    const tripData = await request.json();
    validateTripData(tripData);
    const { uid , source, destination, startDate, endDate, transportMode, tripType, preferences ,budget} = tripData;

    // 2. Generate itinerary with Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
      Create a detailed day-by-day itinerary for a trip to ${destination} from ${source}.
      Trip details:
      - Start date: ${startDate}
      - End date: ${endDate}
      - Transportation mode: ${transportMode.join(', ')}
      - Trip type: ${tripType.join}
      - Interests: ${preferences.join(', ')}

      Format the response as a single, valid JSON object with the following structure. Do not include markdown formatting like \`\`\`json.
      {
        "days": [
          {
            "day": 1,
            "date": "YYYY-MM-DD",
            "title": "Day title (e.g. Arrival & Exploration)",
            "activities": [
              {
                "type": "text",
                "time": "Morning",
                "title": "Activity title",
                "description": "Brief description"
              },
              {
                "type": "image",
                "time": "Afternoon",
                "title": "Activity with visual appeal",
                "description": "Description of the visual activity.",
                "imageQuery": "A concise search query for Unsplash (e.g. 'Eiffel Tower at sunset')"
              }
            ]
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const itinerary = parseJsonResponse(responseText);

    if (!itinerary?.days || !Array.isArray(itinerary.days)) {
      throw new Error('Invalid itinerary structure from AI - missing days array');
    }

    // 3. Process images from Unsplash for activities that need them
    for (const day of itinerary.days) {
      for (const activity of day.activities) {
        if (activity.type === 'image' && activity.imageQuery) {
          try {
            const unsplashResponse = await unsplash.photos.getRandom({
              query: activity.imageQuery,
              count: 1,
              orientation: 'landscape'
            });

            if (unsplashResponse.type === 'error') {
              console.error('Unsplash API error:', unsplashResponse.errors[0]);
              activity.imageUrl = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
            } else {
              const photo = Array.isArray(unsplashResponse.response)
                ? unsplashResponse.response[0]
                : unsplashResponse.response;
              activity.imageUrl = photo.urls.regular;
            }
          } catch (unsplashError) {
            console.error('Failed to fetch from Unsplash:', unsplashError);
            activity.imageUrl = 'https://via.placeholder.com/400x300?text=Image+Fetch+Failed';
          }
        }
      }
    }
    
   const questId = `quest_${Date.now()}`;
   const questRef = db.collection('users').doc(uid).collection('quests').doc(questId);

   const questDocument = {
      // Original trip data
      uid,
      source,
      destination,
      startDate,
      endDate,
      transportMode,
      tripType,
      preferences,
      budget,
      // Generated itinerary
      itinerary,
      // Metadata
      id: questId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'active', // or 'draft'
    };

    
    await questRef.set(questDocument);

    // 4. Return the complete itinerary
    return NextResponse.json({
      success: true,
      itinerary,
      questId: questId
    });

  } catch (error: any) {
    console.error('Error in generate-itinerary API route:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate itinerary', details: error.message },
      { status: 500 }
    );
  }
}