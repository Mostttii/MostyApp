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
  arrayUnion,
  arrayRemove,
  DocumentData,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Recipe, Collection, Tag, Ingredient, Step } from '../types/Recipe';
import { User } from 'firebase/auth';
import { SearchFilters } from '../components/recipe/SearchBar';

const RECIPES_COLLECTION = 'recipes';

export class RecipeService {
  private static RECIPES_COLLECTION = RECIPES_COLLECTION;
  private static COLLECTIONS_COLLECTION = 'collections';
  private static TAGS_COLLECTION = 'tags';

  private static convertDocToRecipe(doc: DocumentData, id: string): Recipe {
    const createdAt = doc.createdAt instanceof Timestamp 
      ? doc.createdAt
      : serverTimestamp();
    
    const updatedAt = doc.updatedAt instanceof Timestamp
      ? doc.updatedAt
      : createdAt;

    return {
      id,
      title: doc.title || '',
      sourceUrl: doc.sourceUrl || '',
      thumbnail: doc.thumbnail || '',
      estimatedTime: doc.estimatedTime,
      cuisineType: doc.cuisineType,
      creatorId: doc.creatorId,
      userId: doc.userId,
      collections: doc.collections || [],
      tags: doc.tags || [],
      metadata: {
        source: doc.metadata?.source || '',
        servings: doc.metadata?.servings,
        prepTime: doc.metadata?.prepTime,
        cookTime: doc.metadata?.cookTime,
        totalTime: doc.metadata?.totalTime,
        ingredients: doc.metadata?.ingredients || [],
        instructions: doc.metadata?.instructions || [],
      },
      createdAt,
      updatedAt,
    };
  }

  // Recipe Methods
  static async getRecipe(id: string): Promise<Recipe> {
    try {
      const docRef = doc(db, RECIPES_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Recipe not found');
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: (data.createdAt as Timestamp).toDate(),
        updatedAt: (data.updatedAt as Timestamp).toDate(),
      } as Recipe;
    } catch (err) {
      console.error('Error getting recipe:', err);
      throw err;
    }
  }

  static async getRecipes(options: {
    creatorId?: string;
    cuisine?: string[];
    difficulty?: ('easy' | 'medium' | 'hard')[];
    limit?: number;
  } = {}): Promise<Recipe[]> {
    try {
      const recipesRef = collection(db, RECIPES_COLLECTION);
      let q = query(recipesRef, orderBy('createdAt', 'desc'));

      if (options.creatorId) {
        q = query(q, where('creatorId', '==', options.creatorId));
      }

      if (options.cuisine && options.cuisine.length > 0) {
        q = query(q, where('cuisine', 'array-contains-any', options.cuisine));
      }

      if (options.difficulty && options.difficulty.length > 0) {
        q = query(q, where('difficulty', 'in', options.difficulty));
      }

      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp).toDate(),
          updatedAt: (data.updatedAt as Timestamp).toDate(),
        } as Recipe;
      });
    } catch (err) {
      console.error('Error getting recipes:', err);
      throw err;
    }
  }

  static async createRecipe(recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'rating'>): Promise<Recipe> {
    try {
      const now = new Date();
      const recipeData = {
        ...recipe,
        rating: {
          average: 0,
          count: 0,
        },
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      };

      const docRef = await addDoc(collection(db, RECIPES_COLLECTION), recipeData);
      return {
        id: docRef.id,
        ...recipeData,
        createdAt: now,
        updatedAt: now,
      };
    } catch (err) {
      console.error('Error creating recipe:', err);
      throw err;
    }
  }

  static async updateRecipe(id: string, updates: Partial<Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    try {
      const recipeRef = doc(db, RECIPES_COLLECTION, id);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date()),
      };

      await updateDoc(recipeRef, updateData);
    } catch (err) {
      console.error('Error updating recipe:', err);
      throw err;
    }
  }

  static async deleteRecipe(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, RECIPES_COLLECTION, id));
    } catch (err) {
      console.error('Error deleting recipe:', err);
      throw err;
    }
  }

  static async uploadRecipeImage(file: Blob, recipeId: string): Promise<string> {
    try {
      const imageRef = ref(storage, `recipes/${recipeId}/main.jpg`);
      await uploadBytes(imageRef, file);
      const imageUrl = await getDownloadURL(imageRef);
      
      await this.updateRecipe(recipeId, { imageUrl });
      return imageUrl;
    } catch (err) {
      console.error('Error uploading recipe image:', err);
      throw err;
    }
  }

  static async searchRecipes(query: string): Promise<Recipe[]> {
    try {
      // TODO: Implement full-text search using a service like Algolia
      // For now, just return an empty array
      return [];
    } catch (err) {
      console.error('Error searching recipes:', err);
      throw err;
    }
  }

  static async getTrendingRecipes(maxResults = 10): Promise<Recipe[]> {
    try {
      const recipesRef = collection(db, RECIPES_COLLECTION);
      const q = query(
        recipesRef,
        orderBy('rating.average', 'desc'),
        where('rating.count', '>=', 10),
        limit(maxResults)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp).toDate(),
          updatedAt: (data.updatedAt as Timestamp).toDate(),
        } as Recipe;
      });
    } catch (err) {
      console.error('Error getting trending recipes:', err);
      throw err;
    }
  }

  static async getRecommendedRecipes(userId: string, maxResults = 10): Promise<Recipe[]> {
    try {
      // TODO: Implement personalized recommendations
      // For now, just return trending recipes
      return this.getTrendingRecipes(maxResults);
    } catch (err) {
      console.error('Error getting recommended recipes:', err);
      throw err;
    }
  }

  // Collection Methods
  static async createCollection(
    collectionData: Omit<Collection, 'id' | 'recipeCount' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const docRef = await addDoc(collection(db, this.COLLECTIONS_COLLECTION), {
      ...collectionData,
      recipeCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  static async getUserCollections(userId: string): Promise<Collection[]> {
    const q = query(
      collection(db, this.COLLECTIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('name', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Collection));
  }

  static async addRecipeToCollections(
    recipeId: string,
    collectionIds: string[]
  ): Promise<void> {
    const recipeRef = doc(db, this.RECIPES_COLLECTION, recipeId);
    await updateDoc(recipeRef, {
      collections: arrayUnion(...collectionIds),
      updatedAt: serverTimestamp(),
    });

    // Update collection counts
    for (const collectionId of collectionIds) {
      const collectionRef = doc(db, this.COLLECTIONS_COLLECTION, collectionId);
      await updateDoc(collectionRef, {
        recipeCount: increment(1),
        updatedAt: serverTimestamp(),
      });
    }
  }

  static async removeRecipeFromCollections(
    recipeId: string,
    collectionIds: string[]
  ): Promise<void> {
    const recipeRef = doc(db, this.RECIPES_COLLECTION, recipeId);
    await updateDoc(recipeRef, {
      collections: arrayRemove(...collectionIds),
      updatedAt: serverTimestamp(),
    });

    // Update collection counts
    for (const collectionId of collectionIds) {
      const collectionRef = doc(db, this.COLLECTIONS_COLLECTION, collectionId);
      await updateDoc(collectionRef, {
        recipeCount: increment(-1),
        updatedAt: serverTimestamp(),
      });
    }
  }

  // Tag Methods
  static async createTag(
    tag: Omit<Tag, 'id' | 'recipeCount' | 'createdAt'>
  ): Promise<string> {
    const docRef = await addDoc(collection(db, this.TAGS_COLLECTION), {
      ...tag,
      recipeCount: 0,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }

  static async getUserTags(userId: string): Promise<Tag[]> {
    const q = query(
      collection(db, this.TAGS_COLLECTION),
      where('userId', '==', userId),
      orderBy('name', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tag));
  }

  static async addTagsToRecipe(
    recipeId: string,
    tags: string[]
  ): Promise<void> {
    const recipeRef = doc(db, this.RECIPES_COLLECTION, recipeId);
    await updateDoc(recipeRef, {
      tags: arrayUnion(...tags),
      updatedAt: serverTimestamp(),
    });

    // Update tag counts
    for (const tagName of tags) {
      const tagRef = doc(db, this.TAGS_COLLECTION, tagName);
      await updateDoc(tagRef, {
        recipeCount: increment(1),
      });
    }
  }

  static async removeTagsFromRecipe(
    recipeId: string,
    tags: string[]
  ): Promise<void> {
    const recipeRef = doc(db, this.RECIPES_COLLECTION, recipeId);
    await updateDoc(recipeRef, {
      tags: arrayRemove(...tags),
      updatedAt: serverTimestamp(),
    });

    // Update tag counts
    for (const tagName of tags) {
      const tagRef = doc(db, this.TAGS_COLLECTION, tagName);
      await updateDoc(tagRef, {
        recipeCount: increment(-1),
      });
    }
  }

  // Suggestion Methods
  static async getSuggestedTags(recipe: Partial<Recipe>): Promise<string[]> {
    const suggestedTags: Set<string> = new Set();

    // Add cuisine type as a tag
    if (recipe.cuisineType) {
      suggestedTags.add(recipe.cuisineType);
    }

    // Add time-based tags
    if (recipe.estimatedTime) {
      const time = parseInt(recipe.estimatedTime);
      if (time <= 15) suggestedTags.add('quick');
      if (time <= 30) suggestedTags.add('under-30-minutes');
      if (time > 60) suggestedTags.add('long-prep');
    }

    // Add source-based tags
    if (recipe.metadata?.source) {
      suggestedTags.add(`from-${recipe.metadata.source.toLowerCase()}`);
    }

    return Array.from(suggestedTags);
  }
} 