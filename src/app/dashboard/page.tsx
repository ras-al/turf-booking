'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchOwnerTurfs, fetchOwnerBookings, fetchOwnerStats, fetchTodaySlots } from '@/lib/supabase/queries';
import { formatCurrency, formatTime, SPORT_ICONS } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import type { Turf, Booking, Slot } from '@/types';
import Link from 'next/link';
import { Calendar, BarChart3, IndianRupee, Star, CheckCircle2, Plus, Loader2 } from 'lucide-react';

const TABS = ['Overview', 'Bookings', 'Slots', 'Turfs'] as const;

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Overview');
  const [ownerTurfs, setOwnerTurfs] = useState<Turf[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedTurf, setSelectedTurf] = useState<string>('');
  const [todaySlots, setTodaySlots] = useState<Slot[]>([]);
  const [stats, setStats] = useState({ totalBookings: 0, todayBookings: 0, totalRevenue: 0, avgRating: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      setLoading(true);
      const [turfs, bks, st] = await Promise.all([
        fetchOwnerTurfs(user!.id),
        fetchOwnerBookings(user!.id),
        fetchOwnerStats(user!.id),
      ]);
      setOwnerTurfs(turfs);
      setBookings(bks);
      setStats(st);
      if (turfs.length > 0) setSelectedTurf(turfs[0].id);
      setLoading(false);
    }
    load();
  }, [user]);

  // Load today's slots when selectedTurf changes
  useEffect(() => {
    if (!selectedTurf) return;
    fetchTodaySlots(selectedTurf).then(setTodaySlots);
  }, [selectedTurf]);

  const currentTurf = ownerTurfs.find((t) => t.id === selectedTurf) || ownerTurfs[0];

  if (loading) {
    return <div className="min-h-screen bg-pitch-900 flex items-center justify-center"><Loader2 className="w-8 h-8 text-turf animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-pitch-900">
      <div className="bg-pitch-950 border-b border-pitch-600/30">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display tracking-wider text-chalk">OWNER <span className="text-turf">DASHBOARD</span></h1>
              <p className="text-sm text-chalk-dim mt-0.5">Welcome back, {user?.full_name || 'Owner'}</p>
            </div>
            <Link href="/dashboard/register-turf" className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-turf/10 border border-turf/30 text-turf rounded-lg hover:bg-turf/20 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Register New Turf
            </Link>
          </div>
          <div className="flex gap-1 mt-4 overflow-x-auto">
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap relative ${activeTab === tab ? 'text-turf bg-turf/10' : 'text-chalk-dim hover:text-chalk hover:bg-pitch-800'}`}>
                {tab}
                {activeTab === tab && <motion.div layoutId="dashboard-tab" className="absolute bottom-0 left-2 right-2 h-0.5 bg-turf rounded-full" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'Overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                { label: "Today's Bookings", value: stats.todayBookings, icon: <Calendar className="w-6 h-6" />, color: 'turf' },
                { label: 'Total Bookings', value: stats.totalBookings, icon: <BarChart3 className="w-6 h-6" />, color: 'chalk' },
                { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: <IndianRupee className="w-6 h-6" />, color: 'turf' },
                { label: 'Avg Rating', value: stats.avgRating || '—', icon: <Star className="w-6 h-6" />, color: 'amber' },
              ].map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-panel rounded-xl p-5">
                  <div className={`flex items-center justify-between mb-3 ${stat.color === 'turf' ? 'text-turf' : stat.color === 'amber' ? 'text-amber' : 'text-chalk-muted'}`}><span className="text-lg">{stat.icon}</span></div>
                  <div className={`text-xl font-mono font-bold ${stat.color === 'turf' ? 'text-turf' : stat.color === 'amber' ? 'text-amber' : 'text-chalk'}`}>{stat.value}</div>
                  <div className="text-xs text-chalk-dim mt-0.5">{stat.label}</div>
                </motion.div>
              ))}
            </div>
            <div className="glass-panel rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-pitch-600/30"><h3 className="text-lg font-display tracking-wide text-chalk">RECENT BOOKINGS</h3></div>
              <div className="divide-y divide-pitch-600/20">
                {bookings.length === 0 ? (
                  <div className="px-5 py-10 text-center text-chalk-dim text-sm">No bookings yet.</div>
                ) : bookings.slice(0, 5).map((b) => (
                  <div key={b.id} className="px-5 py-3 flex items-center justify-between hover:bg-pitch-700/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-turf/20 border border-turf/30 flex items-center justify-center text-turf text-xs font-bold">
                        {(b.user?.full_name || 'U').charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-chalk">{b.user?.full_name || 'User'}</div>
                        <div className="text-xs text-chalk-dim">{b.turf?.name} · {new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-turf">{formatCurrency(b.total_amount)}</div>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${b.status === 'confirmed' ? 'bg-turf/10 text-turf' : b.status === 'cancelled' ? 'bg-danger/10 text-danger' : 'bg-amber/10 text-amber'}`}>{b.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Bookings' && (
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-pitch-600/30"><h3 className="text-lg font-display tracking-wide text-chalk">ALL BOOKINGS</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-pitch-700/30">
                  <tr className="text-chalk-dim text-xs uppercase tracking-wider">
                    <th className="text-left px-5 py-3">Player</th>
                    <th className="text-left px-5 py-3">Turf</th>
                    <th className="text-left px-5 py-3">Date</th>
                    <th className="text-left px-5 py-3">Amount</th>
                    <th className="text-left px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pitch-600/20">
                  {bookings.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-10 text-center text-chalk-dim">No bookings yet.</td></tr>
                  ) : bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-pitch-700/20 transition-colors">
                      <td className="px-5 py-3 text-chalk">{b.user?.full_name || 'User'}</td>
                      <td className="px-5 py-3 text-chalk-muted">{b.turf?.name || '—'}</td>
                      <td className="px-5 py-3 text-chalk-muted font-mono text-xs">{new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className="px-5 py-3 font-mono font-bold text-turf">{formatCurrency(b.total_amount)}</td>
                      <td className="px-5 py-3"><span className={`px-2 py-0.5 text-xs font-medium rounded-md ${b.status === 'confirmed' ? 'bg-turf/10 text-turf' : b.status === 'cancelled' ? 'bg-danger/10 text-danger' : 'bg-amber/10 text-amber'}`}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Slots' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <label className="text-sm text-chalk-dim">Select Turf:</label>
              <select value={selectedTurf} onChange={(e) => setSelectedTurf(e.target.value)} className="px-3 py-2 bg-pitch-800 border border-pitch-600 text-chalk text-sm rounded-lg">
                {ownerTurfs.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="text-lg font-display tracking-wide text-chalk mb-4">TODAY&apos;S SLOTS — {currentTurf?.name}</h3>
              {todaySlots.length === 0 ? (
                <p className="text-chalk-dim text-sm text-center py-6">No slots created for today.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {todaySlots.map((slot) => (
                    <div key={slot.id} className={`px-2 py-3 rounded-lg text-center font-mono text-sm ${slot.status === 'booked' ? 'slot-booked' : slot.status === 'blocked' ? 'slot-blocked' : 'slot-available'}`}>
                      <div className="font-bold">{formatTime(slot.start_time)}</div>
                      <div className="text-xs opacity-70 capitalize">{slot.status}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'Turfs' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ownerTurfs.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <p className="text-chalk-dim mb-4">You haven&apos;t registered any turfs yet.</p>
                <Link href="/dashboard/register-turf" className="px-6 py-3 bg-turf text-pitch-900 rounded-xl font-semibold text-sm">Register a Turf</Link>
              </div>
            ) : ownerTurfs.map((turf, i) => (
              <motion.div key={turf.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-panel rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-display tracking-wide text-chalk">{turf.name}</h3>
                    <p className="text-xs text-chalk-dim">{turf.address}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${turf.is_approved ? 'bg-turf/10 text-turf' : 'bg-amber/10 text-amber'}`}>{turf.is_approved ? 'Active' : 'Pending'}</span>
                </div>
                <div className="flex gap-1.5 mb-3">
                  {turf.sports.map((s) => (
                    <span key={s} className="px-2 py-1 flex items-center gap-1 text-xs bg-pitch-900/50 border border-pitch-600/50 text-chalk-dim rounded-md capitalize">
                      <div className="w-3 h-3 [&>svg]:w-full [&>svg]:h-full">{SPORT_ICONS[s]}</div>{s}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-mono font-bold text-turf">{formatCurrency(turf.price_per_hour)}/hr</span>
                  <span className="text-chalk-dim flex items-center gap-1"><Star className="w-3 h-3 text-amber fill-amber" /> {turf.avg_rating} ({turf.total_reviews})</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
