'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface ExtractionProgressModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const EXTRACTION_STEPS = [
  'Uploading RC photo / invoice to S3 storage',
  'Processing RC photo / invoice via Vision LLM',
  'Extracting RC number, date, category & chassis (OCR)',
  'Validating DISCOM CA number & sanctioned load',
  'Preparing EV subsidy eligibility pre-fill form',
];

export function ExtractionProgressModal({ isOpen, onComplete }: ExtractionProgressModalProps) {
  const [completedStepIndex, setCompletedStepIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCompletedStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCompletedStepIndex((prev) => {
        if (prev < EXTRACTION_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 800);
          return prev;
        }
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-white border border-slate-200/90 rounded-3xl p-8 shadow-2xl text-slate-900 space-y-6 relative overflow-hidden text-center"
        >
          {/* Top Header Badge */}
          <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-8 h-8 animate-spin" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Extracting Document Information
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              DigiLocker OCR engine is processing your documents securely.
            </p>
          </div>

          {/* Steps List */}
          <div className="space-y-3 text-left pt-2">
            {EXTRACTION_STEPS.map((stepText, idx) => {
              const isDone = idx <= completedStepIndex;
              const isCurrent = idx === completedStepIndex;

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between text-xs ${
                    isDone
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-400 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                    )}
                    <span>{stepText}</span>
                  </div>

                  {isCurrent && !isDone && (
                    <Loader2 className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
