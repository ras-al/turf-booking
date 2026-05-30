import { create } from 'zustand';
import type { Slot, Turf } from '@/types';

interface BookingState {
  selectedTurf: Turf | null;
  selectedDate: string;
  selectedSlots: Slot[];
  setSelectedTurf: (turf: Turf | null) => void;
  setSelectedDate: (date: string) => void;
  toggleSlot: (slot: Slot) => void;
  clearSlots: () => void;
  resetBooking: () => void;
  totalAmount: () => number;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  selectedTurf: null,
  selectedDate: new Date().toISOString().split('T')[0],
  selectedSlots: [],

  setSelectedTurf: (turf) => set({ selectedTurf: turf }),

  setSelectedDate: (date) => set({ selectedDate: date, selectedSlots: [] }),

  toggleSlot: (slot) =>
    set((state) => {
      const exists = state.selectedSlots.find((s) => s.id === slot.id);
      if (exists) {
        return { selectedSlots: state.selectedSlots.filter((s) => s.id !== slot.id) };
      }
      return { selectedSlots: [...state.selectedSlots, slot] };
    }),

  clearSlots: () => set({ selectedSlots: [] }),

  resetBooking: () =>
    set({
      selectedTurf: null,
      selectedDate: new Date().toISOString().split('T')[0],
      selectedSlots: [],
    }),

  totalAmount: () => {
    const state = get();
    if (!state.selectedTurf) return 0;
    // Calculate based on slot durations
    let totalMinutes = 0;
    state.selectedSlots.forEach((slot) => {
      const [startH, startM] = slot.start_time.split(':').map(Number);
      const [endH, endM] = slot.end_time.split(':').map(Number);
      totalMinutes += (endH * 60 + endM) - (startH * 60 + startM);
    });
    const hours = totalMinutes / 60;
    return Math.round(state.selectedTurf.price_per_hour * hours);
  },
}));
