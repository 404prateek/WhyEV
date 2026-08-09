'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Navigation } from 'lucide-react';
import { StatusBadge, StationStatusType } from './StatusBadge';
import { ConnectorIcons } from './ConnectorIcons';

export interface StationData {
  id: string;
  name: string;
  operator: string;
  lat: number;
  lng: number;
  address: string;
  locality: string;
  status: StationStatusType;
  confidencePct: number;
  reportCount: number;
  lastVerifiedMinutesAgo: number;
  isFast: boolean;
  maxPowerKw: number;
  pricing: { type: string; rate: number | string };

  operatingHours: string;
  connectors: Array<{ type: string; total: number; available: number; busy?: number; broken?: number }>;

  amenities: string[];
  photos: string[];
  timeline: Array<{ id: string; status: StationStatusType; timeAgo: string; reporterType: string }>;
}

interface PreviewPanelProps {
  station: StationData | null;
  onClose: () => void;
  onViewDetails: (stn: StationData) => void;
  onOpenReportModal: (stn: StationData) => void;
}

export function PreviewPanel({
  station,
  onClose,
  onViewDetails,
  onOpenReportModal,
}: PreviewPanelProps) {
  if (!station) return null;

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`;
  const timeLabel =
    station.lastVerifiedMinutesAgo < 60
      ? `${station.lastVerifiedMinutesAgo} mins ago`
      : `${Math.round(station.lastVerifiedMinutesAgo / 60)} hrs ago`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-16 left-0 right-0 sm:bottom-6 sm:top-24 sm:right-6 sm:left-auto z-50 w-full sm:w-96 bg-white/95 backdrop-blur-2xl border-t sm:border border-slate-200/90 rounded-t-3xl sm:rounded-3xl shadow-2xl text-slate-900 flex flex-col justify-between max-h-[75vh] sm:max-h-[calc(100vh-8rem)] overflow-hidden"
      >
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Panel Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3 bg-slate-50/60">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
              {station.operator} Hub
            </span>
            <h3 className="text-lg font-extrabold text-slate-900 leading-tight">{station.name}</h3>
            <p className="text-xs text-slate-500 font-medium line-clamp-1">{station.address}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Panel Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Status & Recency */}
          <div className="flex items-center justify-between gap-2">
            <StatusBadge status={station.status} size="md" />
            <span className="text-[11px] text-slate-500 font-medium">Verified {timeLabel}</span>
          </div>

          {/* Distance & Travel Time Box */}
          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div>
              <span className="text-slate-400 text-[10px] font-bold block">ESTIMATED DISTANCE</span>
              <span className="font-extrabold text-slate-900 text-sm">~4.2 km</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] font-bold block">ESTIMATED DRIVE TIME</span>
              <span className="font-extrabold text-emerald-700 text-sm">12 mins drive</span>
            </div>
          </div>

          {/* Connectors Breakdown */}
          <ConnectorIcons
            connectors={station.connectors}
            isFast={station.isFast}
            maxPowerKw={station.maxPowerKw}
          />

          {/* Pricing & Hours */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <span className="text-slate-400 text-[10px] font-bold block">PRICING</span>
              <span className="font-bold text-slate-900 text-xs">₹{station.pricing.rate}/kWh</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[10px] font-bold block">HOURS</span>
              <span className="font-bold text-slate-900 text-xs">{station.operatingHours}</span>
            </div>
          </div>
        </div>

        {/* Panel Action Buttons */}
        <div className="p-5 border-t border-slate-100 space-y-2 bg-white">
          <div className="grid grid-cols-2 gap-2">
            {/* Primary CTA: External Google Maps Handoff */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 fill-white" />
              <span>Navigate</span>
            </a>

            {/* Secondary CTA: Full Details Drawer */}
            <button
              onClick={() => onViewDetails(station)}
              className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold text-xs transition-all border border-slate-200 flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>View Details</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Crowdsourced Report Trigger */}
          <button
            onClick={() => onOpenReportModal(station)}
            className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-emerald-700 font-bold text-[11px] transition-colors border border-emerald-200 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Update Station Status</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
