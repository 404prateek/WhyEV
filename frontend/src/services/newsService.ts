import { NewsArticle } from '@/types';
import { MOCK_NEWS_ARTICLES } from '@/lib/mock-data';
import { newsApi, NewsArticleResponse } from '@/lib/api';

export interface NewsFilterParams {
  category?: string;
  isFeatured?: boolean;
  searchQuery?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Map a backend NewsArticleResponse (snake_case) to the frontend NewsArticle type.
 * Backend field names differ from the frontend type — this adapter bridges the gap.
 */
function adaptArticle(raw: NewsArticleResponse): NewsArticle {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    // Backend uses snake_case; frontend type expects these specific field names
    image: raw.image_url || '',
    summary: raw.summary || '',
    content: raw.summary || '',           // content_snippet not in public response; summary used
    author: raw.author || 'WhyEV Desk',
    source: raw.source_name || raw.provider,
    readTime: '3 min read',               // Backend doesn't compute readTime — use a sensible default
    publishedDate: raw.published_at
      ? new Date(raw.published_at).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      : '',
    category: raw.category || 'Industry News',
    tags: raw.tags || [],
    isFeatured: raw.is_featured,
  };
}

/**
 * Map MOCK_NEWS_ARTICLES (legacy format) through the same interface as live articles.
 * Both paths return `NewsArticle[]` — callers cannot distinguish source.
 */
function adaptMockArticle(mock: (typeof MOCK_NEWS_ARTICLES)[0]): NewsArticle {
  return mock as unknown as NewsArticle;
}

export class NewsService {
  /**
   * Fetch all news articles.
   *
   * Primary path: GET /api/v1/news — live DB articles filtered by 3-stage pipeline.
   * Fallback path: MOCK_NEWS_ARTICLES — used if API call fails or returns 0 articles.
   *
   * TODO(news-integration): mock fallback is intentionally retained.
   * Expected API: GET /api/v1/news
   * Expected DB table(s): news_articles
   *
   * TODO(news-integration): searchQuery is filtered client-side against live results.
   * A backend full-text search endpoint is not yet implemented.
   * Expected API: GET /api/v1/news?q=<query>
   */
  static async getArticles(params?: NewsFilterParams): Promise<NewsArticle[]> {
    let liveArticles: NewsArticle[] = [];
    let usedMock = false;

    try {
      const response = await newsApi.getArticles({
        page: params?.page || 1,
        page_size: params?.pageSize || 50,
        category: params?.category,
        featured_only: params?.isFeatured,
      });

      if (response.articles && response.articles.length > 0) {
        liveArticles = response.articles.map(adaptArticle);
      } else {
        // API returned empty — fall through to mock
        usedMock = true;
      }
    } catch {
      // Network error, backend not available, or non-OK response
      usedMock = true;
    }

    // TODO(news-integration): mock retained as safety net per project mock policy.
    // Remove once the backend has been confirmed returning articles in production.
    // Expected API: GET /api/v1/news
    // Expected DB table(s): news_articles
    let list: NewsArticle[] = usedMock
      ? (MOCK_NEWS_ARTICLES || []).map(adaptMockArticle)
      : liveArticles;

    // Client-side filters (applied to both live and mock results)
    if (!params) return list;

    if (params.category && params.category !== 'All') {
      list = list.filter(
        (art) => art.category.toLowerCase() === params.category?.toLowerCase()
      );
    }

    if (params.isFeatured !== undefined) {
      list = list.filter((art) => art.isFeatured === params.isFeatured);
    }

    if (params.searchQuery && params.searchQuery.trim()) {
      const q = params.searchQuery.toLowerCase();
      list = list.filter(
        (art) =>
          art.title.toLowerCase().includes(q) ||
          art.summary.toLowerCase().includes(q) ||
          art.category.toLowerCase().includes(q)
      );
    }

    return list;
  }

  /**
   * Fetch a single article by its URL slug.
   *
   * TODO(news-integration): mock retained — no GET /api/v1/news/{slug} endpoint exists yet.
   * Expected API: GET /api/v1/news/{slug}
   * Expected DB table(s): news_articles
   */
  static async getArticleBySlug(slug: string): Promise<NewsArticle | null> {
    // TODO(news-integration): mock retained — missing: GET /api/v1/news/{slug}
    // Expected API: GET /api/v1/news/{slug}
    // Expected DB table(s): news_articles
    const article = (MOCK_NEWS_ARTICLES || []).find(
      (art) => (art.slug || art.id).toLowerCase() === slug.toLowerCase()
    );
    return (article as unknown as NewsArticle) || (MOCK_NEWS_ARTICLES[0] as unknown as NewsArticle) || null;
  }

  /**
   * Fetch available article categories dynamically.
   * Currently derived from mock data; will be replaced by backend category list.
   *
   * TODO(news-integration): mock retained — no GET /api/v1/news/categories endpoint exists.
   * Expected API: GET /api/v1/news/categories
   * Expected DB table(s): news_articles (derived from distinct category values)
   */
  static async getCategories(): Promise<string[]> {
    // TODO(news-integration): mock retained — missing: GET /api/v1/news/categories
    // Expected DB table(s): news_articles
    const cats = Array.from(
      new Set((MOCK_NEWS_ARTICLES || []).map((art) => art.category))
    );
    return ['All', ...cats];
  }

  /**
   * Fetch related articles (by same category).
   *
   * TODO(news-integration): mock retained — no GET /api/v1/news/{slug}/related endpoint exists.
   * Expected API: GET /api/v1/news/{slug}/related
   * Expected DB table(s): news_articles
   */
  static async getRelatedArticles(slug: string): Promise<NewsArticle[]> {
    // TODO(news-integration): mock retained — missing: GET /api/v1/news/{slug}/related
    // Expected DB table(s): news_articles
    return (MOCK_NEWS_ARTICLES || [])
      .filter((art) => art.slug !== slug)
      .slice(0, 3) as unknown as NewsArticle[];
  }
}
