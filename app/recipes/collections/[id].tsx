import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme, useThemeMode } from '../../../context/ThemeContext';
import { Text } from '../../../components/ui/Text';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { IconButton } from '../../../components/ui/IconButton';
import { Card } from '../../../components/ui/Card';
import { useCollections } from '../../../hooks/useCollections';
import { useSavedRecipes } from '../../../hooks/useSavedRecipes';
import { Toast } from '../../../components/ui/Toast';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SavedRecipe } from '../../../types/SavedRecipe';
import { Collection } from '../../../types/Collection';
import { Recipe } from '../../../types/Recipe';
import { RecipeService } from '../../../services/RecipeService';

export default function CollectionDetailsScreen() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const { isDarkMode } = useThemeMode();
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [recipes, setRecipes] = useState<Record<string, Recipe>>({});
  
  const { collections, updateCollection, deleteCollection } = useCollections();
  const { recipes: savedRecipes, removeFromCollection } = useSavedRecipes(id as string);

  const currentCollection = collections.find(c => c.id === id);
  const collectionRecipes = savedRecipes;

  React.useEffect(() => {
    if (currentCollection) {
      setName(currentCollection.name);
      setDescription(currentCollection.description || '');
    }
  }, [currentCollection]);

  React.useEffect(() => {
    const loadRecipeDetails = async () => {
      const newRecipes: Record<string, Recipe> = {};
      
      for (const savedRecipe of savedRecipes) {
        try {
          const recipe = await RecipeService.getRecipe(savedRecipe.recipeId);
          newRecipes[savedRecipe.recipeId] = recipe;
        } catch (err) {
          console.error(`Error loading recipe ${savedRecipe.recipeId}:`, err);
        }
      }

      setRecipes(newRecipes);
    };

    if (savedRecipes.length > 0) {
      loadRecipeDetails();
    }
  }, [savedRecipes]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a collection name');
      return;
    }

    try {
      setLoading(true);
      setError(undefined);
      
      await updateCollection(id as string, {
        name: name.trim(),
        description: description.trim(),
      });

      setToastMessage('Collection updated successfully!');
      setToastType('success');
      setShowToast(true);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update collection');
      setToastMessage('Failed to update collection');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteCollection(id as string);
      router.back();
    } catch (err) {
      setToastMessage('Failed to delete collection');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRecipe = async (recipeId: string) => {
    try {
      await removeFromCollection(recipeId, id as string);
      setToastMessage('Recipe removed from collection');
      setToastType('success');
      setShowToast(true);
    } catch (err) {
      setToastMessage('Failed to remove recipe');
      setToastType('error');
      setShowToast(true);
    }
  };

  if (!currentCollection) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.default }]}>
        <Text>Collection not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.default }]}>
      <View style={styles.header}>
        {isEditing ? (
          <>
            <Input
              value={name}
              onChangeText={setName}
              error={error}
              maxLength={50}
              style={styles.input}
            />
            <Input
              value={description}
              onChangeText={setDescription}
              placeholder="Description (Optional)"
              multiline
              numberOfLines={3}
              maxLength={200}
              style={styles.input}
            />
            <View style={styles.actions}>
              <Button
                variant="outline"
                style={styles.button}
                onPress={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                style={styles.button}
                onPress={handleSave}
                isLoading={loading}
              >
                Save Changes
              </Button>
            </View>
          </>
        ) : (
          <>
            <View style={styles.titleContainer}>
              <Text variant="h1" style={styles.title}>
                {currentCollection.name}
              </Text>
              <View style={styles.headerActions}>
                <IconButton
                  icon={<MaterialCommunityIcons name="pencil" size={24} color={colors.text.primary} />}
                  onPress={() => setIsEditing(true)}
                />
                <IconButton
                  icon={<MaterialCommunityIcons name="delete" size={24} color={colors.status.error} />}
                  onPress={handleDelete}
                />
              </View>
            </View>
            {currentCollection.description && (
              <Text variant="body1" style={styles.description}>
                {currentCollection.description}
              </Text>
            )}
          </>
        )}
      </View>

      <FlatList
        data={collectionRecipes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No recipes in this collection yet
          </Text>
        }
        renderItem={({ item }: { item: SavedRecipe }) => {
          const recipe = recipes[item.recipeId];
          if (!recipe) return null;

          return (
            <Card
              style={styles.recipeCard}
              onPress={() => router.push(`/recipe/${item.recipeId}`)}
            >
              <View style={styles.recipeContent}>
                <View style={styles.recipeInfo}>
                  <Text variant="h3">{recipe.title}</Text>
                  {recipe.description && (
                    <Text variant="body2" numberOfLines={2}>
                      {recipe.description}
                    </Text>
                  )}
                </View>
                <IconButton
                  icon={<MaterialCommunityIcons name="close" size={24} color={colors.text.secondary} />}
                  onPress={() => handleRemoveRecipe(item.id)}
                />
              </View>
            </Card>
          );
        }}
      />

      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setShowToast(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  description: {
    marginTop: 8,
    opacity: 0.7,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  input: {
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    minWidth: 120,
  },
  recipeCard: {
    marginBottom: 16,
  },
  recipeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  recipeInfo: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
  },
}); 