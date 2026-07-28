'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, CheckCircle2, Store } from 'lucide-react';
import { Dealer } from '@/types';
import { dealerApi } from '@/lib/api';

interface TestDriveModalProps {
  dealer: Dealer | null;
  onClose: () => void;
}

export function TestDriveModal({ dealer, onClose }: TestDriveModalProps) {
  const [date, setDate] = useState('2026-08-01');
  const [time, setTime] = useState('11:00 AM');
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!dealer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await dealerApi.bookTestDrive({
      dealerId: dealer.id,
      scheduledAt: `${date} ${time}`,
      vehicleId: 'veh-4w-tatanexonev',
    });
    setLoading(false);
    setConfirmed(true);
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

        {!confirmed ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{dealer.name}</h3>
                <p className="text-xs text-slate-500">{dealer.locality}, {dealer.city}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Select Preferred Date</label>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-transparent text-slate-900 focus:outline-none w-full"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Select Preferred Time Slot</label>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-transparent text-slate-900 focus:outline-none w-full"
                  >
                    <option value="10:00 AM">10:00 AM - 11:30 AM</option>
                    <option value="11:30 AM">11:30 AM - 01:00 PM</option>
                    <option value="03:00 PM">03:00 PM - 04:30 PM</option>
                    <option value="05:00 PM">05:00 PM - 06:30 PM</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-emerald-900 block">Pre-Qualified Handoff Guarantee:</span>
                <p className="text-slate-600 leading-relaxed font-normal">The dealer will receive your shortlisted specs only. No spam calls before your visit.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[48px] rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                {loading ? 'Confirming Appointment...' : 'Schedule Doorstep / Showroom Test Drive'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Test Drive Confirmed!</h3>
            <p className="text-xs text-slate-600">
              Scheduled at <span className="text-emerald-700 font-bold">{dealer.name}</span> on <span className="text-emerald-700 font-bold">{date}</span> at <span className="text-emerald-700 font-bold">{time}</span>.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold transition-all"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
