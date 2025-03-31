import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme, useThemeMode } from '../../context/ThemeContext';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { useCollections } from '../../hooks/useCollections';
import { useSavedRecipes } from '../../hooks/useSavedRecipes';
import { Toast } from '../../components/ui/Toast';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Recipe } from '../../types/Recipe';
import { RecipeService } from '../../services/RecipeService';
import { formatIngredientAmount } from '../../utils/numberFormat';

export default function RecipeDetailsScreen() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const { isDarkMode } = useThemeMode();
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
  const router = useRouter();
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set());
  
  const { collections } = useCollections();
  const { recipes: savedRecipes, saveRecipe, addToCollection } = useSavedRecipes();

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        setLoading(true);
        const recipeData = await RecipeService.getRecipe(id as string);
        setRecipe(recipeData);
        setError(undefined);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load recipe');
        setToastMessage('Failed to load recipe');
        setToastType('error');
        setShowToast(true);
      } finally {
        setLoading(false);
      }
    };

    loadRecipe();
  }, [id]);

  const handleSave = async () => {
    if (!recipe) return;

    try {
      setLoading(true);
      const savedRecipeId = await saveRecipe(recipe.id);
      
      if (selectedCollections.size > 0) {
        await Promise.all(
          Array.from(selectedCollections).map(collectionId =>
            addToCollection(savedRecipeId, collectionId)
          )
        );
      }

      setToastMessage('Recipe saved successfully!');
      setToastType('success');
      setShowToast(true);
      setShowCollectionDialog(false);
    } catch (err) {
      setToastMessage('Failed to save recipe');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    // TODO: Implement sharing functionality
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.default }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.default }]}>
        <Text>Failed to load recipe</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.default }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {recipe.imageUrl && (
          <Image
            source={{ uri: recipe.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text variant="h1" style={styles.title}>
              {recipe.title}
            </Text>
            <View style={styles.headerActions}>
              <IconButton
                icon={<MaterialCommunityIcons name="share-variant" size={24} color={colors.text.primary} />}
                onPress={handleShare}
              />
              <IconButton
                icon={<MaterialCommunityIcons name="bookmark-outline" size={24} color={colors.text.primary} />}
                onPress={() => setShowCollectionDialog(true)}
              />
            </View>
          </View>

          {recipe.description && (
            <Text variant="body1" style={styles.description}>
              {recipe.description}
            </Text>
          )}

          <View style={styles.metaInfo}>
            <Chip
              leftIcon={<MaterialCommunityIcons name="clock-outline" size={18} color={colors.text.primary} />}
              label={`${recipe.cookTime} mins`}
            />
            <Chip
              leftIcon={<MaterialCommunityIcons name="account-group" size={18} color={colors.text.primary} />}
              label={`${recipe.servings} servings`}
            />
            <Chip
              leftIcon={<MaterialCommunityIcons name="chef-hat" size={18} color={colors.text.primary} />}
              label={recipe.difficulty}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="h2">Ingredients</Text>
          {recipe.ingredients.map((ingredient, index) => (
            <View key={ingredient.id} style={styles.ingredient}>
              <Text variant="body1">
                {formatIngredientAmount(ingredient.amount)} {ingredient.unit} {ingredient.name}
              </Text>
              {ingredient.notes && (
                <Text variant="body2" style={styles.notes}>
                  {ingredient.notes}
                </Text>
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text variant="h2">Instructions</Text>
          {recipe.steps.map((step, index) => (
            <View key={step.id} style={styles.step}>
              <Text variant="h3" style={styles.stepNumber}>
                Step {index + 1}
              </Text>
              <Text variant="body1">{step.description}</Text>
              {step.tips && step.tips.length > 0 && (
                <View style={styles.tips}>
                  <Text variant="body2" style={styles.tipsTitle}>Tips:</Text>
                  {step.tips.map((tip, tipIndex) => (
                    <Text key={tipIndex} variant="body2" style={styles.tip}>
                      • {tip}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {recipe.tags.length > 0 && (
          <View style={styles.section}>
            <Text variant="h2">Tags</Text>
            <View style={styles.tags}>
              {recipe.tags.map(tag => (
                <Chip key={tag} label={tag} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {showCollectionDialog && (
        <View style={styles.dialog}>
          <View style={[styles.dialogContent, { backgroundColor: colors.background.card }]}>
            <Text variant="h2">Save to Collection</Text>
            <ScrollView style={styles.collectionList}>
              {collections.map(collection => (
                <Card
                  key={collection.id}
                  style={[
                    styles.collectionCard,
                    selectedCollections.has(collection.id) && {
                      backgroundColor: colors.primary.default,
                    },
                  ]}
                  onPress={() => {
                    setSelectedCollections(prev => {
                      const next = new Set(prev);
                      if (next.has(collection.id)) {
                        next.delete(collection.id);
                      } else {
                        next.add(collection.id);
                      }
                      return next;
                    });
                  }}
                >
                  <Text
                    variant="body1"
                    style={[
                      selectedCollections.has(collection.id) && {
                        color: '#FFFFFF',
                      },
                    ]}
                  >
                    {collection.name}
                  </Text>
                </Card>
              ))}
            </ScrollView>
            <View style={styles.dialogActions}>
              <Button
                variant="outline"
                style={styles.dialogButton}
                onPress={() => setShowCollectionDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                style={styles.dialogButton}
                onPress={handleSave}
                isLoading={loading}
              >
                Save
              </Button>
            </View>
          </View>
        </View>
      )}

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
  content: {
    paddingBottom: 24,
  },
  image: {
    width: '100%',
    height: 250,
  },
  header: {
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    marginRight: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  description: {
    marginTop: 8,
    opacity: 0.7,
  },
  metaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  ingredient: {
    marginTop: 12,
  },
  notes: {
    marginTop: 4,
    opacity: 0.7,
  },
  step: {
    marginTop: 16,
  },
  stepNumber: {
    marginBottom: 8,
  },
  tips: {
    marginTop: 8,
    paddingLeft: 16,
  },
  tipsTitle: {
    marginBottom: 4,
    fontWeight: '600',
  },
  tip: {
    marginTop: 2,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  dialog: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dialogContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 16,
  },
  collectionList: {
    marginTop: 16,
    marginBottom: 16,
  },
  collectionCard: {
    marginBottom: 8,
    padding: 12,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  dialogButton: {
    minWidth: 100,
  },
}); 