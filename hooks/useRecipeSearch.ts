import { useState, useEffect } from 'react';
import { Recipe } from '../types/Recipe';
import { RecipeService } from '../services/RecipeService';

interface UseRecipeSearchResult {
  recipes: Recipe[];
  loading: boolean;
  error: Error | null;
  search: (query: string) => Promise<void>;
  clearSearch: () => void;
}

export function useRecipeSearch(): UseRecipeSearchResult {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const search = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const results = await RecipeService.searchRecipes(query);
      setRecipes(results);
    } catch (err) {
      console.error('Error searching recipes:', err);
      setError(err instanceof Error ? err : new Error('Failed to search recipes'));
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setRecipes([]);
    setError(null);
  };

  return {
    recipes,
    loading,
    error,
    search,
    clearSearch,
  };
} 