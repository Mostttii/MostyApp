import { collection, doc, getDoc, getDocs, query, where, addDoc, deleteDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const FOLLOWING_COLLECTION = 'user_following';
const COLLECTIONS_COLLECTION = 'collections';
const SAVED_RECIPES_COLLECTION = 'saved_recipes';

interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  recipeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface SavedRecipe {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  creatorId?: string;
  estimatedTime?: string;
  cuisineType?: string;
  tags: string[];
  createdAt: Date;
  collections: string[];
}

export class UserService {
  // Following System
  static async followCreator(userId: string, creatorId: string): Promise<void> {
    await addDoc(collection(db, FOLLOWING_COLLECTION), {
      userId,
      creatorId,
      createdAt: Timestamp.now()
    });
  }

  static async unfollowCreator(userId: string, creatorId: string): Promise<void> {
    const q = query(
      collection(db, FOLLOWING_COLLECTION),
      where('userId', '==', userId),
      where('creatorId', '==', creatorId)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  }

  static async getFollowedCreators(userId: string): Promise<string[]> {
    const q = query(
      collection(db, FOLLOWING_COLLECTION),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data().creatorId);
  }

  // Collections Management
  static async createCollection(
    userId: string,
    name: string,
    description?: string
  ): Promise<Collection> {
    try {
      const collectionsRef = collection(db, 'collections');
      const now = new Date();
      const newCollection = {
        userId,
        name,
        description,
        recipeCount: 0,
        createdAt: now,
        updatedAt: now
      };
      
      const docRef = await addDoc(collectionsRef, newCollection);
      return {
        id: docRef.id,
        ...newCollection
      };
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  }

  static async getUserCollections(userId: string): Promise<Collection[]> {
    try {
      const collectionsRef = collection(db, 'collections');
      const q = query(collectionsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as Collection[];
    } catch (error) {
      console.error('Error getting user collections:', error);
      return [];
    }
  }

  static async saveRecipe(
    userId: string,
    collectionIds: string[],
    recipeData: {
      url: string;
      title: string;
      thumbnailUrl?: string;
      creatorId?: string;
      estimatedTime?: string;
      cuisineType?: string;
      tags: string[];
    }
  ): Promise<string> {
    const docRef = await addDoc(collection(db, SAVED_RECIPES_COLLECTION), {
      userId,
      collectionIds,
      ...recipeData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  }

  static async getSavedRecipes(userId: string, collectionId?: string): Promise<SavedRecipe[]> {
    try {
      const recipesRef = collection(db, 'recipes');
      const q = collectionId
        ? query(recipesRef, 
            where('userId', '==', userId),
            where('collections', 'array-contains', collectionId))
        : query(recipesRef, where('userId', '==', userId));
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as SavedRecipe[];
    } catch (error) {
      console.error('Error getting saved recipes:', error);
      return [];
    }
  }

  static async deleteCollection(collectionId: string): Promise<void> {
    try {
      const collectionRef = doc(db, 'collections', collectionId);
      await deleteDoc(collectionRef);
    } catch (error) {
      console.error('Error deleting collection:', error);
      throw error;
    }
  }

  static async removeRecipeFromCollection(
    recipeId: string,
    collectionId: string
  ): Promise<void> {
    try {
      const recipeRef = doc(db, 'recipes', recipeId);
      const recipeDoc = await getDocs(query(collection(db, 'recipes'), where('id', '==', recipeId)));
      
      if (!recipeDoc.empty) {
        const recipe = recipeDoc.docs[0].data();
        const updatedCollections = recipe.collections.filter((id: string) => id !== collectionId);
        await updateDoc(recipeRef, { collections: updatedCollections });
      }
    } catch (error) {
      console.error('Error removing recipe from collection:', error);
      throw error;
    }
  }
} 