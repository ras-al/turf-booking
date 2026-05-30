'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { MOCK_TURFS } from '@/lib/mock-data';
import { formatCurrency, SPORT_ICONS } from '@/lib/utils';
import {
  Search,
  Calendar,
  Trophy,
  MapPin,
  Star,
  ChevronRight,
  Zap,
  Clock,
  Shield,
} from 'lucide-react';

/* ─── Constants ─── */
const FEATURED_SPORTS = [
  { name: 'Football', key: 'football' },
  { name: 'Cricket', key: 'cricket' },
  { name: 'Badminton', key: 'badminton' },
  { name: 'Basketball', key: 'basketball' },
  { name: 'Tennis', key: 'tennis' },
  { name: 'Volleyball', key: 'volleyball' },
];

const STEPS = [
  {
    step: '01',
    title: 'Search',
    description: 'Find turfs near you by location, sport, or availability.',
    Icon: Search,
    color: 'text-turf',
    glow: 'shadow-turf/20',
  },
  {
    step: '02',
    title: 'Pick Your Slot',
    description: 'Choose from real-time available slots that fit your schedule.',
    Icon: Calendar,
    color: 'text-amber',
    glow: 'shadow-amber/20',
  },
  {
    step: '03',
    title: 'Play!',
    description: 'Pay securely and get your booking confirmed instantly.',
    Icon: Trophy,
    color: 'text-turf',
    glow: 'shadow-turf/20',
  },
];

const STATS = [
  { label: 'Active Turfs', value: '200+', Icon: MapPin },
  { label: 'Instant Booking', value: '<30s', Icon: Zap },
  { label: '24/7 Available', value: 'Always', Icon: Clock },
  { label: 'Verified Owners', value: '100%', Icon: Shield },
];

/* ─── Turf Card Component ─── */
function TurfCard({ turf }: { turf: (typeof MOCK_TURFS)[0] }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Link
        href={`/turfs/${turf.id}`}
        className="glass-card block overflow-hidden group"
      >
        {/* Image placeholder with sport icon */}
        <div className="h-48 relative overflow-hidden">
          {/* Gradient fill */}
          <div className="absolute inset-0 bg-gradient-to-br from-turf/10 via-pitch-800 to-pitch-900" />

          {/* Sport icon watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] group-hover:opacity-[0.12] group-hover:scale-110 transition-all duration-700">
            {SPORT_ICONS[turf.sports[0]] ? (
              <div className="w-32 h-32 [&>svg]:w-full [&>svg]:h-full">
                {SPORT_ICONS[turf.sports[0]]}
              </div>
            ) : (
              <MapPin className="w-32 h-32" />
            )}
          </div>

          {/* Sport badges */}
          <div className="absolute top-3 left-3 flex gap-1.5 z-10">
            {turf.sports.map((sport) => (
              <span
                key={sport}
                className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide bg-pitch-900/70 text-turf border border-turf/20 rounded-md backdrop-blur-md flex items-center gap-1"
              >
                <div className="w-3 h-3 [&>svg]:w-full [&>svg]:h-full">
                  {SPORT_ICONS[sport]}
                </div>
                {sport}
              </span>
            ))}
          </div>

          {/* Size badge */}
          {turf.size && (
            <span className="absolute top-3 right-3 px-2.5 py-1 text-[11px] font-mono font-bold bg-amber text-pitch-900 rounded-md z-10 shadow-lg shadow-amber/30">
              {turf.size}
            </span>
          )}

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[rgba(18,18,18,0.9)] to-transparent" />
        </div>

        {/* Card body */}
        <div className="p-5 space-y-3">
          <h3 className="text-lg font-display tracking-wide text-chalk group-hover:text-turf transition-colors">
            {turf.name}
          </h3>

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
              <span className="text-sm font-mono font-bold text-chalk">
                {turf.avg_rating}
              </span>
              <span className="text-[11px] text-chalk-dim">
                ({turf.total_reviews})
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Home Page ─── */
export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const topTurfs = MOCK_TURFS.slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* ═══════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 hero-gradient" />

        {/* Large ambient blobs for visual interest */}
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-turf/[0.07] rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-amber/[0.05] rounded-full blur-[100px]" />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-turf/[0.03] rounded-full blur-[150px]" />

        {/* Grid lines decoration */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
          </motion.div>

          {/* Main heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <h1 className="text-6xl sm:text-8xl md:text-9xl font-display tracking-wider text-chalk leading-[0.9]">
              BOOK YOUR
              <br />
              <span className="text-gradient-turf">PERFECT TURF</span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-6 text-lg sm:text-xl text-chalk-muted max-w-2xl mx-auto leading-relaxed"
          >
            Discover the best sports turfs near you. Real-time availability.
            Instant booking. <span className="text-chalk">Game on.</span>
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-10 max-w-2xl mx-auto"
          >
            <div className="glass-panel flex gap-2 rounded-2xl p-2.5">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-chalk-dim" />
                <input
                  type="text"
                  placeholder="Search by city, turf name, or sport..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-pitch-800/60 text-chalk placeholder-chalk-dim text-sm rounded-xl border border-pitch-600/40 focus:outline-none focus:border-turf/40 focus:ring-1 focus:ring-turf/20 transition-all"
                />
              </div>
              <Link
                href={`/turfs${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`}
                className="px-8 py-3.5 bg-turf text-pitch-900 font-semibold text-sm rounded-xl hover:bg-turf-light transition-all hover:shadow-lg hover:shadow-turf/30 flex items-center gap-2 whitespace-nowrap"
              >
                Find Turfs
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* Sport Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mt-8 flex flex-wrap justify-center gap-2.5"
          >
            {FEATURED_SPORTS.map((sport, i) => (
              <motion.div
                key={sport.key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + i * 0.06 }}
              >
                <Link
                  href={`/turfs?sport=${sport.key}`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm text-chalk-muted bg-pitch-800/50 border border-pitch-600/40 rounded-full hover:border-turf/40 hover:text-turf hover:bg-turf/5 transition-all backdrop-blur-sm"
                >
                  <div className="w-4 h-4 [&>svg]:w-full [&>svg]:h-full">
                    {SPORT_ICONS[sport.key]}
                  </div>
                  {sport.name}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SOCIAL PROOF STATS BAR
          ═══════════════════════════════════════ */}
      <section className="relative border-y border-pitch-700/50 bg-pitch-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
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

      {/* ═══════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════ */}
      <section className="relative py-24 px-4 bg-pitch-950 ambient-glow overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-6xl font-display tracking-wider text-chalk">
              HOW IT <span className="text-gradient-turf">WORKS</span>
            </h2>
            <p className="mt-4 text-chalk-muted text-lg">
              Three simple steps to get on the field
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative glass-panel rounded-2xl p-8 text-center group hover:border-turf/20 transition-all duration-300"
              >
                {/* Step number badge */}
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-turf text-pitch-900 font-mono font-bold text-xs rounded-full shadow-lg ${step.glow}`}>
                  STEP {step.step}
                </div>

                {/* Icon */}
                <div className="mt-6 mb-6 flex justify-center">
                  <div className={`w-16 h-16 rounded-2xl bg-pitch-800/80 border border-pitch-600/40 flex items-center justify-center ${step.color} group-hover:border-turf/30 transition-colors`}>
                    <step.Icon className="w-7 h-7" />
                  </div>
                </div>

                <h3 className="text-2xl font-display tracking-wide text-chalk group-hover:text-turf transition-colors">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm text-chalk-dim leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURED TURFS
          ═══════════════════════════════════════ */}
      <section className="relative py-24 px-4 bg-pitch-900 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-[20%] w-[400px] h-[400px] bg-amber/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-[20%] w-[300px] h-[300px] bg-turf/[0.04] rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-14"
          >
            <div>
              <h2 className="text-4xl sm:text-6xl font-display tracking-wider text-chalk">
                TOP RATED <span className="text-gradient-amber">TURFS</span>
              </h2>
              <p className="mt-3 text-chalk-muted text-lg">
                The most loved turfs by our players
              </p>
            </div>
            <Link
              href="/turfs"
              className="hidden sm:flex items-center gap-2 text-sm text-turf hover:text-turf-light transition-colors font-medium group"
            >
              View All
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {topTurfs.map((turf, i) => (
              <motion.div
                key={turf.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
              >
                <TurfCard turf={turf} />
              </motion.div>
            ))}
          </div>

          <div className="mt-10 text-center sm:hidden">
            <Link
              href="/turfs"
              className="inline-flex items-center gap-2 px-6 py-3 glass-panel text-chalk rounded-xl text-sm font-medium hover:border-turf/40 transition-all"
            >
              View All Turfs
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA BANNER
          ═══════════════════════════════════════ */}
      <section className="relative py-28 px-4 bg-pitch-950 overflow-hidden">
        {/* Dramatic ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-turf/[0.05] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber/[0.04] rounded-full blur-[120px]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-4xl mx-auto text-center glass-panel p-12 sm:p-16 rounded-3xl border-turf/10"
        >
          <h2 className="text-5xl sm:text-7xl font-display tracking-wider text-chalk leading-[0.9]">
            OWN A <span className="text-gradient-amber">TURF?</span>
          </h2>
          <p className="mt-6 text-lg text-chalk-muted max-w-2xl mx-auto">
            List your turf on TurfBook and reach thousands of players.
            Manage slots, track earnings, and grow your business seamlessly.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth?role=owner"
              className="px-8 py-4 bg-gradient-cta text-pitch-900 font-semibold rounded-xl hover:shadow-lg hover:shadow-amber/25 transition-all hover:-translate-y-0.5 text-sm"
            >
              Register as Owner
            </Link>
            <Link
              href="/turfs"
              className="px-8 py-4 bg-pitch-800/60 backdrop-blur-sm border border-pitch-500/50 text-chalk font-semibold rounded-xl hover:border-chalk-dim/50 transition-all hover:-translate-y-0.5 text-sm"
            >
              Explore Turfs
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
