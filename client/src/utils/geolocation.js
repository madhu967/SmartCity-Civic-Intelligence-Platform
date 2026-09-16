/**
 * Browser Geolocation and Reverse-Geocoding Utility
 */

export const getCurrentCoordinates = (options = {}) => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return reject(new Error('Geolocation is not supported by your browser'));
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
      ...options,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let message = 'Unable to retrieve location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission was denied. You can enter your location manually.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is currently unavailable.';
            break;
          case error.TIMEOUT:
            message = 'Location detection timed out. Please try again or type manually.';
            break;
          default:
            message = error.message || message;
        }
        const err = new Error(message);
        err.code = error.code;
        reject(err);
      },
      defaultOptions
    );
  });
};

export const reverseGeocode = async (latitude, longitude) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;
        const street =
          addr.road ||
          addr.pedestrian ||
          addr.street ||
          addr.residential ||
          addr.suburb ||
          addr.neighbourhood ||
          '';
        const area =
          addr.suburb ||
          addr.neighbourhood ||
          addr.city_district ||
          addr.quarter ||
          '';
        const city =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.municipality ||
          addr.county ||
          '';
        const state = addr.state || '';

        // Pick distinct components
        const parts = [];
        if (street) parts.push(street);
        if (area && area !== street) parts.push(area);
        if (city && city !== area && city !== street) parts.push(city);
        if (state && parts.length < 3) parts.push(state);

        if (parts.length > 0) {
          return parts.join(', ');
        }
      }

      if (data && data.display_name) {
        const segments = data.display_name.split(',').map((s) => s.trim());
        return segments.slice(0, 3).join(', ');
      }
    }
  } catch (err) {
    console.warn('Reverse geocoding not reachable, falling back to coordinates:', err);
  }

  // Graceful fallback
  const latFormatted = `${Math.abs(latitude).toFixed(4)}° ${latitude >= 0 ? 'N' : 'S'}`;
  const lngFormatted = `${Math.abs(longitude).toFixed(4)}° ${longitude >= 0 ? 'E' : 'W'}`;
  return `${latFormatted}, ${lngFormatted}`;
};

export const getUserCurrentLocation = async () => {
  const coords = await getCurrentCoordinates();
  const address = await reverseGeocode(coords.latitude, coords.longitude);
  
  const coordinateNote = `(${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`;
  let locationString = address ? `${address} ${coordinateNote}` : coordinateNote;
  
  if (locationString.length > 190) {
    locationString = locationString.slice(0, 190);
  }

  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy,
    address,
    locationString,
  };
};

export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const numLat1 = Number(lat1);
  const numLon1 = Number(lon1);
  const numLat2 = Number(lat2);
  const numLon2 = Number(lon2);

  if (
    isNaN(numLat1) ||
    isNaN(numLon1) ||
    isNaN(numLat2) ||
    isNaN(numLon2)
  ) {
    return null;
  }

  const R = 6371; // Earth's radius in km
  const dLat = ((numLat2 - numLat1) * Math.PI) / 180;
  const dLon = ((numLon2 - numLon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((numLat1 * Math.PI) / 180) *
      Math.cos((numLat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const formatDistance = (distanceKm) => {
  if (distanceKm === null || distanceKm === undefined || isNaN(distanceKm)) {
    return 'Distance unavailable';
  }
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
};
