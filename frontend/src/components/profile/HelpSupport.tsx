'use client';

import React, { useState } from 'react';
import { HelpCircle, Mail, MessageSquare, Send, ChevronDown, Check, Bug } from 'lucide-react';
import { Button } from '@/components/buttons/Button';

export function HelpSupport() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [bugSubject, setBugSubject] = useState('');
  const [bugDescription, setBugDescription] = useState('');
  const [bugSubmitted, setBugSubmitted] = useState(false);

  const faqs = [
    {
      q: 'How does the 30-day Delhi EV Policy 2026 post-RC rule work?',
      a: 'Under the live Delhi EV Policy 2026 (effective July 2026), purchase incentive claims must be uploaded to the portal strictly within 30 days of RC issuance. WhyEV automatically tracks your RC issuance date and alerts you before expiry.',
    },
    {
      q: 'Are road tax and registration fee waivers automatic at showrooms?',
      a: 'Yes, 100% road tax and registration fee waivers for empanelled 2W, 3W, and 4W EVs are applied directly at the Delhi RTO registration stage. WhyEV generates an official PDF proof that showroom staff can accept.',
    },
    {
      q: 'Why does WhyEV promise zero sales spam calls?',
      a: 'Unlike aggressive lead generators, your contact details are shared ONLY with showrooms you explicitly opt-in to connect with. Dealers receive warm, pre-qualified specs without unsolicited cold outreach.',
    },
    {
      q: 'How is the Battery Health Score (0-100) calculated?',
      a: 'WhyEV coordinates visits with NABL-certified technician partners who run diagnostic scans checking cell degradation, thermal history, cycle counts, and remaining useful life.',
    },
  ];

  const handleReportBug = (e: React.FormEvent) => {
    e.preventDefault();
    setBugSubmitted(true);
    setBugSubject('');
    setBugDescription('');
    setTimeout(() => setBugSubmitted(false), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Help & Support</h3>
            <p className="text-xs text-slate-500 font-normal">Delhi EV Policy 2026 guidance & customer support</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <a
            href="mailto:support@whyev.in"
            className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-emerald-50 hover:border-emerald-200 transition-colors flex items-center gap-3 group"
          >
            <Mail className="w-5 h-5 text-slate-500 group-hover:text-emerald-600 transition-colors shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-900">Email Support</div>
              <div className="text-[11px] text-slate-500 font-normal">support@whyev.in (&lt; 24h response)</div>
            </div>
          </a>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-900">Live AI Assistant</div>
              <div className="text-[11px] text-slate-500 font-normal">Click the floating EV icon on bottom right</div>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h4 className="text-base font-bold text-slate-900">Frequently Asked Questions</h4>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="border border-slate-200/80 rounded-2xl overflow-hidden transition-colors">
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 bg-slate-50/60 hover:bg-slate-100/80 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="p-4 text-xs text-slate-600 leading-relaxed bg-white border-t border-slate-100 font-normal">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Report a Bug Form */}
      <form onSubmit={handleReportBug} className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Bug className="w-5 h-5 text-emerald-600" />
          <h4 className="text-base font-bold text-slate-900">Report an Issue or Bug</h4>
        </div>

        {bugSubmitted && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Thank you! Your feedback has been submitted to Team Zeta engineering.</span>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-700">Subject</label>
            <input
              type="text"
              placeholder="e.g. Issue calculating scrappage bonus"
              value={bugSubject}
              onChange={(e) => setBugSubject(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all mt-1"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">Description</label>
            <textarea
              rows={3}
              placeholder="Please describe what happened and steps to reproduce..."
              value={bugDescription}
              onChange={(e) => setBugDescription(e.target.value)}
              className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-normal focus:outline-none focus:border-emerald-500 focus:bg-white transition-all mt-1"
              required
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button size="sm" variant="emerald" type="submit" rightIcon={<Send className="w-3.5 h-3.5" />}>
            Submit Report
          </Button>
        </div>
      </form>
    </div>
  );
}
