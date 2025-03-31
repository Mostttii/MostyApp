import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp,
  startAfter,
  DocumentSnapshot,
  updateDoc,
  doc,
  increment,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Recipe } from '../types/Recipe';
import { UserService } from './UserService';
import { RecipeParser } from './RecipeParser';

export interface ContentItem {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  title: string;
  description: string;
  thumbnail: string;
  sourceUrl: string;
  type: 'recipe' | 'video' | 'post';
  publishedAt: Timestamp;
  metadata: {
    platform: 'youtube' | 'instagram' | 'tiktok' | 'blog';
    estimatedTime?: number;
    ingredients?: string[];
    servings?: number;
    views: number;
    likes: number;
    shares: number;
    saves: number;
  };
  isSaved?: boolean;
}

export interface FeedContent {
  forYou: ContentItem[];
  trending: ContentItem[];
  recentlyAdded: ContentItem[];
}

interface GetContentOptions {
  filters: {
    cuisineType: string;
    mealType: string;
    difficulty: string;
  };
  limit: number;
  lastDoc?: DocumentSnapshot | null;
}

interface GetContentResult {
  items: ContentItem[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}

export class ContentService {
  private static CONTENT_COLLECTION = 'content';
  private static CREATORS_COLLECTION = 'creators';
  private static SAVED_RECIPES_COLLECTION = 'saved_recipes';
  private static USER_INTERACTIONS_COLLECTION = 'user_interactions';
  private static CONTENT_STATS_COLLECTION = 'content_stats';

  static async getFeedContent(userId: string): Promise<FeedContent> {
    const [forYou, trending, recentlyAdded] = await Promise.all([
      this.getPersonalizedContent(userId),
      this.getTrendingContent(),
      this.getRecentContent(),
    ]);

    return {
      forYou,
      trending,
      recentlyAdded,
    };
  }

  static async getPersonalizedContent(userId: string): Promise<ContentItem[]> {
    try {
      // Get followed creators
      const followedCreators = await UserService.getFollowedCreators(userId);

      // Build query based on user preferences
      const contentRef = collection(db, this.CONTENT_COLLECTION);
      let q = query(
        contentRef,
        orderBy('publishedAt', 'desc'),
        limit(20)
      );

      // Apply filters based on followed creators
      if (followedCreators.length > 0) {
        q = query(q, where('creatorId', 'in', followedCreators));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as ContentItem));
    } catch (error) {
      console.error('Error fetching personalized content:', error);
      return [];
    }
  }

  static async getTrendingContent(): Promise<ContentItem[]> {
    try {
      const statsRef = collection(db, this.CONTENT_STATS_COLLECTION);
      const q = query(
        statsRef,
        orderBy('score', 'desc'),
        limit(20)
      );

      const snapshot = await getDocs(q);
      const trendingIds = snapshot.docs.map(doc => doc.id);

      // Fetch full content items for trending IDs
      const contentRef = collection(db, this.CONTENT_COLLECTION);
      const contentQuery = query(
        contentRef,
        where('id', 'in', trendingIds)
      );

      const contentSnapshot = await getDocs(contentQuery);
      return contentSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as ContentItem));
    } catch (error) {
      console.error('Error fetching trending content:', error);
      return [];
    }
  }

  static async getRecentContent(): Promise<ContentItem[]> {
    try {
      const contentRef = collection(db, this.CONTENT_COLLECTION);
      const q = query(
        contentRef,
        orderBy('publishedAt', 'desc'),
        limit(20)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as ContentItem));
    } catch (error) {
      console.error('Error fetching recent content:', error);
      return [];
    }
  }

  static async trackContentInteraction(
    userId: string,
    contentId: string,
    type: 'view' | 'like' | 'share' | 'save'
  ): Promise<void> {
    try {
      // Record interaction
      const interactionRef = collection(db, this.USER_INTERACTIONS_COLLECTION);
      await addDoc(interactionRef, {
        userId,
        contentId,
        type,
        timestamp: serverTimestamp(),
      });

      // Update content stats
      const statsRef = doc(db, this.CONTENT_STATS_COLLECTION, contentId);
      await updateDoc(statsRef, {
        [`${type}s`]: increment(1),
        lastInteraction: serverTimestamp(),
        // Update trending score based on weighted interactions
        score: increment(this.getInteractionWeight(type)),
      });
    } catch (error) {
      console.error('Error tracking content interaction:', error);
      throw error;
    }
  }

  private static getInteractionWeight(type: 'view' | 'like' | 'share' | 'save'): number {
    const weights = {
      view: 1,
      like: 5,
      share: 10,
      save: 15,
    };
    return weights[type] || 1;
  }

  static async getCreatorContent(creatorId: string, page = 1, pageSize = 20): Promise<ContentItem[]> {
    const q = query(
      collection(db, this.CONTENT_COLLECTION),
      where('creatorId', '==', creatorId),
      orderBy('publishedAt', 'desc'),
      limit(pageSize)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContentItem));
  }

  static async getCreatorsContent(creatorIds: string[], page = 1, pageSize = 20): Promise<ContentItem[]> {
    if (creatorIds.length === 0) return [];

    const q = query(
      collection(db, this.CONTENT_COLLECTION),
      where('creatorId', 'in', creatorIds),
      orderBy('publishedAt', 'desc'),
      limit(pageSize)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContentItem));
  }

  static async parseRecipe(url: string): Promise<{ success: boolean; recipe?: Recipe; error?: string }> {
    try {
      // Here we'll implement recipe parsing logic for different platforms
      // For now, return a mock implementation
      return {
        success: true,
        recipe: {
          id: '',
          title: 'Parsed Recipe',
          sourceUrl: url,
          thumbnail: 'https://via.placeholder.com/300',
          userId: '',
          collections: [],
          tags: [],
          metadata: {
            source: 'web',
            servings: 4,
            prepTime: '15',
            cookTime: '30',
            totalTime: '45',
            ingredients: [],
            instructions: [],
          },
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to parse recipe',
      };
    }
  }

  // Content aggregation methods for different platforms
  static async aggregateYouTubeContent(creatorId: string, channelId: string): Promise<void> {
    // Implement YouTube content aggregation
  }

  static async aggregateInstagramContent(creatorId: string, username: string): Promise<void> {
    // Implement Instagram content aggregation
  }

  static async aggregateTikTokContent(creatorId: string, username: string): Promise<void> {
    // Implement TikTok content aggregation
  }

  static async getContent({ filters, limit: limitCount, lastDoc }: GetContentOptions): Promise<GetContentResult> {
    try {
      const contentRef = collection(db, this.CONTENT_COLLECTION);
      let q = query(contentRef, orderBy('publishedAt', 'desc'));

      // Apply filters
      if (filters.cuisineType !== 'All') {
        q = query(q, where('metadata.cuisineType', '==', filters.cuisineType));
      }
      if (filters.mealType !== 'All') {
        q = query(q, where('metadata.mealType', '==', filters.mealType));
      }
      if (filters.difficulty !== 'All') {
        q = query(q, where('metadata.difficulty', '==', filters.difficulty));
      }

      // Apply pagination
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }
      q = query(q, limit(limitCount));

      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as ContentItem[];

      return {
        items,
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
        hasMore: snapshot.docs.length === limitCount,
      };
    } catch (error) {
      console.error('Error fetching content:', error);
      throw error;
    }
  }

  static async saveRecipe(userId: string, contentId: string): Promise<void> {
    try {
      const savedRecipeRef = doc(collection(db, this.SAVED_RECIPES_COLLECTION));
      await updateDoc(savedRecipeRef, {
        userId,
        contentId,
        savedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving recipe:', error);
      throw error;
    }
  }

  static async aggregateBlogContent(creatorId: string, feedUrl: string): Promise<void> {
    // Implement blog RSS feed aggregation
  }
} 