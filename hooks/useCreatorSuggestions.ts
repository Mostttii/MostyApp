import { useState, useEffect } from 'react';
import { Creator } from '../types/Creator';
import { CreatorService } from '../services/CreatorService';
import { useAuth } from './useAuth';

interface UseCreatorSuggestionsResult {
  suggestions: Creator[];
  loading: boolean;
  error: Error | null;
  followCreator: (creatorId: string) => Promise<void>;
}

export function useCreatorSuggestions(): UseCreatorSuggestionsResult {
  const [suggestions, setSuggestions] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      // Get creators with a mix of cuisines and specialties
      const creators = await CreatorService.getCreators({
        cuisineTypes: ['Italian', 'Asian', 'American'],
        specialties: ['Baking', 'Quick Meals', 'Healthy'],
      });
      setSuggestions(creators.slice(0, 5)); // Show only first 5 suggestions
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load suggestions'));
    } finally {
      setLoading(false);
    }
  };

  const followCreator = async (creatorId: string) => {
    if (!user) throw new Error('Must be logged in to follow creators');
    try {
      await CreatorService.followCreator(user.uid, creatorId);
      // Remove followed creator from suggestions
      setSuggestions(prev => prev.filter(c => c.id !== creatorId));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to follow creator');
    }
  };

  return {
    suggestions,
    loading,
    error,
    followCreator,
  };
} 