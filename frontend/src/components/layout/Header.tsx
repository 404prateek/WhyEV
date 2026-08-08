'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Bot, ShieldCheck } from 'lucide-react';
import { useAuthStore, useAiAgentStore } from '@/lib/store';

export function Header() {
  const { user } = useAuthStore();
  const { toggleDrawer } = useAiAgentStore();

  return (
    <header className="sticky top-0 z-20 w-full bg-slate-950/80 backdrop-blur-md border-b border-emerald-900/20 px-4 lg:px-8 py-3 flex items-center justify-between">
      {/* Left: Mobile Brand & Location Indicator */}
      <div className="flex items-center gap-3">
        <Link href="/" className="lg:hidden flex items-center gap-2">
          <img
            src="/whyev-logo-icon.png"
            alt="WhyEV Logo"
            className="h-8 w-auto object-contain"
          />
        </Link>

        {/* Delhi Residency Live Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>Delhi/NCR Region (Policy 2026 Live)</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* Right: Quick AI trigger, User snippet */}
      <div className="flex items-center gap-3">
        {/* Floating AI Button on header */}
        <button
          onClick={toggleDrawer}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-emerald-900/30 active:scale-95"
        >
          <Bot className="w-4 h-4" />
          <span className="hidden sm:inline">Ask AI Assistant</span>
        </button>

        {/* User Badge */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-emerald-900/40">
            <div className="w-8 h-8 rounded-full bg-emerald-900/50 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-xs">
              {user.name.charAt(0)}
            </div>
            <div className="hidden md:block text-left text-xs">
              <div className="font-semibold text-slate-200 flex items-center gap-1">
                {user.name}
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-[10px] text-slate-400">Delhi Resident</div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
