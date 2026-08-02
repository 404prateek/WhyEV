'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Car } from 'lucide-react';
import evCarsData from '@/data/evCars.json';

interface EvCar {
  manufacturer: string;
  model: string;
  variant: string;
  price: string;
  bodyType: string;
  range: string;
}

const PLACEHOLDER_PHRASES = [
  'Search your desired car...',
  'Search your desired EV...',
  'Search your desired SUV...',
  'Search your desired Sedan...',
  'Search your desired Hatchback...',
  'Search your desired Crossover...',
  'Search your desired Family Car...',
  'Search your desired City Car...',
  'Search your desired Long Range EV...',
];

export function HeroSearchBar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  // Typing animation state
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Animated Typing Effect
  useEffect(() => {
    const currentPhrase = PLACEHOLDER_PHRASES[phraseIndex];
    let typingSpeed = isDeleting ? 35 : 65;

    if (!isDeleting && displayedText === currentPhrase) {
      typingSpeed = 2200;
    } else if (isDeleting && displayedText === '') {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % PLACEHOLDER_PHRASES.length);
      typingSpeed = 400;
    }

    const timer = setTimeout(() => {
      if (!isDeleting && displayedText === currentPhrase) {
        setIsDeleting(true);
      } else if (isDeleting) {
        setDisplayedText(currentPhrase.substring(0, displayedText.length - 1));
      } else {
        setDisplayedText(currentPhrase.substring(0, displayedText.length + 1));
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, phraseIndex]);

  // Debounce Search Input by 200ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim().toLowerCase());
    }, 200);
    return () => clearTimeout(handler);
  }, [query]);

  // Lock Body Scroll & Keydown Listeners when Spotlight Open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Filter EV Cars Dataset
  const searchResults = useMemo(() => {
    if (!debouncedQuery) return [];
    
    return (evCarsData as EvCar[]).filter((car) => {
      const q = debouncedQuery;
      if (q === 'ev' || q === 'electric') return true;
      
      return (
        car.manufacturer.toLowerCase().includes(q) ||
        car.model.toLowerCase().includes(q) ||
        car.variant.toLowerCase().includes(q) ||
        car.bodyType.toLowerCase().includes(q)
      );
    });
  }, [debouncedQuery]);

  // Text Highlighting Helper
  const renderHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-emerald-100 text-emerald-900 font-extrabold px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const handleSelectCar = (searchTerm: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/recommend?search=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <>
      {/* 1. CLOSED HERO SEARCH BAR */}
      <div className="w-full max-w-2xl mx-auto">
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setIsOpen(true)}
          className="w-full rounded-full bg-white border border-slate-200 hover:border-emerald-500/80 shadow-lg shadow-slate-900/5 hover:shadow-emerald-500/10 p-3 sm:p-3.5 flex items-center justify-between cursor-pointer transition-all duration-300 group select-none"
        >
          <div className="flex items-center gap-3.5 pl-2 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
              <Search className="w-4 h-4" />
            </div>

            <div className="flex items-center gap-1 text-slate-400 font-medium text-xs sm:text-sm truncate">
              <span>{displayedText}</span>
              <span className="w-0.5 h-4 bg-emerald-500 animate-pulse" />
            </div>
          </div>

          <div className="flex items-center gap-2 pr-2 shrink-0">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* 2. APPLE SPOTLIGHT SEARCH OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex flex-col items-center pt-10 sm:pt-16 px-3 sm:px-6">
            {/* Backdrop click listener */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 z-0"
            />

            {/* Spotlight Container Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -16 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative z-10 w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[82vh] text-slate-900"
            >
              {/* Spotlight Header Input */}
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-3.5 bg-slate-50/50">
                <Search className="w-5 h-5 text-emerald-600 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search Tata, MG, Mahindra, Hyundai..."
                  className="w-full text-base sm:text-lg font-bold text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  ESC
                </button>
              </div>

              {/* Spotlight Content Body */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
                {/* A. EMPTY QUERY: REMAIN COMPLETELY EMPTY */}
                {!debouncedQuery ? null : (
                  /* B. LIVE SEARCH RESULTS (Max 4 suggestions containing ONLY Manufacturer + Model) */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                      <span className="uppercase tracking-wider">
                        Search Suggestions ({searchResults.slice(0, 4).length})
                      </span>
                      <span>Instant Match</span>
                    </div>

                    {searchResults.length === 0 ? (
                      <div className="py-10 text-center space-y-2">
                        <Car className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-sm font-bold text-slate-700">No matching EVs found</p>
                        <p className="text-xs text-slate-400">
                          Try typing "Tata", "Mahindra", "MG", or "Hyundai"
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {searchResults.slice(0, 4).map((car, idx) => (
                          <motion.button
                            key={idx}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.18, delay: idx * 0.03 }}
                            onClick={() => handleSelectCar(`${car.manufacturer} ${car.model}`)}
                            className="w-full p-4 rounded-2xl bg-white hover:bg-emerald-50/80 border border-slate-200/90 hover:border-emerald-400 text-left transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                                <Car className="w-4 h-4" />
                              </div>
                              <span className="text-sm sm:text-base font-black text-slate-900 group-hover:text-emerald-900">
                                {renderHighlightedText(car.manufacturer, debouncedQuery)}{' '}
                                {renderHighlightedText(car.model, debouncedQuery)}
                              </span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
