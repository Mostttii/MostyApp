import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Text, Button } from '../ui';

export interface NewUserOnboardingProps {
  onComplete: () => void;
}

export function NewUserOnboarding({ onComplete }: NewUserOnboardingProps) {
  const theme = useTheme();

  const features = [
    {
      icon: 'food' as const,
      title: 'Expert Recipes',
      description: 'Access recipes from professional chefs and experienced home cooks.',
    },
    {
      icon: 'play-circle' as const,
      title: 'Video Tutorials',
      description: 'Learn cooking techniques with step-by-step video guides.',
    },
    {
      icon: 'account-group' as const,
      title: 'Community',
      description: 'Connect with other food enthusiasts and share your culinary journey.',
    },
    {
      icon: 'bookmark-multiple' as const,
      title: 'Save & Organize',
      description: 'Create collections of your favorite recipes for easy access.',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.default }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="heading1" style={styles.title}>
          Welcome to Recipe Hubtopia
        </Text>
        <Text variant="body" color={theme.colors.text.secondary} style={styles.subtitle}>
          Your personal cooking companion
        </Text>

        <View style={styles.features}>
          {features.map((feature, index) => (
            <View key={index} style={styles.feature}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.background.cream }]}>
                <MaterialCommunityIcons
                  name={feature.icon}
                  size={32}
                  color={theme.colors.primary.default}
                />
              </View>
              <View style={styles.featureText}>
                <Text variant="heading3">{feature.title}</Text>
                <Text variant="body" color={theme.colors.text.secondary} style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Button variant="primary" onPress={onComplete} style={styles.button}>
          Get Started
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 48,
  },
  features: {
    width: '100%',
    marginBottom: 48,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureDescription: {
    marginTop: 4,
  },
  button: {
    width: '100%',
  },
}); 