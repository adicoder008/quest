// app/api/destination-suggestions/[destination]/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ destination: string }> }  // Mark as Promise
) {
  try {
    const { destination } = await params;  // Await it here
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    
    const prompt = `
      Generate 10 relevant travel interests/preferences for someone visiting ${destination}.
      Return ONLY a JSON array of strings, no additional text or markdown.
      Example: ["Beaches", "Nightlife", "Local Cuisine", "Adventure Sports", "Historical Sites"]
    `;
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse the response
    let suggestions = [];
    try {
      suggestions = JSON.parse(responseText);
    } catch {
      // Use [\s\S] instead of . with s flag to match any character including newlines
      const match = responseText.match(/\[[\s\S]*\]/);
      if (match) {
        suggestions = JSON.parse(match[0]);
      }
    }
    
    return NextResponse.json({ success: true, suggestions });
  } catch (error: any) {
    console.error('Error generating suggestions:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}