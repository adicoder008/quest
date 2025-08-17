
import React from "react";
import { Place } from "../services/placesService";
import { ScrollArea } from "../ui/scroll-area";

interface LocationListProps {
  places: Place[];
  selectedPlace: string | null;
  onSelectPlace: (placeId: string) => void;
}

export const LocationList: React.FC<LocationListProps> = ({
  places,
  selectedPlace,
  onSelectPlace,
}) => {
  const groupedPlaces = places.reduce((acc, place) => {
    if (!acc[place.type]) {
      acc[place.type] = [];
    }
    acc[place.type].push(place);
    return acc;
  }, {} as Record<string, Place[]>);

  return (
    <ScrollArea className="h-[calc(100vh-80px)] w-full">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-3">Trip Locations</h2>
        
        {Object.entries(groupedPlaces).map(([type, placesOfType]) => (
          <div key={type} className="mb-4">
            <h3 className="text-lg font-semibold mb-2 capitalize">{type}s</h3>
            <div className="space-y-2">
              {placesOfType.map((place) => (
                <div
                  key={place.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedPlace === place.id
                      ? "bg-orange-100 border-l-4 border-orange-500"
                      : "bg-white border border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => onSelectPlace(place.id)}
                >
                  <h4 className="font-medium">{place.name}</h4>
                  {place.distance && (
                    <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <span>Distance: {place.distance}</span>
                      {place.duration && <span>• {place.duration}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
