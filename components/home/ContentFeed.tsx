import React, { useState } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ContentReference } from '../../types/ContentReference';
import { useContentFeed } from '../../hooks/useContentFeed';
import { Theme } from '../../constants/Theme';
import { Text, Card, Badge, Avatar, Button } from '../ui';
import { useTheme, useThemeMode } from '../../context/ThemeContext';

const FILTER_OPTIONS = {
  cuisineTypes: ['All', 'Italian', 'Asian', 'Mexican', 'American', 'Mediterranean'],
  mealTypes: ['All', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks'],
  difficulty: ['All', 'Beginner', 'Intermediate', 'Advanced'],
};

export function ContentFeed() {
  const theme = useTheme();
  const { isDarkMode } = useThemeMode();
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
  const [selectedFilters, setSelectedFilters] = useState({
    cuisineType: 'All',
    mealType: 'All',
    difficulty: 'All',
  });
  const [refreshing, setRefreshing] = useState(false);

  const {
    content,
    loading,
    error,
    hasMore,
    loadMore,
    refreshContent,
    saveRecipe
  } = useContentFeed(selectedFilters);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshContent();
    setRefreshing(false);
  };

  const renderFilterSection = (
    title: string,
    options: string[],
    currentValue: string,
    onSelect: (value: string) => void
  ) => (
    <View style={styles.filterSection}>
      <Text variant="h3" style={styles.filterTitle}>{title}</Text>
      <FlatList
        horizontal
        data={options}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <Button
            variant={currentValue === item ? 'primary' : 'outline'}
            size="sm"
            onPress={() => onSelect(item)}
            style={styles.filterChip}
          >
            {item}
          </Button>
        )}
        keyExtractor={item => item}
      />
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.primary.default} />
      </View>
    );
  };

  const renderRecipeCard = ({ item }: { item: ContentReference }) => {
    const duration = item.metadata.duration 
      ? `${Math.floor(item.metadata.duration / 60)} min`
      : 'N/A';
    
    return (
      <Card style={styles.recipeCard} onPress={() => {}}>
        <Card.Image source={item.thumbnail ? { uri: item.thumbnail } : { uri: '' }} />
        <Card.Content>
          <Card.Title
            title={item.title}
            subtitle={`${duration} • ${item.type}`}
            left={
              <Avatar
                size="sm"
                source={undefined}
              />
            }
            right={
              <MaterialCommunityIcons
                name={item.metadata.isSaved ? "bookmark" : "bookmark-outline"}
                size={24}
                color={colors.text.primary}
                onPress={() => saveRecipe(item.id)}
              />
            }
          />
          <View style={styles.badgeContainer}>
            <Badge
              label={item.type}
              variant="default"
            />
            <Badge
              label={item.metadata.platform}
              icon={
                <MaterialCommunityIcons
                  name={getPlatformIcon(item.metadata.platform) as any}
                  size={12}
                  color={colors.text.primary}
                />
              }
            />
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading && content.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.default} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="body1" style={styles.errorText}>
          {error.message}
        </Text>
        <Button
          variant="primary"
          size="sm"
          onPress={refreshContent}
          style={styles.retryButton}
        >
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.default }]}>
      <View style={styles.filterControls}>
        {renderFilterSection(
          'Cuisine Type',
          FILTER_OPTIONS.cuisineTypes,
          selectedFilters.cuisineType,
          (value) => setSelectedFilters(prev => ({ ...prev, cuisineType: value }))
        )}
        {renderFilterSection(
          'Meal Type',
          FILTER_OPTIONS.mealTypes,
          selectedFilters.mealType,
          (value) => setSelectedFilters(prev => ({ ...prev, mealType: value }))
        )}
        {renderFilterSection(
          'Difficulty',
          FILTER_OPTIONS.difficulty,
          selectedFilters.difficulty,
          (value) => setSelectedFilters(prev => ({ ...prev, difficulty: value }))
        )}
      </View>

      <FlatList
        data={content}
        renderItem={renderRecipeCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.contentContainer}
        numColumns={2}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary.default]}
          />
        }
      />
    </View>
  );
}

function getPlatformIcon(platform: 'youtube' | 'instagram' | 'tiktok' | 'website'): string {
  switch (platform.toLowerCase()) {
    case 'youtube':
      return 'youtube';
    case 'instagram':
      return 'instagram';
    case 'tiktok':
      return 'music-note';
    default:
      return 'web';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.layout.spacing.lg,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: Theme.layout.spacing.md,
  },
  retryButton: {
    minWidth: 120,
  },
  filterControls: {
    paddingHorizontal: Theme.layout.spacing.md,
    paddingVertical: Theme.layout.spacing.sm,
  },
  filterSection: {
    marginBottom: Theme.layout.spacing.md,
  },
  filterTitle: {
    marginBottom: Theme.layout.spacing.sm,
  },
  filterChip: {
    marginRight: Theme.layout.spacing.sm,
  },
  contentContainer: {
    padding: Theme.layout.spacing.sm,
  },
  recipeCard: {
    flex: 1,
    margin: Theme.layout.spacing.sm,
    maxWidth: '47%',
    aspectRatio: 3/4,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: Theme.layout.spacing.xs,
    marginTop: Theme.layout.spacing.sm,
  },
  footer: {
    paddingVertical: Theme.layout.spacing.md,
    alignItems: 'center',
  },
}); 