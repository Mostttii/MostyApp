import { useState, useEffect, useCallback } from 'react';
import { ContentReference } from '../types/ContentReference';
import { ContentService } from '../services/ContentService';
import { useAuth } from './useAuth';

interface ContentFilters {
  cuisineType: string;
  mealType: string;
  difficulty: string;
}

interface UseContentFeedResult {
  content: ContentReference[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refreshContent: () => Promise<void>;
  saveRecipe: (contentId: string) => Promise<void>;
}

const ITEMS_PER_PAGE = 10;

export function useContentFeed(filters: ContentFilters): UseContentFeedResult {
  const [content, setContent] = useState<ContentReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();

  const loadContent = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setLoading(true);
        setLastDoc(null);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const result = await ContentService.getContent({
        filters,
        limit: ITEMS_PER_PAGE,
        lastDoc: refresh ? null : lastDoc,
      });

      setContent(prev => refresh ? result.items : [...prev, ...result.items]);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load content'));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, lastDoc]);

  useEffect(() => {
    loadContent(true);
  }, [filters]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    await loadContent();
  };

  const refreshContent = async () => {
    await loadContent(true);
  };

  const saveRecipe = async (contentId: string) => {
    if (!user) throw new Error('Must be logged in to save recipes');
    try {
      await ContentService.saveRecipe(user.uid, contentId);
      // Update local state to reflect save
      setContent(prev =>
        prev.map(item =>
          item.id === contentId
            ? { ...item, isSaved: true }
            : item
        )
      );
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to save recipe');
    }
  };

  return {
    content,
    loading,
    error,
    hasMore,
    loadMore,
    refreshContent,
    saveRecipe,
  };
} 