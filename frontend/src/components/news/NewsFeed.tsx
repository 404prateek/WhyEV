'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Newspaper,
  ShieldCheck,
  Sparkles,
  Zap,
  Clock,
  MapPin,
  ChevronDown,
  ArrowRight,
  ArrowUpRight,
  RefreshCw,
  Loader2,
  Radio,
  Landmark,
} from 'lucide-react';

/**
 * NewsFeed
 * -----------------------------------------------------------------------
 * City-aware feed of upcoming EV launches, subsidy/policy changes, charging
 * infra rollouts, and general industry news. Built with static mock data
 * for now — swap `fetchNews()` for a real API/RSS call later without
 * touching the rest of the component.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NewsCategory = 'policy' | 'launch' | 'infra' | 'general';

export interface NewsItem {
  id: string;
  category: NewsCategory;
  city?: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  tag?: string;
  isBreaking?: boolean;
}

// ---------------------------------------------------------------------------
// Static mock data (swap for a real feed later)
// ---------------------------------------------------------------------------

const MOCK_NEWS: NewsItem[] = [
  {
    id: 'n1',
    category: 'policy',
    city: 'Delhi',
    title: 'Delhi Extends EV Subsidy Scheme Through March 2030',
    summary:
      'The Transport Department has formally extended the Delhi EV Policy 2026, keeping the 100% road tax waiver, free first-year insurance, and RC registration fee waiver in place for four more years.',
    source: 'Delhi Transport Dept',
    date: 'Jul 28, 2026',
    tag: 'Policy Update',
    isBreaking: true,
  },
  {
    id: 'n2',
    category: 'launch',
    city: 'Delhi',
    title: 'Tata Curvv EV Arrives in Delhi NCR Showrooms This Month',
    summary:
      'Tata Motors has begun deliveries of the Curvv EV across its Delhi NCR outlets, with real-world range figures now available for buyers comparing it against the Nexon EV.',
    source: 'Tata Motors',
    date: 'Aug 1, 2026',
    tag: 'New Launch',
  },
  {
    id: 'n3',
    category: 'infra',
    city: 'Mumbai',
    title: 'Mumbai to Add 500 Public Charging Points by Diwali',
    summary:
      'BEST and MahaUrja are rolling out 500 new fast-charging bays across Mumbai suburbs, prioritising metro stations and public parking lots ahead of the festive season rush.',
    source: 'MahaUrja',
    date: 'Jul 25, 2026',
    tag: 'Infra Rollout',
  },
  {
    id: 'n4',
    category: 'policy',
    city: 'Mumbai',
    title: 'Maharashtra Extends Road Tax Waiver for 2W & 3W EVs',
    summary:
      'The state has renewed its road tax exemption for electric two- and three-wheelers, with the subsidy cap raised to keep pace with rising ex-showroom prices.',
    source: 'Maharashtra Transport Dept',
    date: 'Jul 20, 2026',
  },
  {
    id: 'n5',
    category: 'launch',
    city: 'Bengaluru',
    title: 'MG Windsor EV Facelift Spotted Testing Near Bengaluru',
    summary:
      "Camouflaged test mules of the updated Windsor EV were spotted on Bengaluru's outer ring road, hinting at a longer-range variant ahead of a Q4 reveal.",
    source: 'Auto Spy Shots',
    date: 'Jul 30, 2026',
    tag: 'Spotted Testing',
  },
  {
    id: 'n6',
    category: 'policy',
    city: 'Bengaluru',
    title: 'Karnataka Cuts Registration Fees for EVs Under ₹15 Lakh',
    summary:
      'Registration fees have been slashed for electric cars priced below ₹15 lakh, part of a broader push to make Bengaluru a top-three EV adoption city by 2028.',
    source: 'Karnataka Transport Dept',
    date: 'Jul 18, 2026',
  },
  {
    id: 'n7',
    category: 'infra',
    city: 'Pune',
    title: 'Pune Metro Stations to House 120 Fast-Charging Bays',
    summary:
      'Pune Metro Rail Corporation has signed off on installing fast chargers at 14 stations, aiming to turn daily commutes into convenient top-up stops for EV owners.',
    source: 'Pune Metro Rail Corp',
    date: 'Jul 22, 2026',
  },
  {
    id: 'n8',
    category: 'launch',
    city: 'Chennai',
    title: 'Hyundai Creta Electric Bookings Open in Chennai',
    summary:
      "Hyundai has opened bookings for the Creta Electric at Chennai dealerships, undercutting rivals with an introductory price for the first 1,000 units.",
    source: 'Hyundai Motor India',
    date: 'Jul 27, 2026',
    tag: 'Bookings Open',
  },
  {
    id: 'n9',
    category: 'launch',
    city: 'Hyderabad',
    title: 'Ather Rizta+ Now Available in Hyderabad Showrooms',
    summary:
      "Ather's family-focused scooter, the Rizta+, has landed in Hyderabad with a larger seat and boot space aimed squarely at daily commuters over enthusiasts.",
    source: 'Ather Energy',
    date: 'Jul 15, 2026',
  },
  {
    id: 'n10',
    category: 'policy',
    title: 'FAME III Draft Released With Higher 4-Wheeler Incentives',
    summary:
      'The Ministry of Heavy Industries has published a draft of FAME III, proposing steeper per-kWh incentives for electric cars while phasing down two-wheeler subsidies.',
    source: 'Ministry of Heavy Industries',
    date: 'Jul 12, 2026',
    tag: 'Draft Released',
  },
  {
    id: 'n11',
    category: 'general',
    title: "India's EV Sales Cross 2 Million Units in FY26",
    summary:
      'Cumulative EV sales for the fiscal year have crossed the 2 million mark, led by two-wheelers, with four-wheeler EV penetration now above 6% of total car sales.',
    source: 'SIAM',
    date: 'Jul 10, 2026',
  },
  {
    id: 'n12',
    category: 'policy',
    title: 'Battery Swapping Policy Draft Opens for Public Comments',
    summary:
      'NITI Aayog has reopened the national battery swapping policy for public consultation, with standardisation of battery form factors as the central sticking point.',
    source: 'NITI Aayog',
    date: 'Jul 5, 2026',
  },
];

const CITIES = ['All Cities', 'Delhi', 'Mumbai', 'Bengaluru', 'Pune', 'Chennai', 'Hyderabad'];

const CATEGORY_META: Record<
  NewsCategory,
  { label: string; icon: React.ElementType; badge: string; iconBox: string }
> = {
  policy: {
    label: 'Policy & Subsidy',
    icon: Landmark,
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    iconBox: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  launch: {
    label: 'New Launches',
    icon: Sparkles,
    badge: 'bg-amber-100 text-amber-900 border-amber-200',
    iconBox: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  infra: {
    label: 'Charging Infra',
    icon: Zap,
    badge: 'bg-sky-100 text-sky-800 border-sky-200',
    iconBox: 'bg-sky-100 text-sky-700 border-sky-200',
  },
  general: {
    label: 'Industry News',
    icon: Newspaper,
    badge: 'bg-violet-100 text-violet-800 border-violet-200',
    iconBox: 'bg-violet-100 text-violet-700 border-violet-200',
  },
};

const FILTERS: { key: 'all' | NewsCategory; label: string }[] = [
  { key: 'all', label: 'All Updates' },
  { key: 'policy', label: 'Policy & Subsidy' },
  { key: 'launch', label: 'New Launches' },
  { key: 'infra', label: 'Charging Infra' },
  { key: 'general', label: 'Industry News' },
];

// Simulated fetch — swap for a real API/RSS call when ready.
function fetchNews(): Promise<NewsItem[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_NEWS), 450);
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NewsFeed() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | NewsCategory>('all');
  const [activeCity, setActiveCity] = useState('All Cities');
  const [visibleCount, setVisibleCount] = useState(6);

  const loadNews = () => {
    setLoading(true);
    fetchNews().then((data) => {
      setItems(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadNews();
  }, []);

  const breakingItem = useMemo(() => items.find((i) => i.isBreaking), [items]);

  const filteredItems = useMemo(() => {
    return items
      .filter((i) => (breakingItem ? i.id !== breakingItem.id : true))
      .filter((i) => activeFilter === 'all' || i.category === activeFilter)
      .filter((i) => activeCity === 'All Cities' || !i.city || i.city === activeCity);
  }, [items, activeFilter, activeCity, breakingItem]);

  const visibleItems = filteredItems.slice(0, visibleCount);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 lg:space-y-10 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 text-left">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Discover ⚡
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
            Discover the latest EV launches, government policy updates, battery breakthroughs, and charging infrastructure rollouts.
          </p>
        </div>

        <button
          onClick={loadNews}
          className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Filter + City Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
          <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-full border border-slate-200/90 bg-white shadow-sm text-xs sm:text-sm font-bold text-slate-600 w-max">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => {
                  setActiveFilter(f.key);
                  setVisibleCount(6);
                }}
                className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                  activeFilter === f.key
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative shrink-0 w-full lg:w-auto">
          <MapPin className="w-4 h-4 text-emerald-600 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={activeCity}
            onChange={(e) => {
              setActiveCity(e.target.value);
              setVisibleCount(6);
            }}
            className="appearance-none w-full lg:w-auto pl-11 pr-11 py-3 sm:py-3.5 rounded-full border border-slate-200/90 bg-white shadow-sm text-xs sm:text-sm font-bold text-slate-700 cursor-pointer hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-16 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-sm">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
          <div className="text-sm font-bold text-slate-700">Loading latest EV news…</div>
          <div className="text-xs text-slate-400">Fetching launches, subsidy changes & infra updates</div>
        </div>
      )}

      {!loading && (
        <>
          {/* Breaking / Pinned Policy Banner */}
          {breakingItem && (
            <div className="p-6 sm:p-8 lg:p-10 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-amber-50/90 border-2 border-amber-300/90 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-8 relative overflow-hidden">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-300 font-bold shrink-0 mt-1 shadow-xs">
                  <Radio className="w-7 h-7 animate-pulse text-amber-700" />
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold text-amber-950 uppercase tracking-wider bg-amber-200/80 px-2.5 py-0.5 rounded-md border border-amber-300">
                      Breaking
                    </span>
                    {breakingItem.city && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-300 text-amber-950 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" />
                        {breakingItem.city}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {breakingItem.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-700 max-w-xl leading-relaxed font-normal">
                    {breakingItem.summary}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 pt-1">
                    <Clock className="w-3.5 h-3.5" />
                    {breakingItem.source} · {breakingItem.date}
                  </p>
                </div>
              </div>

              <a
                href="/subsidy"
                className="w-full md:w-auto h-[56px] px-9 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shrink-0"
              >
                <span>Read Full Update</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* News Grid */}
          {visibleItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {visibleItems.map((item) => {
                const meta = CATEGORY_META[item.category];
                const Icon = meta.icon;
                return (
                  <div
                    key={item.id}
                    className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${meta.iconBox}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${meta.badge}`}>
                            {meta.label}
                          </span>
                        </div>
                      </div>
                      {item.tag && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap shrink-0">
                          {item.tag}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                        {item.summary}
                      </p>
                    </div>

                    <div className="flex flex-col xs:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-slate-100 mt-auto">
                      <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-700">{item.source}</span>
                        <span className="text-slate-300">·</span>
                        <span>{item.date}</span>
                        {item.city && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {item.city}
                            </span>
                          </>
                        )}
                      </div>
                      <button className="self-start sm:self-auto px-3.5 py-2 -mx-3.5 -my-2 rounded-full text-xs font-extrabold text-emerald-700 hover:bg-emerald-50 flex items-center gap-1 shrink-0 cursor-pointer transition-colors">
                        <span>Read More</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
              No updates match this filter yet. Try a different city or category.
            </div>
          )}

          {/* Show More */}
          {visibleCount < filteredItems.length && (
            <div className="flex justify-center">
              <button
                onClick={() => setVisibleCount((c) => c + 6)}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Show More Updates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default NewsFeed;
