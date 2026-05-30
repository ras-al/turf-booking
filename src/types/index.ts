// TurfBook — Core TypeScript Types

export type UserRole = 'user' | 'owner' | 'admin';

export interface Profile {
  id: string;
  phone: string | null;
  email: string | null;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Turf {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  photos: string[]; // base64 encoded
  amenities: string[];
  sports: string[];
  size: string | null; // '5v5', '7v7', '11v11'
  price_per_hour: number; // in paise (INR × 100)
  is_active: boolean;
  is_approved: boolean;
  avg_rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
  // Computed client-side
  distance?: number; // road distance in km
  owner?: Profile;
}

export type SlotStatus = 'available' | 'booked' | 'blocked';

export interface Slot {
  id: string;
  turf_id: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  status: SlotStatus;
  created_at: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface Booking {
  id: string;
  user_id: string;
  turf_id: string;
  slot_ids: string[];
  status: BookingStatus;
  payment_status: PaymentStatus;
  total_amount: number; // in paise
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  turf?: Turf;
  slots?: Slot[];
  user?: Profile;
}

export type PaymentMethod = 'razorpay' | 'upi' | 'card' | 'netbanking' | 'dummy';

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  method: PaymentMethod | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  status: 'created' | 'captured' | 'failed' | 'refunded';
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  turf_id: string;
  rating: number; // 1-5
  text: string | null;
  photos: string[]; // base64
  created_at: string;
  user?: Profile;
}

export type NotificationChannel = 'whatsapp' | 'sms' | 'email';

export interface Notification {
  id: string;
  user_id: string;
  booking_id: string | null;
  type: string;
  channel: NotificationChannel;
  message: string;
  sent_at: string | null;
  created_at: string;
}

// Filter types
export interface TurfFilters {
  sport?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  minRating?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'distance' | 'newest';
  search?: string;
}
