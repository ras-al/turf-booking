'use client';

import { ChevronLeft, Trophy, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ComingSoonPage() {
  return (
    <div className="min-h-dvh bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg ring-2 ring-emerald-500/30 bg-emerald-950 mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="KiKKO" className="w-full h-full object-contain" />
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold uppercase tracking-wider mb-4 border border-emerald-200">
        <Trophy className="w-3.5 h-3.5" />
        Coming Soon
      </div>

      <h1 className="text-3xl font-black text-gray-900 mb-2 font-sans">
        Feature In Progress
      </h1>
      <p className="text-xs font-bold tracking-widest text-emerald-600 uppercase mb-4">
        KiKKO &bull; FIND. BOOK. PLAY.
      </p>
      <p className="text-gray-500 mb-8 max-w-sm text-sm">
        We&apos;re building something exciting for sports enthusiasts and turf owners. Stay tuned!
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Link 
          href="/tournaments" 
          className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20"
        >
          View Tournaments <ArrowRight className="w-4 h-4" />
        </Link>
        <Link 
          href="/" 
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
}
