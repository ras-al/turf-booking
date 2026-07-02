'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchAllTurfs, fetchAllProfiles, fetchAllBookings, fetchAdminStats, updateTurfApproval } from '@/lib/supabase/queries';
import { formatCurrency, SPORT_ICONS } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import type { Turf, Profile, Booking } from '@/types';
import { Users, Building, Trophy, Clock, ClipboardList, IndianRupee, Star, Loader2, CheckCircle, XCircle, Search } from 'lucide-react';

const ADMIN_TABS = ['Overview', 'Users', 'Turfs', 'Bookings'] as const;

export default function AdminPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<typeof ADMIN_TABS[number]>('Overview');
  const [allTurfs, setAllTurfs] = useState<Turf[]>([]);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalOwners: 0, totalTurfs: 0, pendingApprovals: 0, totalBookings: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
  };

  const pendingTurfs = allTurfs.filter((t) => !t.is_approved);

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
              <h1 className="text-2xl font-extrabold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500 mt-0.5">Welcome, {user?.full_name || 'Admin'}</p>
            </div>
            {stats.pendingApprovals > 0 && (
              <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                {stats.pendingApprovals} pending approval{stats.pendingApprovals > 1 ? 's' : ''}
              </div>
            )}
          </div>
          <div className="flex gap-1 mt-4 overflow-x-auto">
            {ADMIN_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pf-tab ${activeTab === tab ? 'pf-tab-active' : ''}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Overview */}
        {activeTab === 'Overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: <Users className="w-5 h-5" />, color: 'text-gray-700', bg: 'bg-gray-100' },
                { label: 'Total Owners', value: stats.totalOwners, icon: <Building className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-100' },
                { label: 'Total Turfs', value: stats.totalTurfs, icon: <Trophy className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-100' },
                { label: 'Pending', value: stats.pendingApprovals, icon: <Clock className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-100' },
                { label: 'Bookings', value: stats.totalBookings, icon: <ClipboardList className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-100' },
                { label: 'Revenue', value: formatCurrency(stats.totalRevenue), icon: <IndianRupee className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-100' },
              ].map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="pf-stat-card">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} mb-3`}>{stat.icon}</div>
                  <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Pending Approvals Quick View */}
            {pendingTurfs.length > 0 && (
              <div className="pf-card rounded-2xl overflow-hidden border-amber-200">
                <div className="px-5 py-4 border-b border-gray-100 bg-amber-50 flex items-center justify-between">
                  <h3 className="text-base font-bold text-amber-800">Pending Approvals</h3>
                  <button onClick={() => setActiveTab('Turfs')} className="text-xs font-semibold text-amber-600">View All</button>
                </div>
                <div className="p-4 space-y-2">
                  {pendingTurfs.slice(0, 3).map((turf) => (
                    <div key={turf.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                      <div>
                        <div className="text-sm font-bold text-gray-900">{turf.name}</div>
                        <div className="text-xs text-gray-500">{turf.city} &middot; {turf.sports.join(', ')}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(turf.id)} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"><CheckCircle className="w-4 h-4" /></button>
                        <button onClick={() => handleReject(turf.id)} className="p-2 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 transition-colors"><XCircle className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'Users' && (
          <div className="pf-card rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">User Management</h3>
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" /><input type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 text-sm rounded-lg text-gray-900 placeholder-gray-400 outline-none focus:border-green-400 w-48" /></div>
            </div>
            <div className="overflow-x-auto">
              <table className="pf-table">
                <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
                <tbody>
                  {allUsers.filter(u => !searchQuery || u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())).map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-green-100 border border-green-200 flex items-center justify-center text-green-700 text-xs font-bold">{u.full_name.charAt(0)}</div>
                          <span className="font-medium text-gray-900">{u.full_name}</span>
                        </div>
                      </td>
                      <td className="text-gray-500">{u.email}</td>
                      <td><span className={`px-2 py-0.5 text-xs font-semibold rounded-md capitalize ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' : u.role === 'owner' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span></td>
                      <td className="text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Turfs Tab */}
        {activeTab === 'Turfs' && (
          <div className="space-y-6">
            {pendingTurfs.length > 0 && (
              <div className="pf-card rounded-2xl overflow-hidden border-amber-200">
                <div className="px-5 py-4 border-b border-gray-100 bg-amber-50"><h3 className="text-base font-bold text-amber-800">Pending Approvals ({pendingTurfs.length})</h3></div>
                <div className="p-4 space-y-2">
                  {pendingTurfs.map((turf) => (
                    <div key={turf.id} className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-100">
                      <div><div className="text-sm font-bold text-gray-900">{turf.name}</div><div className="text-xs text-gray-500">{turf.city} &middot; {turf.sports.join(', ')} &middot; {formatCurrency(turf.price_per_hour)}/hr</div></div>
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(turf.id)} className="px-4 py-2 text-xs font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">Approve</button>
                        <button onClick={() => handleReject(turf.id)} className="px-4 py-2 text-xs font-bold bg-white text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="pf-card rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100"><h3 className="text-base font-bold text-gray-900">All Turfs ({allTurfs.length})</h3></div>
              <div className="overflow-x-auto">
                <table className="pf-table">
                  <thead><tr><th>Turf</th><th>City</th><th>Sports</th><th>Price</th><th>Rating</th><th>Status</th></tr></thead>
                  <tbody>
                    {allTurfs.map((turf) => (
                      <tr key={turf.id}>
                        <td className="font-medium text-gray-900">{turf.name}</td>
                        <td className="text-gray-500">{turf.city}</td>
                        <td><span className="flex gap-1.5 items-center">{turf.sports.map((s) => <div key={s} className="w-4 h-4 [&>svg]:w-full [&>svg]:h-full text-gray-400">{SPORT_ICONS[s]}</div>)}</span></td>
                        <td className="font-bold text-green-600">{formatCurrency(turf.price_per_hour)}</td>
                        <td className="text-gray-600"><Star className="w-3.5 h-3.5 text-amber fill-amber inline-block mr-1" />{turf.avg_rating}</td>
                        <td><span className={`px-2 py-0.5 text-xs font-semibold rounded-md ${turf.is_approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{turf.is_approved ? 'Active' : 'Pending'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'Bookings' && (
          <div className="pf-card rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100"><h3 className="text-base font-bold text-gray-900">All Bookings ({allBookings.length})</h3></div>
            <div className="overflow-x-auto">
              <table className="pf-table">
                <thead><tr><th>Player</th><th>Turf</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  {allBookings.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">No bookings yet.</td></tr>
                  ) : allBookings.map((b) => (
                    <tr key={b.id}>
                      <td className="font-medium text-gray-900">{b.user?.full_name || 'User'}</td>
                      <td className="text-gray-500">{b.turf?.name || '—'}</td>
                      <td className="text-gray-400 font-mono text-xs">{new Date(b.created_at).toLocaleDateString('en-IN')}</td>
                      <td className="font-bold text-green-600">{formatCurrency(b.total_amount)}</td>
                      <td><span className={`px-2 py-0.5 text-xs font-semibold rounded-md capitalize ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' : b.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>{b.status}</span></td>
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
