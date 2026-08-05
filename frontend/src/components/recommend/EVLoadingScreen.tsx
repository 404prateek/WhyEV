'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedEVCar } from './AnimatedEVCar';

interface EVLoadingScreenProps {
  onComplete: () => void;
}

const LOADING_MESSAGES = [
  'Finding your best EV matches...',
  'Checking applicable subsidies...',
  'Comparing battery range...',
  'Calculating ownership savings...',
  'Matching vehicles to your lifestyle...',
  'Generating recommendations...',
];

export function EVLoadingScreen({ onComplete }: EVLoadingScreenProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const intervalTime = 600;
    const totalMessages = LOADING_MESSAGES.length;

    const messageTimer = setInterval(() => {
      setCurrentMessageIndex((prev) => {
        if (prev < totalMessages - 1) {
          return prev + 1;
        } else {
          clearInterval(messageTimer);
          return prev;
        }
      });
    }, intervalTime);

    const completionTimer = setTimeout(() => {
      onComplete();
    }, 3800);

    return () => {
      clearInterval(messageTimer);
      clearTimeout(completionTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-2xl text-slate-900"
      >
        <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-8 relative overflow-hidden">
          {/* Dynamic Fading Text Messages */}
          <div className="h-16 flex items-center justify-center px-4">
            <AnimatePresence mode="wait">
              <motion.p
                key={LOADING_MESSAGES[currentMessageIndex]}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight"
              >
                {LOADING_MESSAGES[currentMessageIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Premium EV Car Driving Animation */}
          <AnimatedEVCar />

          {/* Smooth Ambient Line Loading Indicator */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden max-w-md mx-auto relative">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 3.6, ease: 'easeInOut' }}
              className="h-full bg-emerald-600 rounded-full"
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
