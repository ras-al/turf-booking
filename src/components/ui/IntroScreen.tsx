'use client';

import { motion } from 'framer-motion';
import { Target, Compass, CalendarCheck, CheckCircle, CreditCard, Trophy } from 'lucide-react';
import { useEffect } from 'react';

const FEATURES = [
  { label: 'Discover Turfs', icon: Compass },
  { label: 'Check Availability', icon: CalendarCheck },
  { label: 'Easy Booking', icon: CheckCircle },
  { label: 'Secure Payments', icon: CreditCard },
  { label: 'Play & Enjoy', icon: Trophy },
];

export default function IntroScreen({ onComplete, isLoading }: { onComplete: () => void, isLoading: boolean }) {
  // Auto-dismiss once minimum time has passed AND loading is complete
  useEffect(() => {
    const minTimePromise = new Promise(resolve => setTimeout(resolve, 3000));
    
    // We only complete when both the minimum time is up AND the data has finished loading
    const checkCompletion = async () => {
      await minTimePromise;
      if (!isLoading) {
        onComplete();
      }
    };
    
    checkCompletion();
  }, [isLoading, onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden items-center"
    >
      {/* Wrapper to center on desktop, full width on mobile */}
      <div className="w-full max-w-md h-full flex flex-col relative bg-white shadow-2xl">
        {/* ── Top Header / Logo ── */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
          className="pt-16 px-8 flex flex-col items-start"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
              <Target className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none">PLAYFIELD</h1>
              <p className="text-xs font-semibold text-gray-500 mt-1">Book. Play. Enjoy.</p>
            </div>
          </div>
          <div className="w-8 h-0.5 bg-green-400 mt-2 rounded-full"></div>
        </motion.div>

        {/* ── Headline ── */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.6, delay: 0.2 }}
          className="px-8 mt-10"
        >
          <h2 className="text-[40px] font-extrabold text-[#0B1221] leading-[1.1] tracking-tight">
            Turf Booking<br />Made Easy
          </h2>
        </motion.div>

        {/* ── Features List ── */}
        <div className="px-8 mt-10 space-y-5 flex-1 relative z-10">
          {FEATURES.map((feature, i) => (
            <motion.div 
              key={feature.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0 shadow-sm">
                <feature.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-semibold text-gray-700">{feature.label}</span>
            </motion.div>
          ))}
        </div>

        {/* ── Bottom Graphic ── */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="relative mt-8 flex-shrink-0"
        >
          <div className="relative h-[32vh] w-full flex items-end justify-center overflow-hidden">
            {/* Subtle green glow floor effect */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-green-500/10 blur-2xl rounded-full transform scale-x-150 translate-y-1/2"></div>
            
            {/* Main graphic */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/landing-hero.png" 
              alt="Football Turf" 
              className="w-full h-full object-cover rounded-t-[40px] shadow-2xl relative z-0 opacity-90"
              style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 40%)', maskImage: 'linear-gradient(to bottom, transparent, black 40%)' }}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
