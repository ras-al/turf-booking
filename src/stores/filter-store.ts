import { create } from 'zustand';
import type { TurfFilters } from '@/types';

interface FilterState {
  filters: TurfFilters;
  setFilter: <K extends keyof TurfFilters>(key: K, value: TurfFilters[K]) => void;
  setFilters: (filters: Partial<TurfFilters>) => void;
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
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
}));
