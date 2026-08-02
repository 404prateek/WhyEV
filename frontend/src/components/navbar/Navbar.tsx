'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Sparkles,
  Landmark,
  Zap,
  BatteryCharging,
  Newspaper,
  LayoutDashboard,
  Store,
  ShoppingBag,
  Menu,
  X,
  ArrowRight,
  LogIn,
  LogOut,
  ChevronRight,
  MapPin,
  User,
  HelpCircle,
  ShieldCheck,
  Star,
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
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const { activeCity, openCityModal } = useCityStore();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getUserInitials = (userObj: any) => {
    if (!userObj || !userObj.name) return 'AD';
    const parts = userObj.name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  const navItems = [
    { label: 'Home', href: ROUTES.HOME, icon: Home },
    { label: 'Shop', href: ROUTES.RECOMMEND, icon: Sparkles },
    { label: 'Certified Used EVs', href: ROUTES.MARKETPLACE, icon: ShoppingBag },
    { label: 'Map', href: ROUTES.MAP, icon: Zap },
    { label: 'Discover', href: ROUTES.LIVE_FEED, icon: Newspaper },
    { label: 'Battery Health', href: ROUTES.BATTERY_CERT, icon: BatteryCharging },
    { label: 'Inspection', href: ROUTES.DEALERS, icon: Store },
    { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  ];

  interface MobileNavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    desc: string;
  }

  interface MobileNavCategory {
    title: string;
    items: MobileNavItem[];
  }

  const mobileCategories: MobileNavCategory[] = [
    {
      title: 'Discovery & Platform',
      items: [
        { label: 'Shop', href: ROUTES.RECOMMEND, icon: Sparkles, desc: 'Personalized electric vehicle marketplace' },
        { label: 'Discover', href: ROUTES.LIVE_FEED, icon: Newspaper, desc: 'Launches, policy alerts & EV updates' },
        { label: 'Charging Stations Map', href: ROUTES.MAP, icon: Zap, desc: 'Live availability & charging map' },
      ],
    },
    {
      title: 'Health & Intelligence',
      items: [
        { label: 'Battery Health & Inspection', href: ROUTES.BATTERY_CERT, icon: BatteryCharging, desc: 'Certified cell health & diagnostics' },
        { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard, desc: 'View claim status & saved vehicles' },
      ],
    },
    {
      title: 'Marketplace',
      items: [
        { label: 'Verified Showrooms', href: ROUTES.DEALERS, icon: Store, desc: 'Verified Delhi NCR EV dealers' },
        { label: 'Used EV Marketplace', href: ROUTES.MARKETPLACE, icon: ShoppingBag, desc: 'Pre-inspected pre-owned EVs' },
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
              onClick={() => {
                setProfileDropdownOpen(false);
                setMobileMenuOpen(true);
              }}
              className="lg:hidden p-1.5 text-slate-700 hover:text-slate-900 focus:outline-none flex items-center justify-center cursor-pointer rounded-full hover:bg-slate-100 shrink-0"
              aria-label="Open Navigation Drawer"
            >
              <Menu className="w-5 h-5 text-slate-900" />
            </button>

            <Link href={ROUTES.HOME} onClick={() => setProfileDropdownOpen(false)}>
              <SaaSLogo />
            </Link>
          </div>

          {/* Desktop Automotive Marketplace Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all select-none ${
                    isActive
                      ? 'text-emerald-800 bg-emerald-50/90 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
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

          {/* Desktop Location Pill */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <button
              onClick={openCityModal}
              className="px-3 py-1.5 rounded-full bg-slate-100/90 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 border border-slate-200/90 hover:border-emerald-300 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Select Location"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{activeCity?.name || 'Select Location'}</span>
            </button>
          </div>

          {/* Desktop Far Right Auth Controls */}
          <div className="hidden sm:flex items-center gap-2 shrink-0 pl-2 border-l border-slate-200/80">
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

          {/* Mobile Right Controls: Location Icon Button + Circular Profile Button */}
          <div className="lg:hidden flex items-center gap-2 shrink-0">
            {/* Clickable Mobile Location Icon Button */}
            <button
              onClick={openCityModal}
              className="px-2 py-1 rounded-full bg-slate-100/90 hover:bg-emerald-50 text-slate-800 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer transition-all border border-slate-200/90 shrink-0"
              title="Select Location"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate max-w-[85px]">{activeCity?.name || 'Select Location'}</span>
            </button>

            {/* Circular Profile Button */}
            {mounted && isAuthenticated ? (
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-9 h-9 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center border border-emerald-500 shadow-xs cursor-pointer hover:bg-emerald-700 transition-colors shrink-0"
                title="Profile Menu"
                aria-label="Profile Menu"
              >
                {getUserInitials(user)}
              </button>
            ) : (
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                title="Profile Menu"
                aria-label="Profile Menu"
              >
                <User className="w-4.5 h-4.5" />
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Mobile Profile Dropdown Menu */}
      <AnimatePresence>
        {profileDropdownOpen && (
          <>
            <div
              onClick={() => setProfileDropdownOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-transparent pointer-events-auto"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden fixed top-16 sm:top-20 right-3 sm:right-6 z-50 w-72 bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-4 shadow-2xl space-y-3.5 pointer-events-auto text-slate-900"
            >
              {/* Location Display Section at Top of Dropdown */}
              <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 truncate">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{activeCity?.name || 'Select Location'}</span>
                </div>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    openCityModal();
                  }}
                  className="text-[11px] font-extrabold text-emerald-700 hover:text-emerald-900 underline cursor-pointer shrink-0"
                >
                  Change
                </button>
              </div>

              {/* User Identity Banner (if logged in) */}
              {mounted && isAuthenticated && (
                <div className="px-2 py-1 border-b border-slate-100 pb-2.5">
                  <div className="text-xs font-black text-slate-900 truncate">{user?.name || 'User Profile'}</div>
                  <div className="text-[11px] text-slate-500 font-medium truncate">{user?.email || 'user@example.com'}</div>
                </div>
              )}

              {/* Dropdown Navigation Options */}
              <div className="space-y-1 text-xs font-bold text-slate-700">
                <Link
                  href={ROUTES.PROFILE}
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  <span>User Profile</span>
                </Link>

                <Link
                  href={ROUTES.DASHBOARD}
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-500" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/profile#support"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <HelpCircle className="w-4 h-4 text-slate-500" />
                  <span>Help & Support</span>
                </Link>
              </div>

              {/* Auth Button at Bottom of Dropdown */}
              <div className="pt-2 border-t border-slate-100">
                {mounted && isAuthenticated ? (
                  <Button
                    variant="outline"
                    fullWidth
                    size="sm"
                    leftIcon={<LogOut className="w-4 h-4 text-slate-600" />}
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                  >
                    Logout
                  </Button>
                ) : (
                  <Button
                    variant="emerald"
                    fullWidth
                    size="sm"
                    leftIcon={<LogIn className="w-4 h-4" />}
                    onClick={() => {
                      setProfileDropdownOpen(false);
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

      {/* Phone-Only Left Sliding Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs pointer-events-auto"
            />

            {/* Left Sliding Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 240 }}
              className="lg:hidden fixed top-0 bottom-0 left-0 z-50 w-[310px] max-w-[85vw] bg-white border-r border-slate-200 shadow-2xl pointer-events-auto flex flex-col justify-between p-6 pb-32 overflow-y-auto text-slate-900"
            >
              <div className="space-y-6">
                {/* Drawer Header */}
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

                {/* Navigation Sections */}
                <div className="space-y-5">
                  {mobileCategories.map((cat, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2">
                        {cat.title}
                      </div>
                      <div className="space-y-1">
                        {cat.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = pathname === item.href;
                          return (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`flex items-center justify-between p-3 rounded-2xl transition-all min-h-[48px] ${
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

              {/* Drawer Footer Single Auth / Logout Button */}
              <div className="pt-4 border-t border-slate-100 space-y-3 mt-6">
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

                {/* Hamburger Bottom Item: Leave a Review */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsReviewModalOpen(true);
                    }}
                    className="w-full p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-900 font-extrabold text-xs transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                      <span>⭐ Leave a Review</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Leave a Review Modal */}
      <LeaveReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />
    </header>
  );
}
