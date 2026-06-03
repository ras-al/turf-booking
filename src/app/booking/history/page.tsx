'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchUserBookings } from '@/lib/supabase/queries';
import { formatCurrency, formatTime, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import type { Booking } from '@/types';
import { Calendar, MapPin, Ticket, Loader2 } from 'lucide-react';

export default function BookingHistoryPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

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
        } catch (error) {
          console.error('Failed to load bookings:', error);
        } finally {
          setLoading(false);
        }
      }
      loadBookings();
    }
  }, [user, authLoading, router]);

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
            {bookings.map((booking, index) => (
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
                        <h3 className="text-xl font-display tracking-wide text-chalk group-hover:text-turf transition-colors">
                          {booking.turf?.name || 'Unknown Turf'}
                        </h3>
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

                    <div className="bg-pitch-900/50 rounded-xl p-3 border border-pitch-600/30 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-pitch-800 flex items-center justify-center text-turf shrink-0">
                        <Ticket className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-chalk">
                          {booking.slot_ids.length} Slot{booking.slot_ids.length > 1 ? 's' : ''} Reserved
                        </div>
                        <div className="text-xs text-chalk-dim mt-0.5">
                          Booking ID: <span className="font-mono text-chalk-muted">{booking.id.split('-')[0]}...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
