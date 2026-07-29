'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Menu, X, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SaaSLogo } from './SaaSLogo';
import { Button } from '@/components/buttons/Button';
import { UserDropdown } from '@/components/auth/UserDropdown';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/routes/routes';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, openAuthModal } = useAuth();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getHref = (hashOrPath: string) => {
    if (hashOrPath.startsWith('#')) {
      return mounted && pathname === '/' ? hashOrPath : `/${hashOrPath}`;
    }
    return hashOrPath;
  };

  // Static navLinks array ensured to be identical on Server and Initial Client Render
  const navLinks = [
    { label: 'Home', href: getHref('#home') },
    { label: 'Features', href: getHref('#features') },
    { label: 'How It Works', href: getHref('#how-it-works') },
    { label: 'Subsidies', href: ROUTES.SUBSIDY },
    { label: 'Map', href: ROUTES.MAP },
    { label: 'Dashboard', href: ROUTES.DASHBOARD },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 pointer-events-none flex justify-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-center pointer-events-auto">
        <motion.div
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`w-fit mt-4 sm:mt-6 px-4 sm:px-6 py-2.5 sm:py-3 rounded-[999px] flex items-center gap-4 sm:gap-6 transition-all duration-300 ${
            scrolled
              ? 'bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-xl shadow-slate-950/5'
              : 'bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-lg shadow-slate-900/5'
          }`}
        >
          {/* Logo */}
          <Link href={ROUTES.HOME} className="shrink-0">
            <SaaSLogo />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6">
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

          {/* Far Right Auth Controls Section */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0 pl-3 border-l border-slate-200/80">
            {mounted && isAuthenticated ? (
              <UserDropdown />
            ) : (
              <>
                <Button size="sm" variant="ghost" onClick={() => openAuthModal()}>
                  Log in
                </Button>
                <Button
                  size="sm"
                  variant="emerald"
                  onClick={() => openAuthModal()}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:text-slate-900 focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
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
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="lg:hidden fixed top-20 left-4 right-4 bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-6 shadow-2xl pointer-events-auto space-y-4 z-50"
          >
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-sm font-semibold py-2.5 px-3 rounded-xl transition-colors border-b border-slate-100/80 last:border-none flex items-center justify-between min-h-[44px] ${
                      isActive ? 'bg-emerald-50 text-emerald-800 font-extrabold' : 'text-slate-700 hover:text-emerald-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              {mounted && isAuthenticated ? (
                <div className="flex justify-center">
                  <UserDropdown />
                </div>
              ) : (
                <>
                  <Button
                    fullWidth
                    variant="outline"
                    leftIcon={<LogIn className="w-4 h-4" />}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal();
                    }}
                  >
                    Log in
                  </Button>
                  <Button
                    fullWidth
                    variant="emerald"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal();
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
