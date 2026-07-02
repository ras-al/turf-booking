'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';
import {
  Calendar, Heart, CreditCard, Users, HelpCircle, Settings,
  LogOut, ChevronRight
} from 'lucide-react';

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth?redirect=/profile');
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  if (!user) return null;

  const menuItems = [
    { label: 'My Bookings', icon: Calendar, href: '/booking/history' },
    { label: 'Favorites', icon: Heart, href: '/favorites' },
    { label: 'Payment Methods', icon: CreditCard, href: '#' },
    { label: 'Invite Friends', icon: Users, href: '/invite', badge: 'Get ₹200' },
    { label: 'Help & Support', icon: HelpCircle, href: '#' },
    { label: 'Settings', icon: Settings, href: '#' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* MOBILE */}
      <div className="md:hidden pt-14 pb-[84px]">
        <div className="bg-gradient-to-br from-green-600 via-green-500 to-green-400 px-5 pt-8 pb-8 rounded-b-3xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-white text-2xl font-bold">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{user.full_name}</h1>
              <p className="text-sm text-white/80">+91 {user.phone || 'No phone added'}</p>
            </div>
          </div>
        </div>
        <div className="px-4 -mt-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {menuItems.map((item, i) => (
              <Link key={item.label} href={item.href} className={`flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors ${i !== menuItems.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-800">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (<span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{item.badge}</span>)}
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </Link>
            ))}
          </div>
          <button onClick={handleLogout} className="w-full mt-4 flex items-center gap-3 px-5 py-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-red-500">Logout</span>
          </button>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="pf-card rounded-2xl p-8 mb-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-green-100 border-2 border-green-200 flex items-center justify-center text-green-700 text-3xl font-bold">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-gray-900">{user.full_name}</h1>
                  <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                  <span className="inline-block mt-2 px-3 py-1 text-xs font-bold uppercase tracking-wider bg-green-100 text-green-700 border border-green-200 rounded-md">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
            <div className="pf-card rounded-2xl overflow-hidden mb-6">
              {menuItems.map((item, i) => (
                <Link key={item.label} href={item.href} className={`flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors ${i !== menuItems.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className="flex items-center gap-3"><item.icon className="w-5 h-5 text-gray-400" /><span className="text-sm font-medium text-gray-800">{item.label}</span></div>
                  <div className="flex items-center gap-2">
                    {item.badge && (<span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">{item.badge}</span>)}
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </Link>
              ))}
            </div>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-6 py-4 pf-card rounded-2xl hover:bg-red-50 transition-colors">
              <LogOut className="w-5 h-5 text-red-500" /><span className="text-sm font-medium text-red-500">Logout</span>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
