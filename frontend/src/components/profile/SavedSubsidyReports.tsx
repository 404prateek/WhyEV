'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Download, Trash2, ArrowUpRight, ShieldCheck, Eye } from 'lucide-react';
import { SavedSubsidyReport } from '@/types';
import { Button } from '@/components/buttons/Button';
import { PdfReportModal } from '@/components/subsidy/PdfReportModal';
import { useSubsidyStore } from '@/lib/store';
import { ROUTES } from '@/routes/routes';

interface SavedSubsidyReportsProps {
  reports: SavedSubsidyReport[];
  onRemove: (id: string) => void;
}

export function SavedSubsidyReports({ reports, onRemove }: SavedSubsidyReportsProps) {
  const { isPdfModalOpen, setPdfModalOpen } = useSubsidyStore();

  const handleOpenPdf = () => {
    setPdfModalOpen(true);
  };

  if (reports.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-3xl p-10 sm:p-14 shadow-sm text-center space-y-6 max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
          <FileText className="w-8 h-8 text-emerald-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">No Saved Subsidy Reports</h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto font-normal">
            Calculate your official Delhi EV Policy 2026 purchase incentives, scrappage bonuses, and 100% road tax waivers.
          </p>
        </div>
        <div className="pt-2">
          <Link href={ROUTES.SUBSIDY}>
            <Button size="md" variant="emerald" rightIcon={<ArrowUpRight className="w-4 h-4" />}>
              Calculate Delhi Subsidy
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Saved Subsidy Reports</h3>
          <p className="text-xs text-slate-500 font-normal">Official calculations generated under Delhi EV Policy 2026</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
          {reports.length} Reports
        </span>
      </div>

      <div className="space-y-4">
        {reports.map((r) => (
          <div
            key={r.id}
            className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {r.state} Policy 2026
                </span>
                <span className="text-xs text-slate-400 font-normal">• Generated on {r.dateGenerated}</span>
              </div>

              <h4 className="text-base font-bold text-slate-900">{r.vehicleName}</h4>

              <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                <span>Battery: {r.batteryCapacityKwh} kWh</span>
                <span>•</span>
                <span>Scrappage Included: {r.scrappageIncluded ? 'Yes' : 'No'}</span>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-3 shrink-0">
              <div className="text-left sm:text-right">
                <div className="text-[10px] text-slate-400 font-medium uppercase">Total Benefit Claimable</div>
                <div className="text-xl font-extrabold text-emerald-600">₹{r.estimatedSavings.toLocaleString('en-IN')}</div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" leftIcon={<Eye className="w-3.5 h-3.5" />} onClick={handleOpenPdf}>
                  View Summary
                </Button>
                <Button size="sm" variant="emerald" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={handleOpenPdf}>
                  PDF
                </Button>
                <button
                  onClick={() => onRemove(r.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete report"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PDF Modal Integration */}
      <PdfReportModal />
    </div>
  );
}
