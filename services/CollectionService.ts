import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  getDoc,
  doc, 
  updateDoc, 
  deleteDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Collection, DEFAULT_COLLECTIONS } from '../types/Collection';
import { User } from 'firebase/auth';

export class CollectionService {
  private static COLLECTION = 'collections';

  /**
   * Initialize default collections for a new user
   */
  static async initializeDefaultCollections(user: User): Promise<void> {
    try {
      const timestamp = Timestamp.now();
      
      for (const defaultCollection of DEFAULT_COLLECTIONS) {
        await addDoc(collection(db, this.COLLECTION), {
          ...defaultCollection,
          recipeIds: [],
          createdBy: user.uid,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      }
    } catch (error) {
      console.error('Error initializing collections:', error);
      throw new Error('Failed to initialize collections');
    }
  }

  /**
   * Create a new collection
   */
  static async createCollection(
    name: string,
    description: string | undefined,
    color: string | undefined,
    user: User
  ): Promise<Collection> {
    try {
      const timestamp = Timestamp.now();
      const newCollection = {
        name,
        description,
        color,
        recipeIds: [],
        createdBy: user.uid,
        createdAt: timestamp,
        updatedAt: timestamp,
        isDefault: false,
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), newCollection);
      
      return {
        ...newCollection,
        id: docRef.id,
        createdAt: timestamp.toDate().toISOString(),
        updatedAt: timestamp.toDate().toISOString(),
      };
    } catch (error) {
      console.error('Error creating collection:', error);
      throw new Error('Failed to create collection');
    }
  }

  /**
   * Get all collections for a user
   */
  static async getUserCollections(userId: string): Promise<Collection[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('createdBy', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp).toDate().toISOString(),
        updatedAt: (doc.data().updatedAt as Timestamp).toDate().toISOString(),
      } as Collection));
    } catch (error) {
      console.error('Error getting collections:', error);
      throw new Error('Failed to get collections');
    }
  }

  /**
   * Add a recipe to a collection
   */
  static async addRecipeToCollection(collectionId: string, recipeId: string): Promise<void> {
    try {
      const collectionRef = doc(db, this.COLLECTION, collectionId);
      await updateDoc(collectionRef, {
        recipeIds: arrayUnion(recipeId),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding recipe to collection:', error);
      throw new Error('Failed to add recipe to collection');
    }
  }

  /**
   * Remove a recipe from a collection
   */
  static async removeRecipeFromCollection(collectionId: string, recipeId: string): Promise<void> {
    try {
      const collectionRef = doc(db, this.COLLECTION, collectionId);
      await updateDoc(collectionRef, {
        recipeIds: arrayRemove(recipeId),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error removing recipe from collection:', error);
      throw new Error('Failed to remove recipe from collection');
    }
  }

  /**
   * Update a collection
   */
  static async updateCollection(
    collectionId: string,
    updates: Partial<Pick<Collection, 'name' | 'description' | 'color' | 'coverImage'>>,
    userId: string
  ): Promise<void> {
    try {
      const collectionRef = doc(db, this.COLLECTION, collectionId);
      const collectionSnap = await getDoc(collectionRef);
      
      if (!collectionSnap.exists()) {
        throw new Error('Collection not found');
      }

      const collection = collectionSnap.data();
      if (collection.createdBy !== userId) {
        throw new Error('Not authorized to update this collection');
      }

      if (collection.isDefault && (updates.name || updates.description)) {
        throw new Error('Cannot modify name or description of default collections');
      }

      await updateDoc(collectionRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating collection:', error);
      throw new Error('Failed to update collection');
    }
  }

  /**
   * Delete a collection
   */
  static async deleteCollection(collectionId: string, userId: string): Promise<void> {
    try {
      const collectionRef = doc(db, this.COLLECTION, collectionId);
      const collectionSnap = await getDoc(collectionRef);
      
      if (!collectionSnap.exists()) {
        throw new Error('Collection not found');
      }

      const collection = collectionSnap.data();
      if (collection.createdBy !== userId) {
        throw new Error('Not authorized to delete this collection');
      }

      if (collection.isDefault) {
        throw new Error('Cannot delete default collections');
      }

      await deleteDoc(collectionRef);
    } catch (error) {
      console.error('Error deleting collection:', error);
      throw new Error('Failed to delete collection');
    }
  }
} 