/**
 * Location Services for KiKKO Turf Booking
 * Handles browser geolocation, reverse geocoding, and distance calculations.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculate direct Haversine distance in km between two [lat, lng] coordinates
 */
export function calculateHaversineDistance(
  from: [number, number],
  to: [number, number]
): number {
  const [lat1, lon1] = from;
  const [lat2, lon2] = to;
  const R = 6371; // Earth's radius in km

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Request user's device coordinates with browser permissions
 */
export function requestCoordinates(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

/**
 * Reverse geocode latitude and longitude into city/locality name
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  // Method 1: BigDataCloud (fast, CORS-friendly, reliable for Indian cities & global)
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (res.ok) {
      const data = await res.json();
      const city =
        data.city ||
        data.locality ||
        data.principalSubdivision ||
        data.countryName;
      if (city && city.trim().length > 0) {
        return city.trim();
      }
    }
  } catch {
    // Continue to fallback
  }

  // Method 2: OpenStreetMap Nominatim
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(4000),
      }
    );
    if (res.ok) {
      const data = await res.json();
      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.county ||
        data.address?.state_district;
      if (city && city.trim().length > 0) {
        return city.trim();
      }
    }
  } catch {
    // Return fallback
  }

  return 'Nearby';
}
