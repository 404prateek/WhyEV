'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/buttons/Button';
import { ROUTES } from '@/routes/routes';

export function FinalCta() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] h-[350px] bg-emerald-50/80 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-3xl mx-auto text-center relative z-10 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Delhi EV Policy 2026 Ready</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Ready to find your <br />
            <span className="text-emerald-600">perfect EV?</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed font-normal">
            Join thousands of Delhi-NCR buyers making informed, subsidy-backed EV decisions with 100% transparency.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href={ROUTES.RECOMMEND}>
            <Button size="lg" variant="emerald" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Start Your Journey
            </Button>
          </Link>

          <Link href={ROUTES.SUBSIDY}>
            <Button size="lg" variant="secondary">
              Check Delhi Subsidy
            </Button>
          </Link>
        </motion.div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>No upfront signup required</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Zero sales spam calls</span>
          </div>
        </div>
      </div>
    </section>
  );
}
