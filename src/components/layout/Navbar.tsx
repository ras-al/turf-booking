'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { Home, Search, Calendar, User, LogIn, LogOut, LayoutDashboard, Shield, Heart, Bell, MapPin } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

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
        <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => alert('Location selection coming soon!')}>
          <MapPin className="w-5 h-5 text-gray-900" />
          <span className="text-base font-bold text-gray-900">Mumbai, India</span>
          <svg className="w-4 h-4 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <button className="relative p-2" onClick={() => alert('No new notifications')}>
          <Bell className="w-6 h-6 text-gray-900" />
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
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
    </>
  );
}
