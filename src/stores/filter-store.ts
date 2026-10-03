import { create } from 'zustand';
import type { TurfFilters } from '@/types';

interface FilterState {
  filters: TurfFilters;
  userCoords: [number, number] | null;
  userCity: string | null;
  locationStatus: 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable';
  setFilter: <K extends keyof TurfFilters>(key: K, value: TurfFilters[K]) => void;
  setFilters: (filters: Partial<TurfFilters>) => void;
  setUserLocation: (coords: [number, number] | null, city?: string | null) => void;
  setLocationStatus: (status: FilterState['locationStatus']) => void;
  resetFilters: () => void;
}

const DEFAULT_FILTERS: TurfFilters = {
  sport: undefined,
  city: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  size: undefined,
  minRating: undefined,
  sortBy: 'newest',
  search: undefined,
};

export const useFilterStore = create<FilterState>((set) => ({
  filters: DEFAULT_FILTERS,
  userCoords: null,
  userCity: null,
  locationStatus: 'idle',
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  setUserLocation: (coords, city) =>
    set((state) => ({
      userCoords: coords,
      userCity: city !== undefined ? city : state.userCity,
      locationStatus: coords ? 'granted' : state.locationStatus,
      filters: city ? { ...state.filters, city } : state.filters,
    })),
  setLocationStatus: (locationStatus) => set({ locationStatus }),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
}));
