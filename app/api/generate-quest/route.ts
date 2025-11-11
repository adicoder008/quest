// app/api/generate-itinerary/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createApi } from 'unsplash-js';
import nodeFetch from 'node-fetch';
import admin, { ServiceAccount } from 'firebase-admin';

// Initialize services
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_K!, 'base64').toString('utf-8')
  );
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount)
  });
}

const db = admin.firestore();

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY!,
  fetch: nodeFetch as any,
});

export async function POST(request: Request) {
  try {
    const tripData = await request.json();
    validateTripData(tripData);
    const { uid, source, destination, startDate, endDate, transportMode, tripType, preferences, budget } = tripData;

    // --- FIX: Updated the model to a powerful and current version ---
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    
    // --- FIX: Updated the prompt to be more selective and descriptive for better images ---
    const prompt = `
      Create a detailed day-by-day travel itinerary for a trip to ${destination} from ${source}.
      
      Trip Details:
      - Dates: ${startDate} to ${endDate}
      - Travel Style: ${tripType}
      - Interests: ${preferences.join(', ')}
      - Budget: ₹${budget || 10000} per person per night
      - Transport: ${transportMode.join(', ')}

      For EVERY activity, include:
      1. A descriptive title.
      2. A detailed description (2-3 sentences).
      3. An estimated time of day (Morning/Afternoon/Evening/Night).
      4. A location object with a name, address, and coordinates.
      5. An array of relevant tags.
      6. An "imageQuery" field with a value that is EITHER:
         a) A highly descriptive search query for Unsplash (e.g., "Dudhsagar Falls Goa during monsoon", "Anjuna flea market vibrant stalls").
         b) null, if the activity is generic and not visually specific (e.g., for "Check into hotel", "Travel to airport", "Lunch").
         ONLY provide a query for visually significant landmarks, scenery, restaurants, or experiences.

      IMPORTANT: Return ONLY valid JSON without any markdown formatting, code blocks, or extra text.
      
      Expected format:
      {
        "days": [
          {
            "day": 1,
            "date": "YYYY-MM-DD",
            "title": "Day title",
            "activities": [
              {
                "time": "Morning",
                "title": "Visit Baga Beach",
                "description": "...",
                "location": { "name": "Baga Beach", ... },
                "imageQuery": "Baga Beach Goa sunny day with tourists",
                "tags": ["beach", "popular"]
              },
              {
                "time": "Afternoon",
                "title": "Travel to Hotel",
                "description": "...",
                "location": { "name": "Hotel Name", ... },
                "imageQuery": null,
                "tags": ["travel", "logistics"]
              }
            ]
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    console.log('Raw AI Response:', responseText.substring(0, 500));
    
    interface Itinerary {
      days: Array<{
        day: number;
        date: string;
        title: string;
        activities: Array<{
          time: string;
          title: string;
          description: string;
          location: {
            name: string;
            address: string;
            coordinates: { lat: number; lng: number };
            googlePlaceId?: string;
          };
          imageQuery: string | null; // Can now be null
          tags: string[];
          media?: Array<{ type: string; url: string }>;
        }>;
      }>;
    }

    const itinerary: Itinerary = parseJsonResponse(responseText);

    if (!itinerary?.days || !Array.isArray(itinerary.days)) {
      throw new Error('Invalid itinerary structure - missing days array');
    }

    // Fetch images for activities
    for (const day of itinerary.days) {
      for (const activity of day.activities) {
        if (activity.imageQuery) {
          try {
            const unsplashResponse = await unsplash.photos.getRandom({
              query: activity.imageQuery,
              count: 1,
              orientation: 'landscape'
            });

            if (unsplashResponse.type === 'success' && unsplashResponse.response) {
              const photo = Array.isArray(unsplashResponse.response)
                ? unsplashResponse.response[0]
                : unsplashResponse.response;
              if (photo) {
                 activity.media = [{ type: 'image', url: photo.urls.regular }];
              } else {
                 throw new Error("Unsplash returned an empty response.");
              }
            } else {
               // Fallback image if Unsplash API call fails or finds nothing
              activity.media = [{ 
                type: 'image', 
                url: `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop` 
              }];
            }
          } catch (error) {
            console.error('Unsplash error:', error);
            activity.media = [{ 
              type: 'image', 
              url: `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop` 
            }];
          }
        } else {
          // Default image if imageQuery is null
          activity.media = [{ 
            type: 'image', 
            url: `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop` 
          }];
        }
      }
    }
    
    // Save to Firestore
    const questCollectionRef = db.collection('quest');
    const newQuestRef = questCollectionRef.doc(); // Let Firestore auto-generate the ID
    const questId = newQuestRef.id;

    const questDocument = {
      id: questId,
      uid,
      source,
      destination,
      startDate,
      endDate,
      transportMode,
      tripType,
      preferences,
      budget,
      itinerary,
      members: {
        [uid]: 'owner'
      },
      type: 'ai_generated',
      status: 'active',
      title: `Quest to ${destination}`,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    await newQuestRef.set(questDocument);
    
    // Add to user's questIds array
    const userRef = db.collection('users').doc(uid);
    await userRef.update({
      questIds: admin.firestore.FieldValue.arrayUnion(questId)
    });

    return NextResponse.json({
      success: true,
      itinerary,
      questId
    });

  } catch (error: any) {
    console.error('Error generating itinerary:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate itinerary', details: error.message },
      { status: 500 }
    );
  }
}

function validateTripData(tripData: any) {
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
  if (!tripType || typeof tripType !== 'string') {
    throw new Error('Invalid tripType - must be a string');
  }
  if (!Array.isArray(preferences)) {
    throw new Error('Invalid preferences - must be an array');
  }
}

function parseJsonResponse(responseText: string) {
  try {
    // First, try direct parse
    return JSON.parse(responseText);
  } catch (error) {
    // Try to extract JSON from markdown code blocks
    const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      try {
        return JSON.parse(codeBlockMatch[1]);
      } catch (e) {
        console.error('Failed to parse JSON from code block:', e);
      }
    }
    
    // Try to find JSON object in the text
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Failed to parse JSON from match:', e);
      }
    }
    
    console.error('Raw response text:', responseText);
    throw new Error("Failed to parse itinerary JSON. AI response may not be in valid JSON format.");
  }
}