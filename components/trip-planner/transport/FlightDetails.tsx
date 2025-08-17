import React, { useState, useEffect } from "react";
import { useParams} from "react-router-dom";
import { FlightCard } from "./FlightCard";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../../../lib/firebase.js";
import { auth } from "../../../lib/firebase.js"; // Import auth from your firebase config

interface FlightDetailsProps {
  source: string;
  destination: string;
  departureDate: string;
}

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
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { tripId } = useParams();
  const db = getFirestore(app);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthLoading(false);
      setUserId(user?.uid || null);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchFlightData = async () => {
      try {
        if (!userId) {
          throw new Error("User not authenticated");
        }
        if (!tripId) {
          throw new Error("Trip information missing");
        }

        setLoading(true);
        setError(null);
        
        const tripRef = doc(db, 'users', userId, 'trips', tripId);
        const tripSnap = await getDoc(tripRef);
        
        if (!tripSnap.exists()) {
          throw new Error("Trip not found");
        }

        const tripData = tripSnap.data();
        if (!tripData) {
          throw new Error("Trip data is empty");
        }

        const flightsData = tripData?.flights || 
                         tripData?.transportOptions?.flights || 
                           [];
        
        if (!Array.isArray(flightsData)) {
          throw new Error("Flight data is not in expected format");
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
        setError(err instanceof Error ? err.message : "Failed to load flight options");
        setFlights(getMockFlightData(source, destination));
      } finally {
        setLoading(false);
      }
    };

    if (userId && tripId) {
      fetchFlightData();
    } else if (!authLoading) {
      setLoading(false);
      setError(!userId ? "Please log in to view flight details" : "Trip information is missing");
      setFlights(getMockFlightData(source, destination));
    }
  }, [source, destination, tripId, userId, db, authLoading]);

  

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    } catch {
      return "N/A";
    }
  };

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

  if (authLoading) {
    return (
      <div className="max-md:max-w-full">
        <div className="flex w-[732px] max-w-full flex-col overflow-hidden pl-6 max-md:pl-5">
          <div className="font-normal max-md:max-w-full">
            <h2 className="text-black text-2xl">
              <span className="font-bold">Flight</span> Details ({source} to {destination})
            </h2>
            <p className="text-center mt-4">Checking authentication status...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="max-md:max-w-full">
        <div className="flex w-[732px] max-w-full flex-col overflow-hidden pl-6 max-md:pl-5">
          <div className="font-normal max-md:max-w-full">
            <h2 className="text-black text-2xl">
              <span className="font-bold">Flight</span> Details ({source} to {destination})
            </h2>
            <p className="text-center text-red-500 mt-4">
              Please log in to view flight details
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-md:max-w-full">
        <div className="flex w-[732px] max-w-full flex-col overflow-hidden pl-6 max-md:pl-5">
          <div className="font-normal max-md:max-w-full">
            <h2 className="text-black text-2xl">
              <span className="font-bold">Flight</span> Details ({source} to {destination})
            </h2>
            <p className="text-center mt-4">Loading flight options...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-md:max-w-full">
        <div className="flex w-[732px] max-w-full flex-col overflow-hidden pl-6 max-md:pl-5">
          <div className="font-normal max-md:max-w-full">
            <h2 className="text-black text-2xl">
              <span className="font-bold">Flight</span> Details ({source} to {destination})
            </h2>
            <p className="text-center text-red-500 mt-4">{error}</p>
            <p className="text-center text-gray-500 mt-2">Showing sample data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-md:max-w-full">
      <div className="flex w-[732px] max-w-full flex-col overflow-hidden pl-6 max-md:pl-5">
        <div className="font-normal max-md:max-w-full">
          <h2 className="text-black text-2xl">
            <span className="font-bold">Flight</span> Details ({source} to {destination})
          </h2>
          <p className="self-stretch gap-2 text-base text-black text-center mt-1.5 max-md:max-w-full">
            Here are some flight options from {source} to {destination} on {formatDisplayDate(departureDate)}
          </p>
        </div>

        <div className="flex overflow-x-auto py-2 gap-4 scrollbar-hide">

          {flights.map((flight, index) => (
            <FlightCard
              key={index}
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
          <button className="text-[rgba(53,138,233,1)] text-sm font-normal text-center mt-3">
            See More
          </button>
        )}
      </div>
    </div>
  );
};