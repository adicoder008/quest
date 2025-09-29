// File: app/api/destination-suggestions/[destination]/route.ts

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET(
  request: Request,
  { params }: { params: { destination: string } }
) {
  try {
    const destination = params.destination;
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `
      Generate 12 specific tourist interests for "${destination}".
      Keep each interest 1-3 words maximum.
      Return a single, valid JSON array of strings without markdown.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const suggestions = JSON.parse(responseText.replace(/```json|```/g, '').trim());

    return NextResponse.json({ success: true, suggestions });

  } catch (error: any) {
    console.error('Error getting destination suggestions:', error);
    return NextResponse.json({ success: false, message: 'Failed to get suggestions', details: error.message }, { status: 500 });
  }
}