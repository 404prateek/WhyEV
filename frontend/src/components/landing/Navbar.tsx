'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SaaSLogo } from './SaaSLogo';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Subsidies', href: '/subsidy' },
    { label: 'Dealers', href: '/dealers' },
    { label: 'About', href: '#why-whyev' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none flex justify-center">
      {/* Fit-Content Floating Pill Navbar (mt-6 / 24px margin-top, rounded-[999px], centered) */}
      <div className="w-full max-w-[1600px] px-6 flex justify-center pointer-events-auto">
        <motion.div
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`w-fit mt-6 px-7 py-3 rounded-[999px] flex items-center gap-10 transition-all duration-300 ${
            scrolled
              ? 'bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-xl shadow-slate-950/5'
              : 'bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-lg shadow-slate-900/5'
          }`}
        >
          {/* Left: SaaS Vector Logo */}
          <Link href="/" className="shrink-0">
            <SaaSLogo />
          </Link>

          {/* Centre Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs font-semibold tracking-wide text-slate-600 hover:text-slate-900 transition-colors py-1"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right CTA Button */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <Link
              href="/recommend"
              className="h-[44px] px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-wide transition-all shadow-md shadow-emerald-600/25 hover:shadow-lg flex items-center gap-2 active:scale-95 group"
            >
              <span>Start Journey</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-slate-700 hover:text-slate-900 focus:outline-none"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </motion.div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden fixed top-24 left-6 right-6 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xl pointer-events-auto space-y-4"
          >
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold text-slate-700 hover:text-emerald-600 py-1.5 transition-colors border-b border-slate-100 last:border-none"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="pt-2">
              <Link
                href="/recommend"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full h-[48px] rounded-full bg-emerald-600 text-white font-bold text-xs text-center flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
              >
                <span>Start Journey</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
