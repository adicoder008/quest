
import React, { useState, useCallback, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";

interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description?: string;
  type: 'hotel' | 'attraction' | 'restaurant' | 'activity';
}

interface MapViewProps {
  places: Place[];
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 15.2993, // Goa's coordinates
  lng: 74.1240
};

export const MapView: React.FC<MapViewProps> = ({ places }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "YOUR_API_KEY" // This should be replaced with your actual API key
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  useEffect(() => {
    if (map && places.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      places.forEach(place => {
        bounds.extend(new google.maps.LatLng(place.lat, place.lng));
      });
      map.fitBounds(bounds);
    }
  }, [map, places]);

  const getMarkerIcon = (type: string) => {
    switch(type) {
      case 'hotel': 
        return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
      case 'restaurant': 
        return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
      case 'attraction': 
        return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
      default: 
        return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
    }
  };

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={10}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {places.map(place => (
        <Marker
          key={place.id}
          position={{ lat: place.lat, lng: place.lng }}
          title={place.name}
          icon={getMarkerIcon(place.type)}
          onClick={() => setSelectedPlace(place)}
        />
      ))}
      
      {selectedPlace && (
        <InfoWindow
          position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
          onCloseClick={() => setSelectedPlace(null)}
        >
          <div className="p-2">
            <h3 className="font-semibold text-base">{selectedPlace.name}</h3>
            <p className="text-sm text-gray-600">{selectedPlace.description}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  ) : <div>Loading...</div>;
};