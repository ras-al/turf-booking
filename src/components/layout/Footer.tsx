import Link from 'next/link';
import { Activity, Zap, Wind, Trophy } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 mb-3 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/logo.png" 
                alt="KiKKO" 
                className="w-11 h-11 object-contain drop-shadow-sm group-hover:scale-105 transition-transform" 
              />
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight leading-none text-gray-900 font-sans">
                  Ki<span className="text-emerald-600">KKO</span>
                </span>
                <span className="text-[9px] font-extrabold tracking-widest text-emerald-700 uppercase mt-0.5">
                  FIND &bull; BOOK &bull; PLAY
                </span>
              </div>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              FIND. BOOK. PLAY. Discover and reserve the best sports turfs near you in real-time.
            </p>
            {/* SVG sports indicators (NO keyboard emojis) */}
            <div className="mt-3 flex items-center gap-3 text-emerald-600">
              <div className="flex items-center gap-1 text-xs font-semibold text-gray-600">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px]">Football</span>
              </div>
              <span className="text-gray-300 text-xs">&bull;</span>
              <div className="flex items-center gap-1 text-xs font-semibold text-gray-600">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px]">Cricket</span>
              </div>
              <span className="text-gray-300 text-xs">&bull;</span>
              <div className="flex items-center gap-1 text-xs font-semibold text-gray-600">
                <Wind className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px]">Badminton</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { href: '/turfs', label: 'Find Turfs' },
                { href: '/tournaments', label: 'Tournaments', badge: 'Soon' },
                { href: '/auth', label: 'Sign In' },
                { href: '/booking/history', label: 'My Bookings' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-emerald-600 transition-colors inline-flex items-center gap-2">
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-700 rounded-full">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sports */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-5">
              Sports
            </h4>
            <ul className="space-y-3">
              {['Football', 'Cricket', 'Badminton', 'Basketball', 'Tennis'].map((sport) => (
                <li key={sport}>
                  <Link href={`/turfs?sport=${sport.toLowerCase()}`} className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">
                    {sport}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Owners */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-5">
              For Owners
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/auth?role=owner" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">
                  Register Your Turf
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">
                  Owner Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            &copy; {new Date().getFullYear()} KiKKO. All rights reserved. &bull; FIND. BOOK. PLAY.
          </p>
        </div>
      </div>
    </footer>
  );
}
