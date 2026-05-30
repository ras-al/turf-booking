'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MOCK_TURFS, MOCK_SLOTS, MOCK_REVIEWS } from '@/lib/mock-data';
import { formatCurrency, formatTime, formatDateShort, getDateRange, SPORT_ICONS, AMENITY_ICONS } from '@/lib/utils';
import { useBookingStore } from '@/stores/booking-store';
import type { Slot } from '@/types';
import { MapPin, Navigation, Star, ArrowLeft } from 'lucide-react';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-amber fill-amber' : 'text-pitch-600 fill-pitch-600'}`}
        />
      ))}
    </div>
  );
}

export default function TurfDetailPage() {
  const params = useParams();
  const router = useRouter();
  const turfId = params.id as string;

  const turf = MOCK_TURFS.find((t) => t.id === turfId);
  const reviews = MOCK_REVIEWS.filter((r) => r.turf_id === turfId);

  const { selectedDate, setSelectedDate, selectedSlots, toggleSlot, setSelectedTurf, totalAmount } = useBookingStore();

  const dates = getDateRange(7);

  const daySlots = useMemo(() => {
    const allSlots = MOCK_SLOTS[turfId] || [];
    return allSlots.filter((s) => s.date === selectedDate);
  }, [turfId, selectedDate]);

  // Set turf in store when page loads
  useState(() => {
    if (turf) setSelectedTurf(turf);
  });

  if (!turf) {
    return (
      <div className="min-h-screen bg-pitch-900 flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <MapPin className="w-16 h-16 text-chalk-dim/50" />
          </div>
          <h2 className="text-2xl font-display text-chalk">TURF NOT FOUND</h2>
          <Link href="/turfs" className="mt-4 flex items-center justify-center gap-2 text-sm text-turf hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Turfs
          </Link>
        </div>
      </div>
    );
  }

  const handleSlotClick = (slot: Slot) => {
    if (slot.status !== 'available') return;
    toggleSlot(slot);
  };

  const handleProceedToBook = () => {
    if (selectedSlots.length === 0) return;
    router.push('/booking/confirm');
  };

  const amount = totalAmount();

  return (
    <div className="min-h-screen bg-pitch-900">
      {/* Hero header */}
      <div className="relative h-64 bg-gradient-to-br from-pitch-700 via-pitch-800 to-pitch-900 grain-overlay">
        <div className="absolute inset-0 flex items-center justify-center opacity-10 [&>svg]:w-64 [&>svg]:h-64 [&>img]:w-64 [&>img]:h-64 [&>img]:object-contain">
          {SPORT_ICONS[turf.sports[0]] || <MapPin className="w-64 h-64" />}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-pitch-900 to-transparent h-32" />
        <div className="absolute bottom-6 left-0 right-0 max-w-6xl mx-auto px-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex gap-1.5 mb-2">
                {turf.sports.map((sport) => (
                  <span key={sport} className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold bg-turf/20 text-turf rounded-md capitalize">
                    <div className="w-3.5 h-3.5 flex-shrink-0">{SPORT_ICONS[sport]}</div>
                    {sport}
                  </span>
                ))}
                {turf.size && (
                  <span className="px-2 py-0.5 text-xs font-mono font-bold bg-amber/20 text-amber rounded-md">
                    {turf.size}
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-display tracking-wider text-chalk">
                {turf.name}
              </h1>
              <p className="text-sm text-chalk-muted mt-1 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {turf.address}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end">
                  <Star className="w-5 h-5 text-amber fill-amber" />
                  <span className="text-xl font-mono font-bold text-chalk">{turf.avg_rating}</span>
                </div>
                <span className="text-xs text-chalk-dim">{turf.total_reviews} reviews</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Info + Slots */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {turf.description && (
              <section>
                <h2 className="text-xl font-display tracking-wide text-chalk mb-3">ABOUT</h2>
                <p className="text-sm text-chalk-muted leading-relaxed">{turf.description}</p>
              </section>
            )}

            {/* Amenities */}
            <section>
              <h2 className="text-xl font-display tracking-wide text-chalk mb-3">AMENITIES</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {turf.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 px-4 py-3 glass-panel rounded-xl"
                  >
                    <span className="text-turf/80">{AMENITY_ICONS[amenity]}</span>
                    <span className="text-sm text-chalk-muted capitalize">{amenity}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* ═══════ SLOT PICKER ═══════ */}
            <section>
              <h2 className="text-xl font-display tracking-wide text-chalk mb-4">
                PICK YOUR <span className="text-turf">SLOTS</span>
              </h2>

              {/* Date selector */}
              <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                {dates.map((date) => {
                  const isSelected = date === selectedDate;
                  const d = new Date(date);
                  const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' });
                  const dayNum = d.getDate();
                  const month = d.toLocaleDateString('en-IN', { month: 'short' });

                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-turf/10 border-turf text-turf'
                          : 'bg-pitch-800 border-pitch-600/30 text-chalk-muted hover:border-pitch-500'
                      }`}
                    >
                      <span className="text-xs font-medium uppercase">{dayName}</span>
                      <span className="text-xl font-mono font-bold mt-0.5">{dayNum}</span>
                      <span className="text-xs">{month}</span>
                    </button>
                  );
                })}
              </div>

              {/* Slot grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {daySlots.map((slot) => {
                  const isSelected = selectedSlots.some((s) => s.id === slot.id);
                  let slotClass = 'slot-available';
                  if (slot.status === 'booked') slotClass = 'slot-booked';
                  else if (slot.status === 'blocked') slotClass = 'slot-blocked';
                  else if (isSelected) slotClass = 'slot-selected';

                  return (
                    <motion.button
                      key={slot.id}
                      onClick={() => handleSlotClick(slot)}
                      disabled={slot.status !== 'available'}
                      className={`${slotClass} px-2 py-3 rounded-lg text-center font-mono text-sm transition-all`}
                      whileTap={slot.status === 'available' ? { scale: 0.95 } : undefined}
                    >
                      <div className="font-bold">{formatTime(slot.start_time)}</div>
                      <div className="text-xs opacity-70">{formatTime(slot.end_time)}</div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-4">
                {[
                  { label: 'Available', className: 'bg-turf-muted border-turf' },
                  { label: 'Selected', className: 'bg-amber border-amber-light' },
                  { label: 'Booked', className: 'bg-pitch-600 border-pitch-500 opacity-50' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border ${item.className}`} />
                    <span className="text-xs text-chalk-dim">{item.label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews */}
            <section>
              <h2 className="text-xl font-display tracking-wide text-chalk mb-4">
                REVIEWS <span className="text-chalk-dim font-body text-sm font-normal">({turf.total_reviews})</span>
              </h2>

              {/* Rating breakdown bar */}
              <div className="glass-panel p-6 mb-6 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-4xl font-mono font-bold text-chalk">{turf.avg_rating}</div>
                    <StarRating rating={Math.round(turf.avg_rating)} />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const percent = star === 5 ? 65 : star === 4 ? 25 : star === 3 ? 7 : star === 2 ? 2 : 1;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-xs text-chalk-dim w-3 font-mono">{star}</span>
                          <div className="flex-1 h-2 bg-pitch-600 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber rounded-full transition-all"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="text-xs text-chalk-dim w-8 text-right">{percent}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Review cards */}
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="glass-panel p-5 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-turf/20 border border-turf/30 flex items-center justify-center text-turf text-sm font-semibold">
                          {review.user?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-chalk">{review.user?.full_name}</div>
                          <div className="text-xs text-chalk-dim">
                            {new Date(review.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                    {review.text && (
                      <p className="text-sm text-chalk-muted leading-relaxed">{review.text}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right: Sticky booking summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Price card */}
              <div className="glass-card p-6 border-t-4 border-t-turf relative overflow-hidden glow-accent">
                <div className="absolute top-0 right-0 w-32 h-32 bg-turf/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-mono font-bold text-turf">
                    {formatCurrency(turf.price_per_hour)}
                  </span>
                  <span className="text-sm text-chalk-dim">/ hour</span>
                </div>

                {selectedSlots.length > 0 ? (
                  <>
                    <div className="space-y-2 mb-4">
                      <div className="text-xs text-chalk-dim uppercase tracking-wider font-semibold">
                        Selected Slots ({selectedSlots.length})
                      </div>
                      {selectedSlots.map((slot) => (
                        <div key={slot.id} className="flex items-center justify-between text-sm">
                          <span className="text-chalk-muted">
                            {formatDateShort(slot.date)} · {formatTime(slot.start_time)}
                          </span>
                          <button
                            onClick={() => toggleSlot(slot)}
                            className="text-danger text-xs hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-pitch-600/30 pt-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-chalk-muted">Total</span>
                        <span className="text-xl font-mono font-bold text-chalk">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleProceedToBook}
                      className="w-full py-3 bg-gradient-cta text-pitch-900 font-semibold rounded-xl hover:shadow-lg hover:shadow-amber/25 transition-all text-sm"
                    >
                      Proceed to Book →
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-chalk-dim">
                    Select time slots from the grid to start booking
                  </p>
                )}
              </div>

              {/* Quick info */}
              <div className="glass-panel rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-chalk uppercase tracking-wider">Quick Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-chalk-dim">City</span>
                    <span className="text-chalk">{turf.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-chalk-dim">Sports</span>
                    <span className="text-chalk capitalize">{turf.sports.join(', ')}</span>
                  </div>
                  {turf.size && (
                    <div className="flex justify-between">
                      <span className="text-chalk-dim">Size</span>
                      <span className="text-chalk font-mono">{turf.size}</span>
                    </div>
                  )}
                </div>

                {/* Directions link (Google Maps) */}
                {turf.latitude && turf.longitude && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${turf.latitude},${turf.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex justify-center items-center gap-2 w-full py-2.5 text-sm font-medium bg-pitch-700 border border-pitch-600 rounded-xl text-turf hover:border-turf/50 transition-colors mt-3"
                  >
                    <Navigation className="w-4 h-4" /> Get Directions
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
