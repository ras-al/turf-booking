'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchOwnerTurfs, fetchOwnerBookings, fetchOwnerStats, fetchTodaySlots } from '@/lib/supabase/queries';
import { formatCurrency, formatTime, SPORT_ICONS } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import type { Turf, Booking, Slot } from '@/types';
import Link from 'next/link';
import { Calendar, BarChart3, IndianRupee, Star, Plus, Loader2, MapPin, Clock, Users } from 'lucide-react';

const TABS = ['Overview', 'Bookings', 'Slots', 'My Turfs'] as const;

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

  useEffect(() => {
    if (!selectedTurf) return;
    fetchTodaySlots(selectedTurf).then(setTodaySlots);
  }, [selectedTurf]);

  const currentTurf = ownerTurfs.find((t) => t.id === selectedTurf) || ownerTurfs[0];

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="w-8 h-8 text-green-600 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Owner Dashboard</h1>
              <p className="text-sm text-gray-500 mt-0.5">Welcome back, {user?.full_name || 'Owner'}</p>
            </div>
            <Link href="/dashboard/register-turf" className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> Register New Turf
            </Link>
          </div>
          <div className="flex gap-1 mt-4 overflow-x-auto">
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`pf-tab relative ${activeTab === tab ? 'pf-tab-active' : ''}`}>
                {tab}
                {activeTab === tab && <motion.div layoutId="dashboard-tab" className="absolute bottom-0 left-2 right-2 h-0.5 bg-green-600 rounded-full" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Overview */}
        {activeTab === 'Overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Today's Bookings", value: stats.todayBookings, icon: <Calendar className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-100' },
                { label: 'Total Bookings', value: stats.totalBookings, icon: <BarChart3 className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-100' },
                { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: <IndianRupee className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-100' },
                { label: 'Avg Rating', value: stats.avgRating || '—', icon: <Star className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-100' },
              ].map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="pf-stat-card">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} mb-3`}>{stat.icon}</div>
                  <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Recent Bookings */}
            <div className="pf-card rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">Recent Bookings</h3>
                <button onClick={() => setActiveTab('Bookings')} className="text-xs font-semibold text-green-600">View All</button>
              </div>
              <div className="divide-y divide-gray-100">
                {bookings.length === 0 ? (
                  <div className="px-5 py-10 text-center text-gray-400 text-sm">No bookings yet.</div>
                ) : bookings.slice(0, 5).map((b) => (
                  <div key={b.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 border border-green-200 flex items-center justify-center text-green-700 text-xs font-bold">
                        {(b.user?.full_name || 'U').charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{b.user?.full_name || 'User'}</div>
                        <div className="text-xs text-gray-500">{b.turf?.name} &middot; {new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-600">{formatCurrency(b.total_amount)}</div>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-md capitalize ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' : b.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>{b.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'Bookings' && (
          <div className="pf-card rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100"><h3 className="text-base font-bold text-gray-900">All Bookings ({bookings.length})</h3></div>
            <div className="overflow-x-auto">
              <table className="pf-table">
                <thead><tr><th>Player</th><th>Turf</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">No bookings yet.</td></tr>
                  ) : bookings.map((b) => (
                    <tr key={b.id}>
                      <td className="font-medium text-gray-900">{b.user?.full_name || 'User'}</td>
                      <td className="text-gray-500">{b.turf?.name || '—'}</td>
                      <td className="text-gray-400 font-mono text-xs">{new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className="font-bold text-green-600">{formatCurrency(b.total_amount)}</td>
                      <td><span className={`px-2 py-0.5 text-xs font-semibold rounded-md capitalize ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' : b.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Slots Tab */}
        {activeTab === 'Slots' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600 font-medium">Select Turf:</label>
              <select value={selectedTurf} onChange={(e) => setSelectedTurf(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:outline-none focus:border-green-400">
                {ownerTurfs.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="pf-card rounded-2xl p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-600" />
                Today&apos;s Slots &mdash; {currentTurf?.name}
              </h3>
              {todaySlots.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">No slots created for today.</p>
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

        {/* My Turfs Tab */}
        {activeTab === 'My Turfs' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ownerTurfs.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <p className="text-gray-400 mb-4">You haven&apos;t registered any turfs yet.</p>
                <Link href="/dashboard/register-turf" className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold text-sm">Register a Turf</Link>
              </div>
            ) : ownerTurfs.map((turf, i) => (
              <motion.div key={turf.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="pf-card rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{turf.name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3 text-green-600" />{turf.address}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-md ${turf.is_approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{turf.is_approved ? 'Active' : 'Pending'}</span>
                </div>
                <div className="flex gap-1.5 mb-3">
                  {turf.sports.map((s) => (
                    <span key={s} className="px-2 py-1 flex items-center gap-1 text-xs bg-gray-50 border border-gray-200 text-gray-600 rounded-md capitalize">
                      <div className="w-3 h-3 [&>svg]:w-full [&>svg]:h-full">{SPORT_ICONS[s]}</div>{s}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                  <span className="font-bold text-green-600">{formatCurrency(turf.price_per_hour)}/hr</span>
                  <span className="text-gray-500 flex items-center gap-1"><Star className="w-3 h-3 text-amber fill-amber" /> {turf.avg_rating} ({turf.total_reviews})</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
