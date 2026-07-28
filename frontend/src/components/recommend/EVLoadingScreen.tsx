'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import loadingData from '@/data/recommendation/loadingMessages.json';
import { AnimatedEVCar } from './AnimatedEVCar';
import { ProgressIndicator } from './ProgressIndicator';

interface EVLoadingScreenProps {
  onComplete: () => void;
}

export function EVLoadingScreen({ onComplete }: EVLoadingScreenProps) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [progress, setProgress] = useState(5);

  const messages = loadingData.messages;
  const quotes = loadingData.quotes;

  useEffect(() => {
    // Pick random quote on mount
    setQuoteIdx(Math.floor(Math.random() * quotes.length));

    // Rotate messages every 700ms
    const msgInterval = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % messages.length);
    }, 700);

    // Progress bar fill (0% -> 100% over 2.8s)
    const startTime = Date.now();
    const durationMs = 2800;

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(pct);

      if (elapsed >= durationMs) {
        clearInterval(progressInterval);
        clearInterval(msgInterval);
        onComplete();
      }
    }, 50);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete, messages.length, quotes.length]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-2xl text-slate-900"
      >
        <div className="w-full max-w-2xl bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6 relative overflow-hidden">
          {/* Header Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold shadow-xs">
            <Sparkles className="w-4 h-4 fill-emerald-600 text-emerald-600 animate-spin" />
            <span>WhyEV Policy Recommendation Engine</span>
          </div>

          {/* Dynamic Rotating Loading Title */}
          <div className="h-14 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.h3
                key={messages[msgIdx]}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
              >
                {messages[msgIdx]}
              </motion.h3>
            </AnimatePresence>
          </div>

          {/* Sleek Animated Parallax EV Car */}
          <AnimatedEVCar />

          {/* Battery Charge Progress Bar */}
          <ProgressIndicator progressPct={progress} />

          {/* Sustainability Inspirational Quote */}
          <div className="pt-4 border-t border-slate-100 max-w-lg mx-auto">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={quotes[quoteIdx]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs sm:text-sm font-semibold text-emerald-700 italic"
              >
                "{quotes[quoteIdx]}"
              </motion.blockquote>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
