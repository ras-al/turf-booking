'use client';

import Link from 'next/link';
import { ChevronLeft, Copy, Check, PartyPopper } from 'lucide-react';
import { useState } from 'react';

export default function InvitePage() {
  const [copied, setCopied] = useState(false);
  const code = 'PLAYFIELD200';

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* MOBILE */}
      <div className="md:hidden pb-20">
        <div className="px-4 pt-2 pb-3 flex items-center gap-3">
          <Link href="/profile" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Invite Friends</h1>
        </div>

        <div className="px-6 pt-4 pb-6 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <PartyPopper className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900">
            Invite your friends &amp;<br />get <span className="text-green-600">₹200 OFF</span>
          </h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Your friend also gets ₹200 OFF on<br />their first booking.
          </p>
        </div>

        <div className="px-4 mb-6">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 flex items-center justify-between">
            <span className="text-lg font-mono font-bold text-gray-900 tracking-wider">{code}</span>
            <button onClick={handleCopy} className="flex items-center gap-1.5 text-sm font-semibold text-green-600">
              {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
            </button>
          </div>
        </div>

        <div className="px-4 space-y-3">
          <button className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-green-600/20">
            Invite via WhatsApp
          </button>
          <button className="w-full py-3 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
            More Options
          </button>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md w-full pf-card rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <PartyPopper className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Invite Friends</h2>
          <p className="text-gray-500 text-sm mb-6">Share your code and both get ₹200 OFF</p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between mb-6">
            <span className="text-xl font-mono font-bold text-gray-900 tracking-wider">{code}</span>
            <button onClick={handleCopy} className="flex items-center gap-1.5 text-sm font-semibold text-green-600">
              {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
            </button>
          </div>
          <button className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl text-sm shadow-sm">Invite via WhatsApp</button>
        </div>
      </div>
    </div>
  );
}
