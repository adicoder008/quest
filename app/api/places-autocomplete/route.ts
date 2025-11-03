// app/api/places-autocomplete/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();

    if (!input || input.length < 3) {
      return NextResponse.json({ suggestions: [] });
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('❌ Google Places API key not found in environment');
      return NextResponse.json(
        { error: 'Google Places API key not configured' },
        { status: 500 }
      );
    }

    console.log('🔍 Fetching suggestions for:', input);

    // New Places API (New) - AutocompleteSuggestion
    const response = await fetch(
      'https://places.googleapis.com/v1/places:autocomplete',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat',
        },
        body: JSON.stringify({
          input: input,
          languageCode: 'en',
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Places API Error:', response.status, errorText);
      
      // Parse error details
      try {
        const errorJson = JSON.parse(errorText);
        console.error('Error details:', errorJson);
      } catch (e) {
        // Not JSON
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch place suggestions',
          details: errorText,
          status: response.status 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Received suggestions:', data.suggestions?.length || 0);
    
    return NextResponse.json({
      suggestions: data.suggestions || [],
    });

  } catch (error) {
    console.error('❌ Error in places-autocomplete API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}