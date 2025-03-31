import React from 'react';
import { StyleSheet, View, Pressable, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Text } from './Text';

export interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  error?: string;
  style?: ViewStyle;
}

export function Toggle({
  value,
  onChange,
  label,
  disabled,
  error,
  style,
}: ToggleProps) {
  const theme = useTheme();

  const handlePress = () => {
    if (!disabled) {
      onChange(!value);
    }
  };

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.background.sage;
    if (value) return theme.colors.primary.default;
    return theme.colors.background.default;
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelContainer}>
        {label && (
          <Text
            variant="body"
            style={[
              styles.label,
              { color: theme.colors.text.secondary },
            ]}
          >
            {label}
          </Text>
        )}
        {error && (
          <Text
            variant="caption"
            style={[
              styles.error,
              { color: theme.colors.status.error },
            ]}
          >
            {error}
          </Text>
        )}
      </View>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.toggle,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: value ? 'transparent' : theme.colors.border.default,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <View
          style={[
            styles.knob,
            {
              backgroundColor: value ? theme.colors.background.default : theme.colors.background.sage,
              transform: [{ translateX: value ? 20 : 0 }],
            },
          ]}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelContainer: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    marginBottom: 4,
  },
  error: {
    marginTop: 4,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    padding: 2,
  },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
}); 