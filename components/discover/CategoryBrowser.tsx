import React from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { Text, Card } from '../ui';

type IconName = 'pasta' | 'noodles' | 'food' | 'coffee' | 'food-variant' | 'food-turkey' | 'cake-variant' | 'cookie' | 'clock-fast' | 'clock' | 'clock-outline';

const CATEGORIES = {
  cuisineTypes: [
    { id: 'italian', name: 'Italian', icon: 'pasta' as IconName },
    { id: 'asian', name: 'Asian', icon: 'noodles' as IconName },
    { id: 'mexican', name: 'Mexican', icon: 'food' as IconName },
    { id: 'american', name: 'American', icon: 'food' as IconName },
    { id: 'mediterranean', name: 'Mediterranean', icon: 'food' as IconName },
  ],
  mealTypes: [
    { id: 'breakfast', name: 'Breakfast', icon: 'coffee' as IconName },
    { id: 'lunch', name: 'Lunch', icon: 'food-variant' as IconName },
    { id: 'dinner', name: 'Dinner', icon: 'food-turkey' as IconName },
    { id: 'dessert', name: 'Dessert', icon: 'cake-variant' as IconName },
    { id: 'snacks', name: 'Snacks', icon: 'cookie' as IconName },
  ],
  cookingTime: [
    { id: 'quick', name: 'Quick & Easy', icon: 'clock-fast' as IconName },
    { id: 'medium', name: 'Medium', icon: 'clock' as IconName },
    { id: 'long', name: 'Long', icon: 'clock-outline' as IconName },
  ],
};

export function CategoryBrowser() {
  const router = useRouter();
  const theme = useTheme();

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/(tabs)/category/${categoryId}` as any);
  };

  const renderCategorySection = (title: string, categories: { id: string; name: string; icon: IconName }[]) => (
    <View style={styles.section}>
      <Text variant="heading3" style={styles.sectionTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
        {categories.map((category) => (
          <Pressable
            key={category.id}
            style={[styles.categoryCard, { backgroundColor: theme.colors.background.default }]}
            onPress={() => handleCategoryPress(category.id)}
          >
            <MaterialCommunityIcons name={category.icon} size={32} color={theme.colors.primary.default} />
            <Text variant="body" style={styles.categoryName}>{category.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.default }]}>
      {renderCategorySection('Cuisine Types', CATEGORIES.cuisineTypes)}
      {renderCategorySection('Meal Types', CATEGORIES.mealTypes)}
      {renderCategorySection('Cooking Time', CATEGORIES.cookingTime)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  categoryList: {
    flexGrow: 0,
  },
  categoryCard: {
    padding: 16,
    marginRight: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryName: {
    marginTop: 8,
    textAlign: 'center',
  },
}); 