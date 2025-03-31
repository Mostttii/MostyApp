import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { Recipe } from '../../types/Recipe';
import { RecipeService } from '../../services/RecipeService';
import { useAuth } from '../../context/AuthContext';
import { formatIngredientAmount } from '../../utils/numberFormat';

export default function RecipePreviewScreen() {
  const router = useRouter();
  const { recipe: recipeParam } = useLocalSearchParams();
  const recipe = JSON.parse(decodeURIComponent(recipeParam as string)) as Recipe;
  const { user } = useAuth();

  const handleSaveRecipe = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to save recipes');
      return;
    }

    try {
      await RecipeService.createRecipe(recipe);
      Alert.alert('Success', 'Recipe saved successfully!');
      router.push('/recipes' as any);
    } catch (error) {
      Alert.alert('Error', 'Failed to save recipe');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Preview Recipe',
          headerRight: () => (
            <TouchableOpacity onPress={handleSaveRecipe} style={styles.saveButton}>
              <FontAwesome name="check" size={24} color="#4ECDC4" />
            </TouchableOpacity>
          ),
        }}
      />

      {recipe.imageUrl && (
        <Image source={{ uri: recipe.imageUrl }} style={styles.image} />
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{recipe.title}</Text>
        
        {recipe.description && (
          <Text style={styles.description}>{recipe.description}</Text>
        )}

        <View style={styles.metaInfo}>
          {recipe.prepTime > 0 && (
            <View style={styles.metaItem}>
              <FontAwesome name="clock-o" size={16} color="#666" />
              <Text style={styles.metaText}>Prep: {recipe.prepTime}m</Text>
            </View>
          )}
          {recipe.cookTime > 0 && (
            <View style={styles.metaItem}>
              <FontAwesome name="fire" size={16} color="#666" />
              <Text style={styles.metaText}>Cook: {recipe.cookTime}m</Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <FontAwesome name="users" size={16} color="#666" />
            <Text style={styles.metaText}>Serves: {recipe.servings}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {recipe.ingredients.map((ingredient) => (
            <View key={ingredient.id} style={styles.ingredientItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.ingredientText}>
                {formatIngredientAmount(ingredient.amount)} {ingredient.unit} {ingredient.name}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {recipe.steps.map((step) => (
            <View key={step.id} style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>{step.order}.</Text>
              <Text style={styles.instructionText}>{step.description}</Text>
            </View>
          ))}
        </View>

        {recipe.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {recipe.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  saveButton: {
    padding: 8,
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    lineHeight: 24,
  },
  metaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  ingredientItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 16,
    color: '#4ECDC4',
    marginRight: 8,
  },
  ingredientText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  instructionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ECDC4',
    marginRight: 8,
    minWidth: 24,
  },
  instructionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: '#666',
  },
}); 