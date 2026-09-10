'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useBookingStore } from '@/stores/booking-store';
import { useAuthStore } from '@/stores/auth-store';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatTime, formatDate } from '@/lib/utils';
import {
  MapPin,
  ChevronLeft,
  Loader2,
  CheckCircle,
  Copy,
  Check,
  Share2,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
} from 'lucide-react';

export default function BookingConfirmPage() {
  const router = useRouter();
  const { selectedTurf, selectedSlots, totalAmount, resetBooking } = useBookingStore();
  const { user } = useAuthStore();

  const [step, setStep] = useState<'review' | 'confirmed'>('review');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookingCode, setBookingCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [ownerHasPayouts, setOwnerHasPayouts] = useState<boolean | null>(null);
  const [checkingOwner, setCheckingOwner] = useState(false);

  const supabase = createClient();
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);

  const amountInPaise = totalAmount();

  // Redirect if no selection
  useEffect(() => {
    if (!selectedTurf || selectedSlots.length === 0) {
      router.replace('/turfs');
    }
  }, [selectedTurf, selectedSlots, router]);

  // Redirect if not logged in
  useEffect(() => {
    if (user === null) {
      const t = setTimeout(() => router.push('/auth?redirect=/booking/confirm'), 800);
      return () => clearTimeout(t);
    }
  }, [user, router]);

  // Check if turf owner has set up payouts
  useEffect(() => {
    const ownerId = selectedTurf?.owner_id;
    if (!ownerId) return;
    let isMounted = true;
    async function checkOwnerAccount() {
      setCheckingOwner(true);
      try {
        const { data, error: profileErr } = await supabase
          .from('profiles')
          .select('razorpay_account_id')
          .eq('id', ownerId)
          .single();

        if (isMounted) {
          if (profileErr || !data?.razorpay_account_id) {
            setOwnerHasPayouts(false);
          } else {
            setOwnerHasPayouts(true);
          }
        }
      } catch {
        if (isMounted) setOwnerHasPayouts(true);
      } finally {
        if (isMounted) setCheckingOwner(false);
      }
    }
    checkOwnerAccount();
    return () => {
      isMounted = false;
    };
  }, [selectedTurf, supabase]);

  const cleanupListeners = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, [supabase]);

  useEffect(() => {
    return () => cleanupListeners();
  }, [cleanupListeners]);

  if (!selectedTurf || selectedSlots.length === 0) return null;

  const startConfirmationListening = (bookingId: string) => {
    cleanupListeners();

    const onConfirmed = (confirmedBooking: any) => {
      cleanupListeners();
      setBookingCode(confirmedBooking.booking_code || `PF${confirmedBooking.id.slice(0, 6).toUpperCase()}`);
      setIsProcessing(false);
      setProcessingMessage(null);
      setStep('confirmed');
    };

    // 1. Listen via Supabase Realtime
    try {
      const channel = supabase
        .channel(`booking-confirm-${bookingId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'bookings',
            filter: `id=eq.${bookingId}`,
          },
          (payload) => {
            if (payload.new && payload.new.status === 'confirmed') {
              onConfirmed(payload.new);
            }
          }
        )
        .subscribe();
      channelRef.current = channel;
    } catch (e) {
      console.error('Realtime subscription error:', e);
    }

    // 2. Poll every 2s for up to 30s
    const startTime = Date.now();
    pollIntervalRef.current = setInterval(async () => {
      try {
        const { data: b } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .single();

        if (b && b.status === 'confirmed') {
          onConfirmed(b);
        } else if (Date.now() - startTime > 30000) {
          cleanupListeners();
          setIsProcessing(false);
          setProcessingMessage(null);
          setError('Payment verification is taking longer than usual. Please check your bookings history in a minute.');
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);
  };

  const handleConfirmBooking = async () => {
    if (!user) return;

    setIsProcessing(true);
    setProcessingMessage('Reserving your slots...');
    setError(null);

    try {
      // 1. Create order on backend which holds slots and sets up Razorpay Route transfer
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          turfId: selectedTurf.id,
          slotIds: selectedSlots.map((s) => s.id),
          totalAmount: amountInPaise / 100, // Send rupee amount
          notes: `Booking for ${selectedTurf.name}`,
        }),
      });

      const orderData = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setOwnerHasPayouts(false);
          throw new Error("This turf's owner hasn't set up payouts yet");
        }
        throw new Error(orderData.error || 'Failed to initialize payment');
      }

      // Check if Razorpay checkout script is loaded
      if (typeof window === 'undefined' || !(window as any).Razorpay) {
        throw new Error('Razorpay payment gateway is still loading. Please wait a moment and try again.');
      }

      setProcessingMessage(null);

      // 2. Open Razorpay Checkout modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: 'INR',
        name: 'PlayField',
        description: `Booking for ${selectedTurf.name}`,
        order_id: orderData.orderId,
        prefill: {
          name: user.full_name || '',
          email: user.email || '',
          contact: user.phone ? user.phone.replace('+91', '') : '',
        },
        theme: {
          color: '#16a34a',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setProcessingMessage(null);
          },
        },
        handler: async (response: any) => {
          // Do NOT mark booking confirmed client-side — wait for webhook confirmation
          setIsProcessing(true);
          setProcessingMessage('Payment received! Finalizing your booking confirmation...');
          startConfirmationListening(orderData.bookingId);
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        setIsProcessing(false);
        setProcessingMessage(null);
        setError(response.error?.description || 'Payment was not completed. Your slots remain held for 10 minutes.');
      });
      rzp.open();
    } catch (err: unknown) {
      setIsProcessing(false);
      setProcessingMessage(null);
      const message = err instanceof Error ? err.message : 'Booking failed. Please try again.';
      if (message.includes('no longer available')) {
        setError('Sorry, someone just reserved one or more of your selected slots. Please go back and pick another time.');
      } else {
        setError(message);
      }
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(bookingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const slotSummary = selectedSlots
      .map((s) => `${formatDate(s.date)} ${formatTime(s.start_time)}–${formatTime(s.end_time)}`)
      .join(', ');
    const text = `I just booked ${selectedTurf.name} on PlayField!\n📅 ${slotSummary}\n🎫 Booking: ${bookingCode}\nBook your turf at ${window.location.origin}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'PlayField Booking', text, url: window.location.origin });
      } catch {
        /* dismissed */
      }
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
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  x: Math.cos((i * 45 * Math.PI) / 180) * 55,
                  y: Math.sin((i * 45 * Math.PI) / 180) * 55,
                }}
                transition={{ delay: 0.1 + i * 0.05, duration: 1 }}
                className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full"
                style={{ background: i % 3 === 0 ? '#16a34a' : i % 3 === 1 ? '#f59e0b' : '#3b82f6' }}
              />
            ))}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-extrabold text-gray-900 mb-1"
          >
            Booking Confirmed!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-gray-500 mb-8 text-center"
          >
            Payment captured and your slots are reserved.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-6"
          >
            <h3 className="text-base font-bold text-gray-900 mb-1">{selectedTurf.name}</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
              <MapPin className="w-3 h-3 text-green-600" /> {selectedTurf.address}
            </p>
            <div className="space-y-1.5 border-t border-gray-100 pt-3">
              {selectedSlots.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {formatDate(slot.date)} · {formatTime(slot.start_time)}–{formatTime(slot.end_time)}
                  </span>
                  <span className="font-bold text-green-600">{formatCurrency(selectedTurf.price_per_hour)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">Total Paid</span>
              <span className="text-base font-bold text-green-600">{formatCurrency(amountInPaise)}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Booking ID</span>
                <button
                  onClick={handleCopyId}
                  className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-700"
                >
                  {bookingCode}
                  {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
                </button>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs text-green-700 font-medium">Payment Status: Paid (via Razorpay)</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="w-full space-y-3">
            <Link
              href="/booking/history"
              onClick={resetBooking}
              className="flex items-center justify-center w-full py-4 bg-green-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-green-600/20 min-h-[52px]"
            >
              View My Bookings
            </Link>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 w-full py-3.5 border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm min-h-[52px]"
            >
              <Share2 className="w-4 h-4" /> Share with Friends
            </button>
          </motion.div>
        </div>

        {/* Desktop success */}
        <div className="hidden md:flex min-h-screen bg-gray-50 items-center justify-center px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="max-w-md w-full text-center pf-card p-10 rounded-3xl"
          >
            <div className="relative mb-6">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    x: Math.cos((i * 30 * Math.PI) / 180) * 80,
                    y: Math.sin((i * 30 * Math.PI) / 180) * 80,
                  }}
                  transition={{ delay: 0.2 + i * 0.05, duration: 1 }}
                  className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full"
                  style={{ background: i % 3 === 0 ? '#16a34a' : i % 3 === 1 ? '#eab308' : '#3b82f6' }}
                />
              ))}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                className="w-24 h-24 mx-auto bg-green-50 border-4 border-green-100 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-12 h-12 text-green-600" />
              </motion.div>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-500 mb-2">Payment captured. Your turf is reserved!</p>
            <div className="flex items-center justify-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">Payment Status: Paid (via Razorpay)</span>
            </div>
            <p className="text-sm font-mono font-bold text-gray-700 mb-6">
              ID: {bookingCode}{' '}
              <button onClick={handleCopyId}>
                {copied ? <Check className="w-3.5 h-3.5 inline text-green-600" /> : <Copy className="w-3.5 h-3.5 inline text-gray-400" />}
              </button>
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/booking/history"
                onClick={resetBooking}
                className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl text-sm hover:bg-green-700 transition-colors block text-center"
              >
                View My Bookings
              </Link>
              <button
                onClick={handleShare}
                className="w-full py-3 text-sm font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" /> Share with Friends
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── REVIEW & CONFIRM SCREEN ──
  return (
    <div className="min-h-dvh bg-white">
      {/* MOBILE */}
      <div className="md:hidden pb-28">
        {/* Header */}
        <div className="px-4 pt-2 pb-3 flex items-center gap-3 border-b border-gray-100">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center min-h-[44px] min-w-[44px]"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Confirm Booking</h1>
        </div>

        {/* Owner Payout Warning Banner if missing */}
        {ownerHasPayouts === false && (
          <div className="px-4 pt-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-900">Payouts Not Set Up</p>
                <p className="text-xs text-amber-700">
                  This turf&apos;s owner hasn&apos;t set up payouts yet. Online booking is temporarily unavailable.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment assurance banner */}
        <div className="px-4 py-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-800">Secure Payment</p>
              <p className="text-xs text-emerald-600">Held securely by Razorpay until the slot date.</p>
            </div>
          </div>
        </div>

        {/* Booking summary */}
        <div className="px-4 pb-4">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-1">{selectedTurf.name}</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
              <MapPin className="w-3 h-3" />
              {selectedTurf.address}
            </p>
            {selectedSlots.map((slot) => (
              <div key={slot.id} className="flex justify-between text-sm py-1.5 border-t border-gray-100">
                <span className="text-gray-600">
                  {formatDate(slot.date)} · {formatTime(slot.start_time)}
                </span>
                <span className="font-semibold">{formatCurrency(selectedTurf.price_per_hour)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Amount</span>
            <span className="text-xl font-bold text-gray-900">{formatCurrency(amountInPaise)}</span>
          </div>
        </div>

        {error && (
          <div className="px-4 mb-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-600">{error}</p>
              {error.includes('pick another') && (
                <button onClick={() => router.back()} className="mt-2 text-sm font-bold text-red-700 underline">
                  ← Go back to slot selection
                </button>
              )}
            </div>
          </div>
        )}

        {/* Processing State Banner */}
        {isProcessing && processingMessage && (
          <div className="px-4 mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2.5">
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
              <p className="text-xs text-blue-700 font-medium">{processingMessage}</p>
            </div>
          </div>
        )}

        {/* Sticky Pay button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 pb-safe pt-3 pb-5 z-40">
          <button
            onClick={handleConfirmBooking}
            disabled={isProcessing || ownerHasPayouts === false || checkingOwner}
            className="w-full py-4 bg-green-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-green-600/20 disabled:opacity-50 flex items-center justify-center gap-2 min-h-[56px]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {processingMessage || 'Processing...'}
              </>
            ) : ownerHasPayouts === false ? (
              'Payouts Not Set Up'
            ) : (
              <>
                <CreditCard className="w-4 h-4" /> Pay with Razorpay · {formatCurrency(amountInPaise)}
              </>
            )}
          </button>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Confirm Your Booking</h1>
            <p className="text-sm text-gray-500">Review your booking details and proceed to secure payment</p>
          </motion.div>

          <div className="grid gap-6">
            {/* Owner Payout Warning Banner if missing */}
            {ownerHasPayouts === false && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-900">This turf&apos;s owner hasn&apos;t set up payouts yet</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Online booking is temporarily disabled for this venue until the owner links their payout account.
                  </p>
                </div>
              </div>
            )}

            {/* Payment banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-800">Secure Razorpay Route Payment</p>
                <p className="text-xs text-emerald-600">
                  Full amount transferred directly to the venue owner and held until your slot date.
                </p>
              </div>
            </div>

            <div className="pf-card rounded-2xl p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Booking Summary</h2>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">{selectedTurf.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-green-600" />
                    {selectedTurf.address}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-green-600">{formatCurrency(amountInPaise)}</span>
                  <p className="text-xs text-gray-400">Total</p>
                </div>
              </div>
              <div className="space-y-2">
                {selectedSlots.map((slot) => (
                  <div key={slot.id} className="flex justify-between text-sm bg-gray-50 px-4 py-2.5 rounded-xl">
                    <span className="text-gray-600">{formatDate(slot.date)}</span>
                    <span className="font-medium text-gray-900">
                      {formatTime(slot.start_time)}–{formatTime(slot.end_time)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-600 font-medium">{error}</p>
                {error.includes('pick another') && (
                  <button onClick={() => router.back()} className="mt-2 text-sm font-bold text-red-700 underline">
                    ← Go back to slot selection
                  </button>
                )}
              </div>
            )}

            {isProcessing && processingMessage && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
                <p className="text-sm text-blue-700 font-medium">{processingMessage}</p>
              </div>
            )}

            <button
              onClick={handleConfirmBooking}
              disabled={isProcessing || ownerHasPayouts === false || checkingOwner}
              className="w-full py-4 bg-green-600 text-white font-bold rounded-xl text-lg shadow-lg shadow-green-600/20 disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {processingMessage || 'Processing...'}
                </>
              ) : ownerHasPayouts === false ? (
                'Payouts Not Set Up'
              ) : (
                <>
                  <CreditCard className="w-5 h-5" /> Pay with Razorpay · {formatCurrency(amountInPaise)}
                </>
              )}
            </button>
            <button
              onClick={() => router.back()}
              className="w-full py-3 text-sm font-bold text-gray-500 hover:text-gray-900"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
