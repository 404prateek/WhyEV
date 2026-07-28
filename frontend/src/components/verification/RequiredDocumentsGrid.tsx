'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, FileText, Home, Key, FileCheck } from 'lucide-react';

const REQUIRED_DOCUMENTS = [
  {
    id: 'aadhaar',
    title: 'Aadhaar Card',
    purpose: 'Identity verification & genuine Delhi resident check',
    isRequired: true,
    formats: 'PDF, JPG, PNG',
    maxSize: '10 MB',
    icon: CreditCard,
    extracted: ['Full Name', 'Delhi Residential Address'],
    notCollected: ['Aadhaar Number for display', 'Biometric data'],
  },
  {
    id: 'electricity_bill',
    title: 'Electricity Bill',
    purpose: 'Verify address & electricity connection provider (BSES / TPDDL / NDMC)',
    isRequired: true,
    formats: 'PDF, JPG, PNG',
    maxSize: '10 MB',
    icon: FileText,
    extracted: ['Consumer CA Number', 'Discom Provider', 'Billing Address', 'Sanctioned Load (kW)'],
    notCollected: ['Bank account details', 'Payment transaction history'],
  },
  {
    id: 'property_proof',
    title: 'Property Ownership Proof',
    purpose: 'Confirm home charger installation eligibility & meter box ownership',
    isRequired: false,
    formats: 'PDF, JPG, PNG',
    maxSize: '10 MB',
    icon: Home,
    extracted: ['Property Address', 'Ownership Confirmation'],
    notCollected: ['Financial valuation', 'Property tax amounts'],
  },
  {
    id: 'tenant_noc',
    title: 'Tenant Consent / NOC',
    purpose: 'Required only for rented properties to confirm landlord charger installation permission',
    isRequired: false,
    formats: 'PDF, JPG, PNG',
    maxSize: '10 MB',
    icon: Key,
    extracted: ['Landlord Consent Confirmation', 'Rental Address'],
    notCollected: ['Monthly rent agreement terms', 'Deposit amounts'],
  },
];

export function RequiredDocumentsGrid() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Required Documents</h3>
        <p className="text-xs text-slate-500 font-normal">
          Review the accepted document types below. You will only upload what is necessary for your claim.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {REQUIRED_DOCUMENTS.map((doc) => {
          const Icon = doc.icon;
          return (
            <motion.div
              key={doc.id}
              whileHover={{ y: -3 }}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 relative flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900">{doc.title}</h4>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      doc.isRequired
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {doc.isRequired ? 'Required' : 'Optional'}
                  </span>
                </div>

                {/* Purpose */}
                <p className="text-xs text-slate-600 font-medium leading-relaxed">{doc.purpose}</p>

                {/* Extracted Fields Summary */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-[11px]">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Extracted Information:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {doc.extracted.map((field, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-semibold"
                      >
                        ✓ {field}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Formats & File Size Footer */}
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-3 border-t border-slate-100">
                <span>Formats: {doc.formats}</span>
                <span>Max Size: {doc.maxSize}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
