'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Sparkles } from 'lucide-react';

export function AnimatedEVCar() {
  return (
    <div className="relative w-full max-w-xl h-44 sm:h-52 overflow-hidden mx-auto my-4 flex items-end justify-center">
      {/* Background Parallax Layer: Delhi Skyline Silhouettes & Trees */}
      <div className="absolute inset-x-0 bottom-10 h-24 opacity-25 flex items-end justify-between px-4 pointer-events-none">
        {/* City Skyline SVG Silhouette */}
        <svg viewBox="0 0 500 120" className="w-full h-full text-slate-400 fill-current">
          <path d="M0 120 L0 80 L30 80 L30 50 L60 50 L60 80 L90 80 L90 30 L110 30 L110 10 L130 10 L130 80 L160 80 L160 60 L190 60 L190 120 Z" />
          <path d="M200 120 L200 70 L220 70 L220 40 L250 40 L250 120 Z" />
          <path d="M260 120 L260 55 L290 55 L290 20 L310 20 L310 120 Z" />
          <path d="M330 120 L330 80 L360 80 L360 45 L390 45 L390 120 Z" />
          <path d="M410 120 L410 65 L440 65 L440 35 L470 35 L470 120 Z" />
        </svg>
      </div>

      {/* Charging Hub Posts along the road (Passing right-to-left) */}
      <motion.div
        animate={{ x: [400, -400] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
        className="absolute bottom-9 flex items-center gap-2 text-emerald-600/70"
      >
        <Zap className="w-5 h-5 fill-emerald-500 text-emerald-600 animate-pulse" />
      </motion.div>

      {/* Main Driving EV Car Container (Moves smoothly left-to-right) */}
      <motion.div
        animate={{ x: [-120, 120], y: [0, -1, 0, 1, 0] }}
        transition={{
          x: { repeat: Infinity, repeatType: 'reverse', duration: 3.5, ease: 'easeInOut' },
          y: { repeat: Infinity, duration: 0.4, ease: 'easeInOut' },
        }}
        className="relative z-20 mb-7 flex items-end"
      >
        {/* Trailing Sparkles / Leaf Particles */}
        <div className="absolute -left-6 bottom-2 flex items-center gap-1 opacity-80">
          <motion.span
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], x: [-5, -20] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm"
          />
          <motion.span
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5], x: [-10, -30] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
            className="w-1.5 h-1.5 rounded-full bg-teal-300"
          />
        </div>

        {/* Custom Sleek Green EV Car SVG */}
        <div className="relative">
          <svg width="130" height="52" viewBox="0 0 130 52" fill="none" className="drop-shadow-lg">
            {/* Car Body */}
            <path
              d="M10 36 C10 36, 18 22, 35 18 C50 14, 75 14, 92 18 C105 22, 118 28, 122 36 C124 40, 120 44, 112 44 L18 44 C12 44, 8 40, 10 36 Z"
              fill="#059669"
            />
            {/* Car Roof & Cabin Glass */}
            <path
              d="M32 20 C42 12, 70 11, 88 18 C85 22, 36 22, 32 20 Z"
              fill="#064e3b"
              opacity="0.8"
            />
            {/* Front Headlight (Emerald Glow) */}
            <path d="M120 34 L126 36 L120 38 Z" fill="#34d399" />
            <circle cx="123" cy="36" r="4" fill="#6ee7b7" className="animate-pulse" />

            {/* Rear Tail Lamp (Red Accent) */}
            <path d="M12 34 L8 36 L12 38 Z" fill="#ef4444" />

            {/* EV Power Bolt Decal on Side Door */}
            <path
              d="M62 26 L56 34 L62 34 L58 41 L68 32 L62 32 Z"
              fill="#fef08a"
              stroke="#059669"
              strokeWidth="0.5"
            />

            {/* Wheels with Spin Animation */}
            <g className="animate-spin" style={{ transformOrigin: '32px 42px', animationDuration: '0.6s' }}>
              <circle cx="32" cy="42" r="10" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
              <circle cx="32" cy="42" r="4" fill="#059669" />
            </g>
            <g className="animate-spin" style={{ transformOrigin: '96px 42px', animationDuration: '0.6s' }}>
              <circle cx="96" cy="42" r="10" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
              <circle cx="96" cy="42" r="4" fill="#059669" />
            </g>
          </svg>
        </div>
      </motion.div>

      {/* Animated Moving Road & Dashed Lines */}
      <div className="absolute inset-x-0 bottom-0 h-8 bg-slate-900 border-t-2 border-slate-700 overflow-hidden">
        {/* Animated Dashed Road Lines (Moving Right-to-Left) */}
        <motion.div
          animate={{ x: [0, -60] }}
          transition={{ repeat: Infinity, duration: 0.5, ease: 'linear' }}
          className="flex gap-8 items-center h-full pt-1"
        >
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="w-8 h-1 bg-emerald-400 rounded-full shrink-0 shadow-xs" />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
