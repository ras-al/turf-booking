'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb, Car, Bath, Coffee, Droplets, Stethoscope } from 'lucide-react';
import { useFilterStore } from '@/stores/filter-store';

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
}

const FACILITIES = [
  { key: 'floodlights', label: 'Flood Lights', icon: Lightbulb },
  { key: 'parking', label: 'Parking', icon: Car },
  { key: 'changing room', label: 'Changing Room', icon: Bath },
  { key: 'cafeteria', label: 'Cafe', icon: Coffee },
  { key: 'drinking water', label: 'Water', icon: Droplets },
  { key: 'first aid', label: 'First Aid', icon: Stethoscope },
];

export default function FilterSheet({ open, onClose }: FilterSheetProps) {
  const { filters, setFilter, resetFilters } = useFilterStore();
  const sheetRef = useRef<HTMLDivElement>(null);

  // Local state for facilities (not in TurfFilters type — applied client-side in listing)
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const minPrice = filters.minPrice ?? 0;
  const maxPrice = filters.maxPrice ?? 3000;

  const toggleFacility = (key: string) => {
    setSelectedFacilities(prev =>
      prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
    );
  };

  // Dismiss on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            key="sheet"
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl"
            style={{ maxHeight: '90dvh', overflowY: 'auto', paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-base font-bold text-gray-900">Filters</h2>
              <div className="flex items-center gap-3">
                <button onClick={() => { resetFilters(); setSelectedFacilities([]); }}
                  className="text-sm font-semibold text-green-600">Reset</button>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="px-5 py-4 space-y-6">
              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  placeholder="Select location"
                  value={filters.city || ''}
                  onChange={(e) => setFilter('city', e.target.value || undefined)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-400"
                />
              </div>

              {/* Price Range */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-700">Price per hour</label>
                  <span className="text-sm font-bold text-green-600">₹{minPrice} – ₹{maxPrice === 3000 ? '3000+' : maxPrice}</span>
                </div>
                <div className="relative h-6 flex items-center mb-3">
                  <div className="absolute left-0 right-0 h-1.5 bg-gray-200 rounded-full" />
                  <div
                    className="absolute h-1.5 bg-green-600 rounded-full pointer-events-none"
                    style={{ left: `${(minPrice / 3000) * 100}%`, right: `${100 - (maxPrice / 3000) * 100}%` }}
                  />
                  <input type="range" min={0} max={3000} step={100} value={minPrice}
                    onChange={(e) => { const v = Number(e.target.value); if (v < maxPrice) setFilter('minPrice', v || undefined); }}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" style={{ zIndex: 2 }} />
                  <input type="range" min={0} max={3000} step={100} value={maxPrice}
                    onChange={(e) => { const v = Number(e.target.value); if (v > minPrice) setFilter('maxPrice', v < 3000 ? v : undefined); }}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" style={{ zIndex: 3 }} />
                  <div className="absolute w-5 h-5 bg-white border-2 border-green-600 rounded-full shadow-sm pointer-events-none"
                    style={{ left: `calc(${(minPrice / 3000) * 100}% - 10px)`, zIndex: 4 }} />
                  <div className="absolute w-5 h-5 bg-white border-2 border-green-600 rounded-full shadow-sm pointer-events-none"
                    style={{ left: `calc(${(maxPrice / 3000) * 100}% - 10px)`, zIndex: 4 }} />
                </div>
                <div className="flex justify-between text-xs text-gray-400"><span>₹0</span><span>₹3000</span></div>
              </div>

              {/* Facilities */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Facilities</label>
                <div className="grid grid-cols-2 gap-2">
                  {FACILITIES.map(fac => {
                    const isSelected = selectedFacilities.includes(fac.key);
                    return (
                      <button key={fac.key} onClick={() => toggleFacility(fac.key)}
                        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left min-h-[48px] ${
                          isSelected ? 'bg-green-50 border-green-400 text-green-700' : 'bg-white border-gray-200 text-gray-700'}`}>
                        <fac.icon className="w-4 h-4 text-gray-500" />
                        <span className="flex-1">{fac.label}</span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center shrink-0">
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'newest', label: 'Newest' },
                    { value: 'price_asc', label: 'Price ↑' },
                    { value: 'price_desc', label: 'Price ↓' },
                    { value: 'rating', label: 'Rating' },
                    { value: 'distance', label: 'Nearest' },
                  ].map(opt => (
                    <button key={opt.value} onClick={() => setFilter('sortBy', opt.value as typeof filters.sortBy)}
                      className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        (filters.sortBy || 'newest') === opt.value
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'bg-white border-gray-200 text-gray-700'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Apply button */}
            <div className="px-5 pt-2 pb-6 border-t border-gray-100 bg-white sticky bottom-0">
              <button onClick={onClose}
                className="w-full py-4 bg-green-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-green-600/20 active:scale-[0.98] transition-transform min-h-[52px]">
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
