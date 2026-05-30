// TurfBook — Mock Data for Development
// All turfs set in Kerala, India with real coordinates

import type { Turf, Slot, Booking, Review, Profile } from '@/types';

export const MOCK_USER: Profile = {
  id: 'user-001',
  phone: '+919876543210',
  email: 'player@turfbook.in',
  full_name: 'Arjun Nair',
  avatar_url: null,
  role: 'user',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const MOCK_OWNER: Profile = {
  id: 'owner-001',
  phone: '+919876543211',
  email: 'owner@turfbook.in',
  full_name: 'Vishnu Kumar',
  avatar_url: null,
  role: 'owner',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const MOCK_TURFS: Turf[] = [
  {
    id: 'turf-001',
    owner_id: 'owner-001',
    name: 'Green Arena Turf',
    description: 'Premium 7-a-side football turf with international-grade artificial grass. Floodlit for night matches. Located in the heart of Kochi with easy parking access.',
    address: 'Near Lulu Mall, Edappally, Kochi',
    city: 'Kochi',
    latitude: 10.0261,
    longitude: 76.3086,
    photos: [],
    amenities: ['parking', 'washroom', 'changing room', 'floodlights', 'drinking water', 'cafeteria'],
    sports: ['football'],
    size: '7v7',
    price_per_hour: 150000, // ₹1,500
    is_active: true,
    is_approved: true,
    avg_rating: 4.5,
    total_reviews: 128,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
  },
  {
    id: 'turf-002',
    owner_id: 'owner-001',
    name: 'Striker Zone',
    description: 'Compact 5-a-side turf perfect for quick matches. Equipped with floodlights and surrounded by nets. Great for corporate events and friendly tournaments.',
    address: 'Kakkanad IT Expressway, Kochi',
    city: 'Kochi',
    latitude: 10.0159,
    longitude: 76.3419,
    photos: [],
    amenities: ['parking', 'washroom', 'floodlights', 'drinking water', 'wifi'],
    sports: ['football', 'cricket'],
    size: '5v5',
    price_per_hour: 100000, // ₹1,000
    is_active: true,
    is_approved: true,
    avg_rating: 4.2,
    total_reviews: 85,
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
  },
  {
    id: 'turf-003',
    owner_id: 'owner-001',
    name: 'Thunder Sports Hub',
    description: 'Multi-sport facility with football and cricket pitches. Professional-grade surface with excellent drainage. Ideal for league matches and training sessions.',
    address: 'MG Road, Thrissur',
    city: 'Thrissur',
    latitude: 10.5276,
    longitude: 76.2144,
    photos: [],
    amenities: ['parking', 'washroom', 'changing room', 'floodlights', 'drinking water', 'first aid', 'seating'],
    sports: ['football', 'cricket'],
    size: '7v7',
    price_per_hour: 120000, // ₹1,200
    is_active: true,
    is_approved: true,
    avg_rating: 4.7,
    total_reviews: 203,
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
  },
  {
    id: 'turf-004',
    owner_id: 'owner-001',
    name: 'Ace Badminton Court',
    description: 'Indoor badminton facility with 4 professional courts. Wooden flooring with proper marking. Air-conditioned for comfortable play.',
    address: 'Palayam, Thiruvananthapuram',
    city: 'Thiruvananthapuram',
    latitude: 8.5074,
    longitude: 76.9558,
    photos: [],
    amenities: ['parking', 'washroom', 'changing room', 'drinking water', 'equipment rental'],
    sports: ['badminton'],
    size: null,
    price_per_hour: 80000, // ₹800
    is_active: true,
    is_approved: true,
    avg_rating: 4.3,
    total_reviews: 67,
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
  },
  {
    id: 'turf-005',
    owner_id: 'owner-001',
    name: 'Galaxy Football Arena',
    description: 'The largest 11-a-side turf in Kozhikode. FIFA-standard artificial grass with full-size goals. Perfect for tournament-level matches.',
    address: 'Beach Road, Kozhikode',
    city: 'Kozhikode',
    latitude: 11.2588,
    longitude: 75.7804,
    photos: [],
    amenities: ['parking', 'washroom', 'changing room', 'floodlights', 'drinking water', 'cafeteria', 'first aid', 'seating'],
    sports: ['football'],
    size: '11v11',
    price_per_hour: 250000, // ₹2,500
    is_active: true,
    is_approved: true,
    avg_rating: 4.8,
    total_reviews: 312,
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
  },
  {
    id: 'turf-006',
    owner_id: 'owner-001',
    name: 'Smash Point',
    description: 'Premium multi-sport indoor facility with basketball and volleyball courts. Climate-controlled with professional lighting.',
    address: 'NH Bypass, Alappuzha',
    city: 'Alappuzha',
    latitude: 9.4981,
    longitude: 76.3388,
    photos: [],
    amenities: ['parking', 'washroom', 'floodlights', 'drinking water', 'equipment rental', 'seating'],
    sports: ['basketball', 'volleyball'],
    size: null,
    price_per_hour: 90000, // ₹900
    is_active: true,
    is_approved: true,
    avg_rating: 4.1,
    total_reviews: 45,
    created_at: '2024-04-01T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
  },
];

// Generate slots for today and next 6 days
function generateMockSlots(turfId: string): Slot[] {
  const slots: Slot[] = [];
  const today = new Date();

  for (let d = 0; d < 7; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const dateStr = date.toISOString().split('T')[0];

    for (let h = 6; h < 24; h++) {
      const isRandomBooked = Math.random() < 0.3;
      slots.push({
        id: `slot-${turfId}-${dateStr}-${h}`,
        turf_id: turfId,
        date: dateStr,
        start_time: `${h.toString().padStart(2, '0')}:00`,
        end_time: `${(h + 1).toString().padStart(2, '0')}:00`,
        status: isRandomBooked ? 'booked' : 'available',
        created_at: '2024-01-01T00:00:00Z',
      });
    }
  }
  return slots;
}

export const MOCK_SLOTS: Record<string, Slot[]> = {};
MOCK_TURFS.forEach((turf) => {
  MOCK_SLOTS[turf.id] = generateMockSlots(turf.id);
});

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'review-001',
    user_id: 'user-001',
    turf_id: 'turf-001',
    rating: 5,
    text: 'Amazing turf! The grass quality is top-notch and the floodlights are excellent for evening games. Will definitely come back.',
    photos: [],
    created_at: '2024-05-15T00:00:00Z',
    user: { ...MOCK_USER, full_name: 'Arjun Nair' },
  },
  {
    id: 'review-002',
    user_id: 'user-002',
    turf_id: 'turf-001',
    rating: 4,
    text: 'Good facility overall. Parking could be better during peak hours. The cafeteria has decent options.',
    photos: [],
    created_at: '2024-05-10T00:00:00Z',
    user: { ...MOCK_USER, id: 'user-002', full_name: 'Rahul Menon' },
  },
  {
    id: 'review-003',
    user_id: 'user-003',
    turf_id: 'turf-001',
    rating: 5,
    text: 'Best turf in Kochi! We organized our corporate tournament here and the experience was seamless.',
    photos: [],
    created_at: '2024-04-20T00:00:00Z',
    user: { ...MOCK_USER, id: 'user-003', full_name: 'Priya Sharma' },
  },
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'booking-001',
    user_id: 'user-001',
    turf_id: 'turf-001',
    slot_ids: ['slot-turf-001-2024-06-01-18'],
    status: 'confirmed',
    payment_status: 'paid',
    total_amount: 150000,
    notes: null,
    created_at: '2024-05-28T10:00:00Z',
    updated_at: '2024-05-28T10:05:00Z',
    turf: MOCK_TURFS[0],
  },
];
