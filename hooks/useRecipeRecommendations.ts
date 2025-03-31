import { useState, useEffect } from 'react';
import { Recipe } from '../types/Recipe';
import { RecipeService } from '../services/RecipeService';
import { useAuth } from './useAuth';

interface UseRecipeRecommendationsResult {
  recommendations: Recipe[];
  trending: Recipe[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useRecipeRecommendations(limit = 10): UseRecipeRecommendationsResult {
  const [recommendations, setRecommendations] = useState<Recipe[]>([]);
  const [trending, setTrending] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const [recommendedRecipes, trendingRecipes] = await Promise.all([
        user ? RecipeService.getRecommendedRecipes(user.uid, limit) : [],
        RecipeService.getTrendingRecipes(limit),
      ]);

      setRecommendations(recommendedRecipes);
      setTrending(trendingRecipes);
    } catch (err) {
      console.error('Error loading recipe recommendations:', err);
      setError(err instanceof Error ? err : new Error('Failed to load recommendations'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [user, limit]);

  return {
    recommendations,
    trending,
    loading,
    error,
    refresh: loadRecommendations,
  };
} 