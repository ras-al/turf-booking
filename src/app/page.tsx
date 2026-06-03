'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { fetchTopTurfs } from '@/lib/supabase/queries';
import { formatCurrency, SPORT_ICONS } from '@/lib/utils';
import type { Turf } from '@/types';
import {
  Search, Calendar, Trophy, MapPin, Star, ChevronRight,
  Zap, Clock, Shield, Smartphone, Play, Apple
} from 'lucide-react';

const FEATURED_SPORTS = [
  { name: 'Football', key: 'football' },
  { name: 'Cricket', key: 'cricket' },
  { name: 'Badminton', key: 'badminton' },
  { name: 'Basketball', key: 'basketball' },
  { name: 'Tennis', key: 'tennis' },
  { name: 'Volleyball', key: 'volleyball' },
];

const STEPS = [
  { step: '01', title: 'Search', description: 'Find turfs near you by location, sport, or availability.', Icon: Search, color: 'text-turf', glow: 'shadow-turf/20' },
  { step: '02', title: 'Pick Your Slot', description: 'Choose from real-time available slots that fit your schedule.', Icon: Calendar, color: 'text-amber', glow: 'shadow-amber/20' },
  { step: '03', title: 'Play!', description: 'Book instantly and get your booking confirmed right away.', Icon: Trophy, color: 'text-turf', glow: 'shadow-turf/20' },
];

const STATS = [
  { label: 'Active Turfs', value: 'Live', Icon: MapPin },
  { label: 'Instant Booking', value: '<30s', Icon: Zap },
  { label: '24/7 Available', value: 'Always', Icon: Clock },
  { label: 'Verified Owners', value: '100%', Icon: Shield },
];

function TurfCard({ turf }: { turf: Turf }) {
  return (
    <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
      <Link href={`/turfs/${turf.id}`} className="glass-card block overflow-hidden group">
        <div className="h-48 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-turf/10 via-pitch-800 to-pitch-900" />
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] group-hover:opacity-[0.12] group-hover:scale-110 transition-all duration-700">
            {SPORT_ICONS[turf.sports[0]] ? (
              <div className="w-32 h-32 [&>svg]:w-full [&>svg]:h-full">{SPORT_ICONS[turf.sports[0]]}</div>
            ) : (
              <MapPin className="w-32 h-32" />
            )}
          </div>
          <div className="absolute top-3 left-3 flex gap-1.5 z-10">
            {turf.sports.map((sport) => (
              <span key={sport} className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide bg-pitch-900/70 text-turf border border-turf/20 rounded-md backdrop-blur-md flex items-center gap-1">
                <div className="w-3 h-3 [&>svg]:w-full [&>svg]:h-full">{SPORT_ICONS[sport]}</div>
                {sport}
              </span>
            ))}
          </div>
          {turf.size && (
            <span className="absolute top-3 right-3 px-2.5 py-1 text-[11px] font-mono font-bold bg-amber text-pitch-900 rounded-md z-10 shadow-lg shadow-amber/30">{turf.size}</span>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[rgba(18,18,18,0.9)] to-transparent" />
        </div>
        <div className="p-5 space-y-3">
          <h3 className="text-lg font-display tracking-wide text-chalk group-hover:text-turf transition-colors">{turf.name}</h3>
          <p className="text-sm text-chalk-dim flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-turf/60 shrink-0" />
            <span className="truncate">{turf.address}</span>
          </p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-xl font-mono font-bold text-turf">
              {formatCurrency(turf.price_per_hour)}
              <span className="text-xs text-chalk-dim font-body font-normal ml-0.5">/hr</span>
            </span>
            <div className="flex items-center gap-1.5 bg-pitch-900/60 px-2.5 py-1 rounded-lg border border-pitch-600/50">
              <Star className="w-3.5 h-3.5 text-amber fill-amber" />
              <span className="text-sm font-mono font-bold text-chalk">{turf.avg_rating}</span>
              <span className="text-[11px] text-chalk-dim">({turf.total_reviews})</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [topTurfs, setTopTurfs] = useState<Turf[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopTurfs(3).then((data) => { setTopTurfs(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* MOBILE APP VIEW */}
      <div className="md:hidden">
        <div className="relative pt-20 pb-28 px-4 rounded-b-[40px] overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/background.jpg')" }}>
            <div className="absolute inset-0 bg-pitch-950/70 backdrop-blur-[2px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pitch-900/50 to-pitch-900" />
          </div>
          <div className="relative z-10 mt-6">
            <h1 className="text-5xl font-display tracking-wider text-chalk leading-none mb-1">
              Book <span className="text-turf">Turfs</span>
            </h1>
            <div className="flex gap-5 mt-6 border-b border-pitch-600/50 pb-4 overflow-x-auto scrollbar-hide">
              <button className="text-chalk font-semibold text-sm whitespace-nowrap bg-pitch-800/80 px-4 py-1.5 rounded-full border border-pitch-600">All Sports</button>
              <button className="text-chalk-muted font-medium text-sm whitespace-nowrap hover:text-chalk px-4 py-1.5">Football</button>
              <button className="text-chalk-muted font-medium text-sm whitespace-nowrap hover:text-chalk px-4 py-1.5">Cricket</button>
              <button className="text-chalk-muted font-medium text-sm whitespace-nowrap hover:text-chalk px-4 py-1.5">Badminton</button>
            </div>
          </div>
        </div>
        <div className="relative z-20 px-4 -mt-16">
          <div className="bg-pitch-800/95 backdrop-blur-md rounded-3xl p-5 border border-pitch-600 shadow-xl shadow-black/40">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <div className="w-3 h-3 rounded-full border-2 border-turf" />
                <div className="w-px h-10 bg-pitch-600 border-l-2 border-dashed border-pitch-600" />
                <div className="w-3 h-3 rounded-full bg-turf" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-[10px] text-chalk-dim uppercase tracking-wider font-semibold mb-1">Search Area</p>
                  <input type="text" placeholder="City or Location" className="w-full bg-transparent text-sm text-chalk focus:outline-none placeholder-chalk-muted font-medium" />
                </div>
                <div className="h-px bg-pitch-600/50" />
                <div>
                  <p className="text-[10px] text-chalk-dim uppercase tracking-wider font-semibold mb-1">Turf Name</p>
                  <input type="text" placeholder="Specific Turf (Optional)" className="w-full bg-transparent text-sm text-chalk focus:outline-none placeholder-chalk-muted font-medium" />
                </div>
              </div>
              <div className="w-10 h-10 flex-shrink-0 rounded-2xl bg-pitch-700/50 border border-pitch-600 flex items-center justify-center">
                <Search className="w-4 h-4 text-chalk" />
              </div>
            </div>
          </div>
        </div>
        {/* Top Rated Turfs (Mobile) */}
        <div className="mt-8 px-4 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-display tracking-wider text-chalk">Top Rated</h2>
            <Link href="/turfs" className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-pitch-800 border border-pitch-600/50 text-xs font-medium text-chalk hover:bg-pitch-700 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
              Filter
            </Link>
          </div>
          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-48 bg-pitch-800/50 rounded-3xl animate-pulse" />)}</div>
          ) : topTurfs.length === 0 ? (
            <div className="text-center py-10"><p className="text-chalk-dim text-sm">No turfs available yet.</p></div>
          ) : (
            <div className="space-y-4">
              {topTurfs.map((turf) => (
                <Link key={turf.id} href={`/turfs/${turf.id}`} className="block bg-pitch-950 rounded-3xl p-5 border border-pitch-700/50 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2.5 py-1 rounded-full border border-turf/30 text-[10px] font-bold text-turf tracking-wider bg-turf/10 uppercase">Top</span>
                    <span className="text-sm font-semibold text-chalk truncate">{turf.name}</span>
                  </div>
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-[10px] text-chalk-dim uppercase tracking-wider mb-1">Location</p>
                      <p className="text-xs text-chalk font-medium truncate max-w-[150px]">{turf.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-chalk-dim uppercase tracking-wider mb-1">Rating</p>
                      <p className="text-xs text-chalk font-medium flex items-center gap-1 justify-end">
                        <Star className="w-3.5 h-3.5 text-amber fill-amber" />{turf.avg_rating}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-turf" />
                    <div className="flex-1 h-px bg-pitch-700 border-t-2 border-dashed border-pitch-600" />
                    <div className="w-10 h-10 rounded-full bg-pitch-800 border border-pitch-600 flex items-center justify-center p-2">
                      <div className="w-full h-full">{SPORT_ICONS[turf.sports[0]]}</div>
                    </div>
                    <div className="flex-1 h-px bg-pitch-700 border-t-2 border-dashed border-pitch-600" />
                    <div className="w-2.5 h-2.5 rounded-full bg-turf" />
                  </div>
                  <div className="bg-pitch-900 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-chalk">{turf.size || 'Standard Size'}</p>
                      <p className="text-[10px] text-chalk-dim mt-0.5 capitalize">{turf.sports.join(', ')}</p>
                    </div>
                    <p className="text-lg font-mono font-bold text-chalk">{formatCurrency(turf.price_per_hour)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block">
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/background.jpg')" }}>
          <div className="absolute inset-0 bg-pitch-950/80" />
          <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-turf/[0.07] rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-amber/[0.05] rounded-full blur-[100px]" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-turf/[0.03] rounded-full blur-[150px]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
          <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8" />
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
              <h1 className="text-6xl sm:text-8xl md:text-9xl font-display tracking-wider text-chalk leading-[0.9]">
                BOOK YOUR<br /><span className="text-gradient-turf">PERFECT TURF</span>
              </h1>
            </motion.div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="mt-6 text-lg sm:text-xl text-chalk-muted max-w-2xl mx-auto leading-relaxed">
              Discover the best sports turfs near you. Real-time availability. Instant booking. <span className="text-chalk">Game on.</span>
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }} className="mt-10 max-w-2xl mx-auto">
              <div className="glass-panel flex gap-2 rounded-2xl p-2.5">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-chalk-dim" />
                  <input type="text" placeholder="Search by city, turf name, or sport..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-pitch-800/60 text-chalk placeholder-chalk-dim text-sm rounded-xl border border-pitch-600/40 focus:outline-none focus:border-turf/40 focus:ring-1 focus:ring-turf/20 transition-all" />
                </div>
                <Link href={`/turfs${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`} className="px-8 py-3.5 bg-turf text-pitch-900 font-semibold text-sm rounded-xl hover:bg-turf-light transition-all hover:shadow-lg hover:shadow-turf/30 flex items-center gap-2 whitespace-nowrap">
                  Find Turfs <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.7 }} className="mt-8 flex flex-wrap justify-center gap-2.5">
              {FEATURED_SPORTS.map((sport, i) => (
                <motion.div key={sport.key} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 + i * 0.06 }}>
                  <Link href={`/turfs?sport=${sport.key}`} className="inline-flex items-center gap-2 px-4 py-2 text-sm text-chalk-muted bg-pitch-800/50 border border-pitch-600/40 rounded-full hover:border-turf/40 hover:text-turf hover:bg-turf/5 transition-all backdrop-blur-sm">
                    <div className="w-4 h-4 [&>svg]:w-full [&>svg]:h-full">{SPORT_ICONS[sport.key]}</div>
                    {sport.name}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* STATS BAR */}
        <section className="relative border-y border-pitch-700/50 bg-pitch-950/80 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {STATS.map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-turf/10 border border-turf/20 flex items-center justify-center shrink-0">
                    <stat.Icon className="w-5 h-5 text-turf" />
                  </div>
                  <div>
                    <div className="text-lg font-mono font-bold text-chalk">{stat.value}</div>
                    <div className="text-xs text-chalk-dim">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="relative py-24 px-4 bg-pitch-950 ambient-glow overflow-hidden">
          <div className="relative z-10 max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <h2 className="text-4xl sm:text-6xl font-display tracking-wider text-chalk">HOW IT <span className="text-gradient-turf">WORKS</span></h2>
              <p className="mt-4 text-chalk-muted text-lg">Three simple steps to get on the field</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {STEPS.map((step, i) => (
                <motion.div key={step.step} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="relative glass-panel rounded-2xl p-8 text-center group hover:border-turf/20 transition-all duration-300">
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-turf text-pitch-900 font-mono font-bold text-xs rounded-full shadow-lg ${step.glow}`}>STEP {step.step}</div>
                  <div className="mt-6 mb-6 flex justify-center">
                    <div className={`w-16 h-16 rounded-2xl bg-pitch-800/80 border border-pitch-600/40 flex items-center justify-center ${step.color} group-hover:border-turf/30 transition-colors`}>
                      <step.Icon className="w-7 h-7" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-display tracking-wide text-chalk group-hover:text-turf transition-colors">{step.title}</h3>
                  <p className="mt-3 text-sm text-chalk-dim leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED TURFS */}
        <section className="relative py-24 px-4 bg-pitch-900 overflow-hidden">
          <div className="absolute top-0 right-[20%] w-[400px] h-[400px] bg-amber/[0.04] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-[20%] w-[300px] h-[300px] bg-turf/[0.04] rounded-full blur-[100px]" />
          <div className="relative z-10 max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-end justify-between mb-14">
              <div>
                <h2 className="text-4xl sm:text-6xl font-display tracking-wider text-chalk">TOP RATED <span className="text-gradient-amber">TURFS</span></h2>
                <p className="mt-3 text-chalk-muted text-lg">The most loved turfs by our players</p>
              </div>
              <Link href="/turfs" className="hidden sm:flex items-center gap-2 text-sm text-turf hover:text-turf-light transition-colors font-medium group">
                View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => <div key={i} className="h-72 bg-pitch-800/50 rounded-2xl animate-pulse" />)}
              </div>
            ) : topTurfs.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-chalk-dim">No turfs listed yet. Be the first!</p>
                <Link href="/auth?role=owner" className="mt-4 inline-block px-6 py-3 bg-turf text-pitch-900 rounded-xl font-semibold text-sm">Register as Owner</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {topTurfs.map((turf, i) => (
                  <motion.div key={turf.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
                    <TurfCard turf={turf} />
                  </motion.div>
                ))}
              </div>
            )}
            <div className="mt-10 text-center sm:hidden">
              <Link href="/turfs" className="inline-flex items-center gap-2 px-6 py-3 glass-panel text-chalk rounded-xl text-sm font-medium hover:border-turf/40 transition-all">
                View All Turfs <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="relative py-28 px-4 bg-pitch-950 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-turf/[0.05] rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber/[0.04] rounded-full blur-[120px]" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative z-10 max-w-4xl mx-auto text-center glass-panel p-12 sm:p-16 rounded-3xl border-turf/10">
            <h2 className="text-5xl sm:text-7xl font-display tracking-wider text-chalk leading-[0.9]">OWN A <span className="text-gradient-amber">TURF?</span></h2>
            <p className="mt-6 text-lg text-chalk-muted max-w-2xl mx-auto">List your turf on TurfBook and reach thousands of players. Manage slots, track earnings, and grow your business seamlessly.</p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth?role=owner" className="px-8 py-4 bg-gradient-cta text-pitch-900 font-semibold rounded-xl hover:shadow-lg hover:shadow-amber/25 transition-all hover:-translate-y-0.5 text-sm">Register as Owner</Link>
              <Link href="/turfs" className="px-8 py-4 bg-pitch-800/60 backdrop-blur-sm border border-pitch-500/50 text-chalk font-semibold rounded-xl hover:border-chalk-dim/50 transition-all hover:-translate-y-0.5 text-sm">Explore Turfs</Link>
            </div>
          </motion.div>
        </section>

        {/* DOWNLOAD APP SECTION */}
        <section className="py-24 px-4 border-t border-pitch-800">
          <div className="max-w-6xl mx-auto">
            <div className="glass-panel rounded-3xl p-8 sm:p-12 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-turf/[0.03] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-display tracking-wider text-chalk mb-4">TAKE THE GAME <span className="text-turf">ANYWHERE</span></h2>
                  <p className="text-chalk-muted text-lg mb-8">Download the TurfBook app to book your favorite turfs on the go, manage your reservations, and get instant notifications.</p>

                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Google Play Button */}
                    <Link href="#" className="flex items-center gap-3 bg-pitch-800 hover:bg-pitch-700 border border-pitch-600 px-6 py-3.5 rounded-xl transition-all hover:border-turf/50 group">
                      <Play className="w-8 h-8 text-turf group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="text-[10px] text-chalk-dim uppercase tracking-wider font-semibold">Get it on</div>
                        <div className="text-lg font-display tracking-wide text-chalk">Google Play</div>
                      </div>
                    </Link>

                    {/* App Store Button */}
                    <Link href="#" className="flex items-center gap-3 bg-pitch-800 hover:bg-pitch-700 border border-pitch-600 px-6 py-3.5 rounded-xl transition-all hover:border-chalk-dim/50 group">
                      <Apple className="w-8 h-8 text-chalk group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="text-[10px] text-chalk-dim uppercase tracking-wider font-semibold">Download on the</div>
                        <div className="text-lg font-display tracking-wide text-chalk">App Store</div>
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="flex justify-center lg:justify-end">
                  <div className="relative w-64 h-[500px] glass-card rounded-[3rem] border-8 border-pitch-950 overflow-hidden shadow-2xl flex items-center justify-center bg-pitch-900">
                    <Smartphone className="w-24 h-24 text-turf/20" />
                    <div className="absolute top-0 w-full h-full bg-gradient-to-b from-turf/10 to-transparent" />
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center w-full">
                      <div className="text-turf font-display tracking-widest text-xl opacity-50">TURFBOOK</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
