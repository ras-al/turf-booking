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
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShow(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs md:hidden">
          {/* Backdrop click to dismiss */}
          <div className="absolute inset-0" onClick={handleDismiss} />

          {/* Plain Solid Modal Card */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="relative w-full max-w-md bg-white text-gray-900 rounded-t-3xl sm:rounded-2xl border border-gray-200 shadow-2xl p-5 overflow-hidden z-10"
          >
            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
              aria-label="Close install prompt"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header: App Icon & Brand Title */}
            <div className="flex items-center gap-3.5 mb-4">
              <div className="shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="KiKKO App"
                  className="w-14 h-14 object-contain rounded-xl border border-gray-100 shadow-sm"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold tracking-widest text-emerald-700 uppercase">
                  FIND. BOOK. PLAY.
                </span>
                <h3 className="text-lg font-black text-gray-900 tracking-tight font-sans leading-snug">
                  Install KiKKO App
                </h3>
                <span className="text-xs text-gray-500 font-medium">
                  Official Sports Turf Booking App
                </span>
              </div>
            </div>

            {/* Features list (Zero keyboard emojis, Lucide React SVG icons) */}
            <div className="space-y-2.5 mb-5 bg-gray-50 border border-gray-100 rounded-xl p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-900">Instant Turf Booking</span>
                  <span className="text-[11px] text-gray-500">Book football, cricket & badminton turfs in seconds</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-900">Real-Time Tournament Alerts</span>
                  <span className="text-[11px] text-gray-500">Get notified when new leagues and slots unlock</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
                  <Smartphone className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-900">1-Tap Fast Access</span>
                  <span className="text-[11px] text-gray-500">Fullscreen fast native performance from your home screen</span>
                </div>
              </div>
            </div>

            {/* iOS Step Guide if requested */}
            {showIOSGuide && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1.5"
              >
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-xs">
                  <ArrowDown className="w-3.5 h-3.5" />
                  <span>How to Install on iPhone / iPad:</span>
                </div>
                <p className="flex items-center gap-1.5">
                  <span className="font-extrabold text-emerald-700">1.</span>
                  <span>Tap the <Share className="inline w-3.5 h-3.5 text-emerald-700 mx-0.5" /> <strong>Share</strong> button in Safari toolbar.</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="font-extrabold text-emerald-700">2.</span>
                  <span>Select <PlusSquare className="inline w-3.5 h-3.5 text-emerald-700 mx-0.5" /> <strong>Add to Home Screen</strong>.</span>
                </p>
              </motion.div>
            )}

            {/* Action Buttons: Solid Colors */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleInstallClick}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>{isIOS && !showIOSGuide ? 'Add to Home Screen' : 'Install App'}</span>
              </button>

              <button
                onClick={handleDismiss}
                className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition-colors cursor-pointer"
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
