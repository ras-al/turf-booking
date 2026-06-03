'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useBookingStore } from '@/stores/booking-store';
import { useAuthStore } from '@/stores/auth-store';
import { createBooking } from '@/lib/supabase/queries';
import { formatCurrency, formatTime, formatDate, SPORT_ICONS } from '@/lib/utils';
import { Ticket, MapPin, ArrowLeft, CheckCircle } from 'lucide-react';

export default function BookingConfirmPage() {
  const router = useRouter();
  const { selectedTurf, selectedSlots, totalAmount, resetBooking } = useBookingStore();
  const { user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!selectedTurf || selectedSlots.length === 0) {
    return (
      <div className="min-h-screen bg-pitch-900 flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-6"><Ticket className="w-16 h-16 text-chalk-dim/50" /></div>
          <h2 className="text-2xl font-display text-chalk">NO SLOTS SELECTED</h2>
          <p className="text-sm text-chalk-dim mt-2">Please select slots from a turf first</p>
          <Link href="/turfs" className="mt-6 flex items-center justify-center gap-2 text-sm text-turf hover:underline">
            <ArrowLeft className="w-4 h-4" /> Browse Turfs
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth?redirect=/booking/confirm');
    return null;
  }

  const amount = totalAmount();

  const handleConfirmBooking = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      await createBooking({
        user_id: user.id,
        turf_id: selectedTurf.id,
        slot_ids: selectedSlots.map((s) => s.id),
        total_amount: amount,
      });
      setIsProcessing(false);
      setIsConfirmed(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
      setIsProcessing(false);
    }
  };

  if (isConfirmed) {
    return (
      <div className="min-h-screen bg-pitch-900 flex items-center justify-center px-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} className="max-w-md w-full text-center">
          <div className="relative mb-6">
            {[...Array(12)].map((_, i) => (
              <motion.div key={i} initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1, 0], opacity: [0, 1, 0], x: Math.cos((i * 30 * Math.PI) / 180) * 80, y: Math.sin((i * 30 * Math.PI) / 180) * 80 }} transition={{ delay: 0.2 + i * 0.05, duration: 1 }} className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full" style={{ background: i % 3 === 0 ? '#22c55e' : i % 3 === 1 ? '#f59e0b' : '#3b82f6' }} />
            ))}
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }} className="w-20 h-20 mx-auto bg-turf/20 border-2 border-turf rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-turf" />
            </motion.div>
          </div>
          <h2 className="text-3xl font-display tracking-wider text-chalk">BOOKING CONFIRMED!</h2>
          <p className="text-chalk-muted mt-2">Your turf is reserved. Game on!</p>
          <div className="mt-8 flex flex-col gap-3">
            <Link href="/turfs" className="px-6 py-3 bg-turf text-pitch-900 font-semibold rounded-xl text-sm hover:bg-turf-light transition-colors" onClick={() => resetBooking()}>Browse More Turfs</Link>
            <Link href="/" className="px-6 py-3 bg-pitch-700 border border-pitch-600 text-chalk font-medium rounded-xl text-sm hover:border-chalk-dim transition-colors" onClick={() => resetBooking()}>Back to Home</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pitch-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-display tracking-wider text-chalk">CONFIRM YOUR <span className="text-amber">BOOKING</span></h1>
          <p className="text-sm text-chalk-muted mt-1">Review your booking details</p>
        </motion.div>

        {/* TICKET STUB */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 150, damping: 20, delay: 0.2 }} className="ticket-stub p-0 overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            <div className="sm:w-[35%] p-6 bg-pitch-700/50 flex flex-col justify-center items-center text-center border-b sm:border-b-0 sm:border-r border-dashed border-pitch-500">
              <div className="text-xs text-chalk-dim uppercase tracking-widest mb-1">Match Day</div>
              <div className="text-2xl font-mono font-bold text-amber">{new Date(selectedSlots[0].date).getDate()}</div>
              <div className="text-sm font-mono text-chalk-muted">{new Date(selectedSlots[0].date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</div>
              <div className="mt-3 text-xs text-chalk-dim uppercase tracking-widest mb-1">Time</div>
              <div className="text-lg font-mono font-bold text-turf">{formatTime(selectedSlots[0].start_time)}</div>
              {selectedSlots.length > 1 && <div className="text-xs text-chalk-dim mt-1">+ {selectedSlots.length - 1} more slot{selectedSlots.length > 2 ? 's' : ''}</div>}
            </div>
            <div className="sm:w-[65%] p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-display tracking-wide text-chalk">{selectedTurf.name}</h3>
                  <p className="text-sm text-chalk-dim flex items-center gap-1 mt-1"><MapPin className="w-3.5 h-3.5" />{selectedTurf.address}</p>
                </div>
                <div className="w-8 h-8 [&>svg]:w-full [&>svg]:h-full text-chalk-dim">{SPORT_ICONS[selectedTurf.sports[0]] || <MapPin />}</div>
              </div>
              <div className="space-y-2 mb-4">
                {selectedSlots.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between text-sm bg-pitch-600/30 rounded-lg px-3 py-2">
                    <span className="text-chalk-muted">{formatDate(slot.date)}</span>
                    <span className="font-mono text-chalk font-semibold">{formatTime(slot.start_time)} — {formatTime(slot.end_time)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-pitch-600/50 pt-3">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-chalk-dim">{selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} × {formatCurrency(selectedTurf.price_per_hour)}/hr</div>
                  <div className="text-2xl font-mono font-bold text-chalk">{formatCurrency(amount)}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Confirm section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-6 glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-display tracking-wide text-chalk mb-4">CONFIRM BOOKING</h3>
          <div className="bg-turf/5 border border-turf/20 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 text-turf text-sm font-medium">
              <CheckCircle className="w-5 h-5" /> Free Booking
            </div>
            <p className="text-xs text-chalk-dim mt-1">No payment required. Your booking will be confirmed instantly.</p>
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger/30 rounded-xl p-3 mb-4">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          <button onClick={handleConfirmBooking} disabled={isProcessing} className="w-full py-3.5 bg-gradient-cta text-pitch-900 font-semibold rounded-xl hover:shadow-lg hover:shadow-amber/25 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isProcessing ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                Confirming...
              </>
            ) : (
              'Confirm Booking'
            )}
          </button>
          <button onClick={() => router.back()} className="w-full mt-3 py-2.5 text-sm text-chalk-dim hover:text-chalk transition-colors">← Go Back</button>
        </motion.div>
      </div>
    </div>
  );
}
