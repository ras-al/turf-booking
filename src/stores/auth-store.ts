import { create } from 'zustand';
import type { Profile } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { fetchProfile } from '@/lib/supabase/queries';

interface AuthState {
  user: Profile | null;
  isLoading: boolean;
  setUser: (user: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),

  initialize: async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        set({ user: profile, isLoading: false });
      } else {
        set({ user: null, isLoading: false });
      }

      // Listen for auth state changes (e.g. magic link click or signin)
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          set({ user: profile, isLoading: false });
        } else {
          set({ user: null, isLoading: false });
        }
      });
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  logout: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, isLoading: false });
  },
}));
