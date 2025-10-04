import React, { FunctionComponent, useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { auth, app } from '../../../lib/firebase.js';
import { useParams } from "next/navigation"; // Correct import for Next.js

// Interface for a single train data object
interface TrainData {
  arrivalTime: string;
  departureTime: string;
  duration: string;
  fare: string;
  trainName: string;
  trainNumber: string;
}

const TrainCard: FunctionComponent = () => {
  // State management
  const [trains, setTrains] = useState<TrainData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Get tripId from URL using the correct Next.js hook
  const { tripId } = useParams();
  const db = getFirestore(app);
  
  // Effect to handle user authentication state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserId(user?.uid || null);
      setIsAuthLoading(false); // Auth check is complete
    });
  
    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []);

  // Effect to fetch train data once authentication is resolved
  useEffect(() => {
    // Wait until the auth state is confirmed
    if (isAuthLoading) {
      return;
    }

    const fetchTrainData = async () => {
      // Validate that we have the necessary information before fetching
      if (!userId) {
        setError("Please log in to view train options.");
        setLoading(false);
        return;
      }
      if (!tripId) {
        setError("Trip information is missing from the URL.");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);

      try {
        const tripDocRef = doc(db, 'users', userId, 'trips', tripId as string);
        const tripDoc = await getDoc(tripDocRef);
        
        if (!tripDoc.exists()) {
          throw new Error(`Trip with ID '${tripId}' was not found.`);
        }
        
        const tripData = tripDoc.data();
        
        // Safely access the train data from the document
        const trainData = tripData?.transportOptions?.trains || [];
        
        if (!Array.isArray(trainData)) {
            throw new Error("Train data is not in the expected format (should be an array).");
        }

        setTrains(trainData as TrainData[]);
      } catch (err) {
        console.error('Error fetching train data:', err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(`Failed to load train data: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainData();
  }, [userId, tripId, db, isAuthLoading]); // Dependencies for the effect

  // --- Conditional Rendering ---

  if (isAuthLoading) {
    return <div className="text-center p-4">Checking authentication...</div>;
  }

  if (loading) {
    return <div className="text-center p-4">Loading train data...</div>;
  }

  if (error) {
    return <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">{error}</div>;
  }

  if (trains.length === 0) {
    return <div className="text-center p-4 text-gray-500">No train data available for this trip.</div>;
  }

  return (
    <div className="w-full p-5 border-blue-600 border-dashed border rounded-md flex flex-col gap-5">
      {trains.map((train, index) => (
        <div 
          key={`${train.trainNumber}-${index}`} // Use a more reliable key
          className="self-stretch shadow-lg rounded-lg bg-white border border-gray-200 flex flex-col p-4 gap-4"
        >
          {/* Train Name and Price Section */}
          <div className="self-stretch flex justify-between items-start">
            <div>
              <div className="text-base font-semibold text-gray-800">{train.trainName}</div>
              <div className="text-sm text-gray-500">{train.trainNumber}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-medium text-gray-900">{train.fare}</div>
              <div className="text-xs text-gray-500">
                <span>3AC </span>
                <span className="text-yellow-600 font-semibold">62RAC</span>
              </div>
            </div>
          </div>
          
          {/* Timing and Route Section */}
          <div className="self-stretch flex items-center justify-between text-xs text-gray-500">
            {/* Departure */}
            <div className="text-left w-1/3">
              <div className="text-sm font-medium text-gray-800">{train.departureTime}</div>
              <div>Departure</div>
            </div>

            {/* Duration and Route Visual */}
            <div className="flex-1 flex flex-col items-center text-center mx-2">
              <div>{train.duration}</div>
              <div className="w-full h-0.5 bg-green-500 rounded-full my-1" />
              <div>Route</div>
            </div>
            
            {/* Arrival */}
            <div className="text-right w-1/3">
              <div className="text-sm font-medium text-gray-800">{train.arrivalTime}</div>
              <div>Arrival</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrainCard;
