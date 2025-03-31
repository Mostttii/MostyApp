import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Searchbar, Card, Button, ActivityIndicator } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCollections } from '../../hooks/useCollections';
import { Recipe } from '../../types/Recipe';

export default function AddRecipeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(new Set());
  
  const router = useRouter();
  const { collectionId } = useLocalSearchParams();
  const { addRecipeToCollection } = useCollections();

  // TODO: Replace with actual recipe search hook
  const [recipes] = useState<Recipe[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: Implement recipe search
  };

  const toggleRecipeSelection = (recipeId: string) => {
    const newSelection = new Set(selectedRecipes);
    if (newSelection.has(recipeId)) {
      newSelection.delete(recipeId);
    } else {
      newSelection.add(recipeId);
    }
    setSelectedRecipes(newSelection);
  };

  const handleAddRecipes = async () => {
    if (!collectionId || typeof collectionId !== 'string') {
      setError('Invalid collection ID');
      return;
    }

    if (selectedRecipes.size === 0) {
      setError('Please select at least one recipe');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Add recipes sequentially to maintain order
      for (const recipeId of selectedRecipes) {
        await addRecipeToCollection(collectionId, recipeId);
      }
      
      router.back();
    } catch (err) {
      console.error('Error adding recipes:', err);
      setError('Failed to add recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <Card
      style={[
        styles.recipeCard,
        selectedRecipes.has(item.id) && styles.selectedCard,
      ]}
      onPress={() => toggleRecipeSelection(item.id)}
    >
      {item.imageUrl && (
        <Card.Cover source={{ uri: item.imageUrl }} style={styles.cardCover} />
      )}
      <Card.Content>
        <Text variant="titleMedium" numberOfLines={1}>
          {item.title}
        </Text>
        <Text variant="bodySmall" style={styles.cookTime}>
          {item.cookTime} mins
        </Text>
        {item.description && (
          <Text variant="bodySmall" numberOfLines={2} style={styles.description}>
            {item.description}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Add Recipes
      </Text>

      <Searchbar
        placeholder="Search recipes..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipeItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'No recipes found. Try a different search.'
                : 'Start searching to find recipes.'}
            </Text>
          }
        />
      )}

      {error && (
        <Text style={styles.errorText} variant="bodySmall">
          {error}
        </Text>
      )}

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={() => router.back()}
          style={styles.button}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleAddRecipes}
          loading={loading}
          disabled={loading || selectedRecipes.size === 0}
          style={styles.button}
        >
          Add {selectedRecipes.size > 0 ? `(${selectedRecipes.size})` : ''}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  searchBar: {
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flexGrow: 1,
  },
  recipeCard: {
    marginBottom: 16,
  },
  selectedCard: {
    backgroundColor: '#E3F2FD',
  },
  cardCover: {
    height: 120,
  },
  cookTime: {
    marginTop: 4,
    color: '#666',
  },
  description: {
    marginTop: 8,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    color: '#666',
  },
  errorText: {
    color: '#B00020',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
}); 