'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Activity, Zap, Wind, Trophy } from 'lucide-react';

export default function IntroScreen({ 
  onComplete, 
  isLoading 
}: { 
  onComplete: () => void; 
  isLoading: boolean; 
}) {
  useEffect(() => {
    // Fast, native-feeling splash duration (like YouTube/Instagram app open: ~1.2s)
    const minTimer = setTimeout(() => {
      if (!isLoading) {
        onComplete();
      }
    }, 1200);

    const maxTimer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
    };
  }, [isLoading, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        scale: 1.08, 
        filter: 'blur(10px)',
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } 
      }}
      className="fixed inset-0 z-[100] flex flex-col justify-between items-center overflow-hidden bg-gradient-to-b from-[#02180d] via-[#052e1a] to-[#011409] select-none pointer-events-auto px-4"
    >
      {/* Ambient turf glow ("full pacha") */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[420px] md:w-[500px] h-[300px] sm:h-[420px] md:h-[500px] bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-60 h-60 bg-lime-400/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Top spacer */}
      <div className="h-10 sm:h-16 md:h-20" />

      {/* Center Stage: High-visibility KiKKO Logo */}
      <div className="relative flex flex-col items-center justify-center z-10 w-full max-w-sm text-center">
        {/* Pulsing ambient halo */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.35, 0.7, 0.35] 
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: 'easeInOut' 
          }}
          className="absolute -inset-4 sm:-inset-6 rounded-[36px] bg-gradient-to-tr from-emerald-500/30 to-lime-400/30 blur-2xl -z-10"
        />

        {/* Centered Logo Card with spring pop */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ 
            type: 'spring', 
            stiffness: 260, 
            damping: 20,
            duration: 0.6 
          }}
          className="relative w-full flex flex-col items-center justify-center"
        >
          {/* Main App Icon (Instagram/YouTube style launch) */}
          <div className="relative">
            <div className="absolute -inset-3 bg-emerald-500/25 rounded-3xl blur-xl animate-pulse" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/logo.png" 
              alt="KiKKO" 
              className="relative w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-2xl rounded-2xl"
            />
          </div>

          {/* Wordmark */}
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-4 font-sans leading-none">
            Ki<span className="text-emerald-400">KKO</span>
          </h1>
        </motion.div>

        {/* Brand Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="mt-2.5 flex flex-col items-center"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-0.5 bg-emerald-400 rounded-full" />
            <p className="text-xs sm:text-sm font-extrabold tracking-[0.25em] text-emerald-300 uppercase">
              FIND. BOOK. PLAY.
            </p>
            <span className="w-2.5 h-0.5 bg-emerald-400 rounded-full" />
          </div>
        </motion.div>
      </div>

      {/* Bottom Section: Sports SVG icons & sleek loading indicator (NO keyboard emojis) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="pb-10 sm:pb-14 flex flex-col items-center gap-3 z-10 w-full"
      >
        {/* Clean SVG sports indicator row */}
        <div className="flex items-center gap-4 text-emerald-300/80">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline text-[11px] text-emerald-200">Football</span>
          </div>
          <span className="text-emerald-600/50 text-xs">&bull;</span>
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline text-[11px] text-emerald-200">Cricket</span>
          </div>
          <span className="text-emerald-600/50 text-xs">&bull;</span>
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <Wind className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline text-[11px] text-emerald-200">Badminton</span>
          </div>
        </div>

        {/* Sleek Instagram/YouTube-like minimal loading line */}
        <div className="w-32 sm:w-40 h-1 bg-emerald-950/80 rounded-full overflow-hidden border border-emerald-800/40 relative">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ 
              duration: 1.1, 
              repeat: Infinity, 
              ease: 'easeInOut' 
            }}
            className="w-1/2 h-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent rounded-full"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
