import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation"; // Correct import for Next.js App Router
import { FlightCard } from "./FlightCard";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app, auth } from "../../../lib/firebase.js"; // Import both app and auth

// Interface for the component's props
interface FlightDetailsProps {
  source: string;
  destination: string;
  departureDate: string;
}

// Interface for a single flight object
interface Flight {
  airline: string;
  flightNumber: string;
  price: string;
  departureDate: string;
  departureTime: string;
  departureCity: string;
  duration: string;
  arrivalDate: string;
  arrivalTime: string;
  arrivalCity: string;
}

export const FlightDetails: React.FC<FlightDetailsProps> = ({
  source,
  destination,
  departureDate,
}) => {
  // State management
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // Tracks auth state readiness

  // Get tripId from URL using the Next.js useParams hook
  const { tripId } = useParams();
  const db = getFirestore(app);

  // Effect to handle user authentication state in real-time
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserId(user?.uid || null);
      setIsAuthLoading(false); // Auth check is complete
    });
    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []);

  // Effect to fetch flight data from Firestore once user is authenticated
  useEffect(() => {
    // Do not run fetch logic until authentication status is confirmed
    if (isAuthLoading) {
      return;
    }

    const fetchFlightData = async () => {
      // Ensure we have the necessary IDs to proceed
      if (!userId) {
        setError("Please log in to view flight details.");
        setLoading(false);
        setFlights(getMockFlightData(source, destination));
        return;
      }
      if (!tripId) {
        setError("Trip information is missing from the URL.");
        setLoading(false);
        setFlights(getMockFlightData(source, destination));
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Construct the path to the specific trip document in Firestore
        const tripRef = doc(db, 'users', userId, 'trips', tripId as string);
        const tripSnap = await getDoc(tripRef);

        if (!tripSnap.exists()) {
          throw new Error("Trip not found in the database.");
        }

        const tripData = tripSnap.data();
        if (!tripData) {
          throw new Error("Trip data is empty.");
        }

        // Safely access flight data from multiple possible locations in the document
        const flightsData = tripData?.flights || tripData?.transportOptions?.flights || [];

        if (!Array.isArray(flightsData)) {
          throw new Error("Flight data is not in the expected format (should be an array).");
        }

        const processedFlights = flightsData.map(flight => ({
          airline: flight.airline || "Unknown Airline",
          flightNumber: flight.flightNumber || "N/A",
          price: flight.price || "N/A",
          departureDate: flight.departureDate || departureDate,
          departureTime: flight.departureTime || "N/A",
          departureCity: flight.departureCity || source,
          duration: flight.duration || "N/A",
          arrivalDate: flight.arrivalDate || flight.departureDate || departureDate,
          arrivalTime: flight.arrivalTime || "N/A",
          arrivalCity: flight.arrivalCity || destination,
        }));

        setFlights(processedFlights);
      } catch (err) {
        console.error("Error fetching flight options:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(`Failed to load flight options: ${errorMessage}`);
        // Show mock data as a fallback when there's an error
        setFlights(getMockFlightData(source, destination));
      } finally {
        setLoading(false);
      }
    };

    fetchFlightData();
  }, [tripId, userId, isAuthLoading, source, destination, departureDate, db]); // Dependencies for the effect

  // Helper to format date strings for display
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    } catch {
      return dateString; // Return original string if parsing fails
    }
  };

  // Generates placeholder data for UI development or as a fallback
  const getMockFlightData = (source: string, destination: string): Flight[] => {
    return [
      {
        airline: "IndiGo",
        flightNumber: "6E 5102",
        price: "₹ 7,250",
        departureDate: departureDate,
        departureTime: "20:00",
        departureCity: source,
        duration: "2h 35m",
        arrivalDate: departureDate,
        arrivalTime: "22:35",
        arrivalCity: destination
      },
      {
        airline: "Air India",
        flightNumber: "AI 468",
        price: "₹ 8,500",
        departureDate: departureDate,
        departureTime: "19:30",
        departureCity: source,
        duration: "2h 35m",
        arrivalDate: departureDate,
        arrivalTime: "22:05",
        arrivalCity: destination,
      }
    ];
  };

  // Conditional Rendering based on loading and error states
  if (isAuthLoading) {
    return (
      <div className="p-4 w-full max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-2">Flight Details</h2>
        <p className="text-center text-gray-500 mt-4">Checking authentication status...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 w-full max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-2">Flight Details</h2>
        <p className="text-center text-gray-500 mt-4">Loading flight options...</p>
      </div>
    );
  }

  return (
    <div className="p-4 w-full max-w-3xl mx-auto">
        <h2 className="text-black text-2xl">
          <span className="font-bold">Flight</span> Details ({source} to {destination})
        </h2>
        <p className="text-base text-gray-600 text-center mt-1.5">
          Here are some flight options for {formatDisplayDate(departureDate)}
        </p>
      
      {error && (
        <div className="my-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
          <p className="text-sm text-gray-600 mt-1">Showing sample data instead.</p>
        </div>
      )}

      {flights.length === 0 && !error && (
         <p className="text-center text-gray-500 mt-8">No flight details found for this trip.</p>
      )}

      {/* Horizontally scrolling container for flight cards */}
      <div className="flex overflow-x-auto py-4 gap-4 scrollbar-hide">
        {flights.map((flight, index) => (
          <FlightCard
            key={`${flight.flightNumber}-${index}`} // A more unique key
            airline={flight.airline}
            flightNumber={flight.flightNumber}
            price={flight.price}
            departureDate={formatDisplayDate(flight.departureDate)}
            departureTime={flight.departureTime}
            departureCity={flight.departureCity}
            duration={flight.duration}
            arrivalDate={formatDisplayDate(flight.arrivalDate)}
            arrivalTime={flight.arrivalTime}
            arrivalCity={flight.arrivalCity}
          />
        ))}
      </div>

      {flights.length > 0 && (
        <button className="text-blue-500 hover:text-blue-700 text-sm font-medium text-center w-full mt-3">
          See More
        </button>
      )}
    </div>
  );
};
