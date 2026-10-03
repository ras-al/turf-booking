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
      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#02180d] via-[#052e1a] to-[#011409] text-white py-14 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8">
        {/* Ambient Turf Glow ("Full Pacha") */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-60 sm:w-80 h-60 sm:h-80 bg-lime-400/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center z-10">
          {/* Logo Badge in Hero */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="flex flex-col items-center justify-center mb-5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/logo.png" 
              alt="KiKKO" 
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-2xl" 
            />
          </motion.div>

          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md shadow-lg"
          >
            <Trophy className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tournaments &bull; Coming Soon</span>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight font-sans"
          >
            The Ultimate Turf Leagues Are Coming to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-lime-300">KiKKO</span>
          </motion.h1>

          {/* Tagline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-emerald-100/80 font-medium max-w-2xl mx-auto mt-4"
          >
            FIND. BOOK. PLAY. Compete with top local squads, climb regional leaderboards, and take home the cup.
          </motion.p>

          {/* Sports Highlights (Clean SVG Icons, NO keyboard emojis) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-8 text-xs sm:text-sm font-bold text-emerald-200"
          >
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-md border border-white/10">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Football 5v5</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-md border border-white/10">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Box Cricket</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-md border border-white/10">
              <Wind className="w-4 h-4 text-emerald-400" />
              <span>Badminton Smash</span>
            </div>
          </motion.div>

          {/* Notify Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.4 }}
            className="mt-8 sm:mt-10 max-w-md mx-auto w-full px-2"
          >
            {submitted ? (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-sm font-semibold flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 text-lime-400" />
                <span>You&apos;re on the priority waitlist! We&apos;ll notify you first.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="email" 
                  required
                  placeholder="Enter email for early bird entry" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3.5 rounded-xl bg-white/15 border border-white/20 text-white placeholder-emerald-200/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm backdrop-blur-md"
                />
                <button 
                  type="submit"
                  className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
                >
                  <Bell className="w-4 h-4" />
                  Notify Me
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Upcoming Formats (Clean SVG Icons, Responsive Grid) ── */}
      <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">What to Expect</h2>
          <p className="text-gray-500 text-sm sm:text-base mt-2">Professional turf competition crafted for passionate athletes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
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
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-2xl border border-gray-200/80 bg-gray-50/50 hover:bg-white hover:border-emerald-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-2.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
                  <span>Team Registration</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Feature Highlights ── */}
      <section className="py-12 bg-emerald-50/50 border-y border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div className="p-3 sm:p-4">
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-5 sm:w-6 h-5 sm:h-6" />
              </div>
              <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Verified Referees</h4>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-1">Official match officiating</p>
            </div>
            <div className="p-3 sm:p-4">
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                <Zap className="w-5 sm:w-6 h-5 sm:h-6" />
              </div>
              <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Live Scoreboards</h4>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-1">Instant digital match points</p>
            </div>
            <div className="p-3 sm:p-4">
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                <Users className="w-5 sm:w-6 h-5 sm:h-6" />
              </div>
              <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Team Rosters</h4>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-1">Manage squad &amp; substitutes</p>
            </div>
            <div className="p-3 sm:p-4">
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                <Award className="w-5 sm:w-6 h-5 sm:h-6" />
              </div>
              <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Exciting Rewards</h4>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-1">Cash prizes, kits &amp; trophies</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-14 sm:py-16 text-center px-4">
        <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2">Want to practice before the league?</h3>
        <p className="text-gray-500 text-xs sm:text-sm mb-6 max-w-md mx-auto">Book slots at top rated turfs near you and gear up with your squad today.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xs sm:max-w-none mx-auto">
          <Link
            href="/turfs"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20"
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
