import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&countrycodes=in&limit=8&addressdetails=1`;

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'KiKKOTurfBooking/1.0 (contact: info@kikko.app)',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ results: [] });
    }

    const data = await res.json();
    const results = (data || []).map((item: any) => {
      const addr = item.address || {};
      const cityName =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.suburb ||
        addr.county ||
        item.name;

      const stateName = addr.state || addr.state_district || 'India';

      return {
        id: item.place_id ? String(item.place_id) : `${item.lat},${item.lon}`,
        name: cityName || item.display_name.split(',')[0],
        displayName: item.display_name,
        city: cityName || item.display_name.split(',')[0],
        state: stateName,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      };
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.warn('Location search error:', error);
    return NextResponse.json({ results: [] });
  }
}
