import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Text } from './Text';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = 'alert-circle-outline',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background.default },
      ]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={48}
        color={theme.colors.text.secondary}
        style={styles.icon}
      />
      <Text
        variant="heading3"
        style={[
          styles.title,
          { color: theme.colors.text.primary },
        ]}
      >
        {title}
      </Text>
      {description && (
        <Text
          variant="body"
          style={[
            styles.description,
            { color: theme.colors.text.secondary },
          ]}
        >
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button
          variant="primary"
          onPress={onAction}
          style={styles.action}
        >
          {actionLabel}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
  },
  action: {
    minWidth: 200,
  },
}); 