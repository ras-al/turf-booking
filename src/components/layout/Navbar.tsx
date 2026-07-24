'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { useFilterStore } from '@/stores/filter-store';
import { Home, Search, Calendar, User, LogIn, LogOut, LayoutDashboard, Shield, Heart, Bell, MapPin, X, Crosshair, Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchNotifications, markAllNotificationsRead, fetchUnreadNotificationCount, fetchDistinctCities } from '@/lib/supabase/queries';
import type { Notification } from '@/types';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { filters, setFilter } = useFilterStore();
  const pathname = usePathname();
  const router = useRouter();
  
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [tempCity, setTempCity] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [cities, setCities] = useState<string[]>([]);

  // Notification state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  const currentCity = filters.city || 'Mumbai, India';

  // Load cities for dropdown
  useEffect(() => {
    fetchDistinctCities().then(setCities).catch(() => {});
  }, []);

  // Load unread count
  useEffect(() => {
    if (user) {
      fetchUnreadNotificationCount(user.id).then(setUnreadCount).catch(() => {});
    }
  }, [user]);

  // Close notifications on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showNotifications]);

  const handleOpenNotifications = useCallback(async () => {
    if (!user) return;
    setShowNotifications(prev => !prev);
    if (!showNotifications) {
      try {
        const notifs = await fetchNotifications(user.id);
        setNotifications(notifs);
        if (unreadCount > 0) {
          await markAllNotificationsRead(user.id);
          setUnreadCount(0);
        }
      } catch { /* ignore */ }
    }
  }, [user, showNotifications, unreadCount]);

  // Auto-detect location on first visit
  useEffect(() => {
    if (typeof window !== 'undefined' && !filters.city && !sessionStorage.getItem('pf_location_checked')) {
      sessionStorage.setItem('pf_location_checked', 'true');
      handleGetLocation();
    }
  }, [filters.city]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          // Extract city or town
          const city = data.address.city || data.address.town || data.address.state_district || data.address.state || 'Unknown Location';
          setFilter('city', city);
          setTempCity(city);
          setShowLocationModal(false);
        } catch (error) {
          console.warn("Error fetching location details", error);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.warn("Geolocation skipped or failed (HTTPS required)", error.message);
        setIsLocating(false);
      }
    );
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Desktop nav links
  const getDesktopNavLinks = () => {
    if (!user) {
      return [
        { href: '/', label: 'Home' },
        { href: '/turfs', label: 'Find Turfs' },
      ];
    }
    switch (user.role) {
      case 'admin':
        return [
          { href: '/admin', label: 'Dashboard' },
        ];
      case 'owner':
        return [
          { href: '/', label: 'Home' },
          { href: '/turfs', label: 'Find Turfs' },
          { href: '/dashboard', label: 'Dashboard' },
        ];
      default:
        return [
          { href: '/', label: 'Home' },
          { href: '/turfs', label: 'Find Turfs' },
          { href: '/booking/history', label: 'My Bookings' },
        ];
    }
  };

  // Mobile bottom nav links (4 fixed tabs)
  const getMobileNavLinks = () => {
    if (!user) {
      return [
        { href: '/', label: 'Home', icon: Home },
        { href: '/booking/history', label: 'Bookings', icon: Calendar },
        { href: '/favorites', label: 'Favorites', icon: Heart },
        { href: '/auth', label: 'Profile', icon: User },
      ];
    }
    switch (user.role) {
      case 'admin':
        return [
          { href: '/admin', label: 'Dashboard', icon: Shield },
          { href: '/booking/history', label: 'Bookings', icon: Calendar },
          { href: '/', label: 'Home', icon: Home },
          { href: '/profile', label: 'Account', icon: User },
        ];
      case 'owner':
        return [
          { href: '/', label: 'Home', icon: Home },
          { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/booking/history', label: 'Bookings', icon: Calendar },
          { href: '/profile', label: 'Profile', icon: User },
        ];
      default:
        return [
          { href: '/', label: 'Home', icon: Home },
          { href: '/booking/history', label: 'Bookings', icon: Calendar },
          { href: '/favorites', label: 'Favorites', icon: Heart },
          { href: '/profile', label: 'Profile', icon: User },
        ];
    }
  };

  const desktopLinks = getDesktopNavLinks();
  const mobileLinks = getMobileNavLinks();

  return (
    <>
      {/* ═══════════════════════════════════════
          DESKTOP — Clean White Top Navbar
          ═══════════════════════════════════════ */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-full border-2 border-green-600 flex items-center justify-center bg-green-50 transition-all group-hover:scale-105 group-hover:bg-green-100">
                <span className="text-green-700 font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-gray-900">
                PLAY<span className="text-green-600">FIELD</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="flex items-center gap-1">
              {desktopLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                    pathname === link.href
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth Section */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  {/* Desktop notification bell */}
                  <div className="relative" ref={notifRef}>
                    <button onClick={handleOpenNotifications} className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <Bell className="w-5 h-5 text-gray-600" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                      )}
                    </button>
                    <AnimatePresence>
                      {showNotifications && (
                        <motion.div
                          initial={{ opacity: 0, y: -5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -5, scale: 0.95 }}
                          className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden"
                        >
                          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                          </div>
                          <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                              <div className="px-4 py-8 text-center">
                                <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">No notifications yet</p>
                              </div>
                            ) : (
                              notifications.map((n) => (
                                <div key={n.id} className={`px-4 py-3 border-b border-gray-50 last:border-0 ${!n.is_read ? 'bg-green-50/50' : ''}`}>
                                  <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                                  {n.body && <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>}
                                  <p className="text-[10px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 border border-green-200 flex items-center justify-center text-green-700 text-sm font-bold">
                      {user.full_name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800 leading-none">{user.full_name}</span>
                      <span className="text-[10px] text-gray-400 capitalize">{user.role}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="px-5 py-2 text-sm font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════
          MOBILE — Top Header (ui.png style)
          ═══════════════════════════════════════ */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 bg-white">
        <div 
          className="flex items-center gap-1.5 cursor-pointer" 
          onClick={() => { setTempCity(filters.city || ''); setShowLocationModal(true); }}
        >
          <MapPin className="w-5 h-5 text-gray-900" />
          <span className="text-base font-bold text-gray-900 truncate max-w-[160px]">{currentCity}</span>
          <svg className="w-4 h-4 text-gray-900 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <div className="relative" ref={notifRef}>
          <button className="relative p-2" onClick={handleOpenNotifications}>
            <Bell className="w-6 h-6 text-gray-900" />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>
          {/* Mobile notification dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                className="absolute right-0 top-12 w-[calc(100vw-32px)] max-w-sm bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                  <button onClick={() => setShowNotifications(false)} className="p-1">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className={`px-4 py-3 border-b border-gray-50 last:border-0 ${!n.is_read ? 'bg-green-50/50' : ''}`}>
                        <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                        {n.body && <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>}
                        <p className="text-[10px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          MOBILE — Bottom Navigation (ui.png)
          ═══════════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around h-[68px] px-2">
          {mobileLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all ${
                  isActive ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[11px] ${isActive ? 'font-bold' : 'font-medium'}`}>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ═══════════════════════════════════════
          Location Selection Modal
          ═══════════════════════════════════════ */}
      <AnimatePresence>
        {showLocationModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-lg">Select Location</h3>
                <button 
                  onClick={() => setShowLocationModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:scale-95"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="p-5 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                  <input 
                    type="text" 
                    placeholder="E.g. Mumbai, Delhi..." 
                    value={tempCity} 
                    onChange={e => setTempCity(e.target.value)} 
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        setFilter('city', tempCity.trim() || undefined);
                        setShowLocationModal(false);
                      }
                    }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-400"
                  autoFocus
                />
                </div>

                {/* City quick-pick buttons */}
                {cities.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Popular Cities</label>
                    <div className="flex flex-wrap gap-2">
                      {cities.slice(0, 8).map(city => (
                        <button
                          key={city}
                          onClick={() => {
                            setFilter('city', city);
                            setTempCity(city);
                            setShowLocationModal(false);
                          }}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                            tempCity === city
                              ? 'bg-green-50 border-green-300 text-green-700'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="mt-3 flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700 disabled:opacity-50"
                >
                  {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
                  {isLocating ? 'Detecting...' : 'Use Current Location'}
                </button>
              </div>
              <div className="px-5 pb-5">
                <button 
                  onClick={() => { 
                    setFilter('city', tempCity.trim() || undefined); 
                    setShowLocationModal(false); 
                  }} 
                  className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl shadow-sm active:scale-[0.98] transition-transform"
                >
                  Save Location
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
