import { 
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  increment,
  Timestamp,
  CollectionReference,
  Query,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Creator } from '../types/Creator';
import { ContentReference } from '../types/ContentReference';

const CREATORS_COLLECTION = 'creators';
const FOLLOWING_COLLECTION = 'user_following';

export class CreatorService {
  static async getCreator(creatorId: string): Promise<Creator | null> {
    try {
      const creatorDoc = await getDoc(doc(db, CREATORS_COLLECTION, creatorId));
      if (!creatorDoc.exists()) return null;

      const data = creatorDoc.data();
      return {
        id: creatorDoc.id,
        name: data.name,
        handle: data.handle,
        channelId: data.channelId,
        bio: data.bio,
        profileImage: data.profileImage,
        tags: data.tags,
        cuisineTypes: data.cuisineTypes,
        specialties: data.specialties,
        difficultyLevel: data.difficultyLevel,
        platforms: data.platforms,
        content: data.content,
        analytics: data.analytics,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Creator;
    } catch (error) {
      console.error('Error getting creator:', error);
      return null;
    }
  }

  static async getCreators(filters?: {
    cuisineTypes?: string[];
    specialties?: string[];
    difficultyLevel?: string;
  }): Promise<Creator[]> {
    try {
      let baseQuery: Query | CollectionReference = collection(db, CREATORS_COLLECTION);
      
      // Apply filters if provided
      if (filters) {
        if (filters.cuisineTypes?.length) {
          baseQuery = query(baseQuery, where('cuisineTypes', 'array-contains-any', filters.cuisineTypes));
        }
        if (filters.specialties?.length) {
          baseQuery = query(baseQuery, where('specialties', 'array-contains-any', filters.specialties));
        }
        if (filters.difficultyLevel) {
          baseQuery = query(baseQuery, where('difficultyLevel', '==', filters.difficultyLevel));
        }
      }

      const querySnapshot = await getDocs(baseQuery);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          handle: data.handle,
          channelId: data.channelId,
          bio: data.bio,
          profileImage: data.profileImage,
          tags: data.tags,
          cuisineTypes: data.cuisineTypes,
          specialties: data.specialties,
          difficultyLevel: data.difficultyLevel,
          platforms: data.platforms,
          content: data.content,
          analytics: data.analytics,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Creator;
      });
    } catch (error) {
      console.error('Error getting creators:', error);
      return [];
    }
  }

  static async getCreatorContent(creatorId: string): Promise<ContentReference[]> {
    try {
      const contentQuery = query(
        collection(db, 'content_references'),
        where('creatorId', '==', creatorId)
      );
      const querySnapshot = await getDocs(contentQuery);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          creatorId: data.creatorId,
          title: data.title,
          thumbnailUrl: data.thumbnailUrl,
          sourceUrl: data.sourceUrl,
          sourcePlatform: data.sourcePlatform,
          publishDate: data.publishDate.toDate(),
          metadata: data.metadata,
          statistics: data.statistics,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as ContentReference;
      });
    } catch (error) {
      console.error('Error getting creator content:', error);
      return [];
    }
  }

  static async followCreator(userId: string, creatorId: string): Promise<void> {
    try {
      await addDoc(collection(db, FOLLOWING_COLLECTION), {
        userId,
        creatorId,
        createdAt: new Date()
      });

      // Update creator's follower count
      const creatorRef = doc(db, CREATORS_COLLECTION, creatorId);
      await updateDoc(creatorRef, {
        'analytics.followers': increment(1)
      });
    } catch (error) {
      console.error('Error following creator:', error);
      throw error;
    }
  }

  static async unfollowCreator(userId: string, creatorId: string): Promise<void> {
    try {
      const followingQuery = query(
        collection(db, FOLLOWING_COLLECTION),
        where('userId', '==', userId),
        where('creatorId', '==', creatorId)
      );
      const querySnapshot = await getDocs(followingQuery);
      
      // Delete the following relationship
      const followDoc = querySnapshot.docs[0];
      if (followDoc) {
        await deleteDoc(followDoc.ref);

        // Update creator's follower count
        const creatorRef = doc(db, CREATORS_COLLECTION, creatorId);
        await updateDoc(creatorRef, {
          'analytics.followers': increment(-1)
        });
      }
    } catch (error) {
      console.error('Error unfollowing creator:', error);
      throw error;
    }
  }

  static async getFollowedCreators(userId: string): Promise<Creator[]> {
    try {
      // Get all following relationships for the user
      const followingQuery = query(
        collection(db, FOLLOWING_COLLECTION),
        where('userId', '==', userId)
      );
      const followingSnapshot = await getDocs(followingQuery);
      const creatorIds = followingSnapshot.docs.map(doc => doc.data().creatorId);

      if (creatorIds.length === 0) return [];

      // Get all creators that the user follows
      const creatorsQuery = query(
        collection(db, CREATORS_COLLECTION),
        where('id', 'in', creatorIds)
      );
      const creatorsSnapshot = await getDocs(creatorsQuery);
      
      return creatorsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          handle: data.handle,
          channelId: data.channelId,
          bio: data.bio,
          profileImage: data.profileImage,
          tags: data.tags,
          cuisineTypes: data.cuisineTypes,
          specialties: data.specialties,
          difficultyLevel: data.difficultyLevel,
          platforms: data.platforms,
          content: data.content,
          analytics: data.analytics,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Creator;
      });
    } catch (error) {
      console.error('Error getting followed creators:', error);
      return [];
    }
  }
} 