'use client';

import React, { useState } from 'react';
import { CheckCircle2, Edit2 } from 'lucide-react';

interface ExtractedData {
  applicantName: string;
  delhiAddress: string;
  discomProvider: string;
  caNumber: string;
  sanctionedLoadKw: string;
  propertyType: string;
}

interface ReviewExtractedInfoSectionProps {
  onConfirm: (data: ExtractedData) => void;
}

export function ReviewExtractedInfoSection({ onConfirm }: ReviewExtractedInfoSectionProps) {
  const [formData, setFormData] = useState<ExtractedData>({
    applicantName: 'Abhishek Sharma',
    delhiAddress: 'Flat 402, Block A, Select CITYWALK Enclave, Saket, New Delhi - 110017',
    discomProvider: 'BSES Rajdhani Power Limited (BRPL)',
    caNumber: '1029384756',
    sanctionedLoadKw: '5 kW (Compatible with 3.3kW / 7.2kW AC Wallbox)',
    propertyType: 'Gated Society Apartment',
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (field: keyof ExtractedData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>AI OCR Extraction Complete</span>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Review Extracted Information</h3>
          <p className="text-xs text-slate-500 font-normal">
            Please verify the extracted details below. You can edit any field if corrections are needed.
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Done Editing' : 'Edit Fields'}</span>
        </button>
      </div>

      {/* Extracted Fields Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700">Applicant Full Name:</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.applicantName}
              onChange={(e) => handleChange('applicantName', e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          ) : (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 font-bold text-slate-900">
              {formData.applicantName}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-slate-700">Discom Utility Provider:</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.discomProvider}
              onChange={(e) => handleChange('discomProvider', e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          ) : (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 font-bold text-slate-900">
              {formData.discomProvider}
            </div>
          )}
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <label className="font-bold text-slate-700">Delhi Residential Billing Address:</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.delhiAddress}
              onChange={(e) => handleChange('delhiAddress', e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          ) : (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 font-bold text-slate-900">
              {formData.delhiAddress}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-slate-700">Electricity CA Number:</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.caNumber}
              onChange={(e) => handleChange('caNumber', e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          ) : (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 font-bold text-slate-900 font-mono">
              {formData.caNumber}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-slate-700">Sanctioned Electrical Load:</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.sanctionedLoadKw}
              onChange={(e) => handleChange('sanctionedLoadKw', e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          ) : (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 font-bold text-slate-900">
              {formData.sanctionedLoadKw}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
