// TurfBook — Supabase Query Functions
// All database operations go through this module

import { createClient } from './client';
import type { Turf, Slot, Booking, Review, Profile } from '@/types';

const supabase = createClient();

// ═══════════════════════════════════════
// TURFS
// ═══════════════════════════════════════

/** Fetch top-rated active & approved turfs */
export async function fetchTopTurfs(limit: number = 3): Promise<Turf[]> {
  const { data, error } = await supabase
    .from('turfs')
    .select('*')
    .eq('is_active', true)
    .eq('is_approved', true)
    .order('avg_rating', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/** Fetch all active & approved turfs */
export async function fetchTurfs(): Promise<Turf[]> {
  const { data, error } = await supabase
    .from('turfs')
    .select('*')
    .eq('is_active', true)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/** Fetch a single turf by ID */
export async function fetchTurfById(id: string): Promise<Turf | null> {
  const { data, error } = await supabase
    .from('turfs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

/** Fetch turfs owned by a specific user */
export async function fetchOwnerTurfs(ownerId: string): Promise<Turf[]> {
  const { data, error } = await supabase
    .from('turfs')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/** Fetch all turfs (admin — includes unapproved) */
export async function fetchAllTurfs(): Promise<Turf[]> {
  const { data, error } = await supabase
    .from('turfs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/** Create a new turf (owner registration — requires admin approval) */
export async function createTurf(turf: {
  owner_id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  photos?: string[];
  amenities?: string[];
  sports: string[];
  size?: string;
  price_per_hour: number;
}): Promise<Turf> {
  const { data, error } = await supabase
    .from('turfs')
    .insert({
      owner_id: turf.owner_id,
      name: turf.name,
      description: turf.description || null,
      address: turf.address,
      city: turf.city,
      latitude: turf.latitude || null,
      longitude: turf.longitude || null,
      photos: turf.photos || [],
      amenities: turf.amenities || [],
      sports: turf.sports,
      size: turf.size || null,
      price_per_hour: turf.price_per_hour,
      is_active: true,
      is_approved: false, // Admin must approve
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Update turf approval status (admin) */
export async function updateTurfApproval(turfId: string, isApproved: boolean): Promise<void> {
  const { error } = await supabase
    .from('turfs')
    .update({ is_approved: isApproved })
    .eq('id', turfId);

  if (error) throw error;
}

// ═══════════════════════════════════════
// SLOTS
// ═══════════════════════════════════════

/** Fetch slots for a turf on a given date */
export async function fetchSlots(turfId: string, date: string): Promise<Slot[]> {
  const { data, error } = await supabase
    .from('slots')
    .select('*')
    .eq('turf_id', turfId)
    .eq('date', date)
    .order('start_time', { ascending: true });

  if (error) throw error;
  return data || [];
}

/** Fetch today's slots for a turf */
export async function fetchTodaySlots(turfId: string): Promise<Slot[]> {
  const today = new Date().toISOString().split('T')[0];
  return fetchSlots(turfId, today);
}

/** Mark slots as booked */
export async function markSlotsBooked(slotIds: string[]): Promise<void> {
  const { error } = await supabase
    .from('slots')
    .update({ status: 'booked' })
    .in('id', slotIds);

  if (error) throw error;
}

// ═══════════════════════════════════════
// BOOKINGS
// ═══════════════════════════════════════

/** Create a new booking (free — no payment) */
export async function createBooking(booking: {
  user_id: string;
  turf_id: string;
  slot_ids: string[];
  total_amount: number;
  notes?: string;
}): Promise<Booking> {
  // 1. Create the booking
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      user_id: booking.user_id,
      turf_id: booking.turf_id,
      slot_ids: booking.slot_ids,
      total_amount: booking.total_amount,
      status: 'confirmed',
      payment_status: 'free',
      notes: booking.notes || null,
    })
    .select()
    .single();

  if (error) throw error;

  // 2. Mark slots as booked
  await markSlotsBooked(booking.slot_ids);

  return data;
}

/** Fetch bookings for a user */
export async function fetchUserBookings(userId: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, turf:turfs(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/** Fetch bookings for an owner's turfs */
export async function fetchOwnerBookings(ownerId: string): Promise<Booking[]> {
  // First get the owner's turf IDs
  const { data: turfs } = await supabase
    .from('turfs')
    .select('id')
    .eq('owner_id', ownerId);

  if (!turfs || turfs.length === 0) return [];

  const turfIds = turfs.map((t) => t.id);
  const { data, error } = await supabase
    .from('bookings')
    .select('*, turf:turfs(*), user:profiles!bookings_user_id_fkey(*)')
    .in('turf_id', turfIds)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/** Fetch all bookings (admin) */
export async function fetchAllBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, turf:turfs(*), user:profiles!bookings_user_id_fkey(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// ═══════════════════════════════════════
// REVIEWS
// ═══════════════════════════════════════

/** Fetch reviews for a turf */
export async function fetchReviews(turfId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, user:profiles!reviews_user_id_fkey(*)')
    .eq('turf_id', turfId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/** Create a review */
export async function createReview(review: {
  user_id: string;
  turf_id: string;
  rating: number;
  text?: string;
}): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      user_id: review.user_id,
      turf_id: review.turf_id,
      rating: review.rating,
      text: review.text || null,
      photos: [],
    })
    .select('*, user:profiles!reviews_user_id_fkey(*)')
    .single();

  if (error) throw error;
  return data;
}

/** Check if a user has already reviewed a turf */
export async function hasUserReviewed(userId: string, turfId: string): Promise<boolean> {
  const { data } = await supabase
    .from('reviews')
    .select('id')
    .eq('user_id', userId)
    .eq('turf_id', turfId)
    .maybeSingle();

  return !!data;
}

// ═══════════════════════════════════════
// PROFILES
// ═══════════════════════════════════════

/** Fetch a user profile */
export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data;
}

/** Fetch all profiles (admin) */
export async function fetchAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// ═══════════════════════════════════════
// STATS
// ═══════════════════════════════════════

/** Fetch owner stats */
export async function fetchOwnerStats(ownerId: string) {
  const { data: turfs } = await supabase
    .from('turfs')
    .select('id, avg_rating')
    .eq('owner_id', ownerId);

  if (!turfs || turfs.length === 0) return { totalBookings: 0, todayBookings: 0, totalRevenue: 0, avgRating: 0 };

  const turfIds = turfs.map((t) => t.id);
  const today = new Date().toISOString().split('T')[0];

  const { count: totalBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .in('turf_id', turfIds);

  const { count: todayBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .in('turf_id', turfIds)
    .gte('created_at', `${today}T00:00:00`)
    .lt('created_at', `${today}T23:59:59`);

  const { data: bookingAmounts } = await supabase
    .from('bookings')
    .select('total_amount')
    .in('turf_id', turfIds);

  const totalRevenue = bookingAmounts?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;
  const avgRating = turfs.length > 0
    ? turfs.reduce((sum, t) => sum + Number(t.avg_rating || 0), 0) / turfs.length
    : 0;

  return {
    totalBookings: totalBookings || 0,
    todayBookings: todayBookings || 0,
    totalRevenue,
    avgRating: Math.round(avgRating * 10) / 10,
  };
}

/** Fetch admin stats */
export async function fetchAdminStats() {
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'user');

  const { count: totalOwners } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'owner');

  const { count: totalTurfs } = await supabase
    .from('turfs')
    .select('*', { count: 'exact', head: true });

  const { count: pendingApprovals } = await supabase
    .from('turfs')
    .select('*', { count: 'exact', head: true })
    .eq('is_approved', false);

  const { count: totalBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true });

  const { data: bookingAmounts } = await supabase
    .from('bookings')
    .select('total_amount');

  const totalRevenue = bookingAmounts?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;

  return {
    totalUsers: totalUsers || 0,
    totalOwners: totalOwners || 0,
    totalTurfs: totalTurfs || 0,
    pendingApprovals: pendingApprovals || 0,
    totalBookings: totalBookings || 0,
    totalRevenue,
  };
}
