'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { fetchUserFavorites } from '@/lib/supabase/queries';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import type { Turf } from '@/types';
import { Heart, MapPin, Star, Loader2 } from 'lucide-react';

function TurfRow({ turf }: { turf: Turf }) {
  return (
    <Link href={`/turfs/${turf.id}`} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0 active:bg-gray-50 transition-colors">
      <div className="w-[72px] h-[72px] rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
        {turf.photos && turf.photos.length > 0
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={turf.photos[0]} alt={turf.name} className="w-full h-full object-cover" />
          : <MapPin className="w-6 h-6 text-gray-300" />}
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <h3 className="text-[15px] font-bold text-gray-900 truncate">{turf.name}</h3>
        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3 text-green-600 shrink-0" />
          <span className="truncate">{turf.address}</span>
        </p>
        <div className="flex items-center gap-1 mt-1">
          <Star className="w-3.5 h-3.5 text-amber fill-amber" />
          <span className="text-xs font-bold text-gray-800">{turf.avg_rating}</span>
          <span className="text-xs text-gray-400">({turf.total_reviews})</span>
        </div>
      </div>
      <div className="text-right flex-shrink-0 pt-1">
        <span className="text-sm font-bold text-green-600">{formatCurrency(turf.price_per_hour)}</span>
        <span className="text-[11px] text-gray-400 ml-0.5">/hr</span>
        <div className="mt-1 flex justify-end"><Heart className="w-4 h-4 text-red-500 fill-red-500" /></div>
      </div>
    </Link>
  );
}

export default function FavoritesPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth?redirect=/favorites');
      return;
    }
    if (user) {
      fetchUserFavorites(user.id)
        .then(data => setTurfs(data))
        .catch(() => setTurfs([]))
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || (loading && user)) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-dvh bg-white">
      {/* MOBILE */}
      <div className="md:hidden">
        <div className="px-4 pt-3 pb-3">
          <h1 className="text-xl font-bold text-gray-900">Favorites</h1>
        </div>
        <div className="px-4">
          {loading ? (
            <div className="space-y-3 py-4">
              {[1,2,3].map(i => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-[72px] h-[72px] rounded-xl bg-gray-100 shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-50 rounded w-1/2" />
                    <div className="h-3 bg-gray-50 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : turfs.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-14 h-14 text-gray-200 mx-auto mb-4" />
              <h3 className="text-base font-bold text-gray-900">No favorites yet</h3>
              <p className="text-sm text-gray-400 mt-1">Tap the heart icon on turfs you love</p>
              <Link href="/turfs" className="mt-4 inline-flex px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm min-h-[44px] items-center">
                Explore Turfs
              </Link>
            </div>
          ) : (
            <div>
              {turfs.map(turf => <TurfRow key={turf.id} turf={turf} />)}
            </div>
          )}
        </div>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">My Favorites</h1>
            <p className="text-sm text-gray-500 mt-1">Turfs you&apos;ve saved for later</p>
          </motion.div>
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : turfs.length === 0 ? (
            <div className="text-center py-20 pf-card rounded-2xl">
              <Heart className="w-16 h-16 text-gray-200 mx-auto mb-6" />
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">No Favorites</h2>
              <p className="text-sm text-gray-500 mb-6">Tap the heart icon on turfs you love</p>
              <Link href="/turfs" className="inline-flex px-6 py-3 bg-green-600 text-white font-bold rounded-xl text-sm">Explore Turfs</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {turfs.map((turf, i) => (
                <motion.div key={turf.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/turfs/${turf.id}`} className="pf-card block overflow-hidden group relative">
                    <div className="absolute top-3 right-3 z-10"><Heart className="w-5 h-5 text-red-500 fill-red-500" /></div>
                    <div className="h-36 bg-gray-100 relative overflow-hidden">
                      {turf.photos && turf.photos.length > 0
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={turf.photos[0]} alt={turf.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        : <div className="absolute inset-0 flex items-center justify-center opacity-20"><MapPin className="w-20 h-20" /></div>}
                    </div>
                    <div className="p-4">
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-green-600 transition-colors">{turf.name}</h3>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 truncate"><MapPin className="w-3 h-3 shrink-0 text-green-600" />{turf.address}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-base font-bold text-green-600">{formatCurrency(turf.price_per_hour)}<span className="text-xs text-gray-400 font-normal">/hr</span></span>
                        <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber fill-amber" /><span className="text-sm font-bold text-gray-800">{turf.avg_rating}</span></div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
