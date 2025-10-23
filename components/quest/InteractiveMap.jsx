import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MapPin, Navigation, Maximize2, Minimize2 } from 'lucide-react';

// Define a color palette for different days - using vibrant, contrasting colors
const DAY_COLORS = [
  '#4f46e5', // Indigo-600
  '#059669', // Emerald-600
  '#d97706', // Amber-600
  '#db2777', // Pink-600
  '#6d28d9', // Violet-700
  '#0891b2', // Cyan-600
  '#be123c', // Rose-700
];

const InteractiveMap = ({ flowCards, activeIndex, onPinClick }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylinesRef = useRef([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  // Smart detection of source and destination cards
  // Source: Cards with titles like "departure", "start", "source" or first card without specific location activities
  // Destination: Cards with titles like "arrival", "end", "destination" or return journey indicators
  const isSourceOrDestination = (card, index, allCards) => {
    if (!card) return false;
    
    const title = (card.title || '').toLowerCase();
    const description = (card.description || '').toLowerCase();
    
    // Check for source indicators
    const sourceKeywords = ['departure', 'start from', 'leaving from', 'source', 'journey begins', 'travel from', 'from to','train','flight'];
    const isSource = sourceKeywords.some(keyword => 
      title.includes(keyword) || description.includes(keyword)
    );
    
    // Check for destination indicators
    const destKeywords = ['arrival', 'reach', 'return to', 'back to', 'destination', 'journey ends'];
    const isDestination = destKeywords.some(keyword => 
      title.includes(keyword) || description.includes(keyword)
    );
    
    // Also check if it's a pure transit activity (train/bus ride with no stop)
    const isTransit = title.includes('train ride') || title.includes('bus ride') || 
                     title.includes('transfer') || title.includes('travel to');
    
    return isSource || isDestination || (isTransit && index === 0);
  };

  // Filter cards that have location data and exclude source/destination
  const locatedCards = useMemo(() => {
    return flowCards.filter((card, index) => {
      // Must have valid location data
      const hasLocation = card.location && 
                         card.location.coordinates && 
                         card.location.coordinates.lat && 
                         card.location.coordinates.lng;
      
      if (!hasLocation) return false;
      
      // Exclude source/destination cards
      return !isSourceOrDestination(card, index, flowCards);
    });
  }, [flowCards]);
  
  // Process cards to assign a color for each unique day
  const cardsWithDayInfo = useMemo(() => {
    const dateToDayMap = new Map();
    let dayCounter = 1;
    
    return locatedCards.map(card => {
      // Use the date field from the card
      const cardDate = card.date ? new Date(card.date).toDateString() : 'Default Day';

      if (!dateToDayMap.has(cardDate)) {
        dateToDayMap.set(cardDate, dayCounter++);
      }
      const dayNumber = dateToDayMap.get(cardDate);
      const dayColor = DAY_COLORS[(dayNumber - 1) % DAY_COLORS.length];

      return { ...card, dayNumber, dayColor };
    });
  }, [locatedCards]);

  // Create a dynamic legend based on the days present
  const dayLegend = useMemo(() => {
    const legendMap = new Map();
    cardsWithDayInfo.forEach(card => {
      if (!legendMap.has(card.dayNumber)) {
        legendMap.set(card.dayNumber, card.dayColor);
      }
    });
    return Array.from(legendMap.entries()).sort((a, b) => a[0] - b[0]);
  }, [cardsWithDayInfo]);

  useEffect(() => {
    initializeMap();
    
    return () => {
      if (polylinesRef.current) {
        polylinesRef.current.forEach(p => p.setMap(null));
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
  }, [cardsWithDayInfo, mapLoaded]);

  useEffect(() => {
    if (mapInstanceRef.current && markersRef.current.length > 0 && cardsWithDayInfo.length > 0) {
      markersRef.current.forEach((marker, index) => {
        if (marker && marker.setIcon) {
          // Find the original index in flowCards
          const card = cardsWithDayInfo[index];
          const originalIndex = flowCards.findIndex(fc => fc.id === card.id);
          const isActive = originalIndex === activeIndex;
          
          if (card) {
            marker.setIcon({
              url: `data:image/svg+xml,${encodeURIComponent(createMarkerSVG(index + 1, card.dayColor, isActive))}`,
              scaledSize: new window.google.maps.Size(40, 40),
              anchor: new window.google.maps.Point(20, 40)
            });
          }
        }
      });
    }
  }, [activeIndex, cardsWithDayInfo, flowCards]);

  const createMarkerSVG = (number, color, isActive = false) => {
    const finalColor = isActive ? '#EF4444' : color || '#3B82F6';
    const bgColor = '#FFFFFF';
    const textColor = finalColor;
    
    return `
      <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow${number}" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" flood-opacity="0.4"/>
          </filter>
        </defs>
        <circle cx="24" cy="24" r="22" fill="${finalColor}" stroke="${bgColor}" stroke-width="4" filter="url(#shadow${number})"/>
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

    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    polylinesRef.current.forEach(p => p.setMap(null));
    polylinesRef.current = [];

    if (cardsWithDayInfo.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();

    cardsWithDayInfo.forEach((card, index) => {
      const position = {
        lat: card.location.coordinates.lat,
        lng: card.location.coordinates.lng
      };
      bounds.extend(position);

      // Find original index for active state
      const originalIndex = flowCards.findIndex(fc => fc.id === card.id);
      const isActive = originalIndex === activeIndex;

      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: card.title || `Stop ${index + 1}`,
        icon: {
          url: `data:image/svg+xml,${encodeURIComponent(createMarkerSVG(index + 1, card.dayColor, isActive))}`,
          scaledSize: new window.google.maps.Size(48, 48),
          anchor: new window.google.maps.Point(24, 48)
        },
        animation: window.google.maps.Animation.DROP
      });

      marker.addListener('click', () => {
        onPinClick(originalIndex);
      });

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

      marker.addListener('mouseover', () => infoWindow.open(mapInstanceRef.current, marker));
      marker.addListener('mouseout', () => infoWindow.close());

      markersRef.current.push(marker);
    });

    // Draw colored polyline segments
    for (let i = 0; i < cardsWithDayInfo.length - 1; i++) {
      const startCard = cardsWithDayInfo[i];
      const endCard = cardsWithDayInfo[i + 1];

      const segmentPath = [
        { lat: startCard.location.coordinates.lat, lng: startCard.location.coordinates.lng },
        { lat: endCard.location.coordinates.lat, lng: endCard.location.coordinates.lng }
      ];

      const segmentColor = startCard.dayColor;

      const polylineSegment = new window.google.maps.Polyline({
        path: segmentPath,
        geodesic: false,
        strokeColor: segmentColor,
        strokeOpacity: 0.9,
        strokeWeight: 5,
        icons: [{
          icon: {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            strokeColor: segmentColor,
            fillColor: segmentColor,
            fillOpacity: 1,
            scale: 3.5
          },
          offset: '100%',
        }],
      });

      polylineSegment.setMap(mapInstanceRef.current);
      polylinesRef.current.push(polylineSegment);
    }

    if (cardsWithDayInfo.length === 1) {
      mapInstanceRef.current.setCenter(bounds.getCenter());
      mapInstanceRef.current.setZoom(12);
    } else if (cardsWithDayInfo.length > 1) {
      mapInstanceRef.current.fitBounds(bounds, { padding: 60 });
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const centerOnActiveMarker = () => {
    if (mapInstanceRef.current && cardsWithDayInfo.length > 0) {
      // Find the active card in cardsWithDayInfo
      const activeCard = cardsWithDayInfo.find(card => {
        const originalIndex = flowCards.findIndex(fc => fc.id === card.id);
        return originalIndex === activeIndex;
      });

      if (activeCard) {
        const position = {
          lat: activeCard.location.coordinates.lat,
          lng: activeCard.location.coordinates.lng
        };
        mapInstanceRef.current.panTo(position);
        mapInstanceRef.current.setZoom(14);
      }
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

  if (cardsWithDayInfo.length === 0) {
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
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Journey Map</h3>

          
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
      
      {/* Increased height from h-96 to h-[600px] for desktop, responsive for mobile */}
      <div className={`relative ${isFullscreen ? 'h-full' : 'h-[350px] sm:h-[400px] md:h-[500px] lg:h-[600px]'}`}>
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
      
      {cardsWithDayInfo.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="flex items-center justify-between flex-wrap gap-y-2">
            <div className="flex items-center gap-4 overflow-x-auto pb-1">
              {dayLegend.map(([day, color]) => (
                <div key={day} className="flex items-center gap-1.5 flex-shrink-0">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: color }}></div>
                  <span className="text-xs text-gray-600 font-medium">Day {day}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-gray-700">
                Viewing {cardsWithDayInfo.length} stop{cardsWithDayInfo.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;