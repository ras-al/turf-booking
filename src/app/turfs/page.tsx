'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { fetchTurfs } from '@/lib/supabase/queries';
import { formatCurrency, SPORT_ICONS, ALL_SPORTS, getRoadDistance, formatDistance } from '@/lib/utils';
import { useFilterStore } from '@/stores/filter-store';
import type { Turf } from '@/types';
import { MapPin, Star, Search } from 'lucide-react';

function TurfListCard({ turf }: { turf: Turf }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
      <Link href={`/turfs/${turf.id}`} className="block glass-card overflow-hidden hover:border-turf/30 transition-all group hover:glow-accent">
        <div className="h-40 bg-gradient-to-br from-pitch-700/80 to-pitch-800/80 relative overflow-hidden grain-overlay">
          <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-all duration-500">
            {SPORT_ICONS[turf.sports[0]] ? (
              <div className="w-16 h-16 [&>svg]:w-full [&>svg]:h-full opacity-30 text-pitch-500 group-hover:text-turf/20">{SPORT_ICONS[turf.sports[0]]}</div>
            ) : (
              <MapPin className="w-16 h-16 opacity-30 text-pitch-500 group-hover:text-turf/20" />
            )}
          </div>
          <div className="absolute top-3 left-3 flex gap-1.5 z-10">
            {turf.sports.slice(0, 2).map((sport) => (
              <span key={sport} className="px-2 py-1 text-xs font-semibold bg-pitch-900/60 border border-turf/20 text-turf rounded-md backdrop-blur-md capitalize flex items-center gap-1">
                <div className="w-3 h-3 [&>svg]:w-full [&>svg]:h-full">{SPORT_ICONS[sport]}</div>
                {sport}
              </span>
            ))}
          </div>
          {turf.size && <span className="absolute top-3 right-3 px-2 py-1 text-xs font-mono font-bold bg-amber/90 text-pitch-900 rounded-md z-10 shadow-lg">{turf.size}</span>}
          {turf.distance !== undefined && (
            <span className="absolute bottom-3 right-3 px-2 py-1 flex items-center gap-1 text-xs font-mono bg-pitch-900/60 text-chalk-muted rounded-md backdrop-blur-md border border-chalk/10 z-10">
              <MapPin className="w-3 h-3 text-turf" /> {formatDistance(turf.distance)}
            </span>
          )}
        </div>
        <div className="p-5">
          <h3 className="text-lg font-display tracking-wide text-chalk group-hover:text-turf transition-colors">{turf.name}</h3>
          <p className="text-sm text-chalk-dim mt-1 flex items-center gap-1.5 truncate"><MapPin className="w-3.5 h-3.5 shrink-0" />{turf.address}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-mono font-bold text-turf">{formatCurrency(turf.price_per_hour)}<span className="text-xs text-chalk-dim font-body">/hr</span></span>
            <div className="flex items-center gap-1.5 bg-pitch-900/50 px-2 py-1 rounded-md border border-pitch-700">
              <Star className="w-3.5 h-3.5 text-amber fill-amber" />
              <span className="text-sm font-mono font-bold text-chalk">{turf.avg_rating}</span>
              <span className="text-xs text-chalk-dim">({turf.total_reviews})</span>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {turf.amenities.slice(0, 4).map((a) => <span key={a} className="px-2 py-0.5 text-xs bg-pitch-700 text-chalk-dim rounded-md capitalize">{a}</span>)}
            {turf.amenities.length > 4 && <span className="px-2 py-0.5 text-xs bg-pitch-700 text-chalk-dim rounded-md">+{turf.amenities.length - 4}</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function TurfsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-pitch-900" />}>
      <TurfsContent />
    </Suspense>
  );
}

function TurfsContent() {
  const searchParams = useSearchParams();
  const { filters, setFilter, resetFilters } = useFilterStore();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [allTurfs, setAllTurfs] = useState<Turf[]>([]);
  const [turfsWithDistance, setTurfsWithDistance] = useState<Turf[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch turfs from Supabase
  useEffect(() => {
    fetchTurfs().then((data) => { setAllTurfs(data); setTurfsWithDistance(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  // Pick up URL search params
  useEffect(() => {
    const sport = searchParams.get('sport');
    const search = searchParams.get('search');
    if (sport) setFilter('sport', sport);
    if (search) setFilter('search', search);
  }, [searchParams, setFilter]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => { /* Location denied */ }
      );
    }
  }, []);

  // Calculate road distances
  useEffect(() => {
    if (!userLocation) { setTurfsWithDistance(allTurfs); return; }
    async function calcDistances() {
      const results = await Promise.all(
        allTurfs.map(async (turf) => {
          if (!turf.latitude || !turf.longitude) return turf;
          const dist = await getRoadDistance(userLocation!, [turf.latitude, turf.longitude]);
          return { ...turf, distance: dist?.distance || undefined };
        })
      );
      setTurfsWithDistance(results);
    }
    calcDistances();
  }, [userLocation, allTurfs]);

  // Apply filters
  const filteredTurfs = useMemo(() => {
    let result = [...turfsWithDistance];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((t) => t.name.toLowerCase().includes(q) || t.city.toLowerCase().includes(q) || t.sports.some((s) => s.includes(q)));
    }
    if (filters.sport) result = result.filter((t) => t.sports.includes(filters.sport!));
    if (filters.minPrice !== undefined) result = result.filter((t) => t.price_per_hour >= filters.minPrice! * 100);
    if (filters.maxPrice !== undefined) result = result.filter((t) => t.price_per_hour <= filters.maxPrice! * 100);
    if (filters.size) result = result.filter((t) => t.size === filters.size);
    if (filters.minRating) result = result.filter((t) => t.avg_rating >= filters.minRating!);
    switch (filters.sortBy) {
      case 'price_asc': result.sort((a, b) => a.price_per_hour - b.price_per_hour); break;
      case 'price_desc': result.sort((a, b) => b.price_per_hour - a.price_per_hour); break;
      case 'rating': result.sort((a, b) => b.avg_rating - a.avg_rating); break;
      case 'distance': result.sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999)); break;
      default: break;
    }
    return result;
  }, [turfsWithDistance, filters]);

  const activeFilterCount = [filters.sport, filters.minPrice, filters.maxPrice, filters.size, filters.minRating].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-pitch-900">
      <div className="bg-pitch-950 border-b border-pitch-600/30">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display tracking-wider text-chalk">FIND YOUR <span className="text-turf">TURF</span></h1>
              <p className="text-sm text-chalk-dim mt-1">{loading ? 'Loading...' : `${filteredTurfs.length} turf${filteredTurfs.length !== 1 ? 's' : ''} available`}{userLocation && ' · Distance from your location'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`px-4 py-2 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 ${isFilterOpen ? 'bg-turf/10 border-turf/30 text-turf' : 'bg-pitch-800 border-pitch-600/50 text-chalk-muted hover:text-chalk'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                Filters
                {activeFilterCount > 0 && <span className="w-5 h-5 rounded-full bg-turf text-pitch-900 text-xs font-bold flex items-center justify-center">{activeFilterCount}</span>}
              </button>
            </div>
          </div>
          <div className="mt-4">
            <div className="relative max-w-md">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-chalk-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Search turfs, cities, sports..." value={filters.search || ''} onChange={(e) => setFilter('search', e.target.value || undefined)} className="w-full pl-9 pr-4 py-2.5 bg-pitch-800 border border-pitch-600/50 text-chalk text-sm rounded-lg placeholder-chalk-dim focus:outline-none focus:border-turf/50" />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isFilterOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-pitch-800 border-b border-pitch-600/30 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 py-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                <div>
                  <label className="text-xs text-chalk-dim font-medium mb-1.5 block">Sport</label>
                  <select value={filters.sport || ''} onChange={(e) => setFilter('sport', e.target.value || undefined)} className="w-full px-3 py-2 bg-pitch-700 border border-pitch-600 text-chalk text-sm rounded-lg focus:outline-none focus:border-turf/50 capitalize">
                    <option value="">All Sports</option>
                    {ALL_SPORTS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-chalk-dim font-medium mb-1.5 block">Size</label>
                  <select value={filters.size || ''} onChange={(e) => setFilter('size', e.target.value || undefined)} className="w-full px-3 py-2 bg-pitch-700 border border-pitch-600 text-chalk text-sm rounded-lg focus:outline-none focus:border-turf/50">
                    <option value="">Any Size</option>
                    <option value="5v5">5v5</option>
                    <option value="7v7">7v7</option>
                    <option value="11v11">11v11</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-chalk-dim font-medium mb-1.5 block">Min Rating</label>
                  <select value={filters.minRating || ''} onChange={(e) => setFilter('minRating', e.target.value ? Number(e.target.value) : undefined)} className="w-full px-3 py-2 bg-pitch-700 border border-pitch-600 text-chalk text-sm rounded-lg focus:outline-none focus:border-turf/50">
                    <option value="">Any</option>
                    <option value="3">3+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="4.5">4.5+ Stars</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-chalk-dim font-medium mb-1.5 block">Sort By</label>
                  <select value={filters.sortBy || 'newest'} onChange={(e) => setFilter('sortBy', e.target.value as typeof filters.sortBy)} className="w-full px-3 py-2 bg-pitch-700 border border-pitch-600 text-chalk text-sm rounded-lg focus:outline-none focus:border-turf/50">
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price: Low → High</option>
                    <option value="price_desc">Price: High → Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="distance">Nearest First</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button onClick={resetFilters} className="w-full px-3 py-2 text-sm text-danger border border-danger/30 rounded-lg hover:bg-danger/10 transition-colors">Clear All</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-72 bg-pitch-800/50 rounded-2xl animate-pulse" />)}
          </div>
        ) : filteredTurfs.length === 0 ? (
          <div className="text-center py-20">
            <div className="flex justify-center mb-6"><Search className="w-16 h-16 text-chalk-dim/50" /></div>
            <h3 className="text-xl font-display text-chalk">NO TURFS FOUND</h3>
            <p className="text-sm text-chalk-dim mt-2">Try adjusting your filters or search query</p>
            <button onClick={resetFilters} className="mt-4 px-5 py-2 text-sm bg-turf text-pitch-900 rounded-lg font-medium hover:bg-turf-light transition-colors">Reset Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTurfs.map((turf) => <TurfListCard key={turf.id} turf={turf} />)}
          </div>
        )}
      </div>
    </div>
  );
}
