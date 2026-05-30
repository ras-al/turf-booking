'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MOCK_TURFS, MOCK_USER, MOCK_OWNER } from '@/lib/mock-data';
import { formatCurrency, SPORT_ICONS } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { Users, Building, Trophy, Clock, ClipboardList, IndianRupee, Star } from 'lucide-react';

const ADMIN_TABS = ['Overview', 'Users', 'Turfs', 'Bookings'] as const;

export default function AdminPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<typeof ADMIN_TABS[number]>('Overview');

  const pendingTurfs = MOCK_TURFS.filter((t) => !t.is_approved).length;

  const stats = {
    totalUsers: 1234,
    totalOwners: 45,
    totalTurfs: MOCK_TURFS.length,
    pendingApprovals: 3,
    totalBookings: 5678,
    totalRevenue: 145000000, // ₹14,50,000
  };

  return (
    <div className="min-h-screen bg-pitch-900">
      {/* Admin Header */}
      <div className="bg-pitch-950 border-b border-pitch-600/30">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display tracking-wider text-chalk">
                ADMIN <span className="text-amber">PANEL</span>
              </h1>
              <p className="text-sm text-chalk-dim mt-0.5">
                Welcome, {user?.full_name || 'Admin'}
              </p>
            </div>
            {stats.pendingApprovals > 0 && (
              <div className="px-4 py-2 bg-amber/10 border border-amber/30 rounded-lg text-amber text-xs font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
                {stats.pendingApprovals} pending approval{stats.pendingApprovals > 1 ? 's' : ''}
              </div>
            )}
          </div>

          <div className="flex gap-1 mt-4 overflow-x-auto">
            {ADMIN_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab ? 'text-amber bg-amber/10' : 'text-chalk-dim hover:text-chalk hover:bg-pitch-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'Overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: <Users className="w-6 h-6" />, color: 'text-chalk' },
                { label: 'Total Owners', value: stats.totalOwners, icon: <Building className="w-6 h-6" />, color: 'text-turf' },
                { label: 'Total Turfs', value: stats.totalTurfs, icon: <Trophy className="w-6 h-6" />, color: 'text-turf' },
                { label: 'Pending', value: stats.pendingApprovals, icon: <Clock className="w-6 h-6" />, color: 'text-amber' },
                { label: 'Bookings', value: stats.totalBookings.toLocaleString(), icon: <ClipboardList className="w-6 h-6" />, color: 'text-chalk' },
                { label: 'Revenue', value: formatCurrency(stats.totalRevenue), icon: <IndianRupee className="w-6 h-6" />, color: 'text-turf' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-panel rounded-xl p-5"
                >
                  <div className={`text-lg mb-2 ${stat.color}`}>{stat.icon}</div>
                  <div className={`text-xl font-mono font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-chalk-dim mt-0.5">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Users' && (
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-pitch-600/30 flex items-center justify-between">
              <h3 className="text-lg font-display tracking-wide text-chalk">USER MANAGEMENT</h3>
              <input
                type="text"
                placeholder="Search users..."
                className="px-3 py-1.5 bg-pitch-700 border border-pitch-600 text-chalk text-xs rounded-lg placeholder-chalk-dim w-48 focus:outline-none focus:border-turf/50"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-pitch-700/30">
                  <tr className="text-chalk-dim text-xs uppercase tracking-wider">
                    <th className="text-left px-5 py-3">User</th>
                    <th className="text-left px-5 py-3">Email</th>
                    <th className="text-left px-5 py-3">Role</th>
                    <th className="text-left px-5 py-3">Status</th>
                    <th className="text-left px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pitch-600/20">
                  {[
                    { ...MOCK_USER },
                    { ...MOCK_OWNER },
                    { ...MOCK_USER, id: 'u3', full_name: 'Priya Sharma', email: 'priya@mail.com', role: 'user' as const },
                    { ...MOCK_USER, id: 'u4', full_name: 'Kabir Das', email: 'kabir@mail.com', role: 'owner' as const },
                    { ...MOCK_USER, id: 'u5', full_name: 'Lakshmi Menon', email: 'lakshmi@mail.com', role: 'user' as const },
                  ].map((u) => (
                    <tr key={u.id} className="hover:bg-pitch-700/20 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-turf/20 border border-turf/30 flex items-center justify-center text-turf text-xs font-bold">
                            {u.full_name.charAt(0)}
                          </div>
                          <span className="text-chalk">{u.full_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-chalk-muted">{u.email}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-md capitalize ${
                          u.role === 'admin' ? 'bg-amber/10 text-amber' : u.role === 'owner' ? 'bg-turf/10 text-turf' : 'bg-pitch-600 text-chalk-muted'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 text-xs font-medium bg-turf/10 text-turf rounded-md">Active</span>
                      </td>
                      <td className="px-5 py-3">
                        <button className="text-xs text-chalk-dim hover:text-chalk transition-colors">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Turfs' && (
          <div className="space-y-6">
            {/* Pending Approvals */}
            <div className="glass-panel border-amber/30 rounded-2xl overflow-hidden shadow-lg shadow-amber/5">
              <div className="px-5 py-4 border-b border-pitch-600/30 bg-amber/5">
                <h3 className="text-lg font-display tracking-wide text-amber">PENDING APPROVALS</h3>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { name: 'New Sports Arena', owner: 'Kabir Das', city: 'Kannur', sports: ['football', 'cricket'] },
                  { name: 'Smash Court Plus', owner: 'Rohit Kumar', city: 'Palakkad', sports: ['badminton'] },
                  { name: 'Power Play Ground', owner: 'Anil Raj', city: 'Kollam', sports: ['football'] },
                ].map((pending, i) => (
                  <div key={i} className="flex items-center justify-between bg-pitch-700/30 rounded-xl p-4">
                    <div>
                      <div className="text-sm font-medium text-chalk">{pending.name}</div>
                      <div className="text-xs text-chalk-dim">
                        by {pending.owner} · {pending.city} · <span className="inline-flex gap-0.5 align-middle">{pending.sports.map((s) => <div key={s} className="w-3 h-3 [&>svg]:w-full [&>svg]:h-full">{SPORT_ICONS[s]}</div>)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 text-xs font-medium bg-turf text-pitch-900 rounded-lg hover:bg-turf-light transition-colors">
                        Approve
                      </button>
                      <button className="px-3 py-1.5 text-xs font-medium bg-danger/10 text-danger border border-danger/30 rounded-lg hover:bg-danger/20 transition-colors">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All turfs */}
            <div className="glass-panel rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-pitch-600/30">
                <h3 className="text-lg font-display tracking-wide text-chalk">ALL TURFS</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-pitch-700/30">
                    <tr className="text-chalk-dim text-xs uppercase tracking-wider">
                      <th className="text-left px-5 py-3">Turf</th>
                      <th className="text-left px-5 py-3">City</th>
                      <th className="text-left px-5 py-3">Sports</th>
                      <th className="text-left px-5 py-3">Price</th>
                      <th className="text-left px-5 py-3">Rating</th>
                      <th className="text-left px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pitch-600/20">
                    {MOCK_TURFS.map((turf) => (
                      <tr key={turf.id} className="hover:bg-pitch-700/20 transition-colors">
                        <td className="px-5 py-3 text-chalk font-medium">{turf.name}</td>
                        <td className="px-5 py-3 text-chalk-muted">{turf.city}</td>
                        <td className="px-5 py-3">
                          <span className="flex gap-1.5 items-center">
                            {turf.sports.map((s) => (
                              <div key={s} className="w-4 h-4 [&>svg]:w-full [&>svg]:h-full text-chalk-muted">{SPORT_ICONS[s]}</div>
                            ))}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-mono text-turf">{formatCurrency(turf.price_per_hour)}</td>
                        <td className="px-5 py-3 text-chalk-muted"><Star className="w-3.5 h-3.5 text-amber fill-amber inline-block mr-1" />{turf.avg_rating}</td>
                        <td className="px-5 py-3">
                          <span className="px-2 py-0.5 text-xs font-medium bg-turf/10 text-turf rounded-md">Active</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Bookings' && (
          <div className="glass-panel rounded-2xl p-10 text-center">
            <div className="flex justify-center mb-6">
              <ClipboardList className="w-16 h-16 text-chalk-dim/50" />
            </div>
            <h3 className="text-xl font-display text-chalk">BOOKING MANAGEMENT</h3>
            <p className="text-sm text-chalk-dim mt-2">
              All bookings across all turfs will appear here with filtering and export options.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
