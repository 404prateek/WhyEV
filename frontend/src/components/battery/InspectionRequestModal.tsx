'use client';

import React, { useState } from 'react';
import { X, BatteryCharging, CheckCircle2 } from 'lucide-react';
import { batteryApi } from '@/lib/api';

interface InspectionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InspectionRequestModal({ isOpen, onClose }: InspectionRequestModalProps) {
  const [makeModel, setMakeModel] = useState('Tata Nexon.ev (2024)');
  const [odometerKm, setOdometerKm] = useState('28450');
  const [address, setAddress] = useState('Saket, New Delhi');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await batteryApi.requestInspection({
      makeModel,
      odometerKm: Number(odometerKm),
      address,
    });
    setLoading(false);
    setSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-900 space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!success ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
                <BatteryCharging className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Request Battery Inspection</h3>
                <p className="text-xs text-slate-500">Certified Partner Workshop Network</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Vehicle Make & Model</label>
                <input
                  type="text"
                  value={makeModel}
                  onChange={(e) => setMakeModel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Odometer Distance (km)</label>
                <input
                  type="number"
                  value={odometerKm}
                  onChange={(e) => setOdometerKm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Inspection Location (Doorstep / Workshop)</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-emerald-900 block">Report Guarantee:</span>
                <p className="text-slate-600 leading-relaxed font-normal">Includes battery health score (0-100), remaining degradation curve, and public QR certificate.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[48px] rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                {loading ? 'Submitting Request...' : 'Book Technician Inspection (₹999)'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Inspection Scheduled!</h3>
            <p className="text-xs text-slate-600">
              A certified technician will arrive at <span className="text-emerald-700 font-bold">{address}</span> within 24 hours to issue your QR-verifiable report.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
