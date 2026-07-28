'use client';

import React, { useState } from 'react';
import { MOCK_DEALERS } from '@/lib/mock-data';
import { Dealer } from '@/types';
import { Store, Star, MapPin, ShieldCheck, Tag, Calendar, CheckCircle2 } from 'lucide-react';
import { TestDriveModal } from './TestDriveModal';
import { dealerApi } from '@/lib/api';

export function DealerList() {
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [connectedLeadIds, setConnectedLeadIds] = useState<string[]>([]);
  const [loadingLeadId, setLoadingLeadId] = useState<string | null>(null);

  const handleConnectLead = async (dealer: Dealer) => {
    setLoadingLeadId(dealer.id);
    await dealerApi.submitLead({
      dealerId: dealer.id,
      vehicleId: 'veh-4w-tatanexonev',
      sourceModule: 'recommendation_flow',
    });
    setLoadingLeadId(null);
    setConnectedLeadIds((prev) => [...prev, dealer.id]);
  };

  return (
    <div className="max-w-7xl mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Module Title */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>No Spam Guarantee: Data Passed Only Upon Your Opt-in</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Empanelled Dealer Handoff & Test Drive Booking
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto font-normal">
          Connect with verified Delhi-NCR showrooms carrying your shortlisted models.
        </p>
      </div>

      {/* Dealer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {MOCK_DEALERS.map((dlr) => {
          const isConnected = connectedLeadIds.includes(dlr.id);
          const isLoading = loadingLeadId === dlr.id;

          return (
            <div
              key={dlr.id}
              className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-300 transition-all duration-300 space-y-6 shadow-sm hover:shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{dlr.name}</h3>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{dlr.locality}, {dlr.city} ({dlr.distanceKm} km away)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-extrabold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{dlr.rating} ({dlr.reviewCount})</span>
                  </div>
                </div>

                {/* Exclusive Offer Tag */}
                {dlr.exclusiveOffer && (
                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-xs text-emerald-900 flex items-start gap-2.5">
                    <Tag className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-semibold">{dlr.exclusiveOffer}</span>
                  </div>
                )}

                {/* Empanelled Models Handled */}
                <div className="space-y-2">
                  <span className="text-xs text-slate-500 font-semibold block">Empanelled Models in Stock:</span>
                  <div className="flex flex-wrap gap-2">
                    {dlr.empanelledModels.map((m, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-100 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleConnectLead(dlr)}
                    disabled={isConnected || isLoading}
                    className={`py-3 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                      isConnected
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                    }`}
                  >
                    {isConnected ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>Lead Shared</span>
                      </>
                    ) : isLoading ? (
                      <span>Connecting...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Connect Dealer</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedDealer(dlr)}
                    className="py-3 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-900 font-bold text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Book Test Drive</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Test Drive Modal */}
      <TestDriveModal dealer={selectedDealer} onClose={() => setSelectedDealer(null)} />
    </div>
  );
}
