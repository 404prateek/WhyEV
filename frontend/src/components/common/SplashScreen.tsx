'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  children: React.ReactNode;
}

export function SplashScreen({ children }: SplashScreenProps) {
  const [showSplash, setShowSplash] = useState<boolean | null>(null);
  const [animationPhase, setAnimationPhase] = useState<number>(0);

  // 8 Soft ambient low-opacity particles for parallax depth
  const particles = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      left: `${18 + (i * 9) % 65}%`,
      top: `${30 + (i * 11) % 50}%`,
      size: Math.random() * 3.5 + 3,
      delay: i * 0.45,
      duration: 4.5 + Math.random() * 2,
    }));
  }, []);

  useEffect(() => {
    // Check if user has already seen splash in current session
    const hasSeen = sessionStorage.getItem('whyev_has_seen_splash');
    if (hasSeen === 'true') {
      setShowSplash(false);
    } else {
      setShowSplash(true);

      // 7-Second Tech-Launch Timeline:
      // 0.0 - 2.0s: Title reveal + horizontal energy light sweep + glass shimmer
      // 2.0 - 4.0s: Tagline Line 1: "Drive Electric."
      // 4.0 - 5.8s: Tagline Line 2: "Save Smarter."
      // 5.8 - 7.0s: Text slides up naturally & homepage fades in seamlessly
      const timer1 = setTimeout(() => setAnimationPhase(1), 2000); // Line 1 "Drive Electric."
      const timer2 = setTimeout(() => setAnimationPhase(2), 4000); // Line 2 "Save Smarter."
      const timer3 = setTimeout(() => {
        setAnimationPhase(3); // Natural slide up exit transition
        sessionStorage.setItem('whyev_has_seen_splash', 'true');
      }, 5800);
      const timer4 = setTimeout(() => setShowSplash(false), 7000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, []);

  // Avoid SSR hydration flash
  if (showSplash === null) {
    return <div className="bg-white min-h-screen" />;
  }

  return (
    <>
      {/* 1. Main Application Content (Rendered completely directly, 100% untouched layout & fixed positioning) */}
      {children}

      {/* 2. Isolated Apple/Rivian-Inspired Light Sweep & Glass Shimmer Overlay */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash-isolated-overlay"
            initial={{ opacity: 1 }}
            animate={{ opacity: animationPhase === 3 ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 bg-gradient-to-b from-white via-emerald-50/30 to-slate-50/70 backdrop-blur-2xl flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden"
          >
            {/* Parallax Background Layer */}
            <motion.div
              animate={{ y: [-8, 8] }}
              transition={{ duration: 6.0, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              {/* Soft Ambient Breathing Radial Glow */}
              <div className="w-[500px] h-[500px] sm:w-[650px] sm:h-[650px] bg-emerald-200/40 rounded-full blur-[120px]" />

              {/* Moving Horizontal Green Energy Light Sweep */}
              <motion.div
                animate={{ x: ['-130%', '130%'] }}
                transition={{ duration: 4.8, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.8 }}
                className="absolute w-[500px] h-[260px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent blur-[80px]"
              />
            </motion.div>

            {/* Floating Ambient Light Particles for Parallax Depth */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  style={{
                    left: p.left,
                    top: p.top,
                    width: p.size,
                    height: p.size,
                  }}
                  animate={{
                    y: [0, -40],
                    opacity: [0, 0.45, 0],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: p.duration,
                    delay: p.delay,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute rounded-full bg-emerald-400/40 blur-[1.5px]"
                />
              ))}
            </div>

            {/* Centered Brand Title & 2-Stage Tagline Container (Natural Slide-Up Exit) */}
            <motion.div
              animate={{
                y: animationPhase === 3 ? -40 : 0,
                opacity: animationPhase === 3 ? 0 : 1,
              }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex flex-col items-center justify-center space-y-6 text-center px-4"
            >
              {/* Brand Title with Animated Glass Reflection Shimmer */}
              <div className="relative">
                <motion.div
                  initial={{ opacity: 0, y: 24, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: [0.92, 1.03, 1] }}
                  transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                  className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tight leading-none drop-shadow-xs relative z-10"
                >
                  Why<span className="text-emerald-600">EV</span>
                </motion.div>

                {/* Traveling Glass Light Reflection Shimmer across letters */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{
                    backgroundPosition: ['150% 0%', '-50% 0%'],
                    opacity: [0, 1, 0],
                  }}
                  transition={{ duration: 3.2, delay: 0.5, ease: 'easeInOut' }}
                  className="absolute inset-0 text-5xl sm:text-7xl font-black tracking-tight leading-none bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent bg-[length:200%_100%] bg-clip-text text-transparent z-20 pointer-events-none"
                >
                  WhyEV
                </motion.div>
              </div>

              {/* 2-Stage Plain Tagline Reveal (No Boxes / Badges / Containers) */}
              <div className="flex flex-col items-center space-y-2 pt-2 min-h-[70px]">
                {/* Line 1: Drive Electric. */}
                <AnimatePresence>
                  {animationPhase >= 1 && (
                    <motion.div
                      key="line-drive-electric-tech"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                      className="text-xs sm:text-sm font-black text-emerald-600 uppercase tracking-[0.3em]"
                    >
                      Drive Electric.
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Line 2: Save Smarter. */}
                <AnimatePresence>
                  {animationPhase >= 2 && (
                    <motion.div
                      key="line-save-smarter-tech"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                      className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-[0.3em]"
                    >
                      Save Smarter.
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
