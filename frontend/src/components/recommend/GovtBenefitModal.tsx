'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, ExternalLink, Calculator, FileCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export interface BenefitSchemeDetail {
  id: string;
  title: string;
  category: string;
  shortDesc: string;
  fullOverview: string;
  whyQualify: string;
  estimatedSavings: string;
  eligibilityCriteria: string[];
  calculationFormula: string;
  applicationType: 'Automatic at RTO' | 'Manual Online Application' | 'Direct Dealer Instant Discount';
  officialLink?: string;
}

interface GovtBenefitModalProps {
  benefit: BenefitSchemeDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export function GovtBenefitModal({ benefit, isOpen, onClose }: GovtBenefitModalProps) {
  if (!isOpen || !benefit) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6 text-slate-900 max-h-[88vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black">
              <ShieldCheck className="w-4 h-4 fill-white" />
              <span>Government Benefit Transparency</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {benefit.title}
            </h3>
            <p className="text-xs text-slate-500 font-medium">{benefit.shortDesc}</p>
          </div>

          {/* Savings Highlight Box */}
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">Your Estimated Savings</span>
              <div className="text-2xl font-black text-emerald-700">{benefit.estimatedSavings}</div>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-white border border-emerald-300 text-emerald-900 text-xs font-extrabold shadow-2xs">
              {benefit.applicationType}
            </div>
          </div>

          {/* 1. Scheme Overview */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Scheme Overview</h4>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {benefit.fullOverview}
            </p>
          </div>

          {/* 2. Why You Qualify */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Why You Qualify</h4>
            <p className="text-xs sm:text-sm text-slate-800 font-bold bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200">
              {benefit.whyQualify}
            </p>
          </div>

          {/* 3. Eligibility Criteria */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Eligibility Criteria</h4>
            <div className="space-y-1.5">
              {benefit.eligibilityCriteria.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. How Savings Were Calculated */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>How Savings Were Calculated</span>
            </h4>
            <div className="text-xs font-mono bg-slate-900 text-emerald-400 p-4 rounded-2xl border border-slate-800">
              {benefit.calculationFormula}
            </div>
          </div>

          {/* Official Link Button */}
          {benefit.officialLink && (
            <div className="border-t border-slate-100 pt-4 flex justify-end">
              <a
                href={benefit.officialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>Official Policy Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
