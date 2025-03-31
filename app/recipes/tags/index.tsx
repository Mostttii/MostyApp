import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Text';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Chip } from '../../../components/ui/Chip';
import { useTheme } from '../../../context/ThemeContext';
import { RecipeService } from '../../../services/RecipeService';
import { Tag } from '../../../types/Recipe';
import { Toast } from '../../../components/ui/Toast';

const SUGGESTED_TAGS = {
  'Meal Type': [
    'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Appetizer'
  ],
  'Dietary': [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Low-Carb', 'Paleo'
  ],
  'Cooking Time': [
    'Quick', 'Under 30 mins', 'Under 1 hour', 'Meal Prep'
  ],
  'Difficulty': [
    'Easy', 'Intermediate', 'Advanced'
  ],
  'Cooking Method': [
    'Grilled', 'Baked', 'Fried', 'Slow Cooked', 'One-Pot', 'No-Cook'
  ],
  'Cuisine': [
    'Italian', 'Mexican', 'Asian', 'Mediterranean', 'American', 'Indian', 'French', 'Middle Eastern'
  ]
};

export default function TagManagerScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [userTags, setUserTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    loadUserTags();
  }, []);

  const loadUserTags = async () => {
    try {
      setLoading(true);
      const tags = await RecipeService.getUserTags();
      setUserTags(tags);
    } catch (error) {
      showErrorToast('Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      setLoading(true);
      await RecipeService.createTag({
        name: newTagName.trim(),
      });
      setNewTagName('');
      await loadUserTags();
      showSuccessToast('Tag created successfully');
    } catch (error) {
      showErrorToast('Failed to create tag');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      setLoading(true);
      await RecipeService.deleteTag(tagId);
      await loadUserTags();
      showSuccessToast('Tag deleted successfully');
    } catch (error) {
      showErrorToast('Failed to delete tag');
    } finally {
      setLoading(false);
    }
  };

  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setToastType('success');
    setShowToast(true);
  };

  const showErrorToast = (message: string) => {
    setToastMessage(message);
    setToastType('error');
    setShowToast(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.default }]}>
      <ScrollView style={styles.content}>
        {/* Custom Tag Creation */}
        <View style={styles.section}>
          <Text variant="h2" style={styles.sectionTitle}>Create Custom Tag</Text>
          <View style={styles.createTagContainer}>
            <Input
              placeholder="Enter new tag name"
              value={newTagName}
              onChangeText={setNewTagName}
              style={styles.tagInput}
            />
            <Button
              variant="primary"
              onPress={handleCreateTag}
              disabled={loading || !newTagName.trim()}
            >
              Create
            </Button>
          </View>
        </View>

        {/* User's Custom Tags */}
        <View style={styles.section}>
          <Text variant="h2" style={styles.sectionTitle}>Your Tags</Text>
          <View style={styles.tagsContainer}>
            {userTags.map(tag => (
              <Chip
                key={tag.id}
                label={tag.name}
                onDelete={() => handleDeleteTag(tag.id)}
                leftIcon={<MaterialCommunityIcons name="tag" size={16} color={theme.colors.text.primary} />}
              />
            ))}
          </View>
        </View>

        {/* Suggested Tags by Category */}
        <View style={styles.section}>
          <Text variant="h2" style={styles.sectionTitle}>Suggested Tags</Text>
          {Object.entries(SUGGESTED_TAGS).map(([category, tags]) => (
            <View key={category} style={styles.categoryContainer}>
              <Text variant="h3" style={styles.categoryTitle}>{category}</Text>
              <View style={styles.tagsContainer}>
                {tags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    onPress={() => {
                      setNewTagName(tag);
                    }}
                    leftIcon={<MaterialCommunityIcons name="tag-outline" size={16} color={theme.colors.text.primary} />}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

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
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  createTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagInput: {
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryTitle: {
    marginBottom: 8,
  },
}); 