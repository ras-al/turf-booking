// TurfBook — Supabase Query Functions
// All database operations go through this module

import { createClient } from './client';
import type { Turf, Slot, Booking, Review, Profile, Payment, Notification } from '@/types';

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
  opening_time?: string;
  closing_time?: string;
  slot_duration_minutes?: number;
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
      opening_time: turf.opening_time || '06:00',
      closing_time: turf.closing_time || '23:00',
      slot_duration_minutes: turf.slot_duration_minutes || 60,
      is_active: true,
      is_approved: false,
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

/** Update an existing turf (owner) */
export async function updateTurf(turfId: string, updates: Partial<{
  name: string;
  description: string;
  address: string;
  city: string;
  photos: string[];
  amenities: string[];
  sports: string[];
  size: string;
  price_per_hour: number;
  opening_time: string;
  closing_time: string;
  slot_duration_minutes: number;
  is_active: boolean;
}>): Promise<Turf> {
  const { data, error } = await supabase
    .from('turfs')
    .update(updates)
    .eq('id', turfId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Fetch distinct cities from turfs (for location selector) */
export async function fetchDistinctCities(): Promise<string[]> {
  const { data, error } = await supabase
    .from('turfs')
    .select('city')
    .eq('is_active', true)
    .eq('is_approved', true);

  if (error) throw error;
  const cities = [...new Set((data || []).map(d => d.city).filter(Boolean))];
  return cities.sort();
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

/** Update a slot's status */
export async function updateSlotStatus(slotId: string, status: 'available' | 'booked' | 'blocked'): Promise<void> {
  const { error } = await supabase
    .from('slots')
    .update({ status })
    .eq('id', slotId);

  if (error) throw error;
}

// ═══════════════════════════════════════
// BOOKINGS (Atomic via RPC)
// ═══════════════════════════════════════

/** Book slots atomically via the book_slots RPC — race-condition-free */
export async function bookSlots(params: {
  user_id: string;
  turf_id: string;
  slot_ids: string[];
  total_amount: number;
  notes?: string;
}): Promise<Booking> {
  const { data, error } = await supabase.rpc('book_slots', {
    p_user_id: params.user_id,
    p_turf_id: params.turf_id,
    p_slot_ids: params.slot_ids,
    p_total_amount: params.total_amount,
    p_notes: params.notes || null,
  });

  if (error) throw error;
  return data as unknown as Booking;
}

/** Cancel a booking via /api/bookings/cancel (refunds & releases slots) */
export async function cancelBooking(bookingId: string, userId: string): Promise<Booking> {
  const res = await fetch('/api/bookings/cancel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId, userId }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to cancel booking');
  }

  return data.booking as Booking;
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
// FAVORITES
// ═══════════════════════════════════════

/** Fetch all favorited turfs for a user */
export async function fetchUserFavorites(userId: string): Promise<Turf[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('turf:turfs(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data || []) as unknown as Array<{ turf: Turf }>).map((row) => row.turf).filter(Boolean);

}

/** Check if a turf is favorited by a user */
export async function isFavorite(userId: string, turfId: string): Promise<boolean> {
  const { data } = await supabase
    .from('favorites')
    .select('user_id')
    .eq('user_id', userId)
    .eq('turf_id', turfId)
    .maybeSingle();

  return !!data;
}

/** Toggle favorite — returns new state (true = now favorited) */
export async function toggleFavorite(userId: string, turfId: string): Promise<boolean> {
  const existing = await isFavorite(userId, turfId);

  if (existing) {
    await supabase.from('favorites').delete().eq('user_id', userId).eq('turf_id', turfId);
    return false;
  } else {
    await supabase.from('favorites').insert({ user_id: userId, turf_id: turfId });
    return true;
  }
}

// ═══════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════

/** Fetch notifications for a user */
export async function fetchNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data || [];
}

/** Fetch unread notification count */
export async function fetchUnreadNotificationCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) return 0;
  return count || 0;
}

/** Mark a notification as read */
export async function markNotificationRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) throw error;
}

/** Mark all notifications as read */
export async function markAllNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
}

// ═══════════════════════════════════════
// PAYMENTS
// ═══════════════════════════════════════

/** Create a payment record */
export async function createPayment(payment: {
  booking_id: string;
  amount: number;
  method?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  status?: 'created' | 'captured' | 'failed' | 'refunded';
}): Promise<Payment> {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      booking_id: payment.booking_id,
      amount: payment.amount,
      method: payment.method || null,
      razorpay_order_id: payment.razorpay_order_id || null,
      razorpay_payment_id: payment.razorpay_payment_id || null,
      razorpay_signature: payment.razorpay_signature || null,
      status: payment.status || 'created',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Update booking payment status */
export async function updateBookingPaymentStatus(
  bookingId: string,
  paymentStatus: 'paid' | 'refunded' | 'unpaid'
): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .update({ payment_status: paymentStatus })
    .eq('id', bookingId);

  if (error) throw error;
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

/** Update user profile */
export async function updateProfile(userId: string, updates: { full_name?: string; phone?: string }): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
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
