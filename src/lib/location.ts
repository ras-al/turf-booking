/**
 * Location Services for KiKKO Turf Booking
 * Handles browser geolocation, mobile HTTP/IP fallbacks, and real-time location suggestions.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
  city?: string;
}

export interface LocationSuggestion {
  id: string;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
}

/**
 * Curated popular Indian sports cities & local hubs with precise coordinates
 */
export const POPULAR_LOCATIONS: LocationSuggestion[] = [
  { id: 'kozhikode', name: 'Kozhikode (Calicut)', city: 'Kozhikode', state: 'Kerala', latitude: 11.2588, longitude: 75.7804 },
  { id: 'kochi', name: 'Kochi (Cochin)', city: 'Kochi', state: 'Kerala', latitude: 9.9312, longitude: 76.2673 },
  { id: 'kannur', name: 'Kannur', city: 'Kannur', state: 'Kerala', latitude: 11.8745, longitude: 75.3704 },
  { id: 'malappuram', name: 'Malappuram', city: 'Malappuram', state: 'Kerala', latitude: 11.0510, longitude: 76.0711 },
  { id: 'thiruvananthapuram', name: 'Thiruvananthapuram (Trivandrum)', city: 'Thiruvananthapuram', state: 'Kerala', latitude: 8.5241, longitude: 76.9366 },
  { id: 'thrissur', name: 'Thrissur', city: 'Thrissur', state: 'Kerala', latitude: 10.5276, longitude: 76.2144 },
  { id: 'palakkad', name: 'Palakkad', city: 'Palakkad', state: 'Kerala', latitude: 10.7867, longitude: 76.6548 },
  { id: 'kollam', name: 'Kollam', city: 'Kollam', state: 'Kerala', latitude: 8.8932, longitude: 76.6141 },
  { id: 'alappuzha', name: 'Alappuzha (Alleppey)', city: 'Alappuzha', state: 'Kerala', latitude: 9.4981, longitude: 76.3388 },
  { id: 'kottayam', name: 'Kottayam', city: 'Kottayam', state: 'Kerala', latitude: 9.5916, longitude: 76.5222 },
  { id: 'wayanad', name: 'Wayanad (Kalpetta)', city: 'Wayanad', state: 'Kerala', latitude: 11.6050, longitude: 76.0827 },
  { id: 'kasaragod', name: 'Kasaragod', city: 'Kasaragod', state: 'Kerala', latitude: 12.5102, longitude: 74.9852 },
  { id: 'bengaluru', name: 'Bengaluru (Bangalore)', city: 'Bengaluru', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946 },
  { id: 'mumbai', name: 'Mumbai', city: 'Mumbai', state: 'Maharashtra', latitude: 19.0760, longitude: 72.8777 },
  { id: 'chennai', name: 'Chennai', city: 'Chennai', state: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707 },
  { id: 'hyderabad', name: 'Hyderabad', city: 'Hyderabad', state: 'Telangana', latitude: 17.3850, longitude: 78.4867 },
  { id: 'delhi', name: 'Delhi NCR', city: 'Delhi', state: 'Delhi', latitude: 28.6139, longitude: 77.2090 },
  { id: 'pune', name: 'Pune', city: 'Pune', state: 'Maharashtra', latitude: 18.5204, longitude: 73.8567 },
  { id: 'mangalore', name: 'Mangalore', city: 'Mangalore', state: 'Karnataka', latitude: 12.9141, longitude: 74.8560 },
  { id: 'coimbatore', name: 'Coimbatore', city: 'Coimbatore', state: 'Tamil Nadu', latitude: 11.0168, longitude: 76.9558 },
  { id: 'goa', name: 'Goa (Panaji)', city: 'Goa', state: 'Goa', latitude: 15.4909, longitude: 73.8278 },
  { id: 'kolkata', name: 'Kolkata', city: 'Kolkata', state: 'West Bengal', latitude: 22.5726, longitude: 88.3639 },
  { id: 'ahmedabad', name: 'Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', latitude: 23.0225, longitude: 72.5714 },
  { id: 'jaipur', name: 'Jaipur', city: 'Jaipur', state: 'Rajasthan', latitude: 26.9124, longitude: 75.7873 },
];

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
 * IP-based geolocation fallback
 * Essential for mobile devices accessing the app over local Wi-Fi / HTTP (which restricts HTML5 GPS)
 */
export async function getIPCoordinates(): Promise<Coordinates> {
  // Method 1: BigDataCloud client IP geolocator (free, CORS-enabled, reliable for Indian ISPs)
  try {
    const res = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client', {
      signal: AbortSignal.timeout(3500),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.latitude && data.longitude) {
        const city = data.city || data.locality || data.principalSubdivision || 'Nearby';
        return {
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          city,
        };
      }
    }
  } catch {
    // try fallback
  }

  // Method 2: ipwho.is (fast, no key required)
  try {
    const res = await fetch('https://ipwho.is/', {
      signal: AbortSignal.timeout(3500),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.latitude && data.longitude) {
        return {
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          city: data.city || data.region || 'Nearby',
        };
      }
    }
  } catch {
    // fallback
  }

  // Default fallback if offline or completely unreachable: Calicut/Kerala centroid
  return {
    latitude: 11.2588,
    longitude: 75.7804,
    city: 'Kozhikode',
  };
}

/**
 * Request user's device coordinates
 * Robust multi-tier resolution:
 * 1. HTML5 GPS (High accuracy)
 * 2. HTML5 Cell/WiFi (Low accuracy fast fallback)
 * 3. IP-based Network Geolocation (ensures 100% success on mobile even over HTTP or when GPS times out)
 */
export function requestCoordinates(): Promise<Coordinates> {
  return new Promise((resolve) => {
    // If browser doesn't have geolocation or is on insecure origin that blocks it
    if (typeof window === 'undefined' || !navigator.geolocation) {
      getIPCoordinates().then(resolve);
      return;
    }

    let resolved = false;

    // Timeout safety net (max 7s total before falling back to IP)
    const safetyNet = setTimeout(async () => {
      if (!resolved) {
        resolved = true;
        const fallback = await getIPCoordinates();
        resolve(fallback);
      }
    }, 7000);

    const tryLowAccuracy = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(safetyNet);
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });
          }
        },
        async () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(safetyNet);
            const fallback = await getIPCoordinates();
            resolve(fallback);
          }
        },
        { enableHighAccuracy: false, timeout: 3500, maximumAge: 300000 }
      );
    };

    // Tier 1: Try GPS with 3.5s timeout
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(safetyNet);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        }
      },
      () => {
        // GPS failed or timed out -> try low accuracy
        tryLowAccuracy();
      },
      {
        enableHighAccuracy: true,
        timeout: 3500,
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
      { signal: AbortSignal.timeout(3500) }
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
        signal: AbortSignal.timeout(3500),
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

/**
 * Search location suggestions as user types keys
 * 1. Matches instant curated local cities list (< 1ms)
 * 2. Fetches matching localities and areas from internal API endpoint
 */
export async function searchLocationSuggestions(query: string): Promise<LocationSuggestion[]> {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 1) {
    return POPULAR_LOCATIONS.slice(0, 8);
  }

  // 1. Instant local match
  const localMatches = POPULAR_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(q) ||
      loc.city.toLowerCase().includes(q) ||
      loc.state.toLowerCase().includes(q)
  );

  // If query is short (< 2 chars), return local matches immediately
  if (q.length < 2) {
    return localMatches.slice(0, 6);
  }

  // 2. Fetch live suggestions from API
  try {
    const res = await fetch(`/api/location-search?q=${encodeURIComponent(q)}`, {
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) {
      const data = await res.json();
      const apiResults: LocationSuggestion[] = data.results || [];

      // Combine local matches first, then API results, deduplicated by name
      const seen = new Set<string>();
      const combined: LocationSuggestion[] = [];

      for (const item of localMatches) {
        seen.add(item.city.toLowerCase());
        combined.push(item);
      }

      for (const item of apiResults) {
        if (!seen.has(item.city.toLowerCase())) {
          seen.add(item.city.toLowerCase());
          combined.push(item);
        }
      }

      return combined.slice(0, 8);
    }
  } catch {
    // API failed or offline: return local matches
  }

  return localMatches.slice(0, 8);
}
