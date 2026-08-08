'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Sparkles,
  Zap,
  BatteryCharging,
  Newspaper,
  LayoutDashboard,
  Store,
  Menu,
  X,
  LogIn,
  LogOut,
  ChevronRight,
  User,
  HelpCircle,
  Star,
  Bookmark,
  Scale,
  Phone,
  Landmark,
  MapPin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SaaSLogo } from './SaaSLogo';
import { Button } from '@/components/buttons/Button';
import { UserDropdown } from '@/components/auth/UserDropdown';
import { LeaveReviewModal } from '@/components/reviews/LeaveReviewModal';
import { useAuth } from '@/hooks/useAuth';
import { useCityStore } from '@/lib/store';
import { ROUTES } from '@/routes/routes';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, logout, openAuthModal } = useAuth();
  const { activeCity, openCityModal } = useCityStore();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', href: ROUTES.HOME, icon: Home },
    { label: 'Shop', href: ROUTES.RECOMMEND, icon: Sparkles },
    { label: 'Map', href: ROUTES.MAP, icon: Zap },
    { label: 'Discover', href: ROUTES.LIVE_FEED, icon: Newspaper },
    { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { label: 'Dealer Connect', href: ROUTES.DEALERS, icon: Store },
  ];

  interface MobileNavItem {
    label: string;
    href?: string;
    icon: React.ElementType;
    desc?: string;
    action?: () => void;
  }

  interface MobileNavCategory {
    title: string;
    items: MobileNavItem[];
  }

  const mobileCategories: MobileNavCategory[] = [
    {
      title: 'Navigation',
      items: [
        { label: 'Home', href: ROUTES.HOME, icon: Home, desc: 'WhyEV homepage' },
        { label: 'Shop', href: ROUTES.RECOMMEND, icon: Sparkles, desc: 'Explore & compare EVs' },
        { label: 'Map', href: ROUTES.MAP, icon: Zap, desc: 'Find charging stations' },
        { label: 'Battery Health', href: ROUTES.BATTERY_HEALTH, icon: BatteryCharging, desc: 'SOH diagnostics & certificate' },
        { label: 'Discover', href: ROUTES.LIVE_FEED, icon: Newspaper, desc: 'EV news & policy updates' },
        { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard, desc: 'Personal EV control center' },
        { label: 'Dealer Connect', href: ROUTES.DEALERS, icon: Store, desc: 'Verified EV dealerships' },
        { label: 'Subsidy Calculator', href: ROUTES.SUBSIDY, icon: Landmark, desc: 'Calculate incentives & tax benefits' },
      ],
    },
    {
      title: 'Utilities',
      items: [
        { label: 'Saved Vehicles', href: '/profile#saved', icon: Bookmark, desc: 'Your saved shortlist' },
        { label: 'Compare Vehicles', href: '/recommend?flow=compare', icon: Scale, desc: 'Side-by-side comparison' },
        { label: 'Reviews', href: '/dealers#reviews', icon: Star, desc: 'Verified buyer feedback' },
      ],
    },
    {
      title: 'Support',
      items: [
        { label: 'Help Center', href: '/profile#support', icon: HelpCircle, desc: 'FAQs and support guides' },
        { label: 'Contact Support', href: '/profile#contact', icon: Phone, desc: 'Get in touch with WhyEV team' },
        {
          label: 'Leave a Review',
          icon: Star,
          desc: 'Share your EV experience',
          action: () => setIsReviewModalOpen(true),
        },
      ],
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 pointer-events-none flex justify-center px-2 sm:px-4">
      <div className="w-full max-w-7xl flex justify-center pointer-events-auto">
        <motion.div
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`w-full lg:w-fit mt-2.5 sm:mt-5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-[999px] flex items-center justify-between gap-2 sm:gap-4 transition-all duration-300 ${
            scrolled
              ? 'bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-xl shadow-slate-950/5'
              : 'bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-lg shadow-slate-900/5'
          }`}
        >
          {/* Mobile Left: Hamburger Trigger & WhyEV Logo Group */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-slate-700 hover:text-slate-900 focus:outline-none flex items-center justify-center cursor-pointer rounded-full hover:bg-slate-100 shrink-0"
              aria-label="Open Navigation Drawer"
            >
              <Menu className="w-5 h-5 text-slate-900" />
            </button>

            <Link href={ROUTES.HOME}>
              <SaaSLogo />
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href === ROUTES.RECOMMEND && pathname === '/shop');
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative flex items-center px-3 py-1.5 rounded-full text-xs font-bold transition-all select-none ${
                    isActive
                      ? 'text-emerald-800 bg-emerald-50/90 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="desktopNavActiveIndicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-600 rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={openCityModal}
              className="flex items-center gap-1 sm:gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-[11px] sm:text-xs font-extrabold border border-slate-200/90 transition-all cursor-pointer select-none"
              title={activeCity.name}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="hidden sm:inline">
                {activeCity.name}
              </span>
            </button>

            {mounted && isAuthenticated ? (
              <UserDropdown />
            ) : (
              <Button
                variant="emerald"
                size="sm"
                onClick={() => openAuthModal()}
                className="rounded-full px-3.5 text-xs font-extrabold"
              >
                Sign In
              </Button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Phone-Only Left Sliding Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs pointer-events-auto"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 240 }}
              className="lg:hidden fixed top-0 bottom-0 left-0 z-50 w-[320px] max-w-[85vw] bg-white border-r border-slate-200 shadow-2xl pointer-events-auto flex flex-col justify-between p-6 pb-24 overflow-y-auto text-slate-900"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <Link href={ROUTES.HOME} onClick={() => setMobileMenuOpen(false)}>
                    <SaaSLogo showLogo={true} />
                  </Link>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {mobileCategories.map((cat, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 flex items-center justify-between">
                        <span>{cat.title}</span>
                      </div>
                      <div className="space-y-1">
                        {cat.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = item.href ? pathname === item.href : false;

                          if (item.action) {
                            return (
                              <button
                                key={item.label}
                                onClick={() => {
                                  setMobileMenuOpen(false);
                                  item.action?.();
                                }}
                                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 border border-slate-100 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer min-h-[46px]"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-xl bg-white text-slate-600 border border-slate-200 flex items-center justify-center shrink-0">
                                    <Icon className="w-4 h-4 text-emerald-600" />
                                  </div>
                                  <div className="text-xs font-bold text-slate-900 text-left">
                                    {item.label}
                                  </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                              </button>
                            );
                          }

                          return (
                            <Link
                              key={item.label}
                              href={item.href || '#'}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`flex items-center justify-between p-3 rounded-2xl transition-all min-h-[46px] ${
                                isActive
                                  ? 'bg-emerald-50 border border-emerald-200/90 text-emerald-900 font-extrabold shadow-2xs'
                                  : 'bg-slate-50/70 border border-slate-100 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                    isActive
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-white text-slate-600 border border-slate-200'
                                  }`}
                                >
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="text-xs font-bold text-slate-900">
                                  {item.label}
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3 mt-6">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2">
                  Account
                </div>

                <Link
                  href={ROUTES.PROFILE}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 border border-slate-100 text-slate-700 hover:bg-slate-100 transition-all min-h-[46px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white text-slate-600 border border-slate-200 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-xs font-bold text-slate-900">
                      My Profile
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </Link>

                {mounted && isAuthenticated ? (
                  <Button
                    variant="outline"
                    fullWidth
                    leftIcon={<LogOut className="w-4 h-4 text-slate-600" />}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                  >
                    Logout
                  </Button>
                ) : (
                  <Button
                    variant="emerald"
                    fullWidth
                    leftIcon={<LogIn className="w-4 h-4" />}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal();
                    }}
                  >
                    Login
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <LeaveReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />
    </header>
  );
}
