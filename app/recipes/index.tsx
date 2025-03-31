import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from '../../components/ui/Text';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { useCollections } from '../../hooks/useCollections';
import { useSavedRecipes } from '../../hooks/useSavedRecipes';
import { Toast } from '../../components/ui/Toast';
import { useTheme } from '../../context/ThemeContext';
import { SavedRecipe } from '../../types/SavedRecipe';
import { SUGGESTED_TAGS } from './tags';
import { Image } from 'react-native';

interface FilterState {
  search: string;
  collections: string[];
  tags: string[];
  creator?: string;
}

export default function RecipeListScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    collections: [],
    tags: [],
    creator: undefined,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const { collections, loading: collectionsLoading } = useCollections();
  const { recipes, loading: recipesLoading, error } = useSavedRecipes();

  // Filter recipes based on current filters
  const filteredRecipes = recipes.filter(recipe => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        recipe.recipeId.toLowerCase().includes(searchLower) ||
        recipe.notes?.toLowerCase().includes(searchLower) ||
        recipe.collections.some(id => collections.find(c => c.id === id)?.name.toLowerCase().includes(searchLower)) ||
        recipe.customizations?.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
        recipe.customizations?.notes?.some(note => note.toLowerCase().includes(searchLower)) ||
        recipe.customizations?.ingredients?.some(ing => 
          ing.substitution?.toLowerCase().includes(searchLower)
        );
      
      if (!matchesSearch) return false;
    }

    // Collection filter
    if (filters.collections.length > 0) {
      if (!filters.collections.some(id => recipe.collections.includes(id))) {
        return false;
      }
    }

    // Tag filter
    if (filters.tags.length > 0) {
      if (!recipe.customizations?.tags?.some(tag => filters.tags.includes(tag))) {
        return false;
      }
    }

    // Creator filter
    if (filters.creator) {
      if (recipe.userId !== filters.creator) {
        return false;
      }
    }

    return true;
  });

  // Sort recipes by most recently updated
  const sortedRecipes = [...filteredRecipes].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const handleSearch = (text: string) => {
    setFilters(prev => ({ ...prev, search: text }));
  };

  const toggleCollectionFilter = (collectionId: string) => {
    setFilters(prev => ({
      ...prev,
      collections: prev.collections.includes(collectionId)
        ? prev.collections.filter(id => id !== collectionId)
        : [...prev.collections, collectionId],
    }));
  };

  const toggleTagFilter = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      collections: [],
      tags: [],
      creator: undefined,
    });
  };

  const renderRecipeCard = ({ item }: { item: SavedRecipe }) => (
    <Card
      style={styles.recipeCard}
      onPress={() => router.push(`/recipe/${item.recipeId}`)}
    >
      {item.thumbnailUrl && (
        <Image source={{ uri: item.thumbnailUrl }} style={styles.cardCover} />
      )}
      <View style={styles.cardContent}>
        <Text variant="h3">{item.recipeId}</Text>
        {item.notes && (
          <Text variant="body2" numberOfLines={2} style={styles.description}>
            {item.notes}
          </Text>
        )}
        <View style={styles.metaInfo}>
          {item.cookHistory && (
            <Chip
              leftIcon={<MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.light.text.primary} />}
              label={`Cooked ${item.cookHistory.timesCooked} times`}
              size="sm"
            />
          )}
          {item.customizations?.servings && (
            <Chip
              leftIcon={<MaterialCommunityIcons name="account-group" size={16} color={theme.colors.light.text.primary} />}
              label={`${item.customizations.servings} servings`}
              size="sm"
            />
          )}
        </View>
        {item.customizations?.tags && item.customizations.tags.length > 0 && (
          <View style={styles.tags}>
            {item.customizations.tags.map((tag: string) => (
              <Chip
                key={tag}
                label={tag}
                size="sm"
                onPress={() => toggleTagFilter(tag)}
                selected={filters.tags.includes(tag)}
              />
            ))}
          </View>
        )}
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.light.background.default }]}>
      <View style={styles.header}>
        <Input
          placeholder="Search recipes..."
          value={filters.search}
          onChangeText={handleSearch}
          rightIcon={
            <IconButton
              icon={<MaterialCommunityIcons name="magnify" size={24} color={theme.colors.light.text.primary} />}
              onPress={() => {}}
            />
          }
          style={styles.searchInput}
        />
        <IconButton
          icon={
            <MaterialCommunityIcons
              name={showFilters ? 'filter-off' : 'filter'}
              size={24}
              color={theme.colors.light.text.primary}
            />
          }
          onPress={() => setShowFilters(!showFilters)}
        />
      </View>

      {showFilters && (
        <ScrollView horizontal style={styles.filtersContainer}>
          <View style={styles.filterSection}>
            <Text variant="h3" style={styles.filterTitle}>Collections</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                {collections.map(collection => (
                  <Chip
                    key={collection.id}
                    label={collection.name}
                    selected={filters.collections.includes(collection.id)}
                    onPress={() => toggleCollectionFilter(collection.id)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text variant="h3" style={styles.filterTitle}>Popular Tags</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                {Object.values(SUGGESTED_TAGS).flat().map((tag: string) => (
                  <Chip
                    key={tag}
                    label={tag}
                    selected={filters.tags.includes(tag)}
                    onPress={() => toggleTagFilter(tag)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          {filters.collections.length > 0 || filters.tags.length > 0 ? (
            <Button
              variant="outline"
              onPress={clearFilters}
              style={styles.clearButton}
            >
              Clear Filters
            </Button>
          ) : null}
        </ScrollView>
      )}

      <FlatList
        data={sortedRecipes}
        renderItem={renderRecipeCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text variant="h2" style={styles.emptyTitle}>
              No recipes found
            </Text>
            <Text variant="body1" style={styles.emptyDescription}>
              {filters.search || filters.collections.length > 0 || filters.tags.length > 0
                ? "Try adjusting your filters or search terms"
                : "Start by saving some recipes to your collection"}
            </Text>
            <Button
              variant="primary"
              onPress={() => router.push("../discover")}
              style={styles.discoverButton}
            >
              Discover Recipes
            </Button>
          </View>
        }
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  filtersContainer: {
    maxHeight: 180,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  filterSection: {
    padding: 16,
    paddingTop: 0,
  },
  filterTitle: {
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  clearButton: {
    alignSelf: 'center',
    marginVertical: 8,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  recipeCard: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardCover: {
    height: 200,
    width: '100%',
  },
  cardContent: {
    padding: 16,
  },
  description: {
    marginTop: 4,
    opacity: 0.7,
  },
  metaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDescription: {
    textAlign: 'center',
    opacity: 0.7,
  },
  discoverButton: {
    marginTop: 16,
  },
});