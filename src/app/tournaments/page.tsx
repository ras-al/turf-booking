'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { Trophy, Users, Award, Bell, ArrowRight, Activity, Zap, Wind } from 'lucide-react';

export default function TournamentsPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-dvh bg-white">
      {/* ── Plain Solid Hero Section ── */}
      <section className="bg-white border-b border-gray-200 py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo Badge in Hero */}
          <div className="flex flex-col items-center justify-center mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/logo.png" 
              alt="KiKKO" 
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md" 
            />
          </div>

          {/* Solid Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-widest mb-5">
            <Trophy className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tournaments &bull; Coming Soon</span>
          </div>

          {/* Solid Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 leading-tight font-sans">
            The Ultimate Turf Leagues Are Coming to <span className="text-emerald-600">KiKKO</span>
          </h1>

          {/* Plain Tagline */}
          <p className="text-base sm:text-lg text-gray-600 font-medium max-w-2xl mx-auto mt-4">
            FIND. BOOK. PLAY. Compete with top local squads, climb regional leaderboards, and take home the cup.
          </p>

          {/* Sports Highlights (Clean Solid Badges) */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 mt-6 text-xs sm:text-sm font-bold text-gray-800">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Football 5v5</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Box Cricket</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl">
              <Wind className="w-4 h-4 text-emerald-600" />
              <span>Badminton Smash</span>
            </div>
          </div>

          {/* Plain Notify Form */}
          <div className="mt-8 max-w-md mx-auto w-full px-2">
            {submitted ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 text-emerald-600" />
                <span>You&apos;re on the priority waitlist! We&apos;ll notify you first.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="email" 
                  required
                  placeholder="Enter email for early bird registration" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600 text-sm shadow-2xs"
                />
                <button 
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0 shadow-xs"
                >
                  <Bell className="w-4 h-4" />
                  Notify Me
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── Upcoming Formats (Plain Solid Cards) ── */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">What to Expect</h2>
          <p className="text-gray-500 text-sm sm:text-base mt-2">Professional turf competition crafted for passionate athletes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              sport: 'Football',
              icon: Activity,
              title: 'KiKKO Turf Premier Cup',
              desc: 'High-octane 5-a-side and 7-a-side knockout tournaments with official referees, video highlights, and cash rewards.',
              tag: 'Coming Q2',
            },
            {
              sport: 'Cricket',
              icon: Zap,
              title: 'Box Cricket Super League',
              desc: 'Under-the-lights box cricket action. Power-plays, live scoring, and trophies for Champions, Runner-ups, and MVP.',
              tag: 'Coming Q2',
            },
            {
              sport: 'Badminton',
              icon: Wind,
              title: 'Smash Open Championship',
              desc: 'Singles and Doubles brackets on premium wooden and synthetic courts. Real-time bracket tracking on KiKKO.',
              tag: 'Coming Q3',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-6 rounded-2xl border border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-700">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                  <span>Team Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Feature Highlights (Plain Gray Section) ── */}
      <section className="py-12 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div className="p-3 sm:p-4">
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-5 sm:w-6 h-5 sm:h-6" />
              </div>
              <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Verified Referees</h4>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-1">Official match officiating</p>
            </div>
            <div className="p-3 sm:p-4">
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto mb-3">
                <Zap className="w-5 sm:w-6 h-5 sm:h-6" />
              </div>
              <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Live Scoreboards</h4>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-1">Instant digital match points</p>
            </div>
            <div className="p-3 sm:p-4">
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto mb-3">
                <Users className="w-5 sm:w-6 h-5 sm:h-6" />
              </div>
              <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Team Rosters</h4>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-1">Manage squad &amp; substitutes</p>
            </div>
            <div className="p-3 sm:p-4">
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto mb-3">
                <Award className="w-5 sm:w-6 h-5 sm:h-6" />
              </div>
              <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Exciting Rewards</h4>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-1">Cash prizes, kits &amp; trophies</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-12 sm:py-16 text-center px-4 bg-white">
        <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2">Want to practice before the league?</h3>
        <p className="text-gray-500 text-xs sm:text-sm mb-6 max-w-md mx-auto">Book slots at top rated turfs near you and gear up with your squad today.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xs sm:max-w-none mx-auto">
          <Link
            href="/turfs"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-xs"
          >
            Find Turfs Now
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </section>
    </div>
  );
}
