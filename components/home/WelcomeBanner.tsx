import React from 'react';
import {
  StyleSheet,
  View,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../constants/Theme';
import { Text } from '../ui/Text';
import { router } from 'expo-router';

export interface WelcomeBannerProps {
  onDismiss?: () => void;
}

export function WelcomeBanner({ onDismiss }: WelcomeBannerProps) {
  const handleExplorePress = () => {
    router.push('/(tabs)/discover');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Theme.colors.primary.gradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text
            variant="heading2"
            color={Theme.colors.background.default}
            style={styles.title}
          >
            Welcome to Recipe Hubtopia!
          </Text>
          <Text
            variant="body"
            color={Theme.colors.background.default}
            style={styles.subtitle}
          >
            Discover, save, and organize your favorite recipes from top creators.
          </Text>
          <View style={styles.actions}>
            <Pressable
              onPress={handleExplorePress}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text
                variant="button"
                color={Theme.colors.primary.default}
              >
                Start Exploring
              </Text>
            </Pressable>
            {onDismiss && (
              <Pressable
                onPress={onDismiss}
                style={({ pressed }) => [
                  styles.dismissButton,
                  pressed && styles.dismissButtonPressed,
                ]}
              >
                <Text
                  variant="button"
                  color={Theme.colors.background.default}
                >
                  Maybe Later
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Theme.layout.spacing.lg,
    marginVertical: Theme.layout.spacing.md,
    borderRadius: Theme.layout.borderRadius.lg,
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
  },
  content: {
    padding: Theme.layout.spacing.lg,
  },
  title: {
    marginBottom: Theme.layout.spacing.xs,
  },
  subtitle: {
    marginBottom: Theme.layout.spacing.lg,
    opacity: 0.9,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.layout.spacing.md,
  },
  button: {
    backgroundColor: Theme.colors.background.default,
    paddingVertical: Theme.layout.spacing.sm,
    paddingHorizontal: Theme.layout.spacing.lg,
    borderRadius: Theme.layout.borderRadius.md,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  dismissButton: {
    paddingVertical: Theme.layout.spacing.sm,
    paddingHorizontal: Theme.layout.spacing.md,
  },
  dismissButtonPressed: {
    opacity: 0.8,
  },
}); 