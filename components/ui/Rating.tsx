import React from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Text } from './Text';

export interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  maxValue?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  variant?: 'star' | 'difficulty';
}

export function Rating({
  value,
  onChange,
  maxValue = 5,
  size = 'md',
  showLabel = true,
  label,
  containerStyle,
  disabled = false,
  variant = 'star',
}: RatingProps) {
  const theme = useTheme();

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 16;
      case 'lg':
        return 32;
      default:
        return 24;
    }
  };

  const getIconName = (index: number): keyof typeof MaterialCommunityIcons.glyphMap => {
    const filled = index < value;
    
    if (variant === 'difficulty') {
      return filled ? 'fire' : 'fire';
    }
    
    return filled ? 'star' : 'star-outline';
  };

  const getIconColor = (index: number) => {
    const filled = index < value;
    
    if (variant === 'difficulty') {
      if (!filled) return theme.colors.text.secondary;
      
      // Color gradient for difficulty levels
      const colors = [
        theme.colors.difficulty.easy,
        theme.colors.difficulty.medium,
        theme.colors.difficulty.hard,
      ];
      
      const level = Math.floor((value - 1) / (maxValue / 3));
      return colors[Math.min(level, colors.length - 1)];
    }
    
    return filled
      ? theme.colors.primary.default
      : theme.colors.text.secondary;
  };

  const handlePress = (newValue: number) => {
    if (!disabled && onChange) {
      onChange(newValue);
    }
  };

  const renderIcon = (index: number) => (
    <Pressable
      key={index}
      onPress={() => handlePress(index + 1)}
      disabled={disabled || !onChange}
      style={({ pressed }) => [
        styles.icon,
        { padding: theme.layout.spacing.xs },
        pressed && !disabled && { opacity: 0.8 },
      ]}
    >
      <MaterialCommunityIcons
        name={getIconName(index)}
        size={getIconSize()}
        color={getIconColor(index)}
        style={[
          styles.iconImage,
          !getIconColor(index) && styles.iconEmpty
        ]}
      />
    </Pressable>
  );

  const getLabelText = () => {
    if (label) return label;
    
    if (variant === 'difficulty') {
      if (value <= maxValue / 3) return 'Easy';
      if (value <= (maxValue / 3) * 2) return 'Medium';
      return 'Hard';
    }
    
    return `${value} of ${maxValue}`;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.icons}>
        {Array.from({ length: maxValue }, (_, index) => renderIcon(index))}
      </View>
      {showLabel && (
        <Text
          variant="caption"
          color={theme.colors.text.secondary}
          style={[
            styles.label,
            { marginTop: theme.layout.spacing.xs }
          ]}
        >
          {getLabelText()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {},
  iconImage: {
    opacity: 1,
  },
  iconEmpty: {
    opacity: 0.5,
  },
  label: {},
}); 