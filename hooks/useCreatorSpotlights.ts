import { useState, useEffect } from 'react';
import { Creator } from '../types/Creator';
import { CreatorService } from '../services/CreatorService';
import { useAuth } from './useAuth';
import { YouTubeService } from '../services/YouTubeService';

interface UseCreatorSpotlightsResult {
  featuredCreators: Creator[];
  loading: boolean;
  error: Error | null;
  followCreator: (creatorId: string) => Promise<void>;
}

export function useCreatorSpotlights(): UseCreatorSpotlightsResult {
  const [featuredCreators, setFeaturedCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadFeaturedCreators();
  }, []);

  const loadFeaturedCreators = async () => {
    try {
      setLoading(true);
      // Get creators with high engagement metrics
      const creators = await CreatorService.getCreators();
      
      // Fetch YouTube channel details for creators with YouTube channels
      const updatedCreators = await Promise.all(
        creators.map(async (creator) => {
          if (creator.platforms?.youtube?.channelId) {
            const channelDetails = await YouTubeService.getChannelDetails(creator.platforms.youtube.channelId);
            if (channelDetails) {
              return {
                ...creator,
                avatar: channelDetails.snippet.thumbnails.default.url || creator.avatar,
                platforms: {
                  ...creator.platforms,
                  youtube: {
                    ...creator.platforms.youtube,
                    subscribers: parseInt(channelDetails.statistics.subscriberCount, 10)
                  }
                }
              };
            }
          }
          return creator;
        })
      );

      // Sort by YouTube subscriber count (if available) or total followers
      const sorted = updatedCreators.sort((a, b) => {
        const aSubscribers = a.platforms?.youtube?.subscribers || 0;
        const bSubscribers = b.platforms?.youtube?.subscribers || 0;
        return bSubscribers - aSubscribers;
      });

      setFeaturedCreators(sorted.slice(0, 5));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load featured creators'));
    } finally {
      setLoading(false);
    }
  };

  const followCreator = async (creatorId: string) => {
    if (!user) throw new Error('Must be logged in to follow creators');
    try {
      await CreatorService.followCreator(user.uid, creatorId);
      // Update local state to reflect the new follower count
      setFeaturedCreators(prev =>
        prev.map(creator => {
          if (creator.id === creatorId) {
            return {
              ...creator,
              statistics: {
                ...creator.statistics,
                followers: creator.statistics.followers + 1
              }
            };
          }
          return creator;
        })
      );
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to follow creator');
    }
  };

  return {
    featuredCreators,
    loading,
    error,
    followCreator,
  };
} 