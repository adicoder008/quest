'use client'
import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import Page1 from "./Page1";
import Page2 from "./Page2";
import Page3 from "./Page3";
import Page4 from "./Page4";
import Page5 from "./Page5";
import Page6 from "./Page6";
// import Navbar from "../Navbar";
import Nav from "../Nav";
import { FlightDetails } from "../trip-planner/transport/FlightDetails";
import { useRouter } from "next/navigation";

const ProgressBar = ({ page, totalPages }) => {
  const progress = (page / totalPages) * 100;

  return (
    <>
      <div className="flex flex-col items-center justify-center p-6 space-y-4 w-full">
        <div className="w-[80vw] bg-gray-200 rounded-full h-[0.35rem]">
          <div
            className="bg-[#F86F0A] h-[0.35rem] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </>
  );
};

const TripPlanner = () => {
  const [page, setPage] = useState(1);
  const totalPages = 6;
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flightData, setFlightData] = useState([]);
  const [fetchingFlights, setFetchingFlights] = useState(false);

  const [formData, setFormData] = useState({
    destination: "",
    source: "",
    startDate: "",
    endDate: "",
    transportMode: [],
    tripType: [],
    preferences: [],
  });

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (formData.transportMode.includes('flight') && formData.source && formData.destination && formData.startDate) {
      const fetchFlightData = async () => {
        setFetchingFlights(true);
        try {
          // Replace with actual Gemini API call
          const mockResponse = {
            flights: [
              {
                airline: "Indigo",
                flightNumber: "6E 2603",
                price: "₹ 6,735",
                departureTime: "19:40",
                departureCity: formData.source,
                duration: "2h 30m",
                arrivalTime: "22:10",
                arrivalCity: formData.destination,
                logo: "https://cdn.builder.io/api/v1/image/assets/3b64de0bd39c48b8b53f7c91e5d4e417/7c261c3204bba32856c6cda2c69cf63dccf8a5847bab25cc4f3d4bbd43df58b7?placeholderIfAbsent=true"
              },
              {
                airline: "Air India",
                flightNumber: "AI 883",
                price: "₹ 7,250",
                departureTime: "10:15",
                departureCity: formData.source,
                duration: "2h 45m",
                arrivalTime: "13:00",
                arrivalCity: formData.destination,
                logo: "https://cdn.builder.io/api/v1/image/assets/3b64de0bd39c48b8b53f7c91e5d4e417/ca046a62429c37a5d23bb1958ac42ad182f0ee37fd489e5948612e413e1fc012?placeholderIfAbsent=true"
              }
            ]
          };
          setFlightData(mockResponse.flights);
        } catch (error) {
          console.error("Error fetching flight data:", error);
        } finally {
          setFetchingFlights(false);
        }
      };
      fetchFlightData();
    }
  }, [formData.transportMode, formData.source, formData.destination, formData.startDate]);

  const updateFormData = (newData) => {
    setFormData((prevData) => ({
      ...prevData,
      ...newData,
    }));
  };

  const renderPage = () => {
    switch (page) {
      case 1:
        return <Page1 formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <Page2 formData={formData} updateFormData={updateFormData} />;
      case 3:
        return (
          <div className="w-full">
            <Page3 formData={formData} updateFormData={updateFormData} />
            {formData.transportMode.includes('flight') && (
              <div className="mt-4 w-full">
                <FlightDetails
                  source={formData.source}
                  destination={formData.destination}
                  departureDate={formData.startDate}
                  flights={flightData}
                  loading={fetchingFlights}
                />
              </div>
            )}
          </div>
        );
      case 4:
        return <Page4 formData={formData} updateFormData={updateFormData} />;
      case 5:
        return <Page5 formData={formData} updateFormData={updateFormData} />;
      case 6:
        return <Page6 formData={formData} updateFormData={updateFormData} />;
      default:
        return <Page1 formData={formData} updateFormData={updateFormData} />;
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      alert("You need to be logged in to generate an itinerary");
      return;
    }

    try {
      setLoading(true);

      const transportMode = JSON.parse(localStorage.getItem('transport') || []);
      const tripType = JSON.parse(localStorage.getItem('travelTypes') || []);
      const preferences = JSON.parse(localStorage.getItem('selectedPreferences') || []);

      const response = await fetch(`http://localhost:5000/api/generate-itinerary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          source: localStorage.getItem('from'),
          destination: localStorage.getItem('to'),
          startDate: localStorage.getItem('startDate'),
          endDate: localStorage.getItem('endDate'), 
          transportMode,
          tripType,
          preferences
        }),
      });

      if (!response.ok) throw new Error('Failed to generate itinerary');
      const data = await response.json();
      
      router.push('/trip', {
        state: {
          itinerary: data.itinerary,
          tripDetails: {
            source: formData.source,
            destination: formData.destination,
            startDate: formData.startDate,
            endDate: formData.endDate,
            transportMode: formData.transportMode,
            tripType: formData.tripType,
            preferences: formData.preferences,
          },
        },
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate itinerary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Nav />
      <div className="bg-[#FFFFFF] w-full h-[80vh] flex flex-col items-center justify-between mt-[20px] gap-3">
        <div className="flex flex-col items-center justify-center w-full gap-1 mt-2">
          <div className="text-[2.5rem] text-center font-arsenal italic">
            AI <span className="text-[#EA6100] font-arsenal font-[700]">trip</span> planner
          </div>
          <div>My Trip</div>
          <div className="text-[#8B8A8F]">Step {page} of {totalPages}</div>
        </div>

        <ProgressBar page={page} totalPages={totalPages} />

        <div className="h-[300px] w-full flex justify-center">
          {renderPage()}
        </div>

        <div className="flex justify-between space-x-4 w-[80vw]">
          {page !== 1 && (
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="px-4 py-2 bg-gray-400 translate-y-4 text-white rounded-lg"
              disabled={loading || fetchingFlights}
            >
              Previous
            </button>
          )}

          {page !== totalPages ? (
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              className="px-4 py-2 bg-[#F86F0A] translate-y-4 text-white rounded-lg"
              disabled={loading || fetchingFlights}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-[#F86F0A] translate-y-4 text-white rounded-lg"
              disabled={loading || fetchingFlights}
            >
              {loading ? "Generating..." : "Submit"}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default TripPlanner;