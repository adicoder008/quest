import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { FlightCard } from "./FlightCard";
import TrainCard from "./TrainCard";
import BusCard from "./BusCard";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../../../lib/firebase.js";
import { auth } from "../../../lib/firebase.js";

interface TransportOptions {
  flights?: any[];
  trains?: any[];
  buses?: any[];
  vehicles?: any;
}

const TransportOptionsDisplay = ({ 
  transportModes = ['flight', 'train', 'bus', 'vehicle'],
  source, 
  destination, 
  date 
}) => {
  const [transportData, setTransportData] = useState<TransportOptions | null>(null);
  const [activeTab, setActiveTab] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { tripId } = useParams();
  const db = getFirestore(app);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Auth state handling
  useEffect(() => {
    console.log("Initializing auth listener");
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!isMounted.current) return;
      
      console.log("Auth state changed:", user ? user.uid : "No user");
      setAuthLoading(false);
      setUserId(user?.uid || null);
    });

    return () => {
      console.log("Cleaning up auth listener");
      unsubscribe();
    };
  }, []);

  // Data fetching effect
  useEffect(() => {
    const fetchTransportData = async () => {
      if (!userId || !tripId) {
        console.log("Missing userId or tripId, skipping fetch");
        if (isMounted.current) setLoading(false);
        return;
      }

      try {
        console.log(`Fetching transport data for user:${userId}, trip:${tripId}`);
        if (isMounted.current) {
          setLoading(true);
          setError(null);
        }

        // Get trip document
        const tripRef = doc(db, 'users', userId, 'trips', tripId);
        const tripSnap = await getDoc(tripRef);
        
        // Validate document exists
        if (!tripSnap.exists()) {
          throw new Error(`Trip document ${tripId} not found`);
        }

        const tripData = tripSnap.data();
        console.log("Trip data:", tripData);

        // Validate transport options
        if (!tripData?.transportOptions) {
          throw new Error("Trip document doesn't contain transportOptions");
        }

        const transportOptions = tripData.transportOptions;
        console.log("Transport options:", transportOptions);

        // Validate at least one transport mode has data
        const hasValidData = transportModes.some(mode => {
          const data = transportOptions[mode];
          return data && (Array.isArray(data) ? data.length > 0 : true);
        });

        if (!hasValidData) {
          throw new Error("No valid transport data found for selected modes");
        }

        if (isMounted.current) {
          setTransportData(transportOptions);
          
          // Set first available tab
          const firstTab = transportModes.find(mode => {
            const data = transportOptions[mode];
            return data && (Array.isArray(data) ? data.length > 0 : true);
          });
          if (firstTab) setActiveTab(firstTab);
          
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load transport data:", err);
        if (isMounted.current) {
          setError(err.message);
          setLoading(false);
          setTransportData(null);
        }
      }
    };

    if (!authLoading) {
      fetchTransportData();
    }
  }, [userId, tripId, transportModes, db, authLoading]);

  // Render loading states
  if (authLoading) {
    return <div className="auth-loading">Checking authentication...</div>;
  }

  if (!userId) {
    return <div className="auth-required">Please sign in to view transport options</div>;
  }

  if (loading) {
    return <div className="data-loading">Loading transport data...</div>;
  }

  if (error) {
    return (
      <div className="error-state">
        <p>Error loading transport options: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!transportData) {
    return (
      <div className="no-data">
        <p>No transport data found for this trip</p>
        <p>Please check back later or update your trip details</p>
      </div>
    );
  }

  // Prepare available tabs
  const availableTabs = transportModes.filter(mode => {
    const data = transportData[mode];
    return data && (Array.isArray(data) ? data.length > 0 : data);
  });

  if (availableTabs.length === 0) {
    return (
      <div className="no-options">
        <p>No transport options available for the selected modes</p>
        <p>Try adjusting your search filters</p>
      </div>
    );
  }

  // Main render
  return (
    <div className="transport-options">
      <div className="mode-tabs">
        {availableTabs.map(mode => (
          <button
            key={mode}
            className={`tab ${activeTab === mode ? 'active' : ''}`}
            onClick={() => setActiveTab(mode)}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      <div className="options-container">
        {activeTab === 'flight' && transportData.flights?.map((flight, i) => (
          <FlightCard key={`flight-${i}`} {...flight} />
        ))}
        {activeTab === 'train' && transportData.trains?.map((train, i) => (
          <TrainCard key={`train-${i}`} {...train} />
        ))}
        {activeTab === 'bus' && transportData.buses?.map((bus, i) => (
          <BusCard key={`bus-${i}`} {...bus} />
        ))}
        {activeTab === 'vehicle' && transportData.vehicles && (
          <div className="vehicle-options">
            <h3>Vehicle Options</h3>
            <p>Estimated time: {transportData.vehicles.estimatedTime}</p>
            {transportData.vehicles.routeSuggestions?.map((route, i) => (
              <div key={`route-${i}`} className="route">
                {route.description}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransportOptionsDisplay;