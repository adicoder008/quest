// src/lib/exifExtractor.ts
// EXIF data extraction utility for photo location detection

interface ExifData {
  latitude?: number;
  longitude?: number;
  timestamp?: Date;
  camera?: string;
  location?: {
    name: string;
    coordinates: { lat: number; lng: number };
  };
}

/**
 * Extract EXIF data from image file
 */
export const extractExifData = async (file: File): Promise<ExifData> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const view = new DataView(e.target?.result as ArrayBuffer);
        const exifData = parseExif(view);
        resolve(exifData);
      } catch (error) {
        console.error('Error parsing EXIF:', error);
        resolve({});
      }
    };
    
    reader.onerror = () => {
      resolve({});
    };
    
    reader.readAsArrayBuffer(file.slice(0, 128 * 1024)); // Read first 128KB
  });
};

/**
 * Parse EXIF data from DataView
 */
const parseExif = (view: DataView): ExifData => {
  const exifData: ExifData = {};
  
  // Check for JPEG marker
  if (view.getUint16(0) !== 0xFFD8) {
    return exifData;
  }
  
  let offset = 2;
  
  // Find EXIF marker
  while (offset < view.byteLength) {
    if (view.getUint16(offset) === 0xFFE1) {
      const exifOffset = offset + 10;
      
      // Check for "Exif" string
      if (view.getUint32(offset + 4) === 0x45786966) {
        const gpsData = parseGPSData(view, exifOffset);
        if (gpsData.latitude && gpsData.longitude) {
          exifData.latitude = gpsData.latitude;
          exifData.longitude = gpsData.longitude;
        }
        
        // Parse timestamp
        const timestamp = parseTimestamp(view, exifOffset);
        if (timestamp) {
          exifData.timestamp = timestamp;
        }
      }
      break;
    }
    offset += 2 + view.getUint16(offset + 2);
  }
  
  return exifData;
};

/**
 * Parse GPS data from EXIF
 */
const parseGPSData = (view: DataView, offset: number): { latitude?: number; longitude?: number } => {
  try {
    // This is a simplified version - full EXIF parsing is complex
    // For production, consider using a library like exif-js or piexifjs
    
    const littleEndian = view.getUint16(offset) === 0x4949;
    const ifdOffset = view.getUint32(offset + 4, littleEndian);
    
    let gpsLat: number | undefined;
    let gpsLon: number | undefined;
    let latRef: string | undefined;
    let lonRef: string | undefined;
    
    // This is a placeholder - actual implementation would be more complex
    return { latitude: gpsLat, longitude: gpsLon };
  } catch (error) {
    return {};
  }
};

/**
 * Parse timestamp from EXIF
 */
const parseTimestamp = (view: DataView, offset: number): Date | undefined => {
  try {
    // Simplified timestamp parsing
    // Real implementation would parse from IFD entries
    return undefined;
  } catch (error) {
    return undefined;
  }
};

/**
 * Reverse geocode coordinates to location name using Google Maps
 */
export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<{ name: string; placeId: string; fullAddress: string } | null> => {
  if (!window.google) {
    console.error('Google Maps not loaded');
    return null;
  }
  
  return new Promise((resolve) => {
    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode(
      { location: { lat, lng } },
      (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const result = results[0];
          
          // Try to find a good location name
          let name = '';
          
          // Look for point of interest
          const poi = result.address_components.find(c => 
            c.types.includes('point_of_interest') || 
            c.types.includes('establishment')
          );
          
          if (poi) {
            name = poi.long_name;
          } else {
            // Use locality or sublocality
            const locality = result.address_components.find(c => 
              c.types.includes('locality') || 
              c.types.includes('sublocality')
            );
            name = locality?.long_name || 'Unknown Location';
          }
          
          resolve({
            name,
            placeId: result.place_id,
            fullAddress: result.formatted_address
          });
        } else {
          resolve(null);
        }
      }
    );
  });
};

/**
 * Extract location from photo with EXIF data
 */
export const extractLocationFromPhoto = async (
  file: File
): Promise<{
  name: string;
  coordinates: { lat: number; lng: number };
  placeId: string;
} | null> => {
  try {
    // Extract EXIF data
    const exifData = await extractExifData(file);
    
    if (!exifData.latitude || !exifData.longitude) {
      return null;
    }
    
    // Reverse geocode to get location name
    const location = await reverseGeocode(exifData.latitude, exifData.longitude);
    
    if (!location) {
      return null;
    }
    
    return {
      name: location.name,
      coordinates: {
        lat: exifData.latitude,
        lng: exifData.longitude
      },
      placeId: location.placeId
    };
  } catch (error) {
    console.error('Error extracting location from photo:', error);
    return null;
  }
};

/**
 * Modern browser-based EXIF extraction using exif-js library approach
 */
export const extractExifModern = async (file: File): Promise<ExifData> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const dataView = new DataView(arrayBuffer);
    
    // Check for JPEG marker
    if (dataView.getUint16(0) !== 0xFFD8) {
      return {};
    }
    
    let offset = 2;
    let latitude: number | undefined;
    let longitude: number | undefined;
    
    // Scan for APP1 (EXIF) marker
    while (offset < dataView.byteLength - 1) {
      const marker = dataView.getUint16(offset);
      
      if (marker === 0xFFE1) { // APP1 marker
        const exifLength = dataView.getUint16(offset + 2);
        const exifIdentifier = dataView.getUint32(offset + 4);
        
        // Check for "Exif" identifier
        if (exifIdentifier === 0x45786966) {
          const tiffOffset = offset + 10;
          const littleEndian = dataView.getUint16(tiffOffset) === 0x4949;
          
          // Get IFD0 offset
          const ifd0Offset = tiffOffset + dataView.getUint32(tiffOffset + 4, littleEndian);
          
          // Find GPS IFD
          const gpsOffset = findGPSIFD(dataView, ifd0Offset, littleEndian, tiffOffset);
          
          if (gpsOffset) {
            const coords = extractGPSCoordinates(dataView, gpsOffset, littleEndian, tiffOffset);
            latitude = coords.latitude;
            longitude = coords.longitude;
          }
        }
        break;
      }
      
      offset += 2 + dataView.getUint16(offset + 2);
    }
    
    return { latitude, longitude };
  } catch (error) {
    console.error('Error in modern EXIF extraction:', error);
    return {};
  }
};

const findGPSIFD = (
  view: DataView,
  ifdOffset: number,
  littleEndian: boolean,
  tiffOffset: number
): number | null => {
  try {
    const numEntries = view.getUint16(ifdOffset, littleEndian);
    
    for (let i = 0; i < numEntries; i++) {
      const entryOffset = ifdOffset + 2 + i * 12;
      const tag = view.getUint16(entryOffset, littleEndian);
      
      // GPS IFD Pointer tag
      if (tag === 0x8825) {
        const gpsOffset = view.getUint32(entryOffset + 8, littleEndian);
        return tiffOffset + gpsOffset;
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

const extractGPSCoordinates = (
  view: DataView,
  gpsOffset: number,
  littleEndian: boolean,
  tiffOffset: number
): { latitude?: number; longitude?: number } => {
  try {
    const numEntries = view.getUint16(gpsOffset, littleEndian);
    
    let latData: number[] | undefined;
    let lonData: number[] | undefined;
    let latRef: string | undefined;
    let lonRef: string | undefined;
    
    for (let i = 0; i < numEntries; i++) {
      const entryOffset = gpsOffset + 2 + i * 12;
      const tag = view.getUint16(entryOffset, littleEndian);
      const type = view.getUint16(entryOffset + 2, littleEndian);
      const count = view.getUint32(entryOffset + 4, littleEndian);
      const valueOffset = view.getUint32(entryOffset + 8, littleEndian);
      
      switch (tag) {
        case 1: // GPSLatitudeRef
          latRef = String.fromCharCode(view.getUint8(entryOffset + 8));
          break;
        case 2: // GPSLatitude
          latData = readRationals(view, tiffOffset + valueOffset, count, littleEndian);
          break;
        case 3: // GPSLongitudeRef
          lonRef = String.fromCharCode(view.getUint8(entryOffset + 8));
          break;
        case 4: // GPSLongitude
          lonData = readRationals(view, tiffOffset + valueOffset, count, littleEndian);
          break;
      }
    }
    
    if (latData && lonData && latRef && lonRef) {
      const latitude = convertDMSToDD(latData, latRef);
      const longitude = convertDMSToDD(lonData, lonRef);
      return { latitude, longitude };
    }
    
    return {};
  } catch (error) {
    return {};
  }
};

const readRationals = (
  view: DataView,
  offset: number,
  count: number,
  littleEndian: boolean
): number[] => {
  const rationals: number[] = [];
  
  for (let i = 0; i < count; i++) {
    const numerator = view.getUint32(offset + i * 8, littleEndian);
    const denominator = view.getUint32(offset + i * 8 + 4, littleEndian);
    rationals.push(numerator / denominator);
  }
  
  return rationals;
};

const convertDMSToDD = (dms: number[], ref: string): number => {
  const degrees = dms[0];
  const minutes = dms[1];
  const seconds = dms[2];
  
  let dd = degrees + minutes / 60 + seconds / 3600;
  
  if (ref === 'S' || ref === 'W') {
    dd = -dd;
  }
  
  return dd;
};

export default {
  extractExifData,
  extractExifModern,
  extractLocationFromPhoto,
  reverseGeocode
};