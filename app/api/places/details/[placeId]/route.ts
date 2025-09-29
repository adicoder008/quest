// File: app/api/places/details/[placeId]/route.ts

import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(
  request: Request,
  { params }: { params: { placeId: string } }
) {
  try {
    const placeId = params.placeId;
    const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
    
    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error('Google Places API key not configured');
    }

    const response = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json`, {
      params: {
        place_id: placeId,
        fields: 'name,geometry,formatted_address,types,photos',
        key: GOOGLE_PLACES_API_KEY
      }
    });

    if (!response.data.result) {
      return NextResponse.json({ success: false, message: 'Place not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, place: response.data.result });

  } catch (error: any) {
    console.error('Google Places Details API error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch place details', details: error.message }, { status: 500 });
  }
}