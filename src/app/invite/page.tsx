'use client';

import Link from 'next/link';
import { ChevronLeft, Copy, Check, Gift, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';

function generateReferralCode(userId: string): string {
  // Deterministic 8-char code from user ID
  const hash = userId.replace(/-/g, '').slice(0, 6).toUpperCase();
  return `PF${hash}`;
}

export default function InvitePage() {
  const [copied, setCopied] = useState(false);
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push('/auth?redirect=/invite');
  }, [user, isLoading, router]);

  if (isLoading) return <div className="min-h-dvh flex items-center justify-center"><div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return null;

  const code = generateReferralCode(user.id);
  const shareText = `Join PlayField and book sports turfs instantly! Use my code ${code} to get ₹200 OFF your first booking. Download now: ${window?.location?.origin || 'https://playfield.app'}`;
  const waLink = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMoreOptions = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'PlayField — ₹200 OFF', text: shareText, url: window.location.origin }); }
      catch { /* dismissed */ }
    } else {
      navigator.clipboard.writeText(shareText);
    }
  };

  return (
    <div className="min-h-dvh bg-white">
      {/* MOBILE */}
      <div className="md:hidden pb-24">
        <div className="px-4 pt-2 pb-3 flex items-center gap-3 border-b border-gray-100">
          <Link href="/profile" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center min-h-[44px] min-w-[44px]">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Invite Friends</h1>
        </div>

        {/* Illustration */}
        <div className="px-6 pt-8 pb-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Gift className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900">
            Invite your friends &amp;<br />get <span className="text-green-600">₹200 OFF</span>
          </h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Your friend also gets ₹200 OFF on<br />their first booking.
          </p>
        </div>

        {/* Referral Code */}
        <div className="px-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex items-center justify-between">
            <span className="text-lg font-mono font-bold text-gray-900 tracking-wider">{code}</span>
            <button onClick={handleCopy} className="flex items-center gap-1.5 text-sm font-semibold text-green-600 min-h-[44px] px-2">
              {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
            </button>
          </div>
        </div>

        <div className="px-4 space-y-3">
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 bg-green-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-green-600/20 min-h-[52px]">
            <MessageCircle className="w-5 h-5" /> Invite via WhatsApp
          </a>
          <button onClick={handleMoreOptions}
            className="w-full py-3.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors min-h-[44px]">
            More Options
          </button>
        </div>
        <div className="px-4 mt-8">
          <h3 className="text-base font-bold text-gray-900 mb-3">Your Rewards Tracker</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-gray-900 mb-1">0</span>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Friends Joined</span>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-green-700 mb-1">₹0</span>
              <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">Earned</span>
            </div>
          </div>
          <p className="text-xs text-center text-gray-400 mt-4">Rewards are credited after your friend's first completed booking.</p>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:flex min-h-screen items-center justify-center px-4 bg-gray-50">
        <div className="max-w-md w-full pf-card rounded-3xl p-8 text-center bg-white shadow-sm border border-gray-100">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center">
              <Gift className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Invite Friends</h2>
          <p className="text-gray-500 text-base mb-8">Share your code and both get ₹200 OFF on your next booking.</p>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl px-6 py-5 flex items-center justify-between mb-8">
            <span className="text-2xl font-mono font-bold text-gray-900 tracking-wider">{code}</span>
            <button onClick={handleCopy} className="flex items-center gap-2 text-sm font-bold text-green-600 bg-green-50 px-4 py-2 rounded-xl transition-colors hover:bg-green-100">
              {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
            </button>
          </div>
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 bg-green-600 hover:bg-green-700 transition-colors text-white font-bold rounded-2xl text-base shadow-sm mb-4">
            <MessageCircle className="w-5 h-5" /> Invite via WhatsApp
          </a>
          <button onClick={handleMoreOptions} className="w-full py-3 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors mb-8">More Options</button>
          
          <div className="border-t border-gray-100 pt-8">
            <h3 className="text-sm font-bold text-gray-900 mb-4 text-left">Your Rewards Tracker</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col items-start">
                <span className="text-3xl font-black text-gray-900 mb-1">0</span>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Friends Joined</span>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex flex-col items-start">
                <span className="text-3xl font-black text-green-700 mb-1">₹0</span>
                <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">Earned</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
