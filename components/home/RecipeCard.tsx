import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Pressable,
  ImageSourcePropType,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../../constants/Theme';
import { Text } from '../ui/Text';
import { router } from 'expo-router';

export interface RecipeCardProps {
  id: string;
  title: string;
  image: ImageSourcePropType;
  creator: {
    id: string;
    name: string;
    avatar: ImageSourcePropType;
  };
  cookingTime: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  variant?: 'horizontal' | 'vertical';
}

export function RecipeCard({
  id,
  title,
  image,
  creator,
  cookingTime,
  difficulty,
  isSaved = false,
  onToggleSave,
  variant = 'vertical',
}: RecipeCardProps) {
  const handlePress = () => {
    router.push(`/recipe/${id}`);
  };

  const handleCreatorPress = () => {
    router.push(`/creator/${creator.id}`);
  };

  const handleSavePress = () => {
    onToggleSave?.(id);
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy':
        return Theme.colors.difficulty.easy;
      case 'medium':
        return Theme.colors.difficulty.medium;
      case 'hard':
        return Theme.colors.difficulty.hard;
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        variant === 'horizontal' && styles.containerHorizontal,
        pressed && styles.containerPressed,
      ]}
    >
      <View style={[
        styles.imageContainer,
        variant === 'horizontal' && styles.imageContainerHorizontal,
      ]}>
        <Image
          source={image}
          style={styles.image}
          resizeMode="cover"
        />
        <Pressable
          onPress={handleSavePress}
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.saveButtonPressed,
          ]}
        >
          <MaterialCommunityIcons
            name={isSaved ? 'heart' : 'heart-outline'}
            size={24}
            color={isSaved ? Theme.colors.status.error : Theme.colors.background.default}
          />
        </Pressable>
      </View>
      <View style={styles.content}>
        <Text
          variant="heading3"
          numberOfLines={2}
          style={styles.title}
        >
          {title}
        </Text>
        <Pressable
          onPress={handleCreatorPress}
          style={styles.creator}
        >
          <Image
            source={creator.avatar}
            style={styles.creatorAvatar}
          />
          <Text
            variant="caption"
            color={Theme.colors.text.secondary}
          >
            {creator.name}
          </Text>
        </Pressable>
        <View style={styles.metadata}>
          <View style={styles.metadataItem}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={16}
              color={Theme.colors.text.secondary}
            />
            <Text
              variant="caption"
              color={Theme.colors.text.secondary}
            >
              {cookingTime} min
            </Text>
          </View>
          <View style={styles.metadataItem}>
            <MaterialCommunityIcons
              name="chef-hat"
              size={16}
              color={getDifficultyColor()}
            />
            <Text
              variant="caption"
              color={getDifficultyColor()}
              style={styles.difficultyText}
            >
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    borderRadius: Theme.layout.borderRadius.lg,
    backgroundColor: Theme.colors.background.default,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  containerHorizontal: {
    width: '100%',
    flexDirection: 'row',
    height: 120,
  },
  containerPressed: {
    opacity: 0.9,
  },
  imageContainer: {
    height: 180,
    borderTopLeftRadius: Theme.layout.borderRadius.lg,
    borderTopRightRadius: Theme.layout.borderRadius.lg,
    overflow: 'hidden',
  },
  imageContainerHorizontal: {
    width: 120,
    height: '100%',
    borderTopRightRadius: 0,
    borderBottomLeftRadius: Theme.layout.borderRadius.lg,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  saveButton: {
    position: 'absolute',
    top: Theme.layout.spacing.sm,
    right: Theme.layout.spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: Theme.layout.spacing.xs,
    borderRadius: Theme.layout.borderRadius.round,
  },
  saveButtonPressed: {
    opacity: 0.8,
  },
  content: {
    padding: Theme.layout.spacing.md,
    flex: 1,
  },
  title: {
    marginBottom: Theme.layout.spacing.xs,
  },
  creator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.layout.spacing.sm,
  },
  creatorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: Theme.layout.spacing.xs,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.layout.spacing.md,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.layout.spacing.xs,
  },
  difficultyText: {
    textTransform: 'capitalize',
  },
}); 