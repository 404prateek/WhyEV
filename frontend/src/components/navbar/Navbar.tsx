'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SaaSLogo } from './SaaSLogo';
import { Button } from '@/components/buttons/Button';
import { ROUTES } from '@/routes/routes';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getHref = (hashOrPath: string) => {
    if (hashOrPath.startsWith('#')) {
      return pathname === '/' ? hashOrPath : `/${hashOrPath}`;
    }
    return hashOrPath;
  };

  const navLinks = [
    { label: 'Home', href: getHref('#home') },
    { label: 'Features', href: getHref('#features') },
    { label: 'How It Works', href: getHref('#how-it-works') },
    { label: 'Subsidies', href: ROUTES.SUBSIDY },
    { label: 'Dealers', href: ROUTES.DEALERS },
    { label: 'Dashboard', href: ROUTES.DASHBOARD },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none flex justify-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-center pointer-events-auto">
        <motion.div
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`w-fit mt-4 sm:mt-6 px-5 sm:px-7 py-2.5 sm:py-3 rounded-[999px] flex items-center gap-6 sm:gap-10 transition-all duration-300 ${
            scrolled
              ? 'bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-xl shadow-slate-950/5'
              : 'bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-lg shadow-slate-900/5'
          }`}
        >
          {/* Logo */}
          <Link href={ROUTES.HOME} className="shrink-0">
            <SaaSLogo />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs font-semibold tracking-wide text-slate-600 hover:text-emerald-600 transition-colors py-1"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right CTA */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <Link href={ROUTES.RECOMMEND}>
              <Button size="sm" variant="emerald" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Start Journey
              </Button>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-slate-700 hover:text-slate-900 focus:outline-none"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </motion.div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden fixed top-20 left-4 right-4 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xl pointer-events-auto space-y-4"
          >
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold text-slate-700 hover:text-emerald-600 py-2 transition-colors border-b border-slate-100 last:border-none"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="pt-2">
              <Link href={ROUTES.RECOMMEND} onClick={() => setMobileMenuOpen(false)}>
                <Button fullWidth variant="emerald" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Start Journey
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
