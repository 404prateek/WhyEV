'use client';

import React, { useState } from 'react';
import { Upload, Camera, FileText, CheckCircle2, Trash2, Sparkles } from 'lucide-react';

interface UploadedFileState {
  aadhaar?: { name: string; size: string; previewUrl?: string };
  electricity_bill?: { name: string; size: string; previewUrl?: string };
}

interface DocumentUploadSectionProps {
  onStartExtraction: (files: UploadedFileState) => void;
}

export function DocumentUploadSection({ onStartExtraction }: DocumentUploadSectionProps) {
  const [files, setFiles] = useState<UploadedFileState>({});

  const handleSimulateUpload = (type: 'aadhaar' | 'electricity_bill', name: string) => {
    setFiles((prev) => ({
      ...prev,
      [type]: { name, size: '1.8 MB' },
    }));
  };

  const handleRemove = (type: 'aadhaar' | 'electricity_bill') => {
    setFiles((prev) => {
      const copy = { ...prev };
      delete copy[type];
      return copy;
    });
  };

  const isReadyToProcess = files.aadhaar && files.electricity_bill;

  return (
    <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
      <div className="space-y-1">
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Upload Documents for Verification</h3>
        <p className="text-xs text-slate-500 font-normal">
          Upload clear copies of your Aadhaar Card and Electricity Bill. Supports PDF, JPG, PNG up to 10MB.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Aadhaar Upload Card */}
        <div className="p-6 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-300 space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-slate-900">Aadhaar Card (Front/Back)</h4>
            <p className="text-xs text-slate-500">Drag & drop your file here, or browse from device</p>
          </div>

          {files.aadhaar ? (
            <div className="p-4 rounded-2xl bg-white border border-emerald-300 flex items-center justify-between text-xs text-slate-800">
              <div className="flex items-center gap-2 font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="truncate max-w-[140px]">{files.aadhaar.name}</span>
                <span className="text-[10px] text-slate-400 font-normal">({files.aadhaar.size})</span>
              </div>
              <button
                onClick={() => handleRemove('aadhaar')}
                className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                title="Remove file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <button
                onClick={() => handleSimulateUpload('aadhaar', 'Aadhaar_Card_Verified.pdf')}
                className="w-full sm:w-auto py-2.5 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Upload className="w-4 h-4" />
                <span>Browse File</span>
              </button>
              <button
                onClick={() => handleSimulateUpload('aadhaar', 'Aadhaar_Photo_Scan.jpg')}
                className="w-full sm:w-auto py-2.5 px-4 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Camera</span>
              </button>
            </div>
          )}
        </div>

        {/* Electricity Bill Upload Card */}
        <div className="p-6 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-300 space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-slate-900">Latest Electricity Bill</h4>
            <p className="text-xs text-slate-500">BSES Yamuna/Rajdhani, TPDDL, or NDMC bill copy</p>
          </div>

          {files.electricity_bill ? (
            <div className="p-4 rounded-2xl bg-white border border-emerald-300 flex items-center justify-between text-xs text-slate-800">
              <div className="flex items-center gap-2 font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="truncate max-w-[140px]">{files.electricity_bill.name}</span>
                <span className="text-[10px] text-slate-400 font-normal">({files.electricity_bill.size})</span>
              </div>
              <button
                onClick={() => handleRemove('electricity_bill')}
                className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                title="Remove file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <button
                onClick={() => handleSimulateUpload('electricity_bill', 'Electricity_Bill_July2026.pdf')}
                className="w-full sm:w-auto py-2.5 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Upload className="w-4 h-4" />
                <span>Browse File</span>
              </button>
              <button
                onClick={() => handleSimulateUpload('electricity_bill', 'Bill_Photo_Scan.jpg')}
                className="w-full sm:w-auto py-2.5 px-4 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Camera</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Start Extraction CTA */}
      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button
          onClick={() => onStartExtraction(files)}
          disabled={!isReadyToProcess}
          className="py-3.5 px-8 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 fill-white" />
          <span>Extract Information & Verify Documents</span>
        </button>
      </div>
    </div>
  );
}
