'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MOCK_TURFS, MOCK_BOOKINGS, MOCK_SLOTS } from '@/lib/mock-data';
import { formatCurrency, formatTime, formatDate, SPORT_ICONS } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import Link from 'next/link';
import { Calendar, BarChart3, IndianRupee, Landmark, Star, CheckCircle2, Plus } from 'lucide-react';

const TABS = ['Overview', 'Bookings', 'Slots', 'Turfs'] as const;

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Overview');
  const [selectedTurf, setSelectedTurf] = useState(MOCK_TURFS[0]?.id);

  const ownerTurfs = MOCK_TURFS.filter((t) => t.owner_id === 'owner-001');
  const currentTurf = ownerTurfs.find((t) => t.id === selectedTurf) || ownerTurfs[0];

  // Mock stats
  const stats = {
    totalBookings: 47,
    todayBookings: 5,
    monthRevenue: 7250000, // ₹72,500
    totalRevenue: 28500000, // ₹2,85,000
    avgRating: 4.5,
    activeSlots: 126,
  };

  return (
    <div className="min-h-screen bg-pitch-900">
      {/* Dashboard Header — Coach's Clipboard style */}
      <div className="bg-pitch-950 border-b border-pitch-600/30">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display tracking-wider text-chalk">
                OWNER <span className="text-turf">DASHBOARD</span>
              </h1>
              <p className="text-sm text-chalk-dim mt-0.5">
                Welcome back, {user?.full_name || 'Owner'}
              </p>
            </div>
            <Link
              href="/auth?role=owner"
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-turf/10 border border-turf/30 text-turf rounded-lg hover:bg-turf/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Register New Turf
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap relative ${
                  activeTab === tab
                    ? 'text-turf bg-turf/10'
                    : 'text-chalk-dim hover:text-chalk hover:bg-pitch-800'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="dashboard-tab"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-turf rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'Overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "Today's Bookings", value: stats.todayBookings, icon: <Calendar className="w-6 h-6" />, color: 'turf' },
                { label: 'Total Bookings', value: stats.totalBookings, icon: <BarChart3 className="w-6 h-6" />, color: 'chalk' },
                { label: "This Month", value: formatCurrency(stats.monthRevenue), icon: <IndianRupee className="w-6 h-6" />, color: 'amber' },
                { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: <Landmark className="w-6 h-6" />, color: 'turf' },
                { label: 'Avg Rating', value: stats.avgRating, icon: <Star className="w-6 h-6" />, color: 'amber' },
                { label: 'Active Slots', value: stats.activeSlots, icon: <CheckCircle2 className="w-6 h-6" />, color: 'turf' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-panel rounded-xl p-5"
                >
                  <div className={`flex items-center justify-between mb-3 ${stat.color === 'turf' ? 'text-turf' : stat.color === 'amber' ? 'text-amber' : 'text-chalk-muted'}`}>
                    <span className="text-lg">{stat.icon}</span>
                  </div>
                  <div className={`text-xl font-mono font-bold ${stat.color === 'turf' ? 'text-turf' : stat.color === 'amber' ? 'text-amber' : 'text-chalk'}`}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-chalk-dim mt-0.5">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Recent bookings */}
            <div className="glass-panel rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-pitch-600/30">
                <h3 className="text-lg font-display tracking-wide text-chalk">RECENT BOOKINGS</h3>
              </div>
              <div className="divide-y divide-pitch-600/20">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-pitch-700/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-turf/20 border border-turf/30 flex items-center justify-center text-turf text-xs font-bold">
                        {String.fromCharCode(64 + i)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-chalk">Player {i}</div>
                        <div className="text-xs text-chalk-dim">
                          {currentTurf?.name} · Today, {formatTime(`${17 + i}:00`)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-turf">
                        {formatCurrency((currentTurf?.price_per_hour || 100000))}
                      </div>
                      <span className="px-2 py-0.5 text-xs font-medium bg-turf/10 text-turf rounded-md">
                        Confirmed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Bookings' && (
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-pitch-600/30 flex items-center justify-between">
              <h3 className="text-lg font-display tracking-wide text-chalk">ALL BOOKINGS</h3>
              <select className="px-3 py-1.5 bg-pitch-700 border border-pitch-600 text-chalk text-xs rounded-lg">
                <option>All Time</option>
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-pitch-700/30">
                  <tr className="text-chalk-dim text-xs uppercase tracking-wider">
                    <th className="text-left px-5 py-3">Player</th>
                    <th className="text-left px-5 py-3">Turf</th>
                    <th className="text-left px-5 py-3">Date & Time</th>
                    <th className="text-left px-5 py-3">Amount</th>
                    <th className="text-left px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pitch-600/20">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <tr key={i} className="hover:bg-pitch-700/20 transition-colors">
                      <td className="px-5 py-3 text-chalk">Player {i}</td>
                      <td className="px-5 py-3 text-chalk-muted">{ownerTurfs[i % ownerTurfs.length]?.name}</td>
                      <td className="px-5 py-3 text-chalk-muted font-mono text-xs">
                        May {20 + i}, 2026 · {formatTime(`${8 + i}:00`)}
                      </td>
                      <td className="px-5 py-3 font-mono font-bold text-turf">
                        {formatCurrency(ownerTurfs[i % ownerTurfs.length]?.price_per_hour || 100000)}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${
                          i % 4 === 0 ? 'bg-amber/10 text-amber' : i % 4 === 3 ? 'bg-danger/10 text-danger' : 'bg-turf/10 text-turf'
                        }`}>
                          {i % 4 === 0 ? 'Pending' : i % 4 === 3 ? 'Cancelled' : 'Confirmed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Slots' && (
          <div className="space-y-6">
            {/* Turf selector */}
            <div className="flex items-center gap-3">
              <label className="text-sm text-chalk-dim">Select Turf:</label>
              <select
                value={selectedTurf}
                onChange={(e) => setSelectedTurf(e.target.value)}
                className="px-3 py-2 bg-pitch-800 border border-pitch-600 text-chalk text-sm rounded-lg"
              >
                {ownerTurfs.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="glass-panel rounded-2xl p-6">
              <h3 className="text-lg font-display tracking-wide text-chalk mb-4">
                TODAY&apos;S SLOTS — {currentTurf?.name}
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {(MOCK_SLOTS[selectedTurf] || [])
                  .filter((s) => s.date === new Date().toISOString().split('T')[0])
                  .map((slot) => (
                    <div
                      key={slot.id}
                      className={`px-2 py-3 rounded-lg text-center font-mono text-sm ${
                        slot.status === 'booked'
                          ? 'slot-booked'
                          : slot.status === 'blocked'
                          ? 'slot-blocked'
                          : 'slot-available'
                      }`}
                    >
                      <div className="font-bold">{formatTime(slot.start_time)}</div>
                      <div className="text-xs opacity-70 capitalize">{slot.status}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Turfs' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ownerTurfs.map((turf, i) => (
              <motion.div
                key={turf.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel rounded-2xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-display tracking-wide text-chalk">{turf.name}</h3>
                    <p className="text-xs text-chalk-dim">{turf.address}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${
                    turf.is_approved ? 'bg-turf/10 text-turf' : 'bg-amber/10 text-amber'
                  }`}>
                    {turf.is_approved ? 'Active' : 'Pending'}
                  </span>
                </div>
                <div className="flex gap-1.5 mb-3">
                  {turf.sports.map((s) => (
                    <span key={s} className="px-2 py-1 flex items-center gap-1 text-xs bg-pitch-900/50 border border-pitch-600/50 text-chalk-dim rounded-md capitalize">
                      <div className="w-3 h-3 [&>svg]:w-full [&>svg]:h-full">{SPORT_ICONS[s]}</div>
                      {s}
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
