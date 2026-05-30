'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';
import { Menu, X, LogIn } from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuthStore();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/turfs', label: 'Find Turfs' },
  ];

  const authLinks = user
    ? [
        ...(user.role === 'owner'
          ? [{ href: '/dashboard', label: 'Dashboard' }]
          : []),
        ...(user.role === 'admin'
          ? [{ href: '/admin', label: 'Admin' }]
          : []),
        { href: '/booking/history', label: 'My Bookings' },
      ]
    : [];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-pitch-900/70 backdrop-blur-2xl border-b border-pitch-600/30">
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
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-chalk-muted hover:text-chalk transition-colors rounded-lg hover:bg-pitch-700/40"
              >
                {link.label}
              </Link>
            ))}
            {authLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-chalk-muted hover:text-chalk transition-colors rounded-lg hover:bg-pitch-700/40"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Button */}
          <div className="hidden md:flex items-center gap-3">
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-chalk-muted hover:text-chalk transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-pitch-800/95 backdrop-blur-xl border-b border-pitch-600/30 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {[...navLinks, ...authLinks].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-chalk-muted hover:text-chalk hover:bg-pitch-700/50 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <Link
                  href="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-sm font-semibold text-pitch-900 bg-turf rounded-lg text-center mt-3"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
