import React from "react";

export const TripHeader = ({ tripData, onBack }) => {
  // Extract destination from the first day's first activity location
  const getDestination = () => {
    if (tripData?.days?.[0]?.activities?.[0]?.location) {
      const location = tripData.days[0].activities[0].location;
      // If location contains "to", take the part after "to"
      if (location.includes(" to ")) {
        return location.split(" to ")[1];
      }
      return location;
    }
    return "Your Destination";
  };

  // Get the start and end date from the first and last day
  const getTripDates = () => {
    if (tripData?.days?.length > 0) {
      if (tripData.days[0].date) {
        const startDate = new Date(tripData.days[0].date);
        const endDate = tripData.days.length > 1 && tripData.days[tripData.days.length - 1].date 
          ? new Date(tripData.days[tripData.days.length - 1].date)
          : startDate;
        
        return `${startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}, ${endDate.getFullYear()}`;
      }
    }
    return "Trip dates not specified";
  };

  return (
    <div className="flex items-center font-normal justify-between flex-wrap mt-[23px] max-md:px-5">
      <div className="self-stretch flex min-w-60 flex-col items-stretch flex-1 shrink basis-[0%] my-auto max-md:max-w-full">
        <h1 className="text-black text-[40px] max-md:max-w-full">
          <span className="font-bold text-[#F86F0A]">Goa</span> trip
        </h1>
        {/* <p className="gap-2 text-base text-black mt-4 max-md:max-w-full">
          Here's a well-planned{" "}
          <span className="font-medium">Delhi to Goa solo trip</span> itinerary{" "}
          <span className="font-medium">(March 15–18)</span> under a budget of{" "}
          <span className="font-medium">
            ₹2500 per night (excluding flight costs)
          </span>
          .
        </p> */}
      </div>
    </div>
  );
};