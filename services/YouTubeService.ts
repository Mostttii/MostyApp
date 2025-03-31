import { ContentItem } from './ContentService';
import { Timestamp } from 'firebase/firestore';

const YOUTUBE_API_KEY = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
    channelTitle: string;
    channelId: string;
    publishedAt: string;
  };
}

interface YouTubeChannel {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
    customUrl?: string;
  };
  statistics: {
    subscriberCount: string;
    videoCount: string;
    viewCount: string;
  };
}

export class YouTubeService {
  static async getChannelDetails(channelId: string): Promise<YouTubeChannel | null> {
    try {
      const response = await fetch(
        `${YOUTUBE_API_BASE_URL}/channels?key=${YOUTUBE_API_KEY}&id=${channelId}&part=snippet,statistics`
      );
      const data = await response.json();

      if (!response.ok || !data.items?.[0]) {
        throw new Error(data.error?.message || 'Failed to fetch channel details');
      }

      return data.items[0];
    } catch (error) {
      console.error('Error fetching channel details:', error);
      return null;
    }
  }

  static async getChannelVideos(channelId: string, maxResults = 50): Promise<ContentItem[]> {
    try {
      // First get channel details to get the correct avatar URL
      const channelDetails = await this.getChannelDetails(channelId);
      if (!channelDetails) {
        throw new Error('Failed to fetch channel details');
      }

      const response = await fetch(
        `${YOUTUBE_API_BASE_URL}/search?key=${YOUTUBE_API_KEY}&channelId=${channelId}&part=snippet&order=date&maxResults=${maxResults}&type=video`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch YouTube videos');
      }

      return data.items.map((video: YouTubeVideo) => ({
        id: video.id,
        creatorId: video.snippet.channelId,
        creatorName: video.snippet.channelTitle,
        creatorAvatar: channelDetails.snippet.thumbnails.default.url,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails.high.url,
        sourceUrl: `https://www.youtube.com/watch?v=${video.id}`,
        type: 'video',
        publishedAt: Timestamp.fromDate(new Date(video.snippet.publishedAt)),
        metadata: {
          platform: 'youtube',
        },
      }));
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      return [];
    }
  }

  static async getVideoDetails(videoId: string): Promise<ContentItem | null> {
    try {
      const response = await fetch(
        `${YOUTUBE_API_BASE_URL}/videos?key=${YOUTUBE_API_KEY}&id=${videoId}&part=snippet,contentDetails`
      );
      const data = await response.json();

      if (!response.ok || !data.items?.[0]) {
        throw new Error(data.error?.message || 'Failed to fetch video details');
      }

      const video = data.items[0];
      // Get channel details for correct avatar URL
      const channelDetails = await this.getChannelDetails(video.snippet.channelId);
      
      return {
        id: video.id,
        creatorId: video.snippet.channelId,
        creatorName: video.snippet.channelTitle,
        creatorAvatar: channelDetails?.snippet.thumbnails.default.url || '',
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails.high.url,
        sourceUrl: `https://www.youtube.com/watch?v=${video.id}`,
        type: 'video',
        publishedAt: Timestamp.fromDate(new Date(video.snippet.publishedAt)),
        metadata: {
          platform: 'youtube',
          estimatedTime: this.parseDuration(video.contentDetails.duration),
        },
      };
    } catch (error) {
      console.error('Error fetching video details:', error);
      return null;
    }
  }

  private static parseDuration(duration: string): number {
    // Convert ISO 8601 duration to minutes
    const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!matches) return 0;

    const [, hours, minutes, seconds] = matches;
    return (
      (parseInt(hours || '0') * 60) +
      parseInt(minutes || '0') +
      Math.ceil(parseInt(seconds || '0') / 60)
    );
  }
} 