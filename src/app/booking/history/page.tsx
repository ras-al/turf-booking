'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchUserBookings, createReview, hasUserReviewed } from '@/lib/supabase/queries';
import { formatCurrency, formatTime, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import type { Booking } from '@/types';
import { Calendar, MapPin, Ticket, Loader2, Star, MessageSquarePlus, X } from 'lucide-react';

export default function BookingHistoryPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewTurfId, setReviewTurfId] = useState<string | null>(null);
  const [reviewTurfName, setReviewTurfName] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewedTurfIds, setReviewedTurfIds] = useState<Set<string>>(new Set());

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

          // Check which turfs the user has already reviewed
          const uniqueTurfIds = Array.from(new Set(data.map(b => b.turf_id)));
          const reviewedMap = await Promise.all(
            uniqueTurfIds.map(async (turfId) => {
              const hasReviewed = await hasUserReviewed(user!.id, turfId);
              return { turfId, hasReviewed };
            })
          );
          const reviewedSet = new Set(reviewedMap.filter(m => m.hasReviewed).map(m => m.turfId));
          setReviewedTurfIds(reviewedSet);
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
      await createReview({
        user_id: user.id,
        turf_id: reviewTurfId,
        rating,
        text: reviewText,
      });
      
      // Update state to hide review button for this turf
      setReviewedTurfIds(prev => new Set(prev).add(reviewTurfId));
      setReviewTurfId(null);
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-pitch-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-turf animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-pitch-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-display tracking-wider text-chalk">
            MY <span className="text-turf">BOOKINGS</span>
          </h1>
          <p className="text-sm text-chalk-muted mt-1">View and manage your turf reservations</p>
        </motion.div>

        {bookings.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 glass-panel rounded-2xl">
            <div className="flex justify-center mb-6">
              <Calendar className="w-16 h-16 text-chalk-dim/50" />
            </div>
            <h2 className="text-2xl font-display text-chalk mb-2">NO BOOKINGS YET</h2>
            <p className="text-sm text-chalk-dim mb-6">You haven't booked any turfs yet. Get out there and play!</p>
            <Link href="/turfs" className="inline-flex items-center gap-2 px-6 py-3 bg-turf text-pitch-900 font-semibold rounded-xl text-sm hover:bg-turf-light transition-all">
              Find Turfs
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, index) => {
              // Determine if playing time is over. We check if the booking date is in the past.
              const isPast = new Date(booking.created_at).getTime() < new Date().getTime(); // Simulating past logic for testing
              // Better logic: if there are slots, check the date of the slot
              // Since slot_ids is an array, we'll just check if booking status is 'confirmed' or 'completed'
              const canReview = (booking.status === 'confirmed' || booking.status === 'completed') && !reviewedTurfIds.has(booking.turf_id);

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-panel rounded-2xl overflow-hidden group hover:border-turf/30 transition-all"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Status & Date block */}
                    <div className="sm:w-48 bg-pitch-800/50 p-5 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-pitch-600/30">
                      <span className={`self-start mb-3 px-2.5 py-1 text-xs font-semibold rounded-md uppercase tracking-wider ${
                        booking.status === 'confirmed' ? 'bg-turf/10 text-turf border border-turf/20' :
                        booking.status === 'cancelled' ? 'bg-danger/10 text-danger border border-danger/20' :
                        'bg-amber/10 text-amber border border-amber/20'
                      }`}>
                        {booking.status}
                      </span>
                      <div className="text-xs text-chalk-dim uppercase tracking-wider mb-1">Booked On</div>
                      <div className="text-sm text-chalk font-medium">
                        {new Date(booking.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </div>
                    </div>

                    {/* Turf Details */}
                    <div className="flex-1 p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <Link href={`/turfs/${booking.turf_id}`} className="text-xl font-display tracking-wide text-chalk group-hover:text-turf transition-colors hover:underline">
                            {booking.turf?.name || 'Unknown Turf'}
                          </Link>
                          <p className="text-sm text-chalk-muted mt-1 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            {booking.turf?.address || '—'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-chalk-dim uppercase tracking-wider mb-1">Amount</div>
                          <div className="text-xl font-mono font-bold text-chalk">
                            {formatCurrency(booking.total_amount)}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-pitch-600/30">
                        <div className="bg-pitch-900/50 rounded-xl px-3 py-2 border border-pitch-600/30 flex items-center gap-2">
                          <Ticket className="w-4 h-4 text-turf" />
                          <div className="text-sm font-medium text-chalk">
                            {booking.slot_ids.length} Slot{booking.slot_ids.length > 1 ? 's' : ''} Reserved
                          </div>
                        </div>

                        {canReview && (
                          <button
                            onClick={() => handleOpenReviewModal(booking)}
                            className="flex items-center gap-2 px-4 py-2 bg-amber/10 text-amber border border-amber/30 rounded-lg text-sm font-medium hover:bg-amber/20 transition-colors"
                          >
                            <MessageSquarePlus className="w-4 h-4" />
                            Write a Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewTurfId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pitch-900/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-pitch-800 border border-pitch-600/50 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={() => setReviewTurfId(null)}
                className="absolute top-4 right-4 text-chalk-dim hover:text-chalk transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-display tracking-wider text-chalk mb-1">RATE YOUR EXPERIENCE</h3>
              <p className="text-sm text-chalk-dim mb-6">How was your game at {reviewTurfName}?</p>

              <form onSubmit={handleSubmitReview} className="space-y-6">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? 'text-amber fill-amber'
                            : 'text-pitch-600 fill-transparent'
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs text-chalk-dim font-medium mb-1.5">Your Review (Optional)</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Tell others what you thought of the turf, pitch quality, lighting, etc."
                    rows={4}
                    className="w-full px-4 py-3 bg-pitch-900/50 border border-pitch-600 text-chalk text-sm rounded-xl placeholder-chalk-dim focus:outline-none focus:border-turf/50 resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewTurfId(null)}
                    className="flex-1 py-3 bg-pitch-700 text-chalk font-semibold rounded-xl hover:bg-pitch-600 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="flex-1 py-3 bg-turf text-pitch-900 font-semibold rounded-xl hover:bg-turf-light transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmittingReview ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                    ) : (
                      'Submit Review'
                    )}
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
