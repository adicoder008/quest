import React from "react";

interface Activity {
  location?: string;
  // Add other activity properties as needed
}

interface Day {
  date?: string;
  activities?: Activity[];
  // Add other day properties as needed
}

interface TripData {
  days?: Day[];
  // Add other tripData properties as needed
}

interface TripHeaderProps {
  tripData?: TripData;
  onBack?: () => void;
}

export const TripHeader: React.FC<TripHeaderProps> = ({ tripData, onBack }) => {
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
    if (tripData?.days && tripData.days.length > 0) {
      const firstDate = tripData.days[0].date;
      const lastDate = tripData.days[tripData.days.length - 1].date;
      
      if (firstDate) {
        const startDate = new Date(firstDate);
        const endDate = tripData.days.length > 1 && lastDate
          ? new Date(lastDate)
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
          <span className="font-bold text-[#F86F0A]">{getDestination()}</span> trip
        </h1>
        <p className="text-sm text-gray-600 mt-2">{getTripDates()}</p>
      </div>
    </div>
  );
};