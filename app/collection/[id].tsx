import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text, Card, IconButton, Button } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { UserService } from '../../services/UserService';

interface SavedRecipe {
  id: string;
  url: string;
  title: string;
  thumbnailUrl?: string;
  creatorId?: string;
  estimatedTime?: string;
  cuisineType?: string;
  tags: string[];
  createdAt: any;
}

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState<any>(null);

  useEffect(() => {
    if (user && id) {
      loadCollection();
    }
  }, [user, id]);

  const loadCollection = async () => {
    try {
      // Load collection details
      const collections = await UserService.getUserCollections(user!.uid);
      const currentCollection = collections.find(c => c.id === id);
      setCollection(currentCollection);

      // Load recipes in this collection
      const collectionRecipes = await UserService.getSavedRecipes(user!.uid, id as string);
      setRecipes(collectionRecipes);
    } catch (error) {
      console.error('Error loading collection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRecipe = async (recipeId: string) => {
    // TODO: Implement remove recipe from collection
    console.log('Remove recipe:', recipeId);
  };

  const renderRecipe = ({ item }: { item: SavedRecipe }) => (
    <Card style={styles.card}>
      {item.thumbnailUrl && (
        <Card.Cover source={{ uri: item.thumbnailUrl }} />
      )}
      <Card.Title
        title={item.title}
        subtitle={item.estimatedTime ? `Cooking time: ${item.estimatedTime}` : undefined}
        right={(props) => (
          <IconButton
            {...props}
            icon="delete"
            onPress={() => handleRemoveRecipe(item.id)}
          />
        )}
      />
      {(item.cuisineType || item.tags.length > 0) && (
        <Card.Content>
          {item.cuisineType && (
            <Text variant="bodyMedium">Cuisine: {item.cuisineType}</Text>
          )}
          {item.tags.length > 0 && (
            <View style={styles.tags}>
              {item.tags.map((tag, index) => (
                <Text key={index} style={styles.tag}>#{tag}</Text>
              ))}
            </View>
          )}
        </Card.Content>
      )}
      <Card.Actions>
        <Button onPress={() => {/* Open recipe in browser */}}>View Recipe</Button>
      </Card.Actions>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!collection) {
    return (
      <View style={styles.container}>
        <Text>Collection not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">{collection.name}</Text>
        {collection.description && (
          <Text variant="bodyMedium">{collection.description}</Text>
        )}
      </View>

      <FlatList
        data={recipes}
        renderItem={renderRecipe}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text>No recipes in this collection yet.</Text>
          </View>
        )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    marginRight: 8,
    marginBottom: 4,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
}); 