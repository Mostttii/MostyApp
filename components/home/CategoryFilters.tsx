import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
} from 'react-native';
import { Theme } from '../../constants/Theme';
import { Text } from '../ui/Text';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'appetizers', label: 'Appetizers' },
  { id: 'desserts', label: 'Desserts' },
  { id: 'drinks', label: 'Drinks' },
];

export interface CategoryFiltersProps {
  selectedCategory?: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryFilters({
  selectedCategory = 'all',
  onSelectCategory,
}: CategoryFiltersProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map(category => (
        <Pressable
          key={category.id}
          onPress={() => onSelectCategory(category.id)}
          style={({ pressed }) => [
            styles.pill,
            category.id === selectedCategory && styles.pillSelected,
            pressed && styles.pillPressed,
          ]}
        >
          <Text
            variant="button"
            color={
              category.id === selectedCategory
                ? Theme.colors.background.default
                : Theme.colors.text.secondary
            }
          >
            {category.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.layout.spacing.lg,
    paddingVertical: Theme.layout.spacing.md,
    gap: Theme.layout.spacing.sm,
  },
  pill: {
    paddingVertical: Theme.layout.spacing.xs,
    paddingHorizontal: Theme.layout.spacing.md,
    borderRadius: Theme.layout.borderRadius.round,
    backgroundColor: Theme.colors.background.cream,
  },
  pillSelected: {
    backgroundColor: Theme.colors.primary.default,
  },
  pillPressed: {
    opacity: 0.8,
  },
}); 