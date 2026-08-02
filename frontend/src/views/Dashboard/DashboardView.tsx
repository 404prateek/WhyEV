'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  MapPin,
  Scale,
  Gift,
  BatteryCharging,
  Car,
  Bookmark,
  FileCheck,
  Zap,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react';

export function DashboardView() {
  return (
    <div className="w-full bg-white text-slate-900 min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2 border-b border-slate-100 pb-6 text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Control Center Dashboard
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium max-w-2xl">
            Manage your saved EV shortlists, battery certificates, subsidy claims, and favorite charging stations.
          </p>
        </div>

        {/* QUICK ACTION BAR */}
        <div className="p-4 rounded-3xl bg-slate-950 text-white flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-400 pl-2">Quick Actions</span>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/recommend"
              className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Find EV</span>
            </Link>
            <Link
              href="/map"
              className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-slate-800"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Locate Charger</span>
            </Link>
            <Link
              href="/recommend"
              className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-slate-800"
            >
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              <span>Compare Cars</span>
            </Link>
            <Link
              href="/battery-cert"
              className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-slate-800"
            >
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
              <span>Battery Health</span>
            </Link>
          </div>
        </div>

        {/* CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Saved EVs */}
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Car className="w-4 h-4 text-emerald-600" />
                <span>Saved Shortlists</span>
              </h3>
              <span className="text-xs font-black text-emerald-700">3 Saved</span>
            </div>
            <div className="space-y-2 text-xs font-bold text-slate-700">
              <div className="p-3 rounded-2xl bg-white border border-slate-200 flex justify-between">
                <span>Tata Curvv EV</span>
                <span className="text-emerald-600 font-extrabold">₹17.49 L</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200 flex justify-between">
                <span>Mahindra BE 6</span>
                <span className="text-emerald-600 font-extrabold">₹18.90 L</span>
              </div>
            </div>
          </div>

          {/* Card 2: Favorite Charging Stations */}
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>Favorite Chargers</span>
              </h3>
              <span className="text-xs font-black text-emerald-700">2 Stations</span>
            </div>
            <div className="space-y-2 text-xs font-bold text-slate-700">
              <div className="p-3 rounded-2xl bg-white border border-slate-200 flex justify-between">
                <span>Tata Power (CP Circle)</span>
                <span className="text-emerald-600 font-extrabold">Available</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200 flex justify-between">
                <span>Zeon Charging (Aerocity)</span>
                <span className="text-emerald-600 font-extrabold">60 kW DC</span>
              </div>
            </div>
          </div>

          {/* Card 3: Battery & Inspection Reports */}
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Diagnostics & Reports</span>
              </h3>
              <span className="text-xs font-black text-emerald-700">96% SOH</span>
            </div>
            <div className="space-y-2 text-xs font-bold text-slate-700">
              <div className="p-3 rounded-2xl bg-white border border-slate-200 flex justify-between">
                <span>Cell Health Cert</span>
                <span className="text-emerald-600 font-extrabold">Grade A+</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200 flex justify-between">
                <span>150-Point Inspection</span>
                <span className="text-emerald-600 font-extrabold">98/100</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
