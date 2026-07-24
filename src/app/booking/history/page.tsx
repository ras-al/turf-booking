'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchUserBookings, createReview, hasUserReviewed, cancelBooking } from '@/lib/supabase/queries';
import { formatCurrency, formatTime, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import type { Booking } from '@/types';
import { Calendar, MapPin, Ticket, Loader2, Star, MessageSquarePlus, X, AlertTriangle } from 'lucide-react';

export default function BookingHistoryPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  // Review Modal State
  const [reviewTurfId, setReviewTurfId] = useState<string | null>(null);
  const [reviewTurfName, setReviewTurfName] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewedTurfIds, setReviewedTurfIds] = useState<Set<string>>(new Set());

  // Cancel Modal State
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth?redirect=/booking/history');
      return;
    }

    if (user) {
      async function loadBookings() {
        try {
          const data = await fetchUserBookings(user!.id);
          setBookings(data);
          const uniqueTurfIds = Array.from(new Set(data.map(b => b.turf_id)));
          const reviewedMap = await Promise.all(
            uniqueTurfIds.map(async (turfId) => {
              const hasReviewed = await hasUserReviewed(user!.id, turfId);
              return { turfId, hasReviewed };
            })
          );
          setReviewedTurfIds(new Set(reviewedMap.filter(m => m.hasReviewed).map(m => m.turfId)));
        } catch (error) {
          console.error('Failed to load bookings:', error);
        } finally {
          setLoading(false);
        }
      }
      loadBookings();
    }
  }, [user, authLoading, router]);

  const handleOpenReviewModal = (booking: Booking) => {
    setReviewTurfId(booking.turf_id);
    setReviewTurfName(booking.turf?.name || 'the turf');
    setRating(5);
    setReviewText('');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reviewTurfId) return;
    setIsSubmittingReview(true);
    try {
      await createReview({ user_id: user.id, turf_id: reviewTurfId, rating, text: reviewText });
      setReviewedTurfIds(prev => new Set(prev).add(reviewTurfId));
      setReviewTurfId(null);
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!user || !cancellingBookingId) return;
    setIsCancelling(true);
    setCancelError(null);
    try {
      await cancelBooking(cancellingBookingId, user.id);
      // Update local state
      setBookings(prev => prev.map(b => b.id === cancellingBookingId ? { ...b, status: 'cancelled' } : b));
      setCancellingBookingId(null);
    } catch (err: unknown) {
      setCancelError(err instanceof Error ? err.message : 'Failed to cancel booking.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Split into upcoming vs past
  const upcomingBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');
  const displayedBookings = tab === 'upcoming' ? upcomingBookings : pastBookings;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      {/* ═══════════════════════════════════════
          MOBILE VIEW — My Bookings (ui.png style)
          ═══════════════════════════════════════ */}
      <div className="md:hidden bg-white min-h-screen">
        {/* Header */}
        <div className="px-4 pb-3">
          <h1 className="text-xl font-bold text-gray-900">My Bookings</h1>
        </div>

        {/* Tabs — Upcoming / Past */}
        <div className="px-4 mb-4">
          <div className="flex border-b border-gray-200">
            {(['upcoming', 'past'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-sm font-semibold text-center transition-all relative capitalize ${
                  tab === t ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {t}
                {tab === t && (
                  <motion.div layoutId="booking-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-green-600 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Booking List */}
        <div className="px-4">
          {displayedBookings.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-14 h-14 text-gray-200 mx-auto mb-4" />
              <h3 className="text-base font-bold text-gray-900">No {tab} bookings</h3>
              <p className="text-sm text-gray-400 mt-1">
                {tab === 'upcoming' ? 'Book a turf to get started!' : 'Your past bookings will show here'}
              </p>
              {tab === 'upcoming' && (
                <Link href="/turfs" className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm">
                  Find Turfs
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {displayedBookings.map((booking, index) => {
                const canReview = (booking.status === 'confirmed' || booking.status === 'completed') && !reviewedTurfIds.has(booking.turf_id);
                const canCancel = booking.status === 'confirmed' || booking.status === 'pending';
                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      {/* Turf image placeholder */}
                      <div className="w-14 h-14 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {booking.turf?.photos && booking.turf.photos.length > 0 ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={booking.turf.photos[0]} alt={booking.turf?.name} className="w-full h-full object-cover" />
                        ) : (
                          <MapPin className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/turfs/${booking.turf_id}`} className="text-sm font-bold text-gray-900 hover:text-green-600 transition-colors truncate block">
                          {booking.turf?.name || 'Unknown Turf'}
                        </Link>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {booking.turf?.address || '—'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(booking.created_at).toLocaleDateString('en-IN', {
                            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                        {booking.booking_code && (
                          <p className="text-[10px] font-mono text-gray-400 mt-0.5">ID: {booking.booking_code}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(booking.total_amount)}</span>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${
                        booking.status === 'confirmed' ? 'bg-green-50 text-green-600 border border-green-200' :
                        booking.status === 'cancelled' ? 'bg-red-50 text-red-500 border border-red-200' :
                        'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-3">
                      {canCancel && (
                        <button
                          onClick={() => setCancellingBookingId(booking.id)}
                          className="flex-1 py-2 text-sm font-semibold text-red-500 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center gap-1.5"
                        >
                          Cancel
                        </button>
                      )}
                      {canReview && (
                        <button
                          onClick={() => handleOpenReviewModal(booking)}
                          className="flex-1 py-2 text-sm font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center gap-1.5"
                        >
                          <MessageSquarePlus className="w-3.5 h-3.5" /> Review
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          DESKTOP VIEW — Unified Light Theme
          ═══════════════════════════════════════ */}
      <div className="hidden md:block min-h-screen bg-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">My Bookings</h1>
            <p className="text-sm text-gray-500 mt-1">View and manage your turf reservations</p>
          </motion.div>

          {bookings.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 pf-card rounded-2xl">
              <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Bookings Yet</h2>
              <p className="text-sm text-gray-500 mb-6">Get out there and play!</p>
              <Link href="/turfs" className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-xl text-sm shadow-sm">Find Turfs</Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking, index) => {
                const canReview = (booking.status === 'confirmed' || booking.status === 'completed') && !reviewedTurfIds.has(booking.turf_id);
                const canCancel = booking.status === 'confirmed' || booking.status === 'pending';
                return (
                  <motion.div key={booking.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="pf-card rounded-2xl overflow-hidden group hover:border-green-200 transition-all">
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-48 bg-gray-50 p-5 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-gray-100">
                        <span className={`self-start mb-3 px-2.5 py-1 text-xs font-bold rounded-md uppercase tracking-wider ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700 border border-green-200' :
                          booking.status === 'cancelled' ? 'bg-red-50 text-red-600 border border-red-200' :
                          'bg-amber-50 text-amber-600 border border-amber-200'
                        }`}>{booking.status}</span>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Booked On</div>
                        <div className="text-sm text-gray-900 font-semibold">{new Date(booking.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        {booking.booking_code && (
                          <div className="text-xs font-mono text-gray-400 mt-1">ID: {booking.booking_code}</div>
                        )}
                      </div>
                      <div className="flex-1 p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <Link href={`/turfs/${booking.turf_id}`} className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">{booking.turf?.name || 'Unknown Turf'}</Link>
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{booking.turf?.address || '—'}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Amount</div>
                            <div className="text-xl font-bold text-gray-900">{formatCurrency(booking.total_amount)}</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-100">
                          <div className="bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 flex items-center gap-2">
                            <Ticket className="w-4 h-4 text-green-600" />
                            <div className="text-sm font-semibold text-gray-700">{booking.slot_ids.length} Slot{booking.slot_ids.length > 1 ? 's' : ''}</div>
                          </div>
                          <div className="flex gap-2">
                            {canCancel && (
                              <button onClick={() => setCancellingBookingId(booking.id)} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 border border-red-200 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors">
                                Cancel Booking
                              </button>
                            )}
                            {canReview && (
                              <button onClick={() => handleOpenReviewModal(booking)} className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg text-sm font-bold hover:bg-amber-100 transition-colors">
                                <MessageSquarePlus className="w-4 h-4" /> Write a Review
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {cancellingBookingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-red-500" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Cancel Booking?</h3>
              <p className="text-sm text-gray-500 text-center mb-6">This action cannot be undone. The slots will be released back to availability.</p>
              {cancelError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                  <p className="text-sm text-red-600">{cancelError}</p>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => { setCancellingBookingId(null); setCancelError(null); }} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm">Keep Booking</button>
                <button onClick={handleCancelBooking} disabled={isCancelling} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                  {isCancelling ? <><Loader2 className="w-4 h-4 animate-spin" /> Cancelling...</> : 'Yes, Cancel'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Modal — shared */}
      <AnimatePresence>
        {reviewTurfId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setReviewTurfId(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Rate Your Experience</h3>
              <p className="text-sm text-gray-500 mb-6">How was your game at {reviewTurfName}?</p>
              <form onSubmit={handleSubmitReview} className="space-y-6">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setRating(star)} className="p-1 transition-transform hover:scale-110 focus:outline-none">
                      <Star className={`w-8 h-8 ${star <= rating ? 'text-amber fill-amber' : 'text-gray-200 fill-transparent'} transition-colors`} />
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-medium mb-1.5">Your Review (Optional)</label>
                  <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Tell others about your experience..." rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl placeholder-gray-400 focus:outline-none focus:border-green-400 resize-none" />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setReviewTurfId(null)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm">Cancel</button>
                  <button type="submit" disabled={isSubmittingReview} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSubmittingReview ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Review'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
