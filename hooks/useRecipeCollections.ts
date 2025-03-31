import { useState, useEffect } from 'react';
import { Collection } from '../types/Collection';
import { CollectionService } from '../services/CollectionService';
import { useAuth } from './useAuth';

interface UseRecipeCollectionsResult {
  collections: Collection[];
  selectedCollection: Collection | null;
  loading: boolean;
  error: Error | null;
  selectCollection: (collection: Collection | null) => void;
  createCollection: (name: string, description?: string, color?: string) => Promise<Collection>;
  updateCollection: (id: string, updates: Partial<Collection>) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  addRecipeToCollection: (collectionId: string, recipeId: string) => Promise<void>;
  removeRecipeFromCollection: (collectionId: string, recipeId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useRecipeCollections(): UseRecipeCollectionsResult {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const loadCollections = async () => {
    if (!user) {
      setCollections([]);
      setSelectedCollection(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userCollections = await CollectionService.getUserCollections(user.uid);
      setCollections(userCollections);
    } catch (err) {
      console.error('Error loading collections:', err);
      setError(err instanceof Error ? err : new Error('Failed to load collections'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, [user]);

  const createCollection = async (name: string, description?: string, color?: string): Promise<Collection> => {
    if (!user) throw new Error('User must be logged in to create collections');

    try {
      const newCollection = await CollectionService.createCollection(name, description, color, user);
      setCollections(prev => [...prev, newCollection]);
      return newCollection;
    } catch (err) {
      console.error('Error creating collection:', err);
      throw err instanceof Error ? err : new Error('Failed to create collection');
    }
  };

  const updateCollection = async (id: string, updates: Partial<Collection>): Promise<void> => {
    if (!user) throw new Error('User must be logged in to update collections');

    try {
      await CollectionService.updateCollection(id, updates, user.uid);
      setCollections(prev => 
        prev.map(collection => 
          collection.id === id ? { ...collection, ...updates } : collection
        )
      );
      if (selectedCollection?.id === id) {
        setSelectedCollection(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (err) {
      console.error('Error updating collection:', err);
      throw err instanceof Error ? err : new Error('Failed to update collection');
    }
  };

  const deleteCollection = async (id: string): Promise<void> => {
    if (!user) throw new Error('User must be logged in to delete collections');

    try {
      await CollectionService.deleteCollection(id, user.uid);
      setCollections(prev => prev.filter(collection => collection.id !== id));
      if (selectedCollection?.id === id) {
        setSelectedCollection(null);
      }
    } catch (err) {
      console.error('Error deleting collection:', err);
      throw err instanceof Error ? err : new Error('Failed to delete collection');
    }
  };

  const addRecipeToCollection = async (collectionId: string, recipeId: string): Promise<void> => {
    try {
      await CollectionService.addRecipeToCollection(collectionId, recipeId);
      setCollections(prev =>
        prev.map(collection =>
          collection.id === collectionId
            ? {
                ...collection,
                recipes: [...collection.recipes, recipeId],
                updatedAt: collection.updatedAt,
              }
            : collection
        )
      );
      if (selectedCollection?.id === collectionId) {
        setSelectedCollection(prev =>
          prev
            ? {
                ...prev,
                recipes: [...prev.recipes, recipeId],
                updatedAt: prev.updatedAt,
              }
            : null
        );
      }
    } catch (err) {
      console.error('Error adding recipe to collection:', err);
      throw err instanceof Error ? err : new Error('Failed to add recipe to collection');
    }
  };

  const removeRecipeFromCollection = async (collectionId: string, recipeId: string): Promise<void> => {
    try {
      await CollectionService.removeRecipeFromCollection(collectionId, recipeId);
      setCollections(prev =>
        prev.map(collection =>
          collection.id === collectionId
            ? {
                ...collection,
                recipes: collection.recipes.filter(id => id !== recipeId),
                updatedAt: collection.updatedAt,
              }
            : collection
        )
      );
      if (selectedCollection?.id === collectionId) {
        setSelectedCollection(prev =>
          prev
            ? {
                ...prev,
                recipes: prev.recipes.filter(id => id !== recipeId),
                updatedAt: prev.updatedAt,
              }
            : null
        );
      }
    } catch (err) {
      console.error('Error removing recipe from collection:', err);
      throw err instanceof Error ? err : new Error('Failed to remove recipe from collection');
    }
  };

  return {
    collections,
    selectedCollection,
    loading,
    error,
    selectCollection: setSelectedCollection,
    createCollection,
    updateCollection,
    deleteCollection,
    addRecipeToCollection,
    removeRecipeFromCollection,
    refresh: loadCollections,
  };
} 