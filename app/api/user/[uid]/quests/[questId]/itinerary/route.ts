import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function PUT(
  request: NextRequest,
  { params }: { params: { uid: string; questId: string } }
) {
  try {
    const { uid, questId } = params;
    const { days } = await request.json();
    
    const questRef = doc(db, 'users', uid, 'quests', questId);
    const questSnap = await getDoc(questRef);
    
    if (!questSnap.exists()) {
      return NextResponse.json(
        { error: 'Quest not found' },
        { status: 404 }
      );
    }
    
    const questData = questSnap.data();
    
    await setDoc(questRef, {
      ...questData,
      itinerary: {
        ...questData.itinerary,
        days: days
      },
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    return NextResponse.json({ 
      success: true,
      message: 'Itinerary updated successfully'
    });
  } catch (error) {
    console.error('Error updating itinerary:', error);
    return NextResponse.json(
      { error: 'Failed to update itinerary', details: error.message },
      { status: 500 }
    );
  }
}