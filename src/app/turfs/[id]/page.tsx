'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { fetchTurfById, fetchSlots, fetchReviews, isFavorite, toggleFavorite } from '@/lib/supabase/queries';
import { formatCurrency, formatTime, getDateRange, SPORT_ICONS, AMENITY_ICONS } from '@/lib/utils';
import { useBookingStore } from '@/stores/booking-store';
import { useAuthStore } from '@/stores/auth-store';
import type { Turf, Slot, Review } from '@/types';
import { MapPin, Navigation, Star, ArrowLeft, Loader2, Heart, Share2, ChevronLeft, ChevronRight } from 'lucide-react';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= rating ? 'text-amber fill-amber' : 'text-gray-200'}`} />)}
    </div>
  );
}

export default function TurfDetailPage() {
  const params = useParams();
  const router = useRouter();
  const turfId = params.id as string;
  const { user } = useAuthStore();

  const [turf, setTurf] = useState<Turf | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [daySlots, setDaySlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'book' | 'about'>('book');

  const { selectedDate, setSelectedDate, selectedSlots, toggleSlot, setSelectedTurf, totalAmount } = useBookingStore();
  const dates = getDateRange(7);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [turfData, reviewsData] = await Promise.all([fetchTurfById(turfId), fetchReviews(turfId)]);
      setTurf(turfData);
      setReviews(reviewsData);
      if (turfData) setSelectedTurf(turfData);
      if (user && turfData) {
        const fav = await isFavorite(user.id, turfData.id);
        setFavorited(fav);
      }
      setLoading(false);
    }
    load();
  }, [turfId, setSelectedTurf, user]);

  useEffect(() => {
    async function loadSlots() {
      setSlotsLoading(true);
      const slots = await fetchSlots(turfId, selectedDate);
      setDaySlots(slots);
      setSlotsLoading(false);
    }
    loadSlots();
  }, [turfId, selectedDate]);

  const handleFavorite = useCallback(async () => {
    if (!user) { router.push('/auth'); return; }
    if (!turf || favLoading) return;
    setFavLoading(true);
    const newState = await toggleFavorite(user.id, turf.id);
    setFavorited(newState);
    setFavLoading(false);
  }, [user, turf, favLoading, router]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: turf?.name, text: `Check out ${turf?.name} on PlayField!`, url }); }
      catch { /* dismissed */ }
    } else {
      await navigator.clipboard.writeText(url);
    }
  }, [turf]);

  const handleSlotClick = (slot: Slot) => { if (slot.status === 'available') toggleSlot(slot); };
  const handleProceedToBook = () => { if (selectedSlots.length > 0) router.push('/booking/confirm'); };
  const amount = totalAmount();

  if (loading) return <div className="min-h-dvh flex items-center justify-center"><Loader2 className="w-8 h-8 text-green-600 animate-spin" /></div>;
  if (!turf) return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="text-center"><MapPin className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Turf Not Found</h2>
        <Link href="/turfs" className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600"><ArrowLeft className="w-4 h-4" /> Back to Turfs</Link>
      </div>
    </div>
  );

  const photos = turf.photos && turf.photos.length > 0 ? turf.photos : [];

  return (
    <div className="min-h-dvh">
      {/* ── MOBILE ── */}
      <div className="md:hidden bg-white -mt-14">
        {/* Photo carousel */}
        <div className="relative h-64 bg-gray-900">
          {photos.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photos[photoIdx]} alt={turf.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-900 to-green-700 flex items-center justify-center">
              <div className="w-20 h-20 opacity-20">{SPORT_ICONS[turf.sports[0]] || <MapPin className="w-20 h-20 text-white" />}</div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

          {/* Top nav */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-14 pb-4">
            <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
              <ChevronLeft className="w-5 h-5 text-gray-800" />
            </button>
            <div className="flex gap-2">
              <button onClick={handleFavorite} disabled={favLoading} className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
                <Heart className={`w-5 h-5 ${favorited ? 'text-red-500 fill-red-500' : 'text-gray-700'}`} />
              </button>
              <button onClick={handleShare} className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
                <Share2 className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Photo navigation */}
          {photos.length > 1 && (
            <>
              <button onClick={() => setPhotoIdx(i => Math.max(0, i-1))} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center" style={{display: photoIdx===0?'none':'flex'}}>
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <button onClick={() => setPhotoIdx(i => Math.min(photos.length-1, i+1))} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center" style={{display: photoIdx===photos.length-1?'none':'flex'}}>
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
              <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/60 text-white text-xs rounded-md backdrop-blur-sm">
                {photoIdx+1} / {photos.length}
              </div>
            </>
          )}
        </div>

        {/* Turf Info */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-3">
              <h1 className="text-xl font-bold text-gray-900 leading-tight">{turf.name}</h1>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />{turf.address}
              </p>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 rounded-xl shrink-0">
              <Star className="w-3.5 h-3.5 text-white fill-white" />
              <span className="text-sm font-bold text-white">{turf.avg_rating}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {turf.amenities.slice(0,4).map(a => (
              <span key={a} className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded-full border border-green-200 capitalize">{a}</span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-4">
          {(['book','about'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`flex-1 py-2.5 text-sm font-semibold capitalize relative ${activeTab===t ? 'text-green-600' : 'text-gray-400'}`}>
              {t === 'book' ? 'Book' : 'About'}
              {activeTab===t && <motion.div layoutId="turf-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-green-600 rounded-full" />}
            </button>
          ))}
        </div>

        {activeTab === 'book' ? (
          <div>
            {/* Date Picker */}
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Select Date</h3>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {dates.map(date => {
                  const isSelected = date === selectedDate;
                  const d = new Date(date);
                  return (
                    <button key={date} onClick={() => setSelectedDate(date)}
                      className={`flex-shrink-0 flex flex-col items-center px-3 py-2.5 rounded-xl border transition-all min-w-[56px] min-h-[44px] ${isSelected ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-200 text-gray-600'}`}>
                      <span className="text-[10px] font-medium uppercase">{d.toLocaleDateString('en-IN',{weekday:'short'})}</span>
                      <span className="text-lg font-bold mt-0.5">{d.getDate()}</span>
                      <span className="text-[10px]">{d.toLocaleDateString('en-IN',{month:'short'})}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slots */}
            <div className="px-4 pt-3 pb-3">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Select Time</h3>
              {slotsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-green-600 animate-spin" /></div>
              ) : daySlots.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-gray-400 text-sm">No slots available for this date.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {daySlots.map(slot => {
                    const isSelected = selectedSlots.some(s => s.id === slot.id);
                    const isBooked = slot.status === 'booked' || slot.status === 'blocked';
                    return (
                      <button key={slot.id} onClick={() => handleSlotClick(slot)} disabled={isBooked}
                        className={`px-2 py-3 rounded-xl text-center text-xs font-medium transition-all min-h-[56px] ${
                          isBooked ? 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed opacity-50' :
                          isSelected ? 'bg-green-600 text-white border border-green-600 shadow-sm' :
                          'bg-green-50 text-green-700 border border-green-200'}`}>
                        <div className="font-bold">{formatTime(slot.start_time)}</div>
                        <div className="text-[10px] opacity-70 mt-0.5">{formatTime(slot.end_time)}</div>
                        {isBooked && <div className="text-[9px] mt-0.5 text-gray-400">Booked</div>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Price Details */}
            {selectedSlots.length > 0 && (
              <div className="px-4 pt-3 pb-3 border-t border-gray-100 mx-4 mt-1">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Price Details</h3>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>₹{(turf.price_per_hour/100).toFixed(0)} x {selectedSlots.length} Hour{selectedSlots.length>1?'s':''}</span>
                  <span>{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total Amount</span>
                  <span className="text-green-600">{formatCurrency(amount)}</span>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="px-4 pb-28 pt-4">
              <button onClick={handleProceedToBook} disabled={selectedSlots.length===0}
                className={`w-full py-4 rounded-xl text-sm font-bold transition-all min-h-[56px] ${
                  selectedSlots.length>0 ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                {selectedSlots.length>0 ? 'Continue to Book' : 'Select slots to book'}
              </button>
            </div>
          </div>
        ) : (
          <div className="px-4 pt-4 pb-28 space-y-5">
            {turf.description && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">About</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{turf.description}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">Facilities</h3>
              <div className="grid grid-cols-2 gap-2">
                {turf.amenities.map(a => (
                  <div key={a} className="flex items-center gap-2.5 px-3 py-3 bg-green-50 rounded-xl border border-green-100">
                    <span className="text-green-600 shrink-0">{AMENITY_ICONS[a.toLowerCase()] || <MapPin className="w-5 h-5" />}</span>
                    <span className="text-sm text-gray-700 capitalize">{a}</span>
                  </div>
                ))}
              </div>
            </div>
            {photos.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Photos</h3>
                <div className="grid grid-cols-3 gap-2">
                  {photos.slice(0,2).map((p,i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={p} alt="" className="w-full h-24 object-cover rounded-xl" />
                  ))}
                  {photos.length > 2 && (
                    <div className="relative h-24 rounded-xl overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photos[2]} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">+{photos.length-2}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="pt-2">
              <button onClick={handleProceedToBook} disabled={selectedSlots.length===0}
                className={`w-full py-4 rounded-xl text-sm font-bold min-h-[56px] ${
                  selectedSlots.length>0 ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                {selectedSlots.length>0 ? `Book Now (${formatCurrency(amount)})` : 'Select Date & Time first'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden md:block min-h-screen">
        <div className="relative h-72 bg-gray-100 overflow-hidden">
          {photos.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photos[photoIdx]} alt={turf.name} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center opacity-30">
              {SPORT_ICONS[turf.sports[0]] || <MapPin className="w-64 h-64" />}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-0 right-0 max-w-6xl mx-auto px-4">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{turf.name}</h1>
                <p className="text-sm text-white/80 mt-1 flex items-center gap-1"><MapPin className="w-4 h-4" />{turf.address}</p>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                <div className="bg-white/90 backdrop-blur-md rounded-xl px-4 py-2 shadow-sm flex items-center gap-1.5">
                  <Star className="w-5 h-5 text-amber fill-amber" />
                  <span className="text-xl font-bold text-gray-900">{turf.avg_rating}</span>
                  <span className="text-xs text-gray-500">({turf.total_reviews})</span>
                </div>
                <button onClick={handleFavorite} className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                  <Heart className={`w-5 h-5 ${favorited?'text-red-500 fill-red-500':'text-gray-700'}`} />
                </button>
                <button onClick={handleShare} className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                  <Share2 className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {turf.description && (
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">About</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">{turf.description}</p>
                </section>
              )}
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {turf.amenities.map(a => (
                    <div key={a} className="flex items-center gap-2 px-4 py-3 pf-card rounded-xl">
                      <span className="text-green-600">{AMENITY_ICONS[a.toLowerCase()]}</span>
                      <span className="text-sm text-gray-700 capitalize">{a}</span>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Pick Your Slots</h2>
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                  {dates.map(date => { const isSelected = date===selectedDate; const d=new Date(date); return (
                    <button key={date} onClick={() => setSelectedDate(date)}
                      className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-xl border transition-all ${isSelected?'bg-green-50 border-green-600 text-green-700':'bg-white border-gray-200 text-gray-600 hover:border-green-300'}`}>
                      <span className="text-xs font-medium uppercase">{d.toLocaleDateString('en-IN',{weekday:'short'})}</span>
                      <span className="text-xl font-bold mt-0.5">{d.getDate()}</span>
                      <span className="text-xs">{d.toLocaleDateString('en-IN',{month:'short'})}</span>
                    </button>
                  );})}
                </div>
                {slotsLoading ? <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-green-600 animate-spin" /></div>
                : daySlots.length===0 ? <div className="text-center py-10 pf-card rounded-xl"><p className="text-gray-400 text-sm">No slots available for this date.</p></div>
                : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {daySlots.map(slot => { const isSel=selectedSlots.some(s=>s.id===slot.id); let cls='slot-available'; if(slot.status==='booked') cls='slot-booked'; else if(slot.status==='blocked') cls='slot-blocked'; else if(isSel) cls='slot-selected'; return (
                      <button key={slot.id} onClick={() => handleSlotClick(slot)} disabled={slot.status!=='available'}
                        className={`${cls} px-2 py-3 rounded-lg text-center font-mono text-sm transition-all`}>
                        <div className="font-bold">{formatTime(slot.start_time)}</div>
                        <div className="text-xs opacity-70">{formatTime(slot.end_time)}</div>
                      </button>
                    );})}
                  </div>
                )}
              </section>
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews <span className="text-gray-400 text-sm font-normal">({turf.total_reviews})</span></h2>
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r.id} className="pf-card p-5 rounded-2xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-sm font-bold">{r.user?.full_name?.charAt(0)||'U'}</div>
                          <div><div className="text-sm font-medium text-gray-900">{r.user?.full_name}</div><div className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('en-IN',{month:'short',year:'numeric'})}</div></div>
                        </div>
                        <StarRating rating={r.rating} />
                      </div>
                      {r.text && <p className="text-sm text-gray-600">{r.text}</p>}
                    </div>
                  ))}
                  {reviews.length===0 && <p className="text-sm text-gray-400 text-center py-6">No reviews yet.</p>}
                </div>
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <div className="pf-card p-6 border-t-4 border-t-green-600 rounded-2xl">
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-3xl font-bold text-green-600">{formatCurrency(turf.price_per_hour)}</span>
                    <span className="text-sm text-gray-400">/ hour</span>
                  </div>
                  {selectedSlots.length>0 ? (
                    <>
                      <div className="space-y-2 mb-4">
                        {selectedSlots.map(slot => (
                          <div key={slot.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{formatTime(slot.start_time)}–{formatTime(slot.end_time)}</span>
                            <button onClick={() => toggleSlot(slot)} className="text-red-500 text-xs hover:underline">Remove</button>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-gray-200 pt-3 mb-4 flex justify-between text-sm">
                        <span className="text-gray-500">Total</span>
                        <span className="text-xl font-bold text-gray-900">{formatCurrency(amount)}</span>
                      </div>
                      <button onClick={handleProceedToBook} className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all text-sm shadow-sm">
                        Continue to Book
                      </button>
                    </>
                  ) : <p className="text-sm text-gray-400">Select time slots to start booking</p>}
                </div>
                {turf.latitude && turf.longitude && (
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${turf.latitude},${turf.longitude}`} target="_blank" rel="noopener noreferrer"
                    className="flex justify-center items-center gap-2 w-full py-3 text-sm font-medium bg-gray-50 border border-gray-200 rounded-xl text-green-600 hover:border-green-300 transition-colors">
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
