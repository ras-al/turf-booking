'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useBookingStore } from '@/stores/booking-store';
import { useAuthStore } from '@/stores/auth-store';
import { createBooking } from '@/lib/supabase/queries';
import { formatCurrency, formatTime, formatDate, SPORT_ICONS } from '@/lib/utils';
import { Ticket, MapPin, ArrowLeft, CheckCircle, ChevronLeft, Loader2 } from 'lucide-react';

export default function BookingConfirmPage() {
  const router = useRouter();
  const { selectedTurf, selectedSlots, totalAmount, resetBooking } = useBookingStore();
  const { user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!selectedTurf || selectedSlots.length === 0) {
    return (
      <div className="min-h-screen bg-white md:bg-pitch-900 flex items-center justify-center px-4">
        <div className="text-center">
          <Ticket className="w-16 h-16 text-gray-200 md:text-chalk-dim/50 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 md:text-2xl md:font-display md:text-chalk">No Slots Selected</h2>
          <p className="text-sm text-gray-400 md:text-chalk-dim mt-2">Please select slots from a turf first</p>
          <Link href="/turfs" className="mt-6 inline-flex items-center gap-2 text-sm text-green-600 md:text-turf font-semibold">
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

  // ═══════════════════════════════════════
  // SUCCESS SCREEN (ui.png "Booking Confirmed!" screen)
  // ═══════════════════════════════════════
  if (isConfirmed) {
    return (
      <div className="min-h-screen">
        {/* MOBILE */}
        <div className="md:hidden bg-white min-h-screen flex flex-col items-center justify-center px-6 pb-20">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-2xl font-extrabold text-gray-900 mb-1">Booking Confirmed!</motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-sm text-gray-500 mb-8">Your booking has been confirmed successfully.</motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="w-full bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-6">
            <h3 className="text-base font-bold text-gray-900 mb-1">{selectedTurf.name}</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
              <MapPin className="w-3 h-3 text-green-600" /> {selectedTurf.address}
            </p>
            <div className="space-y-2 border-t border-gray-100 pt-3">
              {selectedSlots.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{formatDate(slot.date)} · {formatTime(slot.start_time)} - {formatTime(slot.end_time)}</span>
                  <span className="font-bold text-green-600">{formatCurrency(selectedTurf.price_per_hour)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">Booking ID</span>
              <span className="text-xs font-mono font-bold text-gray-500">PF{Date.now().toString(36).toUpperCase()}</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="w-full space-y-3">
            <Link href="/booking/history" onClick={() => resetBooking()} className="block w-full py-3.5 bg-green-600 text-white font-bold rounded-xl text-center text-sm shadow-lg shadow-green-600/20">
              View My Bookings
            </Link>
            <Link href="/" onClick={() => resetBooking()} className="block w-full py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl text-center text-sm">
              Share with Friends
            </Link>
          </motion.div>
        </div>

        {/* DESKTOP */}
        <div className="hidden md:flex min-h-screen bg-gray-50 items-center justify-center px-4">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} className="max-w-md w-full text-center pf-card p-10 rounded-3xl">
            <div className="relative mb-6">
              {[...Array(12)].map((_, i) => (
                <motion.div key={i} initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1, 0], opacity: [0, 1, 0], x: Math.cos((i * 30 * Math.PI) / 180) * 80, y: Math.sin((i * 30 * Math.PI) / 180) * 80 }} transition={{ delay: 0.2 + i * 0.05, duration: 1 }} className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full" style={{ background: i % 3 === 0 ? '#16a34a' : i % 3 === 1 ? '#eab308' : '#3b82f6' }} />
              ))}
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }} className="w-24 h-24 mx-auto bg-green-50 border-4 border-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </motion.div>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-500">Your turf is reserved. Game on!</p>
            <div className="mt-8 flex flex-col gap-3">
              <Link href="/booking/history" className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl text-sm shadow-sm hover:bg-green-700 transition-colors" onClick={() => resetBooking()}>View My Bookings</Link>
              <Link href="/" className="w-full py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-200 transition-colors" onClick={() => resetBooking()}>Back to Home</Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // BOOKING CONFIRMATION FORM
  // ═══════════════════════════════════════
  return (
    <div className="min-h-screen">
      {/* MOBILE — Payment-style screen from ui.png */}
      <div className="md:hidden bg-white min-h-screen pb-20">
        <div className="px-4 pt-2 pb-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Payment</h1>
        </div>

        {/* Total Amount */}
        <div className="px-4 mb-5">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-sm text-gray-600">Total Amount</span>
            <span className="text-lg font-bold text-gray-900">{formatCurrency(amount)}</span>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="px-4 mb-5">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-2">{selectedTurf.name}</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
              <MapPin className="w-3 h-3" /> {selectedTurf.address}
            </p>
            {selectedSlots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between text-sm py-1.5 border-t border-gray-100">
                <span className="text-gray-600">{formatDate(slot.date)} · {formatTime(slot.start_time)}</span>
                <span className="font-semibold text-gray-800">{formatCurrency(selectedTurf.price_per_hour)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Free Booking Notice */}
        <div className="px-4 mb-5">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-700">Free Booking</p>
              <p className="text-xs text-green-600/70 mt-0.5">No payment required. Confirmed instantly.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="px-4 mb-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Confirm Button */}
        <div className="px-4">
          <button
            onClick={handleConfirmBooking}
            disabled={isProcessing}
            className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-green-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Confirming...</>
            ) : (
              `Pay ${formatCurrency(amount)}`
            )}
          </button>
        </div>
      </div>

      {/* DESKTOP — Unified Light Theme */}
      <div className="hidden md:block min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Confirm Your Booking</h1>
            <p className="text-sm text-gray-500">Review your booking details before proceeding</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 150, damping: 20, delay: 0.2 }} className="pf-card p-0 overflow-hidden mb-8">
            <div className="flex flex-col sm:flex-row">
              <div className="sm:w-[35%] p-6 bg-green-50 flex flex-col justify-center items-center text-center border-b sm:border-b-0 sm:border-r border-dashed border-green-200">
                <div className="text-xs text-green-700 uppercase tracking-widest mb-1 font-bold">Match Day</div>
                <div className="text-4xl font-bold text-green-700 mb-1">{new Date(selectedSlots[0].date).getDate()}</div>
                <div className="text-sm font-semibold text-green-600/80">{new Date(selectedSlots[0].date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</div>
                <div className="mt-4 text-xs text-green-700 uppercase tracking-widest mb-1 font-bold">Time</div>
                <div className="text-xl font-bold text-gray-900">{formatTime(selectedSlots[0].start_time)}</div>
                {selectedSlots.length > 1 && <div className="text-xs text-gray-500 mt-1">+ {selectedSlots.length - 1} more</div>}
              </div>
              <div className="sm:w-[65%] p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedTurf.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-green-600" />{selectedTurf.address}</p>
                  </div>
                  <div className="w-10 h-10 [&>svg]:w-full [&>svg]:h-full text-gray-300">{SPORT_ICONS[selectedTurf.sports[0]] || <MapPin />}</div>
                </div>
                <div className="space-y-2 mb-6">
                  {selectedSlots.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                      <span className="text-gray-600 font-medium">{formatDate(slot.date)}</span>
                      <span className="font-bold text-gray-900">{formatTime(slot.start_time)} — {formatTime(slot.end_time)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">{selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} × {formatCurrency(selectedTurf.price_per_hour)}/hr</div>
                    <div className="text-3xl font-bold text-green-600">{formatCurrency(amount)}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-green-800">Free Booking</p>
                <p className="text-sm text-green-600 mt-1">No payment required. Confirmed instantly.</p>
              </div>
            </div>
            {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"><p className="text-sm text-red-600 font-medium">{error}</p></div>}
            
            <button onClick={handleConfirmBooking} disabled={isProcessing} className="w-full py-4 bg-green-600 text-white font-bold rounded-xl text-lg shadow-lg shadow-green-600/20 disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-green-700 transition-colors">
              {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Confirming...</> : 'Confirm Booking'}
            </button>
            <button onClick={() => router.back()} className="w-full mt-4 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">← Go Back</button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
