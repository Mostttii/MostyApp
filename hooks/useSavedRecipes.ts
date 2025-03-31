import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { SavedRecipe } from '../types/SavedRecipe';
import { useAuth } from '../context/AuthContext';

interface UseSavedRecipesReturn {
  recipes: SavedRecipe[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  saveRecipe: (recipeId: string, collectionIds?: string[]) => Promise<string>;
  updateSavedRecipe: (id: string, data: Partial<SavedRecipe>) => Promise<void>;
  deleteSavedRecipe: (id: string) => Promise<void>;
  addToCollection: (recipeId: string, collectionId: string) => Promise<void>;
  removeFromCollection: (recipeId: string, collectionId: string) => Promise<void>;
}

export function useSavedRecipes(collectionId?: string | null): UseSavedRecipesReturn {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecipes = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const recipesRef = collection(db, 'saved_recipes');
      let q = query(
        recipesRef,
        where('userId', '==', user.uid),
        orderBy('updatedAt', 'desc')
      );

      if (collectionId) {
        q = query(
          recipesRef,
          where('userId', '==', user.uid),
          where('collections', 'array-contains', collectionId),
          orderBy('updatedAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const fetchedRecipes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as SavedRecipe[];

      setRecipes(fetchedRecipes);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch recipes'));
    } finally {
      setLoading(false);
    }
  };

  const saveRecipe = async (recipeId: string, collectionIds: string[] = []) => {
    if (!user) throw new Error('User must be authenticated');

    const recipesRef = collection(db, 'saved_recipes');
    const now = new Date();
    
    const newSavedRecipe = {
      recipeId,
      userId: user.uid,
      collections: collectionIds,
      cookHistory: {
        timesCooked: 0,
        servingsSizes: [],
      },
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(recipesRef, newSavedRecipe);
    await fetchRecipes();
    return docRef.id;
  };

  const updateSavedRecipe = async (id: string, data: Partial<SavedRecipe>) => {
    if (!user) throw new Error('User must be authenticated');

    const recipeRef = doc(db, 'saved_recipes', id);
    await updateDoc(recipeRef, {
      ...data,
      updatedAt: new Date(),
    });
    await fetchRecipes();
  };

  const deleteSavedRecipe = async (id: string) => {
    if (!user) throw new Error('User must be authenticated');

    const recipeRef = doc(db, 'saved_recipes', id);
    await deleteDoc(recipeRef);
    await fetchRecipes();
  };

  const addToCollection = async (recipeId: string, collectionId: string) => {
    if (!user) throw new Error('User must be authenticated');

    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) throw new Error('Recipe not found');

    const updatedCollections = [...new Set([...recipe.collections, collectionId])];
    await updateSavedRecipe(recipeId, { collections: updatedCollections });
  };

  const removeFromCollection = async (recipeId: string, collectionId: string) => {
    if (!user) throw new Error('User must be authenticated');

    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) throw new Error('Recipe not found');

    const updatedCollections = recipe.collections.filter(id => id !== collectionId);
    await updateSavedRecipe(recipeId, { collections: updatedCollections });
  };

  useEffect(() => {
    fetchRecipes();
  }, [user, collectionId]);

  return {
    recipes,
    loading,
    error,
    refetch: fetchRecipes,
    saveRecipe,
    updateSavedRecipe,
    deleteSavedRecipe,
    addToCollection,
    removeFromCollection,
  };
} 