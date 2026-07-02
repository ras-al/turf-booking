'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { fetchTurfs } from '@/lib/supabase/queries';
import { formatCurrency, SPORT_ICONS, ALL_SPORTS, getRoadDistance, formatDistance } from '@/lib/utils';
import { useFilterStore } from '@/stores/filter-store';
import type { Turf } from '@/types';
import { MapPin, Star, Search, SlidersHorizontal, X } from 'lucide-react';
import FilterSheet from '@/components/turf/FilterSheet';

function TurfCard({ turf }: { turf: Turf }) {
  return (
    <Link href={`/turfs/${turf.id}`} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
      <div className="w-[72px] h-[72px] rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
        {turf.photos && turf.photos.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={turf.photos[0]} alt={turf.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-8 h-8 opacity-30">{SPORT_ICONS[turf.sports[0]] || <MapPin className="w-8 h-8 text-gray-300" />}</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-gray-900 truncate">{turf.name}</h3>
        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3 text-green-600 shrink-0" />
          <span className="truncate">{turf.address}</span>
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber fill-amber" />
            <span className="text-xs font-bold text-gray-700">{turf.avg_rating}</span>
            <span className="text-xs text-gray-400">({turf.total_reviews})</span>
          </div>
          {turf.distance !== undefined && (
            <span className="text-xs text-gray-400 flex items-center gap-0.5">
              <MapPin className="w-2.5 h-2.5" /> {formatDistance(turf.distance)}
            </span>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0 pt-1">
        <span className="text-sm font-bold text-green-600">{formatCurrency(turf.price_per_hour)}</span>
        <span className="text-[10px] text-gray-400 block">/hr</span>
      </div>
    </Link>
  );
}

function DesktopTurfCard({ turf }: { turf: Turf }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
      <Link href={`/turfs/${turf.id}`} className="block pf-card overflow-hidden group">
        <div className="h-40 bg-gray-100 relative overflow-hidden">
          {turf.photos && turf.photos.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={turf.photos[0]} alt={turf.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              {SPORT_ICONS[turf.sports[0]] ? (
                <div className="w-16 h-16 [&>svg]:w-full [&>svg]:h-full opacity-20 text-gray-400">{SPORT_ICONS[turf.sports[0]]}</div>
              ) : (<MapPin className="w-16 h-16 opacity-20 text-gray-400" />)}
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-1.5 z-10">
            {turf.sports.slice(0, 2).map((sport) => (
              <span key={sport} className="px-2 py-1 text-xs font-semibold bg-white/90 text-green-700 rounded-md backdrop-blur-md capitalize flex items-center gap-1 shadow-sm">
                <div className="w-3 h-3 [&>svg]:w-full [&>svg]:h-full">{SPORT_ICONS[sport]}</div>{sport}
              </span>
            ))}
          </div>
          {turf.size && <span className="absolute top-3 right-3 px-2 py-1 text-xs font-mono font-bold bg-amber text-white rounded-md z-10 shadow-sm">{turf.size}</span>}
          {turf.distance !== undefined && (
            <span className="absolute bottom-3 right-3 px-2 py-1 flex items-center gap-1 text-xs font-mono bg-white/90 text-gray-700 rounded-md backdrop-blur-md shadow-sm z-10">
              <MapPin className="w-3 h-3 text-green-600" /> {formatDistance(turf.distance)}
            </span>
          )}
        </div>
        <div className="p-5">
          <h3 className="text-base font-bold text-gray-900 group-hover:text-green-600 transition-colors">{turf.name}</h3>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5 truncate"><MapPin className="w-3.5 h-3.5 shrink-0 text-green-600" />{turf.address}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-bold text-green-600">{formatCurrency(turf.price_per_hour)}<span className="text-xs text-gray-400 font-normal">/hr</span></span>
            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
              <Star className="w-3.5 h-3.5 text-amber fill-amber" />
              <span className="text-sm font-bold text-gray-800">{turf.avg_rating}</span>
              <span className="text-xs text-gray-400">({turf.total_reviews})</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function TurfsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
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
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTurfs().then((data) => { setAllTurfs(data); setTurfsWithDistance(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const sport = searchParams.get('sport');
    const search = searchParams.get('search');
    if (sport) setFilter('sport', sport);
    if (search) setFilter('search', search);
  }, [searchParams, setFilter]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => { /* Location denied */ }
      );
    }
  }, []);

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
    <div className="min-h-screen bg-white">
      {/* FilterSheet bottom sheet */}
      <FilterSheet open={isSheetOpen} onClose={() => setIsSheetOpen(false)} />

      {/* ═══════════════════════════════════════
          MOBILE VIEW
          ═══════════════════════════════════════ */}
      <div className="md:hidden">
        {/* Search + Filter Header */}
        <div className="px-4 pt-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 min-h-[44px]">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input type="text" placeholder="Search turfs, cities..." value={filters.search || ''} onChange={(e) => setFilter('search', e.target.value || undefined)} className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none" />
              {filters.search && <button onClick={() => setFilter('search', undefined)} className="text-gray-400"><X className="w-4 h-4" /></button>}
            </div>
            <button onClick={() => setIsSheetOpen(true)} className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-all relative ${activeFilterCount > 0 ? 'bg-green-50 border-green-300 text-green-600' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
              <SlidersHorizontal className="w-4 h-4" />
              {activeFilterCount > 0 && (<span className="absolute -top-1 -right-1 w-4 h-4 bg-green-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{activeFilterCount}</span>)}
            </button>
          </div>
          <p className="text-xs text-gray-400">{loading ? 'Loading...' : `${filteredTurfs.length} turf${filteredTurfs.length !== 1 ? 's' : ''} found`}</p>
        </div>
        <AnimatePresence>{/* desktop filter panel handled below */}</AnimatePresence>

        <div className="px-4 py-2 pb-[84px]">
          {loading ? (
            <div className="space-y-3 py-4">{[1,2,3,4].map(i => (<div key={i} className="flex gap-3 animate-pulse"><div className="w-[72px] h-[72px] rounded-xl bg-gray-100" /><div className="flex-1 space-y-2 py-1"><div className="h-4 bg-gray-100 rounded w-3/4" /><div className="h-3 bg-gray-50 rounded w-1/2" /><div className="h-3 bg-gray-50 rounded w-1/4" /></div></div>))}</div>
          ) : filteredTurfs.length === 0 ? (
            <div className="text-center py-16"><Search className="w-12 h-12 text-gray-200 mx-auto mb-4" /><h3 className="text-base font-bold text-gray-900">No turfs found</h3><p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p><button onClick={resetFilters} className="mt-3 px-5 py-2 text-sm bg-green-600 text-white rounded-lg font-medium">Reset Filters</button></div>
          ) : (
            <div>{filteredTurfs.map((turf) => <TurfCard key={turf.id} turf={turf} />)}</div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          DESKTOP VIEW — Unified Light Theme
          ═══════════════════════════════════════ */}
      <div className="hidden md:block min-h-screen">
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">Find Your Turf</h1>
                <p className="text-sm text-gray-500 mt-1">{loading ? 'Loading...' : `${filteredTurfs.length} turf${filteredTurfs.length !== 1 ? 's' : ''} available`}{userLocation && ' · Distance from your location'}</p>
              </div>
              <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all flex items-center gap-1.5 ${isFilterOpen ? 'bg-green-50 border-green-300 text-green-600' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                <SlidersHorizontal className="w-4 h-4" /> Filters
                {activeFilterCount > 0 && <span className="w-5 h-5 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">{activeFilterCount}</span>}
              </button>
            </div>
            <div className="mt-4 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search turfs, cities, sports..." value={filters.search || ''} onChange={(e) => setFilter('search', e.target.value || undefined)} className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 text-gray-900 text-sm rounded-lg placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isFilterOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-white border-b border-gray-200 overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 py-5">
                <div className="grid grid-cols-5 gap-4">
                  <div><label className="text-xs text-gray-500 font-medium mb-1.5 block">Sport</label><select value={filters.sport || ''} onChange={(e) => setFilter('sport', e.target.value || undefined)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg capitalize"><option value="">All Sports</option>{ALL_SPORTS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}</select></div>
                  <div><label className="text-xs text-gray-500 font-medium mb-1.5 block">Size</label><select value={filters.size || ''} onChange={(e) => setFilter('size', e.target.value || undefined)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg"><option value="">Any Size</option><option value="5v5">5v5</option><option value="7v7">7v7</option><option value="11v11">11v11</option></select></div>
                  <div><label className="text-xs text-gray-500 font-medium mb-1.5 block">Min Rating</label><select value={filters.minRating || ''} onChange={(e) => setFilter('minRating', e.target.value ? Number(e.target.value) : undefined)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg"><option value="">Any</option><option value="3">3+ Stars</option><option value="4">4+ Stars</option><option value="4.5">4.5+ Stars</option></select></div>
                  <div><label className="text-xs text-gray-500 font-medium mb-1.5 block">Sort By</label><select value={filters.sortBy || 'newest'} onChange={(e) => setFilter('sortBy', e.target.value as typeof filters.sortBy)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg"><option value="newest">Newest</option><option value="price_asc">Price: Low to High</option><option value="price_desc">Price: High to Low</option><option value="rating">Highest Rated</option><option value="distance">Nearest First</option></select></div>
                  <div className="flex items-end"><button onClick={resetFilters} className="w-full px-3 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors font-medium">Clear All</button></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {loading ? (
            <div className="grid grid-cols-3 gap-6">{[1,2,3,4,5,6].map(i => <div key={i} className="h-72 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
          ) : filteredTurfs.length === 0 ? (
            <div className="text-center py-20"><Search className="w-16 h-16 text-gray-200 mx-auto mb-6" /><h3 className="text-xl font-bold text-gray-900">No turfs found</h3><p className="text-sm text-gray-500 mt-2">Try adjusting your filters or search query</p><button onClick={resetFilters} className="mt-4 px-5 py-2 text-sm bg-green-600 text-white rounded-lg font-bold">Reset Filters</button></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{filteredTurfs.map((turf) => <DesktopTurfCard key={turf.id} turf={turf} />)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
