'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';

export default function IntroScreen({ 
  onComplete, 
  isLoading 
}: { 
  onComplete: () => void; 
  isLoading: boolean; 
}) {
  useEffect(() => {
    // Fast, native-feeling splash duration (~1.0s like modern native iOS/Android apps)
    const minTimer = setTimeout(() => {
      if (!isLoading) {
        onComplete();
      }
    }, 1000);

    const maxTimer = setTimeout(() => {
      onComplete();
    }, 1800);

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
        transition: { duration: 0.3, ease: 'easeInOut' } 
      }}
      className="fixed inset-0 z-[100] flex flex-col justify-between items-center bg-[#090e0c] select-none pointer-events-auto px-6 py-12"
    >
      {/* Top spacer */}
      <div className="h-8" />

      {/* Center Stage: Professional, Clean KiKKO Launch (No AI gradient blobs) */}
      <div className="flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          {/* Official KiKKO App Icon */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/logo.png" 
            alt="KiKKO" 
            className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-xl rounded-3xl"
          />

          {/* Wordmark */}
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-4 font-sans leading-none">
            Ki<span className="text-emerald-500">KKO</span>
          </h1>

          {/* Tagline */}
          <p className="text-[11px] sm:text-xs font-bold tracking-[0.25em] text-emerald-400 uppercase mt-2">
            FIND. BOOK. PLAY.
          </p>
        </motion.div>
      </div>

      {/* Bottom: Minimalist Native Loading Indicator */}
      <div className="flex flex-col items-center gap-4 w-full max-w-[200px]">
        {/* Clean, subtle progress track */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ 
              duration: 1.0, 
              repeat: Infinity, 
              ease: 'easeInOut' 
            }}
            className="w-1/2 h-full bg-emerald-500 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}
