// src/components/quest/InteractiveMap.jsx
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Maximize2, Minimize2 } from 'lucide-react';

const InteractiveMap = ({ flowCards, activeIndex, onPinClick }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  // Filter cards that have location data and exclude first and last
  const locatedCards = flowCards.filter((card, index) => 
    card.location && 
    card.location.coordinates && 
    card.location.coordinates.lat && 
    card.location.coordinates.lng &&
    index !== 0 && // Exclude first card (source)
    index !== flowCards.length - 1 // Exclude last card (destination)
  );

  useEffect(() => {
    initializeMap();
    
    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && mapLoaded) {
      updateMarkers();
    }
  }, [flowCards, mapLoaded]);

  useEffect(() => {
    if (mapInstanceRef.current && markersRef.current.length > 0) {
      markersRef.current.forEach((marker, index) => {
        if (marker && marker.setIcon) {
          const isActive = index === activeIndex - 1; // Adjust for removed first card
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
    const color = isActive ? '#EF4444' : '#3B82F6';
    const bgColor = '#FFFFFF';
    const textColor = isActive ? '#EF4444' : '#3B82F6';
    
    return `
      <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow${number}" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" flood-opacity="0.4"/>
          </filter>
        </defs>
        <circle cx="24" cy="24" r="22" fill="${color}" stroke="${bgColor}" stroke-width="4" filter="url(#shadow${number})"/>
        <circle cx="24" cy="24" r="16" fill="${bgColor}"/>
        <text x="24" y="30" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="${textColor}">
          ${number}
        </text>
      </svg>
    `;
  };

  const initializeMap = async () => {
    try {
      if (!window.google || !window.google.maps) {
        await loadGoogleMapsAPI();
      }

      if (!mapRef.current) return;

      const defaultCenter = { lat: 40.7128, lng: -74.0060 };

      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 10,
        center: defaultCenter,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi.business',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      mapInstanceRef.current = map;
      setMapLoaded(true);
      
      setTimeout(() => updateMarkers(), 100);
      
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(true);
    }
  };

  const loadGoogleMapsAPI = () => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps API'));
      
      document.head.appendChild(script);
    });
  };

  const updateMarkers = () => {
    if (!mapInstanceRef.current || !window.google) return;

    // Clear existing markers and polyline
    markersRef.current.forEach(marker => {
      if (marker && marker.setMap) {
        marker.setMap(null);
      }
    });
    markersRef.current = [];

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

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
          url: `data:image/svg+xml,${encodeURIComponent(createMarkerSVG(index + 1, index === activeIndex - 1))}`,
          scaledSize: new window.google.maps.Size(48, 48),
          anchor: new window.google.maps.Point(24, 48)
        },
        animation: window.google.maps.Animation.DROP
      });

      // Add click listener - adjust index to account for removed first card
      marker.addListener('click', () => {
        const originalIndex = flowCards.findIndex(fc => fc === card);
        onPinClick(originalIndex);
      });

      // Create styled info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-3 rounded-lg" style="min-width: 220px; max-width: 280px;">
            <h3 class="font-bold text-gray-900 mb-1 text-base">${card.title || `Stop ${index + 1}`}</h3>
            <p class="text-sm text-gray-600 mb-2 flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              ${card.location.name || 'Unknown location'}
            </p>
            ${card.media && card.media[0] ? 
              `<img src="${card.media[0].url}" alt="${card.title}" class="w-full h-32 object-cover rounded-lg shadow-sm"/>` : 
              ''
            }
          </div>
        `
      });

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

    // Draw smooth curved path between markers
    if (path.length > 1) {
      polylineRef.current = new window.google.maps.Polyline({
        path,
        geodesic: false,
        strokeColor: '#3B82F6',
        strokeOpacity: 0.8,
        strokeWeight: 4,
        icons: [
          {
            icon: {
              path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              strokeColor: '#3B82F6',
              fillColor: '#3B82F6',
              fillOpacity: 1,
              scale: 3
            },
            offset: '100%',
            repeat: '150px'
          }
        ]
      });

      polylineRef.current.setMap(mapInstanceRef.current);
    }

    // Fit map to show all markers
    if (locatedCards.length === 1) {
      mapInstanceRef.current.setCenter(bounds.getCenter());
      mapInstanceRef.current.setZoom(12);
    } else if (locatedCards.length > 1) {
      mapInstanceRef.current.fitBounds(bounds, { padding: 50 });
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const centerOnActiveMarker = () => {
    const adjustedIndex = activeIndex - 1; // Adjust for removed first card
    if (mapInstanceRef.current && locatedCards[adjustedIndex]) {
      const position = {
        lat: locatedCards[adjustedIndex].location.coordinates.lat,
        lng: locatedCards[adjustedIndex].location.coordinates.lng
      };
      mapInstanceRef.current.panTo(position);
      mapInstanceRef.current.setZoom(14);
    }
  };

  if (mapError) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-red-500 mb-4">
          <MapPin className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Map unavailable</h3>
        <p className="text-gray-600 mb-4">Unable to load the map. Please try again later.</p>
        <button 
          onClick={initializeMap}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
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
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${
      isFullscreen ? 'fixed inset-4 z-50' : ''
    }`}>
      {/* Map Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Journey Map</h3>
          <p className="text-sm text-gray-600 mt-0.5">
            {locatedCards.length} stop{locatedCards.length !== 1 ? 's' : ''} on your quest
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={centerOnActiveMarker}
            className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
            title="Center on active location"
          >
            <Navigation className="w-5 h-5" />
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
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
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-3"></div>
              <p className="text-sm text-gray-600 font-medium">Loading your journey map...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Map Legend */}
      {locatedCards.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
                <span className="text-xs text-gray-600 font-medium">Your route</span>
              </div>
              <div className="h-4 w-px bg-gray-300"></div>
              <span className="text-xs text-gray-500">Click markers to jump to details</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-gray-700">
                Stop {Math.max(1, activeIndex)} of {locatedCards.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;