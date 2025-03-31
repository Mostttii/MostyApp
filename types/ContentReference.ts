export interface ContentMetadata {
  estimatedTime: string;
  cuisineType: string;
  mealType: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface ContentStatistics {
  saveCount: number;
  viewCount: number;
}

export interface ContentReference {
  id: string;
  type: 'recipe' | 'article' | 'video';
  title: string;
  description?: string;
  thumbnail?: string;
  url: string;
  creatorId: string;
  metadata: {
    duration?: number; // in seconds for videos
    views: number;
    likes: number;
    shares: number;
    platform: 'youtube' | 'instagram' | 'tiktok' | 'website';
    isSaved?: boolean;
  };
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
} 