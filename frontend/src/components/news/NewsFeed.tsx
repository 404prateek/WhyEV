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
import { NewsService } from '@/services/newsService';

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
    date: 'Aug 6, 2026',
    imageUrl: '/hero-slide-2.png',
    readTime: '3 min read',
    isRecent: true,
  },
  {
    id: 'n2',
    category: 'launch',
    city: 'Delhi',
    title: 'Tata Curvv EV Real-World Highway Range Test: 585 km Long Range Model Reviewed',
    summary:
      'Drive impressions and highway efficiency tests of Tata Motors new Coupe SUV built on acti.ev architecture with 55 kWh liquid-cooled battery pack.',
    source: 'WhyEV Tech Lab',
    date: 'Aug 5, 2026',
    imageUrl: '/explore/curvv-ev-desktop.png',
    readTime: '4 min read',
    isRecent: true,
  },
  {
    id: 'n3',
    category: 'launch',
    city: 'Mumbai',
    title: 'Mahindra BE 6 Born-Electric SUV First Look: 682 km Range & RWD Motor',
    summary:
      'Mahindra unveils the production variant of the BE 6 featuring ultra-futuristic aero styling, INGLO platform, and fast 175 kW DC charging capability.',
    source: 'Mahindra Electric',
    date: 'Aug 4, 2026',
    imageUrl: '/explore/be6-desktop.png',
    readTime: '5 min read',
    isRecent: true,
  },
  {
    id: 'n4',
    category: 'launch',
    city: 'Bengaluru',
    title: 'MG Windsor EV Essence Variant Launched with BaaS Battery Subscription',
    summary:
      'MG Motor introduces 135° Reclining Aero Lounge Seats and 15.6-inch Grand View Touchscreen paired with unique Battery-as-a-Service monthly rental options.',
    source: 'MG Motor India',
    date: 'Aug 3, 2026',
    imageUrl: '/explore/windsor-desktop.png',
    readTime: '3 min read',
  },
  {
    id: 'n5',
    category: 'launch',
    city: 'Chennai',
    title: 'Hyundai Creta Electric Drive Impressions: Dual Curved Screens & ADAS Level 2',
    summary:
      'Creta EV enters high-demand mid-size SUV segment with 51.4 kWh battery option, 510 km range, and SmartSense safety package.',
    source: 'Autocar India',
    date: 'Aug 2, 2026',
    imageUrl: '/explore/creta-desktop.png',
    readTime: '4 min read',
  },
  {
    id: 'n6',
    category: 'infra',
    city: 'Mumbai',
    title: 'Mumbai Suburban Hub to Add 500 Fast Charging Bays Ahead of Festive Season',
    summary:
      'MahaUrja and BEST have partnered to deploy 500 new high-power CCS2 fast chargers near metro stations and commercial parking hubs.',
    source: 'MahaUrja Infra',
    date: 'Aug 1, 2026',
    imageUrl: '/hero-slide-3.jpg',
    readTime: '4 min read',
  },
  {
    id: 'n7',
    category: 'launch',
    city: 'Bengaluru',
    title: 'BYD Atto 3 Dynamic Edition Released with 521 km Range Blade Battery',
    summary:
      'BYD expands its Indian lineup with an accessible luxury electric crossover featuring ultra-safe LFP Blade Battery technology.',
    source: 'EV Motors World',
    date: 'Jul 30, 2026',
    imageUrl: '/vehicles/byd-atto-3.jpg',
    readTime: '3 min read',
  },
  {
    id: 'n8',
    category: 'launch',
    city: 'Delhi',
    title: 'Tata Harrier EV AWD Dual-Motor Edition Completes Altitude Testing in Ladakh',
    summary:
      'Tata Motors tests dual-motor AWD setup on high-altitude mountain passes, proving thermal endurance and off-road traction control.',
    source: 'Auto Spy Shots',
    date: 'Jul 29, 2026',
    imageUrl: '/vehicles/tata-harrier-ev.jpg',
    readTime: '5 min read',
  },
  {
    id: 'n9',
    category: 'policy',
    city: 'Mumbai',
    title: 'Maharashtra Renews Zero Road Tax Waiver for Passenger & Commercial EVs',
    summary:
      'The Maharashtra state cabinet has approved a four-year extension of the zero road tax policy for passenger electric vehicles and commercial fleets.',
    source: 'Maharashtra RTO',
    date: 'Jul 28, 2026',
    imageUrl: '/hero-ev-car.png',
    readTime: '3 min read',
  },
  {
    id: 'n10',
    category: 'launch',
    city: 'Pune',
    title: 'Tata Sierra EV Flagship Luxury SUV Reborn on Acti.ev+ Architecture',
    summary:
      'Iconic Sierra design revives with signature Alpine rear glass, 65 kWh battery pack, and lounge luxury seating arrangement.',
    source: 'Tata Design Studio',
    date: 'Jul 27, 2026',
    imageUrl: '/vehicles/tata-sierra-ev.jpg',
    readTime: '4 min read',
  },
  {
    id: 'n11',
    category: 'infra',
    city: 'Bengaluru',
    title: 'Bengaluru IT Corridors Sanction 120kW Dual-Gun Ultra-Fast Charging Plazas',
    summary:
      'Bescom has sanctioned 45 high-speed dual-gun charging plazas along Whitefield and Electronic City to support heavy office commute volumes.',
    source: 'Bescom Energy',
    date: 'Jul 26, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80',
    readTime: '3 min read',
  },
  {
    id: 'n12',
    category: 'general',
    city: 'Delhi',
    title: 'Tata Punch EV Crosses 50,000 Sales Milestone Across Indian Metro Cities',
    summary:
      'Sub-compact SUV built on acti.ev platform becomes Indias fastest-selling EV in urban commuting segments.',
    source: 'WhyEV Market Intelligence',
    date: 'Jul 25, 2026',
    imageUrl: '/vehicles/tata-punch-ev.jpg',
    readTime: '3 min read',
  },
  {
    id: 'n13',
    category: 'launch',
    city: 'Hyderabad',
    title: 'Kia Syros EV Compact SUV Unveiled with 450 km Claimed Range & V2L Power',
    summary:
      'Kia Motors reveals its new compact electric crossover with bi-directional V2L charging and panoramic infotainment displays.',
    source: 'Kia India',
    date: 'Jul 24, 2026',
    imageUrl: '/vehicles/kia-syros-ev.jpg',
    readTime: '4 min read',
  },
];
// TODO(news-integration): MOCK_NEWS retained — used as fallback when NewsService.getArticles() fails
// or returns 0 articles (e.g., API key not configured, network unreachable, empty DB).
// Expected API: GET /api/v1/news
// Expected DB table(s): news_articles
// Remove MOCK_NEWS once the backend is confirmed serving articles in production.

/** Map a NewsArticle from newsService back to NewsItem for this component's rendering logic. */
function adaptToNewsItem(art: Awaited<ReturnType<typeof NewsService.getArticles>>[0]): NewsItem {
  const categoryMap: Record<string, NewsCategory> = {
    'Policy & Subsidies': 'policy',
    'New Launches': 'launch',
    'Charging Infra': 'infra',
    'Battery Tech': 'general',
    'Market & Sales': 'general',
    'Industry News': 'general',
    'Reviews & Tests': 'general',
  };
  return {
    id: art.id,
    category: categoryMap[art.category] || 'general',
    title: art.title,
    summary: art.summary,
    source: art.source,
    date: art.publishedDate || '',
    imageUrl: art.image || '/hero-slide-2.png',
    readTime: art.readTime || '3 min read',
    isRecent: art.publishedDate
      ? Date.now() - new Date(art.publishedDate).getTime() < 86_400_000
      : false,
  };
}

const CITIES = ['All Cities', 'Delhi', 'Mumbai', 'Bengaluru', 'Pune', 'Chennai', 'Hyderabad'];

const FILTERS: { key: 'all' | NewsCategory; label: string }[] = [
  { key: 'all', label: 'All Updates' },
  { key: 'policy', label: 'Policy & Subsidy' },
  { key: 'launch', label: 'New Launches' },
  { key: 'infra', label: 'Charging Infra' },
  { key: 'general', label: 'Industry News' },
];


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
    // TODO(news-integration): NewsService.getArticles() calls GET /api/v1/news
    // with MOCK_NEWS as the automatic fallback if API is unavailable or returns empty.
    // Expected API: GET /api/v1/news
    // Expected DB table(s): news_articles
    NewsService.getArticles({ pageSize: 50 })
      .then((articles) => {
        if (articles && articles.length > 0) {
          setItems(articles.map(adaptToNewsItem));
        } else {
          // Explicit fallback: API returned empty list
          setItems(MOCK_NEWS);
        }
      })
      .catch(() => {
        // Network or API error — fallback to mock
        setItems(MOCK_NEWS);
      })
      .finally(() => {
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
