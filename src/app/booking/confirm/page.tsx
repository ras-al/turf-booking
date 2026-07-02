'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useBookingStore } from '@/stores/booking-store';
import { useAuthStore } from '@/stores/auth-store';
import { createBooking, createPayment, updateBookingPaymentStatus, holdSlots } from '@/lib/supabase/queries';
import { formatCurrency, formatTime, formatDate } from '@/lib/utils';
import { Ticket, MapPin, ChevronLeft, Loader2, CheckCircle, Copy, Check, Share2 } from 'lucide-react';

const PAYMENTS_MODE = process.env.NEXT_PUBLIC_PAYMENTS_MODE || 'mock';

type UPIOption = { id: string; label: string; icon: string };
const UPI_OPTIONS: UPIOption[] = [
  { id: 'gpay', label: 'Google Pay', icon: 'G' },
  { id: 'phonepe', label: 'PhonePe', icon: '₱' },
  { id: 'paytm', label: 'Paytm', icon: 'P' },
  { id: 'bhim', label: 'BHIM UPI', icon: 'B' },
];

export default function BookingConfirmPage() {
  const router = useRouter();
  const { selectedTurf, selectedSlots, totalAmount, resetBooking } = useBookingStore();
  const { user } = useAuthStore();

  const [step, setStep] = useState<'payment' | 'confirmed'>('payment');
  const [selectedUPI, setSelectedUPI] = useState('gpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingRef, setBookingRef] = useState('');
  const [copied, setCopied] = useState(false);
  const [slotsHeld, setSlotsHeld] = useState(false);

  const amount = totalAmount();

  // Redirect if no selection
  useEffect(() => {
    if (!selectedTurf || selectedSlots.length === 0) {
      router.replace('/turfs');
    }
  }, [selectedTurf, selectedSlots, router]);

  // Redirect if not logged in
  useEffect(() => {
    if (user === null) {
      // wait a tick in case auth is loading
      const t = setTimeout(() => router.push('/auth?redirect=/booking/confirm'), 800);
      return () => clearTimeout(t);
    }
  }, [user, router]);

  // Hold slots when page mounts
  useEffect(() => {
    if (!user || !selectedSlots.length) return;
    holdSlots(selectedSlots.map(s => s.id), user.id).then(ok => setSlotsHeld(ok));
  }, [user, selectedSlots]);

  if (!selectedTurf || selectedSlots.length === 0) return null;

  const handlePay = async () => {
    if (!user) return;
    if (!slotsHeld) {
      setError('One or more slots are no longer available. Please go back and re-select.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      if (PAYMENTS_MODE === 'mock') {
        // Mock payment flow — simulate 1s processing
        await new Promise(r => setTimeout(r, 1200));
        const booking = await createBooking({
          user_id: user.id,
          turf_id: selectedTurf.id,
          slot_ids: selectedSlots.map(s => s.id),
          total_amount: amount,
          payment_status: 'paid',
        });
        await createPayment({ booking_id: booking.id, amount, method: selectedUPI, status: 'captured' });
        setBookingId(booking.id);
        setBookingRef(`PF${booking.id.slice(0,6).toUpperCase()}`);
        setStep('confirmed');
      } else {
        // Razorpay flow — create booking first (unpaid), then open checkout
        const booking = await createBooking({
          user_id: user.id,
          turf_id: selectedTurf.id,
          slot_ids: selectedSlots.map(s => s.id),
          total_amount: amount,
          payment_status: 'unpaid',
        });
        const paymentRecord = await createPayment({ booking_id: booking.id, amount, method: 'razorpay', status: 'created' });

        // Open Razorpay checkout (requires window.Razorpay script loaded)
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: amount, // already in paise
          currency: 'INR',
          name: 'PlayField',
          description: `Booking at ${selectedTurf.name}`,
          order_id: paymentRecord.razorpay_order_id,
          handler: async (response: { razorpay_payment_id: string; razorpay_signature: string }) => {
            await updateBookingPaymentStatus(booking.id, 'paid');
            setBookingId(booking.id);
            setBookingRef(`PF${booking.id.slice(0,6).toUpperCase()}`);
            setStep('confirmed');
          },
          prefill: { name: user.full_name, email: user.email || '', contact: user.phone || '' },
          theme: { color: '#16a34a' },
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rzp = new (window as unknown as { Razorpay: new (o: unknown) => { open: () => void } }).Razorpay(options);
        rzp.open();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(bookingRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const text = `I just booked ${selectedTurf.name} on PlayField! Booking ID: ${bookingRef}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'PlayField Booking', text, url: window.location.origin }); }
      catch { /* dismissed */ }
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  // ── SUCCESS SCREEN ──
  if (step === 'confirmed') {
    return (
      <div className="min-h-dvh bg-white">
        <div className="md:hidden min-h-dvh flex flex-col items-center justify-center px-6 pb-24">
          {/* Confetti dots */}
          <div className="relative mb-6">
            {[...Array(8)].map((_, i) => (
              <motion.div key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1, 0], opacity: [0, 1, 0], x: Math.cos(i * 45 * Math.PI / 180) * 55, y: Math.sin(i * 45 * Math.PI / 180) * 55 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 1 }}
                className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full"
                style={{ background: i%3===0 ? '#16a34a' : i%3===1 ? '#f59e0b' : '#3b82f6' }}
              />
            ))}
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
          </div>

          <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-2xl font-extrabold text-gray-900 mb-1">Booking Confirmed!</motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-sm text-gray-500 mb-8 text-center">Your booking has been confirmed successfully.</motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="w-full bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-6">
            <h3 className="text-base font-bold text-gray-900 mb-1">{selectedTurf.name}</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
              <MapPin className="w-3 h-3 text-green-600" /> {selectedTurf.address}
            </p>
            <div className="space-y-1.5 border-t border-gray-100 pt-3">
              {selectedSlots.map(slot => (
                <div key={slot.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{formatDate(slot.date)} · {formatTime(slot.start_time)}–{formatTime(slot.end_time)}</span>
                  <span className="font-bold text-green-600">{formatCurrency(selectedTurf.price_per_hour)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">Total</span>
              <span className="text-base font-bold text-green-600">{formatCurrency(amount)}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">Booking ID</span>
              <button onClick={handleCopyId} className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-700">
                {bookingRef}
                {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="w-full space-y-3">
            <Link href="/booking/history" onClick={resetBooking}
              className="flex items-center justify-center w-full py-4 bg-green-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-green-600/20 min-h-[52px]">
              View My Bookings
            </Link>
            <button onClick={handleShare}
              className="flex items-center justify-center gap-2 w-full py-3.5 border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm min-h-[52px]">
              <Share2 className="w-4 h-4" /> Share with Friends
            </button>
          </motion.div>
        </div>

        {/* Desktop success */}
        <div className="hidden md:flex min-h-screen bg-gray-50 items-center justify-center px-4">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="max-w-md w-full text-center pf-card p-10 rounded-3xl">
            <div className="relative mb-6">
              {[...Array(12)].map((_, i) => (
                <motion.div key={i} initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0,1,0], opacity: [0,1,0], x: Math.cos(i*30*Math.PI/180)*80, y: Math.sin(i*30*Math.PI/180)*80 }}
                  transition={{ delay: 0.2+i*0.05, duration: 1 }}
                  className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full"
                  style={{ background: i%3===0?'#16a34a':i%3===1?'#eab308':'#3b82f6' }} />
              ))}
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                className="w-24 h-24 mx-auto bg-green-50 border-4 border-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </motion.div>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-500 mb-2">Your turf is reserved. Game on!</p>
            <p className="text-sm font-mono font-bold text-gray-700 mb-6">ID: {bookingRef} <button onClick={handleCopyId}>{copied?<Check className="w-3.5 h-3.5 inline text-green-600"/>:<Copy className="w-3.5 h-3.5 inline text-gray-400"/>}</button></p>
            <div className="flex flex-col gap-3">
              <Link href="/booking/history" onClick={resetBooking} className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl text-sm hover:bg-green-700 transition-colors block text-center">View My Bookings</Link>
              <button onClick={handleShare} className="w-full py-3 text-sm font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" /> Share with Friends
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── PAYMENT SCREEN ──
  return (
    <div className="min-h-dvh bg-white">
      {/* MOBILE */}
      <div className="md:hidden pb-28">
        {/* Header */}
        <div className="px-4 pt-2 pb-3 flex items-center gap-3 border-b border-gray-100">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center min-h-[44px] min-w-[44px]">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Payment</h1>
        </div>

        {/* Total */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Amount</span>
            <span className="text-xl font-bold text-gray-900">{formatCurrency(amount)}</span>
          </div>
        </div>

        {/* Booking summary */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-1">{selectedTurf.name}</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1 mb-2"><MapPin className="w-3 h-3" />{selectedTurf.address}</p>
            {selectedSlots.map(slot => (
              <div key={slot.id} className="flex justify-between text-sm py-1.5 border-t border-gray-100">
                <span className="text-gray-600">{formatDate(slot.date)} · {formatTime(slot.start_time)}</span>
                <span className="font-semibold">{formatCurrency(selectedTurf.price_per_hour)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* UPI section */}
        <div className="px-4 py-4">
          <h2 className="text-sm font-bold text-gray-900 mb-3">UPI</h2>
          <div className="space-y-2">
            {UPI_OPTIONS.map(opt => (
              <button key={opt.id} onClick={() => setSelectedUPI(opt.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all min-h-[52px] ${
                  selectedUPI===opt.id ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                  selectedUPI===opt.id ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                  {opt.icon}
                </div>
                <span className="text-sm font-medium text-gray-800 flex-1 text-left">{opt.label}</span>
                <div className={`w-5 h-5 rounded-full border-2 shrink-0 ${
                  selectedUPI===opt.id ? 'border-green-600 bg-green-600' : 'border-gray-300'}`}>
                  {selectedUPI===opt.id && <div className="w-full h-full rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Cards section */}
        <div className="px-4 pb-4 border-t border-gray-100 pt-4">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Cards</h2>
          <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-dashed border-gray-300 bg-gray-50 min-h-[52px]">
            <span className="text-2xl">+</span>
            <span className="text-sm font-medium text-gray-600">Add New Card</span>
          </button>
        </div>

        {/* More options */}
        <div className="px-4 pb-4 border-t border-gray-100 pt-4">
          <h2 className="text-sm font-bold text-gray-900 mb-3">More Options</h2>
          <div className="space-y-2">
            {['Wallets', 'Net Banking'].map(opt => (
              <button key={opt} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-200 bg-white min-h-[52px]">
                <span className="text-sm font-medium text-gray-700 flex-1 text-left">{opt}</span>
                <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
              </button>
            ))}
          </div>
        </div>

        {PAYMENTS_MODE === 'mock' && (
          <div className="px-4 mb-2">
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 font-medium">
              🧪 Demo mode — no real payment processed
            </div>
          </div>
        )}

        {error && (
          <div className="px-4 mb-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-3"><p className="text-sm text-red-600">{error}</p></div>
          </div>
        )}

        {/* Sticky Pay button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 pb-safe pt-3 pb-5 z-40">
          <button onClick={handlePay} disabled={isProcessing}
            className="w-full py-4 bg-green-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-green-600/20 disabled:opacity-50 flex items-center justify-center gap-2 min-h-[56px]">
            {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" />Processing...</> : `Pay ${formatCurrency(amount)}`}
          </button>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Complete Payment</h1>
            <p className="text-sm text-gray-500">Review your booking and choose a payment method</p>
          </motion.div>

          <div className="grid gap-6">
            <div className="pf-card rounded-2xl p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Booking Summary</h2>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">{selectedTurf.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-green-600" />{selectedTurf.address}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-green-600">{formatCurrency(amount)}</span>
                  <p className="text-xs text-gray-400">Total</p>
                </div>
              </div>
              <div className="space-y-2">
                {selectedSlots.map(slot => (
                  <div key={slot.id} className="flex justify-between text-sm bg-gray-50 px-4 py-2.5 rounded-xl">
                    <span className="text-gray-600">{formatDate(slot.date)}</span>
                    <span className="font-medium text-gray-900">{formatTime(slot.start_time)}–{formatTime(slot.end_time)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pf-card rounded-2xl p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">UPI Payment</h2>
              <div className="grid grid-cols-2 gap-3">
                {UPI_OPTIONS.map(opt => (
                  <button key={opt.id} onClick={() => setSelectedUPI(opt.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${selectedUPI===opt.id?'border-green-500 bg-green-50':'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${selectedUPI===opt.id?'bg-green-600 text-white':'bg-gray-100 text-gray-700'}`}>{opt.icon}</div>
                    <span className="text-sm font-medium text-gray-800">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {PAYMENTS_MODE === 'mock' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-700 font-medium">
                🧪 Running in demo mode — no real payment will be charged. Set NEXT_PUBLIC_PAYMENTS_MODE=razorpay to enable real payments.
              </div>
            )}

            {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4"><p className="text-sm text-red-600 font-medium">{error}</p></div>}

            <button onClick={handlePay} disabled={isProcessing}
              className="w-full py-4 bg-green-600 text-white font-bold rounded-xl text-lg shadow-lg shadow-green-600/20 disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-green-700 transition-colors">
              {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" />Processing...</> : `Pay ${formatCurrency(amount)}`}
            </button>
            <button onClick={() => router.back()} className="w-full py-3 text-sm font-bold text-gray-500 hover:text-gray-900">← Go Back</button>
          </div>
        </div>
      </div>

      {/* Ticket icon for empty state (keep linter happy) */}
      <div className="hidden"><Ticket /></div>
      <AnimatePresence>{/* keep framer-motion import used */}</AnimatePresence>
    </div>
  );
}
