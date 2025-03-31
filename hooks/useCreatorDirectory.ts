import { useState, useEffect } from 'react';
import { Creator } from '../types/Creator';
import { CreatorService } from '../services/CreatorService';
import { useAuth } from './useAuth';

interface DirectoryFilters {
  cuisineType: string;
  specialty: string;
  difficulty: string;
}

interface UseCreatorDirectoryResult {
  creators: Creator[];
  loading: boolean;
  error: Error | null;
  followCreator: (creatorId: string) => Promise<void>;
}

export function useCreatorDirectory(filters: DirectoryFilters): UseCreatorDirectoryResult {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadCreators();
  }, [filters]);

  const loadCreators = async () => {
    try {
      setLoading(true);
      const creatorFilters = {
        cuisineTypes: filters.cuisineType !== 'All' ? [filters.cuisineType] : undefined,
        specialties: filters.specialty !== 'All' ? [filters.specialty] : undefined,
        difficultyLevel: filters.difficulty !== 'All' ? filters.difficulty.toLowerCase() : undefined,
      };

      const fetchedCreators = await CreatorService.getCreators(creatorFilters);
      setCreators(fetchedCreators);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load creators'));
    } finally {
      setLoading(false);
    }
  };

  const handleFollowCreator = async (creatorId: string) => {
    if (!user) throw new Error('Must be logged in to follow creators');
    try {
      await CreatorService.followCreator(user.id, creatorId);
      // Update local state to reflect the new follower count
      setCreators(prev =>
        prev.map(creator => {
          if (creator.id === creatorId) {
            const updatedCreator = { ...creator };
            if (!updatedCreator.analytics) {
              updatedCreator.analytics = {
                followers: 1,
                totalSaves: 0,
                totalViews: 0,
              };
            } else {
              updatedCreator.analytics.followers = (updatedCreator.analytics.followers || 0) + 1;
            }
            return updatedCreator;
          }
          return creator;
        })
      );
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to follow creator');
    }
  };

  return {
    creators,
    loading,
    error,
    followCreator: handleFollowCreator,
  };
} 