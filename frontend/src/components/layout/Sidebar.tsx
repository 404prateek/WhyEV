'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Sliders,
  FileCheck,
  LayoutDashboard,
  User,
  Store,
  BatteryCharging,
  ShoppingBag,
  MapPin,
  Bot,
  ShieldAlert,
} from 'lucide-react';
import { useAiAgentStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const { toggleDrawer } = useAiAgentStore();

  const mainNavItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'EV Matcher', href: '/recommend', icon: Sliders },
    { label: 'Subsidy 2026', href: '/subsidy', icon: FileCheck, badge: 'USP' },
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  const secondaryNavItems = [
    { label: 'Dealers', href: '/dealers', icon: Store },
    { label: 'Battery Cert', href: '/battery-cert', icon: BatteryCharging },
    { label: 'Used Marketplace', href: '/marketplace', icon: ShoppingBag, tag: 'Phase 2' },
    { label: 'Charging Map', href: '/charging', icon: MapPin, tag: 'Phase 2' },
    { label: 'Admin Ops', href: '/admin', icon: ShieldAlert },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-emerald-900/20 bg-slate-950/95 backdrop-blur-xl h-screen sticky top-0 z-30 p-4 text-slate-200">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-2 py-3 border-b border-emerald-900/30 mb-4">
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src="/whyev-logo.jpg"
            alt="WhyEV Logo"
            className="h-10 w-auto object-contain rounded-lg transition-transform group-hover:scale-105"
          />
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="space-y-6 flex-1 overflow-y-auto pr-1">
        <div>
          <div className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
            Core Modules
          </div>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/10 text-emerald-300 border border-emerald-500/30 shadow-inner'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn('w-4 h-4', isActive ? 'text-emerald-400' : 'text-slate-400')} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
            Ecosystem Services
          </div>
          <nav className="space-y-1">
            {secondaryNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span>{item.label}</span>
                  </div>
                  {item.tag && (
                    <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {item.tag}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Docked AI Assistant Banner */}
      <div className="mt-auto pt-4 border-t border-emerald-900/30">
        <button
          onClick={toggleDrawer}
          className="w-full group p-3 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-teal-950/40 border border-emerald-500/30 hover:border-emerald-400/60 transition-all text-left shadow-lg relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                AI Assistant
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">Ask anything on EV Policy & Models</p>
            </div>
          </div>
        </button>
      </div>
    </aside>
  );
}
