'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { fetchTurfs } from '@/lib/supabase/queries';
import { formatCurrency, formatDistance, SPORT_ICONS } from '@/lib/utils';
import { requestCoordinates, reverseGeocode, calculateHaversineDistance } from '@/lib/location';
import { useFilterStore } from '@/stores/filter-store';
import type { Turf } from '@/types';
import {
  Search, MapPin, Star, ChevronRight, Navigation, Loader2,
  SlidersHorizontal, CheckCircle, Compass, CalendarCheck, CreditCard, Trophy
} from 'lucide-react';
import FilterSheet from '@/components/turf/FilterSheet';
import IntroScreen from '@/components/ui/IntroScreen';

/* ═══════════════════════════════════════
   Mobile Turf Card (list item)
   ═══════════════════════════════════════ */
function TurfItem({ turf }: { turf: Turf }) {
  return (
    <Link href={`/turfs/${turf.id}`} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0 active:bg-gray-50 transition-colors">
      <div className="w-[72px] h-[72px] rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
        {turf.photos && turf.photos.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={turf.photos[0]} alt={turf.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-10 h-10 opacity-20">{SPORT_ICONS[turf.sports[0]] || <MapPin className="w-10 h-10 text-gray-300" />}</div>
        )}
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <h3 className="text-[15px] font-bold text-gray-900 truncate">{turf.name}</h3>
        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3 text-green-600 shrink-0" />
          <span className="truncate">{turf.address}</span>
        </p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber fill-amber" />
            <span className="text-xs font-bold text-gray-800">{turf.avg_rating}</span>
            <span className="text-xs text-gray-400">({turf.total_reviews})</span>
          </div>
          {turf.distance !== undefined && (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Navigation className="w-2.5 h-2.5 text-emerald-600" />
              {formatDistance(turf.distance)}
            </span>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0 pt-1">
        <span className="text-sm font-bold text-green-600">{formatCurrency(turf.price_per_hour)}</span>
        <span className="text-[11px] text-gray-400 ml-0.5">/hr</span>
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════
   Desktop Turf Card
   ═══════════════════════════════════════ */
function DesktopTurfCard({ turf }: { turf: Turf }) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
      <Link href={`/turfs/${turf.id}`} className="block pf-card overflow-hidden group">
        <div className="h-44 bg-gray-100 relative overflow-hidden">
          {turf.photos && turf.photos.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={turf.photos[0]} alt={turf.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              {SPORT_ICONS[turf.sports[0]] ? (
                <div className="w-16 h-16 [&>svg]:w-full [&>svg]:h-full opacity-20 text-gray-400">{SPORT_ICONS[turf.sports[0]]}</div>
              ) : ( <MapPin className="w-16 h-16 opacity-20 text-gray-400" /> )}
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-1.5 z-10">
            {turf.sports.map((sport) => (
              <span key={sport} className="px-2 py-1 text-[11px] font-semibold bg-white/90 text-green-700 rounded-md backdrop-blur-md capitalize flex items-center gap-1 shadow-sm">
                <div className="w-3 h-3 [&>svg]:w-full [&>svg]:h-full">{SPORT_ICONS[sport]}</div>
                {sport}
              </span>
            ))}
          </div>
          {turf.size && <span className="absolute top-3 right-3 px-2 py-1 text-[11px] font-mono font-bold bg-amber text-white rounded-md z-10 shadow-sm">{turf.size}</span>}
        </div>
        <div className="p-5 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-gray-900 group-hover:text-green-600 transition-colors truncate">{turf.name}</h3>
            {turf.distance !== undefined && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                <Navigation className="w-3 h-3 text-emerald-600" />
                {formatDistance(turf.distance)}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 flex items-center gap-1.5 truncate"><MapPin className="w-3.5 h-3.5 text-green-600 shrink-0" />{turf.address}</p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-lg font-bold text-green-600">{formatCurrency(turf.price_per_hour)}<span className="text-xs text-gray-400 font-normal ml-0.5">/hr</span></span>
            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
              <Star className="w-3.5 h-3.5 text-amber fill-amber" />
              <span className="text-sm font-bold text-gray-800">{turf.avg_rating}</span>
              <span className="text-[11px] text-gray-400">({turf.total_reviews})</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

const FEATURES = [
  { label: 'Discover Turfs', icon: Compass },
  { label: 'Check Availability', icon: CalendarCheck },
  { label: 'Easy Booking', icon: CheckCircle },
  { label: 'Secure Payments', icon: CreditCard },
  { label: 'Play & Enjoy', icon: Trophy },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [allTurfs, setAllTurfs] = useState<Turf[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const { userCoords, userCity, locationStatus, setUserLocation, setLocationStatus } = useFilterStore();

  // Ask location permission and detect nearby city/coords
  const detectLocation = async () => {
    setIsDetectingLocation(true);
    setLocationStatus('requesting');
    try {
      const coords = await requestCoordinates();
      const detectedCity = await reverseGeocode(coords.latitude, coords.longitude);
      setUserLocation([coords.latitude, coords.longitude], detectedCity);
    } catch (err: any) {
      console.warn('Location permission skipped or denied:', err?.message);
      setLocationStatus('denied');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  useEffect(() => {
    // Only show intro splash once per browser session; clicking home never shows it again
    try {
      const hasSeenIntro = sessionStorage.getItem('kikko_intro_seen');
      if (!hasSeenIntro) {
        setShowIntro(true);
      }
    } catch {
      setShowIntro(false);
    }

    // Proactively ask permission to access location on entering app
    if (!userCoords) {
      detectLocation();
    }
  }, []);

  useEffect(() => {
    fetchTurfs()
      .then((data) => {
        setAllTurfs(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Compute turfs with distance and sort by proximity if location available
  const displayTurfs = useMemo(() => {
    if (!allTurfs.length) return [];

    if (userCoords) {
      const withDistance = allTurfs.map((turf) => {
        if (turf.latitude && turf.longitude) {
          const dist = calculateHaversineDistance(userCoords, [turf.latitude, turf.longitude]);
          return { ...turf, distance: dist };
        }
        return turf;
      });
      // Sort nearest first
      return withDistance.sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));
    }

    // Default: Sort by rating
    return [...allTurfs].sort((a, b) => b.avg_rating - a.avg_rating);
  }, [allTurfs, userCoords]);

  const handleIntroComplete = () => {
    try {
      sessionStorage.setItem('kikko_intro_seen', 'true');
    } catch { /* ignore */ }
    setShowIntro(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/turfs?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className="min-h-dvh bg-white">
      {/* Intro Overlay acts as splash/loading screen */}
      <AnimatePresence>
        {showIntro && <IntroScreen onComplete={handleIntroComplete} isLoading={loading} />}
      </AnimatePresence>

      {/* FilterSheet — shared */}
      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} />

      {/* ═══════════════════════════════════════════════
          MOBILE VIEW — KiKKO Turf Booking
          ═══════════════════════════════════════════════ */}
      <div className="md:hidden">
        {/* Search Bar */}
        <div className="px-4 pb-3 pt-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 min-h-[44px]">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search turfs, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 shrink-0 active:bg-gray-100 transition-colors"
              aria-label="Open filters"
            >
              <SlidersHorizontal className="w-[18px] h-[18px]" />
            </button>
          </form>
        </div>

        {/* Hero Banner */}
        <div className="px-4 mb-4">
          <div className="relative rounded-2xl overflow-hidden bg-gray-900 min-h-[170px]">
            {/* Background Image */}
            <div className="absolute inset-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/landing-hero.png" alt="Turf" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/20" />
            </div>

            <div className="relative z-10 p-5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">FIND. BOOK. PLAY.</span>
              <h2 className="text-[22px] font-extrabold text-white leading-tight mt-0.5">Ready to Play?</h2>
              <p className="text-sm text-gray-200 mt-1.5 leading-snug font-medium">Book your favorite turf<br />in seconds</p>
              <Link href="/turfs" className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-sm min-h-[44px]">
                Book Now <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Tournaments Teaser Banner (Mobile) - No Emojis, Responsive */}
        <div className="px-4 mb-5">
          <Link 
            href="/tournaments" 
            className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#032011] via-[#07361d] to-[#042413] text-white shadow-md border border-emerald-600/40 group active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 backdrop-blur-xs text-emerald-400 border border-white/10">
                <Trophy className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black tracking-wide text-white">KiKKO Tournaments</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-400 text-emerald-950">Coming Soon</span>
                </div>
                <span className="text-[11px] text-emerald-200/90 font-medium">Football, Cricket &amp; Badminton Leagues</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </Link>
        </div>

        {/* Turfs Near You / Popular Turfs */}
        <div className="px-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-[17px] font-bold text-gray-900">
                {userCoords ? 'Turfs Near You' : 'Popular Turfs'}
              </h2>
              {userCoords && userCity && (
                <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                  <Navigation className="w-3 h-3 shrink-0" />
                  <span>Sorted by distance from {userCity}</span>
                </p>
              )}
            </div>
            <Link href="/turfs" className="text-sm font-semibold text-green-600">See all →</Link>
          </div>

          {/* Location permission banner when not yet granted */}
          {!userCoords && locationStatus !== 'requesting' && (
            <div className="p-3 bg-emerald-50 border border-emerald-200/90 rounded-2xl mb-3 flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Navigation className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-900">Find Turfs Near You</span>
                  <span className="text-[10px] text-gray-500">Allow location to sort pitches by distance</span>
                </div>
              </div>
              <button
                onClick={detectLocation}
                disabled={isDetectingLocation}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shrink-0 flex items-center gap-1 shadow-xs"
              >
                {isDetectingLocation ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                <span>{isDetectingLocation ? 'Locating...' : 'Enable'}</span>
              </button>
            </div>
          )}

          {displayTurfs.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No turfs available yet.</p>
            </div>
          ) : (
            <div>{displayTurfs.slice(0, 6).map((turf) => <TurfItem key={turf.id} turf={turf} />)}</div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          DESKTOP VIEW — Landing Page
          ═══════════════════════════════════════════════ */}
      <div className="hidden md:block">
        {/* Hero Section */}
        <section className="min-h-[85vh] flex items-center bg-white py-12">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Prominent KiKKO Brand & Features */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              {/* KiKKO Main Brand & Quote */}
              <div className="inline-flex items-center gap-4 p-2.5 pr-6 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-green-500/10 to-transparent border border-emerald-500/25 mb-8 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/logo.png" 
                  alt="KiKKO" 
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-xl"
                />
                <div className="flex flex-col">
                  <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-none font-sans">
                    Ki<span className="text-emerald-600">KKO</span>
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold tracking-[0.2em] text-emerald-700 uppercase mt-1">
                    FIND &bull; BOOK &bull; PLAY
                  </span>
                </div>
              </div>

              <h2 className="text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 leading-[1.1] mb-8 font-sans">
                FIND. BOOK. PLAY.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600">Turf Booking Made Easy</span>
              </h2>

              <div className="space-y-4 mb-10">
                {FEATURES.map((f) => (
                  <div key={f.label} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                      <f.icon className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-base text-gray-700 font-medium">{f.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Link href="/turfs" className="px-8 py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-sm shadow-lg shadow-green-600/20">
                  Find Turfs
                </Link>
                <Link href="/auth?role=owner" className="px-8 py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-green-400 transition-colors text-sm">
                  List Your Turf
                </Link>
              </div>
            </motion.div>

            {/* Right — Hero Image */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="flex justify-center">
              <div className="relative w-full max-w-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/landing-hero.png" alt="Football on green turf" className="w-full h-auto rounded-3xl shadow-2xl" />
                <div className="absolute -bottom-6 -left-6 bg-white pf-card px-4 py-3 flex items-center gap-3 shadow-lg">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"><MapPin className="w-5 h-5 text-green-600" /></div>
                  <div><p className="text-xs text-gray-400">Active Turfs</p><p className="text-lg font-bold text-gray-900">500+</p></div>
                </div>
                <div className="absolute -top-4 -right-4 bg-white pf-card px-4 py-3 flex items-center gap-3 shadow-lg">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center"><Star className="w-5 h-5 text-amber fill-amber" /></div>
                  <div><p className="text-xs text-gray-400">Avg Rating</p><p className="text-lg font-bold text-gray-900">4.6</p></div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Turfs / Turfs Near You */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-black uppercase tracking-widest text-emerald-600">
                    {userCoords ? 'PROXIMITY RADAR' : 'FEATURED GROUNDS'}
                  </span>
                  {userCity && userCoords && (
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                      Near {userCity}
                    </span>
                  )}
                </div>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900">
                  {userCoords ? 'Sports Turfs Near You' : 'Top Rated Turfs'}
                </h2>
                <p className="mt-1 text-gray-500 text-base">
                  {userCoords
                    ? 'Closest pitches and sports venues sorted by distance from your location'
                    : 'The most loved turfs by our sports community'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {!userCoords && (
                  <button
                    onClick={detectLocation}
                    disabled={isDetectingLocation}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-300 hover:border-emerald-500 hover:text-emerald-700 text-gray-700 font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    {isDetectingLocation ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5 text-emerald-600" />}
                    <span>{isDetectingLocation ? 'Detecting...' : 'Use My Location'}</span>
                  </button>
                )}
                <Link href="/turfs" className="hidden sm:flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-semibold group">
                  View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            {displayTurfs.length === 0 ? (
              <div className="text-center py-16 pf-card rounded-2xl">
                <p className="text-gray-500">No turfs listed yet.</p>
                <Link href="/auth?role=owner" className="mt-4 inline-block px-6 py-3 bg-green-600 text-white rounded-xl font-bold text-sm">Register as Owner</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayTurfs.map((turf, i) => (
                  <motion.div key={turf.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                    <DesktopTurfCard turf={turf} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-500 text-lg mb-16">Three simple steps to get on the field</p>
            <div className="grid grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Search', desc: 'Find turfs near you by location, sport, or availability.', Icon: Search, color: 'green' },
                { step: '02', title: 'Pick Your Slot', desc: 'Choose from real-time available slots that fit your schedule.', Icon: CalendarCheck, color: 'amber' },
                { step: '03', title: 'Play!', desc: 'Book instantly and get your booking confirmed right away.', Icon: Trophy, color: 'green' },
              ].map((s, i) => (
                <motion.div key={s.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                  className="pf-card rounded-2xl p-8 text-center relative group hover:shadow-lg transition-shadow"
                >
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-600 text-white font-mono font-bold text-xs rounded-full shadow-sm">STEP {s.step}</div>
                  <div className="mt-4 mb-5 flex justify-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.color === 'green' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                      <s.Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-20 px-4 bg-emerald-600">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-4">Own a Turf?</h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">List your turf on KiKKO and reach thousands of players. Manage slots, track earnings, and grow your business.</p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth?role=owner" className="px-8 py-4 bg-white text-emerald-800 font-bold rounded-xl shadow-lg text-sm hover:bg-gray-50 transition-colors">Register as Owner</Link>
              <Link href="/turfs" className="px-8 py-4 bg-emerald-700 text-white font-bold rounded-xl text-sm hover:bg-emerald-800 transition-colors border border-emerald-500">Explore Turfs</Link>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
