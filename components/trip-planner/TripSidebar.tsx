import React from "react";

export const TripSidebar = ({ tripData }) => {
  // Calculate the total activities across all days
  const getTotalActivities = () => {
    if (!tripData?.days) return 0;
    return tripData.days.reduce((total, day) => total + (day.activities?.length || 0), 0);
  };

  // Get all unique locations from all activities
  const getUniqueLocations = () => {
    if (!tripData?.days) return [];
    
    const locations = new Set();
    tripData.days.forEach(day => {
      day.activities?.forEach(activity => {
        if (activity.location) {
          // Split locations if they contain "to"
          if (activity.location.includes(" to ")) {
            const [from, to] = activity.location.split(" to ");
            locations.add(from.trim());
            locations.add(to.trim());
          } else {
            locations.add(activity.location.trim());
          }
        }
      });
    });
    
    return Array.from(locations);
  };

  const uniqueLocations = getUniqueLocations();

  return (
    <div className="flex flex-col p-5 rounded-xl border border-solid border-[#D3D3D3] shadow-sm h-fit">
      <div className="text-black text-xl font-semibold">Trip Overview</div>
      
      <div className="flex flex-col mt-6 gap-4">
        <div className="flex justify-between">
          <div className="text-zinc-500">Days</div>
          <div className="text-black font-medium">{tripData?.days?.length || 0}</div>
        </div>
        
        <div className="flex justify-between">
          <div className="text-zinc-500">Activities</div>
          <div className="text-black font-medium">{getTotalActivities()}</div>
        </div>
        
        <div className="h-px bg-gray-200 my-2" />
        
        <div className="flex flex-col">
          <div className="text-zinc-500 mb-2">Destinations</div>
          <div className="flex flex-col gap-2">
            {uniqueLocations.length > 0 ? (
              uniqueLocations.slice(0, 5).map((location: string, index: number) => (
                <div key={index} className="text-black font-medium">{location}</div>
              ))
            ) : (
              <div className="text-black font-medium">No destinations specified</div>
            )}
            
            {uniqueLocations.length > 5 && (
              <div className="text-zinc-500">+{uniqueLocations.length - 5} more</div>
            )}
          </div>
        </div>
        
        <div className="h-px bg-gray-200 my-2" />
        
        <div className="flex flex-col">
          <div className="text-zinc-500 mb-2">Weather</div>
          <div className="flex items-center gap-2">
            <div className="text-2xl">☀️</div>
            <div className="text-black font-medium">28°C / 82°F</div>
          </div>
          <div className="text-zinc-500 text-sm mt-1">Average for {tripData?.days?.[0]?.date ? new Date(tripData.days[0].date).toLocaleDateString('en-US', { month: 'long' }) : 'this period'}</div>
        </div>
      </div>
      
      <button className="mt-8 bg-white border-2 border-solid border-[#EA6100] text-[#EA6100] rounded-lg py-2.5 font-medium hover:bg-orange-50 transition-colors">
        Download Itinerary PDF
      </button>
    </div>
  );
};