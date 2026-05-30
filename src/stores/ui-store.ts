import { create } from 'zustand';

interface UIState {
  isMobileMenuOpen: boolean;
  isFilterOpen: boolean;
  activeModal: string | null;
  toggleMobileMenu: () => void;
  toggleFilter: () => void;
  openModal: (id: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  isFilterOpen: false,
  activeModal: null,

  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  toggleFilter: () =>
    set((state) => ({ isFilterOpen: !state.isFilterOpen })),

  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
}));
