// src/components/quest/InteractiveMap.jsx
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Maximize2, Minimize2 } from 'lucide-react';

const InteractiveMap = ({ flowCards, activeIndex, onPinClick }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  // Filter cards that have location data
  const locatedCards = flowCards.filter(card => 
    card.location && 
    card.location.coordinates && 
    card.location.coordinates.lat && 
    card.location.coordinates.lng
  );

  useEffect(() => {
    // Initialize map when component mounts
    initializeMap();
    
    return () => {
      // Cleanup map instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Update markers when flowCards change
    if (mapInstanceRef.current && mapLoaded) {
      updateMarkers();
    }
  }, [flowCards, mapLoaded]);

  useEffect(() => {
    // Highlight active marker
    if (mapInstanceRef.current && markersRef.current.length > 0) {
      markersRef.current.forEach((marker, index) => {
        if (marker && marker.setIcon) {
          const isActive = index === activeIndex;
          marker.setIcon({
            url: `data:image/svg+xml,${encodeURIComponent(createMarkerSVG(index + 1, isActive))}`,
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 40)
          });
        }
      });
    }
  }, [activeIndex]);

  const createMarkerSVG = (number, isActive = false) => {
    const color = isActive ? '#3B82F6' : '#6B7280';
    const bgColor = isActive ? '#EFF6FF' : '#F9FAFB';
    
    return `
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="20" cy="20" r="12" fill="${bgColor}"/>
        <text x="20" y="25" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="${color}">
          ${number}
        </text>
      </svg>
    `;
  };

  const initializeMap = async () => {
    try {
      // Check if Google Maps is available
      if (!window.google || !window.google.maps) {
        // Load Google Maps API dynamically
        await loadGoogleMapsAPI();
      }

      if (!mapRef.current) return;

      // Default center (will be adjusted based on markers)
      const defaultCenter = { lat: 40.7128, lng: -74.0060 }; // New York

      // Initialize map
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 10,
        center: defaultCenter,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      mapInstanceRef.current = map;
      setMapLoaded(true);
      
      // Add markers after map is loaded
      setTimeout(() => updateMarkers(), 100);
      
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(true);
    }
  };

  const loadGoogleMapsAPI = () => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps API'));
      
      document.head.appendChild(script);
    });
  };

  const updateMarkers = () => {
    if (!mapInstanceRef.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      if (marker && marker.setMap) {
        marker.setMap(null);
      }
    });
    markersRef.current = [];

    if (locatedCards.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();
    const path = [];

    // Create markers for each located card
    locatedCards.forEach((card, index) => {
      const position = {
        lat: card.location.coordinates.lat,
        lng: card.location.coordinates.lng
      };

      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: card.title || `Stop ${index + 1}`,
        icon: {
          url: `data:image/svg+xml,${encodeURIComponent(createMarkerSVG(index + 1, index === activeIndex))}`,
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 40)
        }
      });

      // Add click listener
      marker.addListener('click', () => {
        onPinClick(flowCards.findIndex(fc => fc === card));
      });

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-medium text-gray-900 mb-1">${card.title || `Stop ${index + 1}`}</h3>
            <p class="text-sm text-gray-600 mb-2">${card.location.name || 'Unknown location'}</p>
            ${card.media && card.media[0] ? 
              `<img src="${card.media[0].url}" alt="${card.title}" class="w-full h-24 object-cover rounded"/>` : 
              ''
            }
          </div>
        `
      });

      // Show info window on hover
      marker.addListener('mouseover', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      marker.addListener('mouseout', () => {
        infoWindow.close();
      });

      markersRef.current.push(marker);
      bounds.extend(position);
      path.push(position);
    });

    // Draw path between markers
    if (path.length > 1) {
      const polyline = new window.google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#3B82F6',
        strokeOpacity: 1.0,
        strokeWeight: 3
      });

      polyline.setMap(mapInstanceRef.current);
    }

    // Fit map to show all markers
    if (locatedCards.length === 1) {
      mapInstanceRef.current.setCenter(bounds.getCenter());
      mapInstanceRef.current.setZoom(12);
    } else if (locatedCards.length > 1) {
      mapInstanceRef.current.fitBounds(bounds, { padding: 20 });
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const centerOnActiveMarker = () => {
    if (mapInstanceRef.current && locatedCards[activeIndex]) {
      const position = {
        lat: locatedCards[activeIndex].location.coordinates.lat,
        lng: locatedCards[activeIndex].location.coordinates.lng
      };
      mapInstanceRef.current.panTo(position);
      mapInstanceRef.current.setZoom(14);
    }
  };

  if (mapError) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-red-400 mb-4">
          <MapPin className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Map unavailable</h3>
        <p className="text-gray-600 mb-4">Unable to load the map. Please try again later.</p>
        <button 
          onClick={initializeMap}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (locatedCards.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400 mb-4">
          <MapPin className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No locations to display</h3>
        <p className="text-gray-600">This quest doesn't have any location data to show on the map.</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${
      isFullscreen ? 'fixed inset-4 z-50' : ''
    }`}>
      {/* Map Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-900">Journey Map</h3>
          <p className="text-sm text-gray-600">
            {locatedCards.length} location{locatedCards.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={centerOnActiveMarker}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Center on active location"
          >
            <Navigation className="w-4 h-4" />
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      
      {/* Map Container */}
      <div className={`relative ${isFullscreen ? 'h-full' : 'h-96'}`}>
        <div 
          ref={mapRef} 
          className="w-full h-full"
          style={{ minHeight: '300px' }}
        />
        
        {!mapLoaded && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Map Legend */}
      {locatedCards.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Click markers to jump to journey cards</span>
            <span>Active: Stop {activeIndex + 1}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;