import { FunctionComponent, useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { auth, app } from '../../../lib/firebase.js';
import { useParams } from "react-router-dom";

interface TrainData {
  arrivalTime: string;
  departureTime: string;
  duration: string;
  fare: string;
  trainName: string;
  trainNumber: string;
}

const TrainCard: FunctionComponent = () => {
  const [trains, setTrains] = useState<TrainData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { tripId } = useParams<{ tripId: string }>();
  const db = getFirestore(app);
  
  // Auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("Auth state changed in TrainCard:", user?.uid || "No user");
      setAuthLoading(false);
      setUserId(user?.uid || null);
    });
  
    return () => unsubscribe();
  }, []);

  // Data fetching - depends on userId and tripId
  useEffect(() => {
    const fetchTrainData = async () => {
      // Don't attempt to fetch if we don't have userId or tripId
      if (!userId || !tripId) {
        console.log("Missing userId or tripId, cannot fetch train data");
        return;
      }

      try {
        console.log(`Fetching train data for trip: ${tripId}, user: ${userId}`);
        setLoading(true);
        
        // Get the trip document
        const tripDocRef = doc(db, 'users', userId, 'trips', tripId);
        const tripDoc = await getDoc(tripDocRef);
        
        if (!tripDoc.exists()) {
          throw new Error(`Trip ${tripId} not found`);
        }
        
        const tripData = tripDoc.data();
        
        // Access the transportOptions.trains array directly from the trip document
        const trainData = tripData?.transportOptions?.trains || [];
        
        console.log(`Found ${trainData.length} trains`);
        setTrains(trainData as TrainData[]);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching train data:', err);
        setError(`Failed to load train data: ${err.message}`);
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchTrainData();
    }
  }, [userId, tripId, db, authLoading]); // Added dependencies

  if (authLoading) {
    return <div>Checking authentication...</div>;
  }

  if (!userId) {
    return <div>Please log in to view train options</div>;
  }

  if (loading) {
    return <div>Loading train data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (trains.length === 0) {
    return <div>No train data available</div>;
  }

  return (
    <div className="w-full relative rounded-[5px] border-blueviolet border-dashed border-[1px] box-border overflow-hidden flex flex-col items-start justify-start p-[1.25rem] gap-[1.25rem] text-left text-[0.875rem] text-label-primary font-body-bold-b3">
      {trains.map((train, index) => (
        <div 
          key={`${train.trainNumber}-${index}`}
          className="self-stretch shadow-[4px_4px_10px_rgba(0,_0,_0,_0.1)] rounded-lg bg-background-primary border-label-tertiary border-solid border-[1px] flex flex-col items-start justify-start py-[0.75rem] px-[1rem] gap-[1rem] mb-[1.25rem]"
        >
          <div className="self-stretch flex flex-col items-start justify-start gap-[1rem]">
            <div className="self-stretch flex flex-row items-start justify-between gap-[0rem]">
              <div className="flex flex-row items-center justify-start">
                <div className="flex flex-col items-start justify-start">
                  <div className="relative leading-[150%]">{train.trainName}</div>
                  <div className="self-stretch relative text-[0.75rem] leading-[150%] text-label-secondary mt-[-0.125rem]">
                    {train.trainNumber}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end justify-start text-[1rem]">
                <div className="relative leading-[150%] font-medium">{train.fare}</div>
                <div className="relative text-[0.75rem] leading-[150%] mt-[-0.125rem] text-label-secondary">
                  <span className="whitespace-pre-wrap">3AC  </span>
                  <span className="text-gold">62RAC</span>
                </div>
              </div>
            </div>
            <div className="self-stretch flex flex-row items-end justify-start text-[0.625rem] text-label-secondary">
              <div className="flex-1 flex flex-row items-center justify-between gap-[0rem]">
                <div className="w-[4rem] flex flex-col items-start justify-start">
                  <div className="relative leading-[150%]">Today</div>
                  <div className="relative text-[0.875rem] leading-[150%] font-medium text-label-primary mt-[-0.125rem]">
                    {train.departureTime}
                  </div>
                  <div className="relative text-[0.75rem] leading-[150%] mt-[-0.125rem]">Departure</div>
                </div>
                <div className="w-[3.563rem] h-[2.5rem] flex flex-col items-center justify-between gap-[0rem] text-center">
                  <div className="self-stretch relative leading-[150%]">{train.duration}</div>
                  <div className="self-stretch relative rounded-lg bg-functional-success h-[0.125rem]" />
                  <div className="self-stretch relative leading-[150%]">Route</div>
                </div>
                <div className="w-[4rem] flex flex-col items-end justify-start">
                  <div className="relative leading-[150%]">Today</div>
                  <div className="relative text-[0.875rem] leading-[150%] font-medium text-label-primary mt-[-0.125rem]">
                    {train.arrivalTime}
                  </div>
                  <div className="relative text-[0.75rem] leading-[150%] mt-[-0.125rem]">Arrival</div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-[15.563rem] rounded-13xl bg-primary-600 hidden flex-row items-center justify-center py-[0.375rem] px-[1rem] box-border text-[0.75rem] text-background-primary">
            <div className="relative leading-[150%] font-medium">View More</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrainCard;