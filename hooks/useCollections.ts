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
import { Collection } from '../types/Collection';
import { useAuth } from '../context/AuthContext';

interface UseCollectionsReturn {
  collections: Collection[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createCollection: (data: Omit<Collection, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateCollection: (id: string, data: Partial<Collection>) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
}

export function useCollections(): UseCollectionsReturn {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCollections = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const collectionsRef = collection(db, 'collections');
      const q = query(
        collectionsRef,
        where('userId', '==', user.uid),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const fetchedCollections = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Collection[];

      setCollections(fetchedCollections);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch collections'));
    } finally {
      setLoading(false);
    }
  };

  const createCollection = async (
    data: Omit<Collection, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!user) throw new Error('User must be authenticated');

    const collectionsRef = collection(db, 'collections');
    const now = new Date();
    
    const newCollection = {
      ...data,
      userId: user.uid,
      recipes: [],
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collectionsRef, newCollection);
    await fetchCollections();
    return docRef.id;
  };

  const updateCollection = async (id: string, data: Partial<Collection>) => {
    if (!user) throw new Error('User must be authenticated');

    const collectionRef = doc(db, 'collections', id);
    await updateDoc(collectionRef, {
      ...data,
      updatedAt: new Date(),
    });
    await fetchCollections();
  };

  const deleteCollection = async (id: string) => {
    if (!user) throw new Error('User must be authenticated');

    const collectionRef = doc(db, 'collections', id);
    await deleteDoc(collectionRef);
    await fetchCollections();
  };

  useEffect(() => {
    fetchCollections();
  }, [user]);

  return {
    collections,
    loading,
    error,
    refetch: fetchCollections,
    createCollection,
    updateCollection,
    deleteCollection,
  };
} 