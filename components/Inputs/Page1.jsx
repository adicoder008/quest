'use client'
import React, { useRef, useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { useLoadScript } from "@react-google-maps/api";
import { getAuth } from "firebase/auth";
// import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
// import { db } from "@/lib/firebase.cjs";
// import MyTrips from "@/pages/MyTrips";

const libraries = ["places"];

const Page1 = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const fromRef = useRef(null);
  const toRef = useRef(null);
  const router = useRouter();
  const auth = getAuth();

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyD3ZFwUynLIrpQ0P4Uvmwohv-E15WJHCuo", // Replace with your Google API key
    libraries,
  });

  const handleFromPlaceChanged = () => {
    const place = fromRef.current.getPlace();
    setFrom(place.formatted_address);
    localStorage.setItem('source', place.formatted_address);
  };

  const handleToPlaceChanged = () => {
    const place = toRef.current.getPlace();
    setTo(place.formatted_address);
    localStorage.setItem('destination', place.formatted_address);
  };

  const handleMyTripsClick = async () => {
    setLoading(true);
    try {
      if (!auth.currentUser) {
        // If not logged in, redirect to login page
        router.push("/");
        return;
      }

      // Navigate to my trips page
      router.push("/my-trips");
    } catch (error) {
      console.error("Error fetching trips:", error);
      alert("Failed to load your trips. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div className="flex flex-col w-[80vw] gap-8">
      {/* My Trips Button */}
      <div className="self-end">
        <button
          onClick={handleMyTripsClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 flex items-center gap-2"
          disabled={loading}
        >
          {loading ? "Loading..." : "My Trips"}
        </button>
      </div>

      <div className="flex justify-between gap-20 w-full">
        {/* LEFT INPUT */}
        <div className="w-1/2 flex flex-col gap-4">
          <div className="font-arsenal font-[600] italic text-2xl">From</div>
          <div className="text-[0.9rem]">We'll recommend the best transportation options for you</div>

          {/* Input with icon */}
          <div className="relative w-full">
            <CiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="search"
              className="w-full pl-10 border-2 p-2 rounded-md outline-none"
              placeholder="Enter starting city or town"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              onBlur={() => localStorage.setItem('from', from)}
              ref={fromRef}
              onFocus={() => {
                const autocomplete = new window.google.maps.places.Autocomplete(fromRef.current, { types: ["(cities)"] });
                autocomplete.addListener("place_changed", handleFromPlaceChanged);
              }}
            />
          </div>
        </div>

        {/* RIGHT INPUT */}
        <div className="w-1/2 flex flex-col gap-4">
          <div className="font-arsenal font-[600] italic text-2xl">Where do you want to go?</div>
          <div className="text-[0.9rem]">Get personalized recommendations to plan your itinerary.</div>

          {/* Input with icon */}
          <div className="relative w-full">
            <CiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="search"
              className="w-full pl-10 border-2 p-2 rounded-md outline-none"
              placeholder="Enter destination city or town"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              onBlur={() => localStorage.setItem('to', to)}
              ref={toRef}
              onFocus={() => {
                const autocomplete = new window.google.maps.places.Autocomplete(toRef.current, { types: ["(cities)"] });
                autocomplete.addListener("place_changed", handleToPlaceChanged);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page1;