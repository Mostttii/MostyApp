import { Timestamp } from 'firebase/firestore';
import { VerificationMetadata } from './Verification';

export type PlatformType = 'instagram' | 'tiktok' | 'blog' | 'youtube';

export interface CreatorPlatforms {
  youtube?: {
    channelId: string;
    subscribers: number;
  };
  instagram?: {
    username: string;
    followers: number;
  };
  tiktok?: {
    username: string;
    followers: number;
  };
  blog?: {
    url: string;
    feedUrl: string;
  };
}

export interface Creator {
  id: string;
  name: string;
  handle: string;
  bio?: string;
  avatar?: string;
  profileImage?: string;
  coverImage?: string;
  platforms: CreatorPlatforms;
  specialties: string[];
  cuisineTypes: string[];
  difficultyLevels: ('easy' | 'medium' | 'hard')[];
  statistics: {
    followers: number;
    recipes: number;
    totalViews: number;
    averageRating: number;
  };
  featured: boolean;
  verification: VerificationMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserFollowing {
  userId: string;
  creatorId: string;
  notificationSettings: {
    enabled: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  followedAt: Timestamp;
}

export interface ContentItem {
  id: string;
  creatorId: string;
  platform: PlatformType;
  type: 'recipe' | 'video' | 'article';
  title: string;
  thumbnail: string;
  originalUrl: string;
  publishedAt: Timestamp;
  metadata: {
    estimatedTime?: string;
    cuisineType?: string;
    tags?: string[];
  };
} 