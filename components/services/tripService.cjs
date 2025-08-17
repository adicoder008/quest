import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';

const createTrip = async (tripData) => {
  try {
    const userId = auth.currentUser.uid;
    const tripRef = collection(db, "users", userId, "trips");
    
    const newTrip = await addDoc(tripRef, {
      metadata: {
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        title: tripData.title || "My Trip",
        description: tripData.description || ""
      },
      itinerary: tripData.itinerary || "",
      selectedHotelId: null // Will be set when user selects final hotel
    });
    
    // Add places
    if (tripData.places && tripData.places.length > 0) {
      const placesRef = collection(db, "users", userId, "trips", newTrip.id, "places");
      for (const place of tripData.places) {
        await addDoc(placesRef, place);
      }
    }
    
    // Add hotels
    if (tripData.hotels && tripData.hotels.length > 0) {
      const hotelsRef = collection(db, "users", userId, "trips", newTrip.id, "hotels");
      for (const hotel of tripData.hotels) {
        await addDoc(hotelsRef, hotel);
      }
    }
    
    return newTrip.id;
  } catch (error) {
    console.error("Error creating trip:", error);
    throw error;
  }
};