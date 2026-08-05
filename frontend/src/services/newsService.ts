import { NewsArticle } from '@/types';
import { MOCK_NEWS_ARTICLES } from '@/lib/mock-data';

export interface NewsFilterParams {
  category?: string;
  isFeatured?: boolean;
  searchQuery?: string;
}

export class NewsService {
  /**
   * Fetch all news articles from backend response with optional filter parameters.
   */
  static async getArticles(params?: NewsFilterParams): Promise<NewsArticle[]> {
    let list = [...(MOCK_NEWS_ARTICLES || [])];

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
   */
  static async getArticleBySlug(slug: string): Promise<NewsArticle | null> {
    const article = (MOCK_NEWS_ARTICLES || []).find(
      (art) => (art.slug || art.id).toLowerCase() === slug.toLowerCase()
    );
    return article || MOCK_NEWS_ARTICLES[0] || null;
  }

  /**
   * Fetch available article categories dynamically.
   */
  static async getCategories(): Promise<string[]> {
    const cats = Array.from(
      new Set((MOCK_NEWS_ARTICLES || []).map((art) => art.category))
    );
    return ['All', ...cats];
  }

  /**
   * Fetch related articles.
   */
  static async getRelatedArticles(slug: string): Promise<NewsArticle[]> {
    return (MOCK_NEWS_ARTICLES || []).filter((art) => art.slug !== slug).slice(0, 3);
  }
}
