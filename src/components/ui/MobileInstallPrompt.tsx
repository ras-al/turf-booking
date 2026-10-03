'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Bell, Smartphone, Share, PlusSquare, ArrowDown } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function MobileInstallPrompt() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Only target client-side mobile devices
    if (typeof window === 'undefined') return;

    // Check if already in standalone PWA mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // Check if user previously dismissed in this session
    try {
      if (sessionStorage.getItem('kikko_install_dismissed')) {
        return;
      }
    } catch { /* ignore */ }

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isAppleMobile = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isAppleMobile);

    // Listen for Chrome/Android PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show install window on mobile after short entrance delay (1.8s)
    const timer = setTimeout(() => {
      // Check viewport width (mobile screens < 768px)
      if (window.innerWidth < 768) {
        setShow(true);
      }
    }, 1800);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Native Chromium / Android prompt
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShow(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      // Show iOS step-by-step instructions
      setShowIOSGuide(true);
    } else {
      // Fallback
      alert('To install, tap your browser menu (⋮) and select "Add to Home screen" or "Install App".');
      setShow(false);
    }
  };

  const handleDismiss = () => {
    try {
      sessionStorage.setItem('kikko_install_dismissed', 'true');
    } catch { /* ignore */ }
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs md:hidden">
          {/* Backdrop click to dismiss */}
          <div className="absolute inset-0" onClick={handleDismiss} />

          {/* Modal Card */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="relative w-full max-w-md bg-[#0a1510] text-white rounded-t-3xl sm:rounded-3xl border-t sm:border border-emerald-800/40 shadow-2xl p-6 overflow-hidden z-10"
          >
            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 transition-colors"
              aria-label="Close install prompt"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header: App Icon & Brand Title */}
            <div className="flex items-center gap-3.5 mb-5">
              <div className="relative shrink-0">
                <div className="absolute -inset-1 bg-emerald-400/30 rounded-2xl blur-md" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="KiKKO App"
                  className="relative w-16 h-16 object-contain rounded-2xl shadow-xl"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold tracking-widest text-emerald-400 uppercase">
                  FIND. BOOK. PLAY.
                </span>
                <h3 className="text-xl font-black text-white tracking-tight font-sans">
                  Install KiKKO App
                </h3>
                <span className="text-xs text-emerald-200/80 font-medium">
                  Official Sports Turf Booking App
                </span>
              </div>
            </div>

            {/* Features list (Zero keyboard emojis, Lucide React SVG icons) */}
            <div className="space-y-3 mb-6 bg-white/5 border border-emerald-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Instant Slot Booking</span>
                  <span className="text-[11px] text-gray-300">Book football, cricket & badminton turfs in seconds</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Real-Time Tournament Alerts</span>
                  <span className="text-[11px] text-gray-300">Get notified when new leagues and slots unlock</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">1-Tap Home Screen Access</span>
                  <span className="text-[11px] text-gray-300">Fast, fullscreen, offline-ready native performance</span>
                </div>
              </div>
            </div>

            {/* iOS Step Guide if requested */}
            {showIOSGuide && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-5 p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-400/40 text-xs text-emerald-100 space-y-2"
              >
                <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
                  <ArrowDown className="w-4 h-4 animate-bounce" />
                  <span>How to Install on iPhone / iPad:</span>
                </div>
                <p className="flex items-center gap-2">
                  <span className="font-extrabold text-white">1.</span>
                  <span>Tap the <Share className="inline w-3.5 h-3.5 text-emerald-300 mx-0.5" /> <strong>Share</strong> button in Safari's bottom toolbar.</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-extrabold text-white">2.</span>
                  <span>Scroll down and tap <PlusSquare className="inline w-3.5 h-3.5 text-emerald-300 mx-0.5" /> <strong>Add to Home Screen</strong>.</span>
                </p>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleInstallClick}
                className="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <Smartphone className="w-4 h-4" />
                <span>{isIOS && !showIOSGuide ? 'Add to Home Screen' : 'Install App'}</span>
              </button>

              <button
                onClick={handleDismiss}
                className="py-3.5 px-5 bg-white/10 hover:bg-white/15 text-gray-300 hover:text-white font-bold text-sm rounded-xl transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
