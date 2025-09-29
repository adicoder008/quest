// File: app/api/places/search/route.ts

import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const type = searchParams.get('type') || '(cities)';

    if (!query || query.length < 3) {
      return NextResponse.json({ suggestions: [] });
    }

    const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error('Google Places API key not configured');
    }

    const response = await axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json`, {
      params: {
        input: query,
        types: type,
        key: GOOGLE_PLACES_API_KEY
      }
    });

    const suggestions = response.data.predictions || [];
    return NextResponse.json({ success: true, suggestions });

  } catch (error: any) {
    console.error('Google Places API error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch place suggestions', details: error.message }, { status: 500 });
  }
}