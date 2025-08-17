
import { useEffect, useState } from "react";

export interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description?: string;
  type: 'hotel' | 'attraction' | 'restaurant' | 'activity';
  distance?: string;
  duration?: string;
}

// This would normally be fetched from an API
export const useItineraryPlaces = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulating an API call
    setTimeout(() => {
      try {
        // Mock data for demo purposes
        setPlaces([
          {
            id: "hotel1",
            name: "Hotel Baga Bay",
            lat: 15.5553,
            lng: 73.7539,
            description: "Comfortable beachside accommodations with great amenities",
            type: "hotel"
          },
          {
            id: "arambol",
            name: "Arambol Beach",
            lat: 15.6826,
            lng: 73.7033,
            description: "Discover the magic of Arambol Beach – where golden sands, chill vibes, and epic sunsets await!",
            type: "attraction"
          },
          {
            id: "calangute",
            name: "Calangute Beach",
            lat: 15.5440,
            lng: 73.7527,
            description: "Experience the vibrant atmosphere of Calangute Beach – Goa's most popular shoreline!",
            type: "attraction"
          },
          {
            id: "baga",
            name: "Baga Beach",
            lat: 15.5553,
            lng: 73.7539,
            description: "Enjoy water sports and beachside activities at the energetic Baga Beach",
            type: "attraction"
          },
          {
            id: "titos",
            name: "Tito's Lane",
            lat: 15.5566,
            lng: 73.7491,
            description: "Experience Goa's legendary nightlife at Tito's Lane – the heart of party central!",
            type: "activity"
          },
          {
            id: "anjuna",
            name: "Anjuna Flea Market",
            lat: 15.5752,
            lng: 73.7397,
            description: "Shop for souvenirs and experience local culture at this vibrant market",
            type: "activity"
          },
          {
            id: "chapora",
            name: "Chapora Fort",
            lat: 15.6008,
            lng: 73.7369,
            description: "Explore this historic fort with panoramic views of the coastline",
            type: "attraction"
          },
          {
            id: "basilica",
            name: "Basilica of Bom Jesus",
            lat: 15.5009,
            lng: 73.9112,
            description: "Visit this UNESCO World Heritage site and important religious landmark",
            type: "attraction"
          },
          {
            id: "dudhsagar",
            name: "Dudhsagar Falls",
            lat: 15.3144,
            lng: 74.3143,
            description: "Witness the majestic four-tiered waterfall in all its glory",
            type: "attraction"
          }
        ]);
        setLoading(false);
      } catch (err) {
        setError("Failed to load places data");
        setLoading(false);
      }
    }, 1000);
  }, []);

  return { places, loading, error };
};

// Function to simulate fetching hotel recommendations near a location
export const useNearbyHotels = (lat: number, lng: number) => {
  const [hotels, setHotels] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulating an API call to fetch hotels near the provided coordinates
    setTimeout(() => {
      try {
        // Mock data for nearby hotels
        setHotels([
          {
            id: "hotel1",
            name: "Hotel Baga Bay",
            lat: lat + 0.002,
            lng: lng + 0.001,
            description: "Comfortable beachside accommodations with great amenities",
            type: "hotel",
            distance: "0.3 km",
            duration: "5 min drive"
          },
          {
            id: "hotel2",
            name: "Calangute Resort",
            lat: lat - 0.001,
            lng: lng + 0.003,
            description: "Luxurious resort with pool and spa facilities",
            type: "hotel",
            distance: "0.5 km",
            duration: "7 min drive"
          },
          {
            id: "hotel3",
            name: "Baga Beach Retreat",
            lat: lat + 0.003,
            lng: lng - 0.002,
            description: "Budget-friendly accommodations near Baga Beach",
            type: "hotel",
            distance: "0.7 km",
            duration: "10 min drive"
          }
        ]);
        setLoading(false);
      } catch (err) {
        setError("Failed to load nearby hotels");
        setLoading(false);
      }
    }, 800);
  }, [lat, lng]);

  return { hotels, loading, error };
};
