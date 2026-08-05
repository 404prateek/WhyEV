'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  MapPin,
  ChevronDown,
  ArrowRight,
  ArrowUpRight,
  RefreshCw,
  Loader2,
  Bookmark,
  BookmarkCheck,
  Share2,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export type NewsCategory = 'policy' | 'launch' | 'infra' | 'general';

export interface NewsItem {
  id: string;
  category: NewsCategory;
  city?: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  imageUrl: string;
  readTime: string;
  isRecent?: boolean;
}

const MOCK_NEWS: NewsItem[] = [
  {
    id: 'n1',
    category: 'policy',
    city: 'Delhi',
    title: 'Delhi Extends EV Subsidy Scheme Through March 2030',
    summary:
      'The Transport Department has formally extended the Delhi EV Policy, maintaining the 100% road tax waiver, registration fee exemption, and direct state capital incentives across all regional RTOs.',
    source: 'Delhi Transport Dept',
    date: 'Aug 4, 2026',
    imageUrl: '/hero-slide-2.png',
    readTime: '3 min read',
    isRecent: true,
  },
  {
    id: 'n2',
    category: 'launch',
    city: 'Delhi',
    title: 'Tata Curvv EV Deliveries Begin Across Delhi NCR Outlets',
    summary:
      'Tata Motors has officially commenced customer deliveries of the Curvv EV SUV Coupe in Delhi NCR, featuring a 55 kWh battery pack and ARAI-certified 585 km range.',
    source: 'Tata Motors',
    date: 'Aug 5, 2026',
    imageUrl: '/explore/curvv-ev-desktop.png',
    readTime: '2 min read',
    isRecent: true,
  },
  {
    id: 'n3',
    category: 'infra',
    city: 'Mumbai',
    title: 'Mumbai Suburban Hub to Add 500 Fast Charging Bays',
    summary:
      'MahaUrja and BEST have partnered to deploy 500 new high-power CCS2 fast chargers near metro stations and commercial parking hubs ahead of the festive season.',
    source: 'MahaUrja',
    date: 'Aug 3, 2026',
    imageUrl: '/hero-slide-3.jpg',
    readTime: '4 min read',
    isRecent: true,
  },
  {
    id: 'n4',
    category: 'policy',
    city: 'Mumbai',
    title: 'Maharashtra Renews Road Tax Waiver for 2W & 4W EVs',
    summary:
      'The Maharashtra state cabinet has approved a four-year extension of the zero road tax policy for passenger electric vehicles and commercial fleets.',
    source: 'Maharashtra RTO',
    date: 'Jul 30, 2026',
    imageUrl: '/hero-ev-car.png',
    readTime: '3 min read',
  },
  {
    id: 'n5',
    category: 'launch',
    city: 'Bengaluru',
    title: 'MG Windsor EV Facelift Spotted Testing Near Outer Ring Road',
    summary:
      'Camouflaged test mules of the updated Windsor EV featuring an enlarged 50 kWh battery pack were spotted undergoing highway endurance testing.',
    source: 'Auto Spy Shots',
    date: 'Jul 28, 2026',
    imageUrl: '/explore/curvv-ev-desktop.png',
    readTime: '2 min read',
  },
  {
    id: 'n6',
    category: 'infra',
    city: 'Bengaluru',
    title: 'Bengaluru IT Corridors to Receive 120kW Ultra-Fast Chargers',
    summary:
      'Bescom has sanctioned 45 high-speed dual-gun charging plazas along Whitefield and Electronic City to support heavy office commute volumes.',
    source: 'Bescom Energy',
    date: 'Jul 25, 2026',
    imageUrl: '/hero-slide-3.jpg',
    readTime: '3 min read',
  },
];

const CITIES = ['All Cities', 'Delhi', 'Mumbai', 'Bengaluru', 'Pune', 'Chennai', 'Hyderabad'];

const FILTERS: { key: 'all' | NewsCategory; label: string }[] = [
  { key: 'all', label: 'All Updates' },
  { key: 'policy', label: 'Policy & Subsidy' },
  { key: 'launch', label: 'New Launches' },
  { key: 'infra', label: 'Charging Infra' },
  { key: 'general', label: 'Industry News' },
];

function fetchNews(): Promise<NewsItem[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_NEWS), 400);
  });
}

export function NewsFeed() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | NewsCategory>('all');
  const [activeCity, setActiveCity] = useState('All Cities');
  const [visibleCount, setVisibleCount] = useState(6);
  const [savedArticleIds, setSavedArticleIds] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('whyev_saved_news');
      if (stored) setSavedArticleIds(JSON.parse(stored));
    } catch (e) {}
  }, []);

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

  const handleToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const toggleBookmark = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSavedArticleIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((i) => i !== id) : [...prev, id];
      try {
        localStorage.setItem('whyev_saved_news', JSON.stringify(next));
      } catch (e) {}
      handleToast(exists ? 'Removed from saved updates' : 'Article bookmarked to dashboard!');
      return next;
    });
  };

  const handleShare = (e: React.MouseEvent, item: NewsItem) => {
    e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({ title: item.title, text: item.summary, url: window.location.href })
        .catch(() => {});
    } else {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
      }
      handleToast('Article link copied to clipboard!');
    }
  };

  const filteredItems = useMemo(() => {
    return items
      .filter((i) => activeFilter === 'all' || i.category === activeFilter)
      .filter((i) => activeCity === 'All Cities' || !i.city || i.city === activeCity);
  }, [items, activeFilter, activeCity]);

  const visibleItems = filteredItems.slice(0, visibleCount);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 lg:space-y-10 text-slate-900">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-emerald-300 px-4 py-2.5 rounded-2xl shadow-2xl border border-emerald-500/30 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 text-left">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Discover
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            Stay Ahead in the EV World
          </p>
        </div>

        <button
          onClick={loadNews}
          className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh New Feed</span>
        </button>
      </div>

      {/* Filter Chips & City Selector Bar */}
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

      {/* Loading Skeleton */}
      {loading && (
        <div className="p-16 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-sm">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
          <div className="text-sm font-bold text-slate-700">Loading latest EV news…</div>
        </div>
      )}

      {/* Responsive Polished News Grid (1 col mobile, 2 col tablet, 3 col laptop) */}
      {!loading && (
        <>
          {visibleItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {visibleItems.map((item) => {
                const isSaved = savedArticleIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className="group bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-left cursor-pointer relative overflow-hidden"
                  >
                    {/* Consistent 16:9 Image Thumbnail with Smooth Zoom */}
                    <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-4 bg-slate-950 border border-slate-100 shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />

                      {/* Top-Right Action Icons: Bookmark & Share */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                        <button
                          type="button"
                          onClick={(e) => toggleBookmark(e, item.id)}
                          className="p-2 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white backdrop-blur-md transition-all cursor-pointer shadow-md"
                          title={isSaved ? 'Remove bookmark' : 'Save article'}
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                          ) : (
                            <Bookmark className="w-4 h-4 text-white" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleShare(e, item)}
                          className="p-2 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white backdrop-blur-md transition-all cursor-pointer shadow-md"
                          title="Share article"
                        >
                          <Share2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Row */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-900 font-extrabold">{item.source}</span>
                        <span className="text-slate-300">·</span>
                        <span>{item.date}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 font-medium">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{item.readTime}</span>
                      </div>
                    </div>

                    {/* Article Headline with Tiny Green Dot for <24h Updates */}
                    <div className="space-y-2 mb-4 flex-1">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors flex items-start gap-2">
                        {item.isRecent && (
                          <span
                            className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1.5 shadow-2xs"
                            title="Published within last 24 hours"
                          />
                        )}
                        <span>{item.title}</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium line-clamp-3">
                        {item.summary}
                      </p>
                    </div>

                    {/* Bottom CTA */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                      {item.city ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600">
                          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{item.city}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          National
                        </span>
                      )}

                      <div className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                        <span>Read Full Update</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
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

          {/* Show More Button */}
          {visibleCount < filteredItems.length && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setVisibleCount((c) => c + 6)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
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
