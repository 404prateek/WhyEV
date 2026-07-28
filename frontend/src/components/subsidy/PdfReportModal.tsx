'use client';

import React from 'react';
import { X, Download, ShieldCheck, Calendar, Sparkles } from 'lucide-react';
import { useSubsidyStore, useAuthStore } from '@/lib/store';
import { formatINR } from '@/lib/utils';

export function PdfReportModal() {
  const { isPdfModalOpen, setPdfModalOpen, calculatedIncentive, scrappageIncentive, taxWaiverIncentive } = useSubsidyStore();
  const { user } = useAuthStore();

  if (!isPdfModalOpen) return null;

  const totalBenefit = calculatedIncentive + scrappageIncentive + taxWaiverIncentive;

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-900 space-y-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setPdfModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Report Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-extrabold">
              <Sparkles className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold tracking-tight text-slate-900">WhyEV Subsidy Eligibility Certificate</h3>
              <p className="text-xs text-emerald-700 font-semibold">Delhi EV Policy 2026 (Ref: GNCTD Transport Dept)</p>
            </div>
          </div>
          <div className="text-right text-[11px] text-slate-400 font-medium">
            <div>Report ID: #DEL-2026-8809</div>
            <div>Issued: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* User Info */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <span className="text-slate-500 block">Applicant Name:</span>
            <span className="font-bold text-slate-900">{user?.name || 'Abhishek Sharma'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Residency Verification:</span>
            <span className="font-bold text-emerald-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Delhi/NCR
            </span>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Incentive Calculation Breakdown</h4>
          <div className="rounded-2xl border border-slate-200 overflow-hidden text-xs">
            <div className="bg-slate-50 px-4 py-2.5 font-bold text-slate-500 grid grid-cols-2">
              <span>Benefit Type</span>
              <span className="text-right">Amount (INR)</span>
            </div>
            <div className="p-4 space-y-2.5 bg-white">
              <div className="flex justify-between">
                <span className="text-slate-600">Direct Purchase Incentive (4W - 40.5 kWh)</span>
                <span className="font-bold text-slate-900">{formatINR(calculatedIncentive)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">ICE Vehicle Scrappage Bonus</span>
                <span className="font-bold text-slate-900">{formatINR(scrappageIncentive)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">100% Road Tax & Registration Fee Waiver</span>
                <span className="font-bold text-slate-900">{formatINR(taxWaiverIncentive)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-100 text-sm font-extrabold">
                <span className="text-slate-900">Total Financial Benefit:</span>
                <span className="text-emerald-700">{formatINR(totalBenefit)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mandatory Rule Box */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs">
          <Calendar className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-900">Mandatory 30-Day Filing Rule</div>
            <p className="text-slate-600 leading-relaxed font-normal">
              Per Delhi EV Policy 2026, subsidy claim applications must be submitted on the official portal within exactly 30 days of RC issuance.
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={() => setPdfModalOpen(false)}
            className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold transition-all"
          >
            Close Preview
          </button>
          <button
            onClick={handleDownload}
            className="px-7 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Official PDF Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
