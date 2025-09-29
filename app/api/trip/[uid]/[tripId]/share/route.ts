// File: app/api/trip/[uid]/[tripId]/share/route.ts

import { NextResponse } from 'next/server';
// You will need to export and import your db instance from your firebase config file
import { db } from '@/lib/firebase'; // Adjust this import path to your firebase.js file
import { doc, getDoc, setDoc } from 'firebase/firestore';

export async function POST(
  request: Request,
  { params }: { params: { uid: string, tripId: string } }
) {
  try {
    const { uid, tripId } = params;
    
    const tripRef = doc(db, 'users', uid, 'trips', tripId);
    const tripSnap = await getDoc(tripRef);

    if (!tripSnap.exists()) {
      return NextResponse.json({ success: false, message: 'Trip not found' }, { status: 404 });
    }

    const shareableLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/shared-trip/${uid}/${tripId}`;
    
    await setDoc(tripRef, {
      isShared: true,
      shareableLink,
    }, { merge: true });

    return NextResponse.json({ success: true, shareableLink });

  } catch (error: any) {
    console.error('Error generating shareable link:', error);
    return NextResponse.json({ success: false, message: 'Failed to generate shareable link', details: error.message }, { status: 500 });
  }
}