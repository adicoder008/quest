import React from "react";
import { Place } from "../services/placesService";

interface HotelDetailProps {
  hotel: Place;
}

export const HotelDetail: React.FC<HotelDetailProps> = ({ hotel }) => {
  return (
    <div className="bg-white shadow-sm rounded-lg p-4 mb-3">
      <h3 className="font-semibold text-lg">{hotel.name}</h3>
      <p className="text-sm text-gray-600 mb-2">{hotel.description}</p>
      
      {hotel.distance && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Distance: {hotel.distance}</span>
          {hotel.duration && <span>• {hotel.duration}</span>}
        </div>
      )}
      
      <button className="mt-3 text-sm text-blue-600 hover:text-blue-800">
        View Details
      </button>
    </div>
  );
};
