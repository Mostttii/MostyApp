import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { FAB, SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useCollections } from '../../hooks/useCollections';
import { CollectionList } from '../../components/recipes/CollectionList';
import { CollectionView } from '../../components/recipes/CollectionView';
import { Collection } from '../../types/Collection';
import { Recipe } from '../../types/Recipe';

export default function MyRecipesScreen() {
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const router = useRouter();
  const { collections, loading } = useCollections();

  const handleCollectionSelect = (collection: Collection) => {
    setSelectedCollection(collection);
  };

  const handleBack = () => {
    setSelectedCollection(null);
  };

  const handleRecipePress = (recipe: Recipe) => {
    router.push(`/recipe/${recipe.id}` as any);
  };

  const handleAddCollection = () => {
    router.push('/create-collection' as any);
  };

  const handleAddRecipe = () => {
    if (selectedCollection) {
      router.push({
        pathname: '/add-recipe',
        params: { collectionId: selectedCollection.id },
      } as any);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SegmentedButtons
          value={viewMode}
          onValueChange={(value) => setViewMode(value as 'grid' | 'list')}
          buttons={[
            { value: 'grid', icon: 'grid', label: 'Grid' },
            { value: 'list', icon: 'format-list-bulleted', label: 'List' },
          ]}
        />
      </View>

      {selectedCollection ? (
        <CollectionView
          collection={selectedCollection}
          viewMode={viewMode}
          onRecipePress={handleRecipePress}
          onBack={handleBack}
          loading={loading}
        />
      ) : (
        <CollectionList
          collections={collections}
          viewMode={viewMode}
          onSelect={handleCollectionSelect}
          loading={loading}
        />
      )}

      <FAB
        icon={selectedCollection ? 'plus' : 'folder-plus'}
        label={selectedCollection ? 'Add Recipe' : 'New Collection'}
        style={styles.fab}
        onPress={selectedCollection ? handleAddRecipe : handleAddCollection}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
}); 