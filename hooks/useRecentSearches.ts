import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_SEARCHES_KEY = '@recipe_hub:recent_searches';
const MAX_RECENT_SEARCHES = 10;

interface UseRecentSearchesResult {
  searches: string[];
  addSearch: (query: string) => Promise<void>;
  removeSearch: (query: string) => Promise<void>;
  clearSearches: () => Promise<void>;
}

export function useRecentSearches(): UseRecentSearchesResult {
  const [searches, setSearches] = useState<string[]>([]);

  useEffect(() => {
    loadSearches();
  }, []);

  const loadSearches = async () => {
    try {
      const savedSearches = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (savedSearches) {
        setSearches(JSON.parse(savedSearches));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const saveSearches = async (newSearches: string[]) => {
    try {
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newSearches));
      setSearches(newSearches);
    } catch (error) {
      console.error('Error saving recent searches:', error);
    }
  };

  const addSearch = async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    const newSearches = [
      trimmedQuery,
      ...searches.filter(s => s !== trimmedQuery),
    ].slice(0, MAX_RECENT_SEARCHES);

    await saveSearches(newSearches);
  };

  const removeSearch = async (query: string) => {
    const newSearches = searches.filter(s => s !== query);
    await saveSearches(newSearches);
  };

  const clearSearches = async () => {
    try {
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
      setSearches([]);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  };

  return {
    searches,
    addSearch,
    removeSearch,
    clearSearches,
  };
} 