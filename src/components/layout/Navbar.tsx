'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';
import { Home, Search, Calendar, User, LogIn, Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user } = useAuthStore();
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/turfs', label: 'Find Turfs', icon: Search },
  ];

  const authLinks = user
    ? [
        { href: '/booking/history', label: 'Bookings', icon: Calendar },
        ...(user.role === 'owner' ? [{ href: '/dashboard', label: 'Dashboard', icon: User }] : []),
        ...(user.role === 'admin' ? [{ href: '/admin', label: 'Admin', icon: User }] : []),
        { href: '/profile', label: 'Profile', icon: User }, // Or just a placeholder if profile doesn't exist
      ]
    : [
        { href: '/auth', label: 'Sign In', icon: LogIn }
      ];

  // Pick max 4 icons for mobile bottom nav
  const mobileNavLinks = [...navLinks];
  if (user) {
    mobileNavLinks.push({ href: '/booking/history', label: 'Bookings', icon: Calendar });
    if (user.role === 'owner') mobileNavLinks.push({ href: '/dashboard', label: 'Dashboard', icon: User });
    else if (user.role === 'admin') mobileNavLinks.push({ href: '/admin', label: 'Admin', icon: User });
    else mobileNavLinks.push({ href: '/profile', label: 'Profile', icon: User });
  } else {
    mobileNavLinks.push({ href: '/auth', label: 'Sign In', icon: LogIn });
  }

  // Ensure only 4 items max for mobile to look good
  const finalMobileLinks = mobileNavLinks.slice(0, 4);

  return (
    <>
      {/* Desktop Top Navbar */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-pitch-900/70 backdrop-blur-2xl border-b border-pitch-600/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-turf flex items-center justify-center text-pitch-900 font-bold text-lg font-display transition-all group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-turf/30">
                T
              </div>
              <span className="text-xl font-display tracking-wider text-chalk">
                TURF<span className="text-turf">BOOK</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-pitch-700/40 ${
                    pathname === link.href ? 'text-turf bg-turf/10' : 'text-chalk-muted hover:text-chalk'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <Link
                  href="/booking/history"
                  className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-pitch-700/40 ${
                    pathname === '/booking/history' ? 'text-turf bg-turf/10' : 'text-chalk-muted hover:text-chalk'
                  }`}
                >
                  My Bookings
                </Link>
              )}
              {user?.role === 'owner' && (
                <Link
                  href="/dashboard"
                  className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-pitch-700/40 ${
                    pathname === '/dashboard' ? 'text-turf bg-turf/10' : 'text-chalk-muted hover:text-chalk'
                  }`}
                >
                  Dashboard
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-pitch-700/40 ${
                    pathname === '/admin' ? 'text-turf bg-turf/10' : 'text-chalk-muted hover:text-chalk'
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>

            {/* Auth Button */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-turf/15 border border-turf/30 flex items-center justify-center text-turf text-sm font-semibold">
                    {user.full_name.charAt(0)}
                  </div>
                  <span className="text-sm text-chalk-muted">{user.full_name}</span>
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="px-5 py-2 text-sm font-semibold bg-turf text-pitch-900 rounded-lg hover:bg-turf-light transition-all hover:shadow-lg hover:shadow-turf/25 flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Header (Wireframe style) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-turf/20 border-2 border-turf/30 flex items-center justify-center overflow-hidden">
            {user ? (
              <span className="text-turf font-bold text-lg">{user.full_name.charAt(0)}</span>
            ) : (
              <User className="w-5 h-5 text-turf" />
            )}
          </div>
          <div>
            <p className="text-xs text-chalk-dim font-medium">Welcome back,</p>
            <p className="text-sm font-display tracking-wide text-chalk">
              {user ? user.full_name : 'Guest Player'}
            </p>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full bg-pitch-800/80 backdrop-blur-sm border border-pitch-600/50 flex items-center justify-center text-chalk hover:text-turf transition-colors">
          <Bell className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-pitch-900/90 backdrop-blur-xl border-t border-pitch-600/50 pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          {finalMobileLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            const Icon = link.icon;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all ${
                  isActive ? 'text-turf' : 'text-chalk-muted hover:text-chalk'
                }`}
              >
                <div className={`p-1.5 rounded-full transition-colors ${isActive ? 'bg-turf/15' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
