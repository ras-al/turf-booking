'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { useFilterStore } from '@/stores/filter-store';
import { requestCoordinates, reverseGeocode } from '@/lib/location';
import { Home, Search, Calendar, User, LogIn, LogOut, LayoutDashboard, Shield, Heart, Bell, MapPin, X, Crosshair, Loader2, Trophy } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchNotifications, markAllNotificationsRead, fetchUnreadNotificationCount, fetchDistinctCities } from '@/lib/supabase/queries';
import type { Notification } from '@/types';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { filters, setFilter, userCoords, userCity, setUserLocation, setLocationStatus } = useFilterStore();
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

  const displayCity = userCity || filters.city || 'Detect Location';

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
    if (typeof window !== 'undefined' && !userCoords && !sessionStorage.getItem('kikko_location_prompted')) {
      sessionStorage.setItem('kikko_location_prompted', 'true');
      handleGetLocation();
    }
  }, [userCoords]);

  const handleGetLocation = async () => {
    setIsLocating(true);
    setLocationStatus('requesting');
    try {
      const coords = await requestCoordinates();
      const detectedCity = await reverseGeocode(coords.latitude, coords.longitude);
      setUserLocation([coords.latitude, coords.longitude], detectedCity);
      setFilter('city', detectedCity);
      setTempCity(detectedCity);
      setShowLocationModal(false);
    } catch (error) {
      console.warn("Geolocation skipped or failed", error);
      setLocationStatus('denied');
    } finally {
      setIsLocating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  interface NavLink {
    href: string;
    label: string;
    badge?: string;
  }

  // Desktop nav links
  const getDesktopNavLinks = (): NavLink[] => {
    if (!user) {
      return [
        { href: '/', label: 'Home' },
        { href: '/turfs', label: 'Find Turfs' },
        { href: '/tournaments', label: 'Tournaments', badge: 'Coming Soon' },
      ];
    }
    switch (user.role) {
      case 'admin':
        return [
          { href: '/admin', label: 'Dashboard' },
          { href: '/tournaments', label: 'Tournaments', badge: 'Coming Soon' },
        ];
      case 'owner':
        return [
          { href: '/', label: 'Home' },
          { href: '/turfs', label: 'Find Turfs' },
          { href: '/tournaments', label: 'Tournaments', badge: 'Coming Soon' },
          { href: '/dashboard', label: 'Dashboard' },
        ];
      default:
        return [
          { href: '/', label: 'Home' },
          { href: '/turfs', label: 'Find Turfs' },
          { href: '/tournaments', label: 'Tournaments', badge: 'Coming Soon' },
          { href: '/booking/history', label: 'My Bookings' },
        ];
    }
  };

  interface MobileNavLink {
    href: string;
    label: string;
    icon: any;
    badge?: string;
  }

  // Mobile bottom nav links (Includes Tournaments with Trophy icon and Soon badge)
  const getMobileNavLinks = (): MobileNavLink[] => {
    return [
      { href: '/', label: 'Home', icon: Home },
      { href: '/turfs', label: 'Turfs', icon: Search },
      { href: '/tournaments', label: 'Tournaments', icon: Trophy, badge: 'Soon' },
      { href: '/booking/history', label: 'Bookings', icon: Calendar },
      { 
        href: user ? (user.role === 'owner' ? '/dashboard' : '/profile') : '/auth', 
        label: user ? (user.role === 'owner' ? 'Dashboard' : 'Profile') : 'Profile', 
        icon: user && user.role === 'owner' ? LayoutDashboard : User 
      },
    ];
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
            {/* KiKKO Logo — Main Icon + Brand Typography & Quote */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/logo.png" 
                  alt="KiKKO" 
                  className="h-10 w-10 sm:h-11 sm:w-11 object-contain drop-shadow-md group-hover:scale-105 transition-transform" 
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight leading-none text-gray-900 font-sans">
                  Ki<span className="text-emerald-600">KKO</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-extrabold tracking-widest text-emerald-700 uppercase mt-0.5">
                  FIND &bull; BOOK &bull; PLAY
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="flex items-center gap-1.5">
              {desktopLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3.5 py-2 text-sm font-semibold transition-all rounded-xl flex items-center gap-2 ${
                      isActive
                        ? 'text-emerald-700 bg-emerald-50'
                        : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/60'
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-full shadow-xs animate-pulse">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Location Selector */}
            <button 
              onClick={() => { setTempCity(displayCity !== 'Detect Location' ? displayCity : ''); setShowLocationModal(true); }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-emerald-50/60 border border-gray-200 hover:border-emerald-300 text-gray-700 hover:text-emerald-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              title="Change or detect location"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="max-w-[120px] truncate">{displayCity.split(',')[0]}</span>
              <svg className="w-3 h-3 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

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
          MOBILE — Top Header with KiKKO Branding
          ═══════════════════════════════════════ */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-3 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
        {/* Brand / Main Icon */}
        <Link href="/" className="flex items-center gap-1.5 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/logo.png" 
            alt="KiKKO" 
            className="h-8 w-8 object-contain drop-shadow-xs" 
          />
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tight leading-none text-gray-900 font-sans">
              Ki<span className="text-emerald-600">KKO</span>
            </span>
            <span className="text-[7.5px] font-extrabold tracking-wider text-emerald-700 uppercase">
              FIND. BOOK. PLAY.
            </span>
          </div>
        </Link>

        {/* Location selector */}
        <div 
          className="flex items-center gap-1 cursor-pointer bg-gray-50 hover:bg-gray-100 px-2 py-1.5 rounded-full border border-gray-200 transition-colors max-w-[120px] xs:max-w-[140px]" 
          onClick={() => { setTempCity(displayCity !== 'Detect Location' ? displayCity : ''); setShowLocationModal(true); }}
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold text-gray-800 truncate">{displayCity.split(',')[0]}</span>
          <svg className="w-3 h-3 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Tournaments Soon + Notifications */}
        <div className="flex items-center gap-1.5">
          <Link
            href="/tournaments"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200"
            title="Tournaments - Coming Soon"
          >
            <Trophy className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[9px] uppercase tracking-wider font-extrabold">Soon</span>
          </Link>

          <div className="relative" ref={notifRef}>
            <button className="relative p-1.5 text-gray-800 hover:text-gray-950" onClick={handleOpenNotifications} aria-label="Notifications">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
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
    </div>

      {/* ═══════════════════════════════════════
          MOBILE — Bottom Navigation (Includes Tournaments)
          ═══════════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around h-[64px] px-1">
          {mobileLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex flex-col items-center justify-center w-full h-full gap-0.5 transition-all ${
                  isActive ? 'text-emerald-600 font-bold' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  {link.badge && (
                    <span className="absolute -top-1.5 -right-3.5 px-1 py-0.2 bg-emerald-600 text-white text-[7.5px] font-black rounded-full uppercase leading-tight">
                      {link.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{link.label}</span>
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
                            setUserLocation(null, city);
                            setTempCity(city);
                            setShowLocationModal(false);
                          }}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                            tempCity === city
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
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
                  className="mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-50 cursor-pointer"
                >
                  {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
                  {isLocating ? 'Detecting current coordinates...' : 'Use Current Location'}
                </button>
              </div>
              <div className="px-5 pb-5">
                <button 
                  onClick={() => { 
                    const chosen = tempCity.trim();
                    setFilter('city', chosen || undefined); 
                    setUserLocation(userCoords, chosen || null);
                    setShowLocationModal(false); 
                  }} 
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
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
