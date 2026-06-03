'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchAllTurfs, fetchAllProfiles, fetchAllBookings, fetchAdminStats, updateTurfApproval } from '@/lib/supabase/queries';
import { formatCurrency, SPORT_ICONS } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import type { Turf, Profile, Booking } from '@/types';
import { Users, Building, Trophy, Clock, ClipboardList, IndianRupee, Star, Loader2 } from 'lucide-react';

const ADMIN_TABS = ['Overview', 'Users', 'Turfs', 'Bookings'] as const;

export default function AdminPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<typeof ADMIN_TABS[number]>('Overview');
  const [allTurfs, setAllTurfs] = useState<Turf[]>([]);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalOwners: 0, totalTurfs: 0, pendingApprovals: 0, totalBookings: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [turfs, users, bookings, st] = await Promise.all([
        fetchAllTurfs(), fetchAllProfiles(), fetchAllBookings(), fetchAdminStats(),
      ]);
      setAllTurfs(turfs);
      setAllUsers(users);
      setAllBookings(bookings);
      setStats(st);
      setLoading(false);
    }
    load();
  }, []);

  const handleApprove = async (turfId: string) => {
    await updateTurfApproval(turfId, true);
    setAllTurfs((prev) => prev.map((t) => t.id === turfId ? { ...t, is_approved: true } : t));
    setStats((prev) => ({ ...prev, pendingApprovals: prev.pendingApprovals - 1 }));
  };

  const handleReject = async (turfId: string) => {
    await updateTurfApproval(turfId, false);
    // Could also delete — for now just keep as unapproved
  };

  const pendingTurfs = allTurfs.filter((t) => !t.is_approved);

  if (loading) {
    return <div className="min-h-screen bg-pitch-900 flex items-center justify-center"><Loader2 className="w-8 h-8 text-turf animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-pitch-900">
      <div className="bg-pitch-950 border-b border-pitch-600/30">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display tracking-wider text-chalk">ADMIN <span className="text-amber">PANEL</span></h1>
              <p className="text-sm text-chalk-dim mt-0.5">Welcome, {user?.full_name || 'Admin'}</p>
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
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${activeTab === tab ? 'text-amber bg-amber/10' : 'text-chalk-dim hover:text-chalk hover:bg-pitch-800'}`}>{tab}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: <Users className="w-6 h-6" />, color: 'text-chalk' },
              { label: 'Total Owners', value: stats.totalOwners, icon: <Building className="w-6 h-6" />, color: 'text-turf' },
              { label: 'Total Turfs', value: stats.totalTurfs, icon: <Trophy className="w-6 h-6" />, color: 'text-turf' },
              { label: 'Pending', value: stats.pendingApprovals, icon: <Clock className="w-6 h-6" />, color: 'text-amber' },
              { label: 'Bookings', value: stats.totalBookings, icon: <ClipboardList className="w-6 h-6" />, color: 'text-chalk' },
              { label: 'Revenue', value: formatCurrency(stats.totalRevenue), icon: <IndianRupee className="w-6 h-6" />, color: 'text-turf' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-panel rounded-xl p-5">
                <div className={`text-lg mb-2 ${stat.color}`}>{stat.icon}</div>
                <div className={`text-xl font-mono font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-chalk-dim mt-0.5">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'Users' && (
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-pitch-600/30"><h3 className="text-lg font-display tracking-wide text-chalk">USER MANAGEMENT</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-pitch-700/30">
                  <tr className="text-chalk-dim text-xs uppercase tracking-wider">
                    <th className="text-left px-5 py-3">User</th>
                    <th className="text-left px-5 py-3">Email</th>
                    <th className="text-left px-5 py-3">Role</th>
                    <th className="text-left px-5 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pitch-600/20">
                  {allUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-pitch-700/20 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-turf/20 border border-turf/30 flex items-center justify-center text-turf text-xs font-bold">{u.full_name.charAt(0)}</div>
                          <span className="text-chalk">{u.full_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-chalk-muted">{u.email}</td>
                      <td className="px-5 py-3"><span className={`px-2 py-0.5 text-xs font-medium rounded-md capitalize ${u.role === 'admin' ? 'bg-amber/10 text-amber' : u.role === 'owner' ? 'bg-turf/10 text-turf' : 'bg-pitch-600 text-chalk-muted'}`}>{u.role}</span></td>
                      <td className="px-5 py-3 text-chalk-muted text-xs">{new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Turfs' && (
          <div className="space-y-6">
            {pendingTurfs.length > 0 && (
              <div className="glass-panel border-amber/30 rounded-2xl overflow-hidden shadow-lg shadow-amber/5">
                <div className="px-5 py-4 border-b border-pitch-600/30 bg-amber/5"><h3 className="text-lg font-display tracking-wide text-amber">PENDING APPROVALS</h3></div>
                <div className="p-5 space-y-3">
                  {pendingTurfs.map((turf) => (
                    <div key={turf.id} className="flex items-center justify-between bg-pitch-700/30 rounded-xl p-4">
                      <div>
                        <div className="text-sm font-medium text-chalk">{turf.name}</div>
                        <div className="text-xs text-chalk-dim">{turf.city} · {turf.sports.join(', ')}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(turf.id)} className="px-3 py-1.5 text-xs font-medium bg-turf text-pitch-900 rounded-lg hover:bg-turf-light transition-colors">Approve</button>
                        <button onClick={() => handleReject(turf.id)} className="px-3 py-1.5 text-xs font-medium bg-danger/10 text-danger border border-danger/30 rounded-lg hover:bg-danger/20 transition-colors">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="glass-panel rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-pitch-600/30"><h3 className="text-lg font-display tracking-wide text-chalk">ALL TURFS</h3></div>
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
                    {allTurfs.map((turf) => (
                      <tr key={turf.id} className="hover:bg-pitch-700/20 transition-colors">
                        <td className="px-5 py-3 text-chalk font-medium">{turf.name}</td>
                        <td className="px-5 py-3 text-chalk-muted">{turf.city}</td>
                        <td className="px-5 py-3"><span className="flex gap-1.5 items-center">{turf.sports.map((s) => <div key={s} className="w-4 h-4 [&>svg]:w-full [&>svg]:h-full text-chalk-muted">{SPORT_ICONS[s]}</div>)}</span></td>
                        <td className="px-5 py-3 font-mono text-turf">{formatCurrency(turf.price_per_hour)}</td>
                        <td className="px-5 py-3 text-chalk-muted"><Star className="w-3.5 h-3.5 text-amber fill-amber inline-block mr-1" />{turf.avg_rating}</td>
                        <td className="px-5 py-3"><span className={`px-2 py-0.5 text-xs font-medium rounded-md ${turf.is_approved ? 'bg-turf/10 text-turf' : 'bg-amber/10 text-amber'}`}>{turf.is_approved ? 'Active' : 'Pending'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                  {allBookings.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-10 text-center text-chalk-dim">No bookings yet.</td></tr>
                  ) : allBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-pitch-700/20 transition-colors">
                      <td className="px-5 py-3 text-chalk">{b.user?.full_name || 'User'}</td>
                      <td className="px-5 py-3 text-chalk-muted">{b.turf?.name || '—'}</td>
                      <td className="px-5 py-3 text-chalk-muted font-mono text-xs">{new Date(b.created_at).toLocaleDateString('en-IN')}</td>
                      <td className="px-5 py-3 font-mono font-bold text-turf">{formatCurrency(b.total_amount)}</td>
                      <td className="px-5 py-3"><span className={`px-2 py-0.5 text-xs font-medium rounded-md ${b.status === 'confirmed' ? 'bg-turf/10 text-turf' : b.status === 'cancelled' ? 'bg-danger/10 text-danger' : 'bg-amber/10 text-amber'}`}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
