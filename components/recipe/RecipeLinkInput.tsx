import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Clipboard,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { RecipeParser } from '../../services/RecipeParser';
import { ParseResult } from '../../types/Recipe';
import { auth } from '../../config/firebase';
import { useRouter } from 'expo-router';

interface Props {
  onRecipeParsed: (result: ParseResult) => void;
}

export default function RecipeLinkInput({ onRecipeParsed }: Props) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handlePaste = async () => {
    try {
      const clipboardContent = await Clipboard.getString();
      setUrl(clipboardContent);
      setError(null);
    } catch (error) {
      setError('Failed to paste from clipboard');
      Alert.alert('Error', 'Failed to paste from clipboard');
    }
  };

  const handleSubmit = async () => {
    if (!url.trim()) {
      setError('Please enter a recipe URL');
      Alert.alert('Error', 'Please enter a recipe URL');
      return;
    }

    if (!auth.currentUser) {
      setError('Please sign in to save recipes');
      Alert.alert('Error', 'Please sign in to save recipes');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await RecipeParser.parseUrl(url.trim());
      
      if (!result.success) {
        setError(result.error?.message || 'Failed to parse recipe');
        Alert.alert('Error', result.error?.message || 'Failed to parse recipe');
        return;
      }

      if (!result.recipe) {
        setError('No recipe data found');
        Alert.alert('Error', 'No recipe data found');
        return;
      }

      // Add user ID to the recipe
      result.recipe.createdBy = auth.currentUser.uid;
      
      onRecipeParsed(result);
      setUrl(''); // Clear the input on success

      // Navigate to preview screen with parsed recipe
      const recipeParam = encodeURIComponent(JSON.stringify(result.recipe));
      router.push(`/recipe/preview?recipe=${recipeParam}`);
    } catch (error) {
      console.error('Error parsing recipe:', error);
      let errorMessage = 'An unexpected error occurred';
      
      if (error instanceof Error) {
        if (error.message.includes('auth/')) {
          errorMessage = 'Please sign in to save recipes';
        } else if (error.message.includes('permission-denied')) {
          errorMessage = 'You do not have permission to save recipes';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            error ? styles.inputError : null
          ]}
          value={url}
          onChangeText={(text) => {
            setUrl(text);
            setError(null);
          }}
          placeholder="Paste a recipe link..."
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          onSubmitEditing={handleSubmit}
        />
        <TouchableOpacity onPress={handlePaste} style={styles.pasteButton}>
          <FontAwesome name="clipboard" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <TouchableOpacity 
        style={[
          styles.submitButton,
          (!url.trim() || isLoading) && styles.submitButtonDisabled
        ]}
        onPress={handleSubmit}
        disabled={!url.trim() || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <FontAwesome name="magic" size={20} color="#fff" style={styles.submitIcon} />
            <Text style={styles.submitText}>Parse Recipe</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.supportedText}>
        Supported: AllRecipes, Food Network, Epicurious, Simply Recipes, Tasty
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#ff6b6b',
    backgroundColor: '#fff0f0',
  },
  pasteButton: {
    width: 44,
    height: 44,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    height: 44,
    backgroundColor: '#4ECDC4',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitIcon: {
    marginRight: 8,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  supportedText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginTop: 4,
  },
}); 