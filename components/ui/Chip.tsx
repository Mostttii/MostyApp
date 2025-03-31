import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { useTheme, useThemeMode } from '../../context/ThemeContext';
import { Text } from './Text';

export type ChipVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
export type ChipSize = 'sm' | 'md' | 'lg';

interface ChipProps extends TouchableOpacityProps {
  variant?: ChipVariant;
  size?: ChipSize;
  label: string;
  selected?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRemove?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Chip({
  variant = 'default',
  size = 'md',
  label,
  selected = false,
  leftIcon,
  rightIcon,
  onRemove,
  style,
  textStyle,
  disabled,
  ...props
}: ChipProps) {
  const theme = useTheme();
  const { isDarkMode } = useThemeMode();
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;

  const getBackgroundColor = () => {
    if (disabled) return colors.border.light;
    if (selected) {
      switch (variant) {
        case 'primary':
          return colors.primary.default;
        case 'success':
          return colors.status.success;
        case 'warning':
          return colors.status.warning;
        case 'error':
          return colors.status.error;
        case 'info':
          return colors.status.info;
        default:
          return colors.background.card;
      }
    }
    const alpha = isDarkMode ? '33' : '15'; // 20% opacity for light mode, 10% for dark mode
    switch (variant) {
      case 'primary':
        return `${colors.primary.default}${alpha}`;
      case 'success':
        return `${colors.status.success}${alpha}`;
      case 'warning':
        return `${colors.status.warning}${alpha}`;
      case 'error':
        return `${colors.status.error}${alpha}`;
      case 'info':
        return `${colors.status.info}${alpha}`;
      default:
        return colors.background.card;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.text.disabled;
    if (selected && variant !== 'default') return '#FFFFFF';
    switch (variant) {
      case 'primary':
        return colors.primary.default;
      case 'success':
        return colors.status.success;
      case 'warning':
        return colors.status.warning;
      case 'error':
        return colors.status.error;
      case 'info':
        return colors.status.info;
      default:
        return colors.text.primary;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: 4,
          paddingHorizontal: 8,
        };
      case 'lg':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
        };
      default:
        return {
          paddingVertical: 6,
          paddingHorizontal: 12,
        };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return theme.typography.fontSize.xs;
      case 'lg':
        return theme.typography.fontSize.md;
      default:
        return theme.typography.fontSize.sm;
    }
  };

  const chipStyles = [
    styles.chip,
    {
      backgroundColor: getBackgroundColor(),
      ...getPadding(),
      opacity: disabled ? 0.6 : 1,
    },
    style,
  ];

  const textStyles = [
    styles.text,
    {
      color: getTextColor(),
      fontSize: getFontSize(),
      fontFamily: theme.typography.fontFamily.inter,
    },
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={chipStyles}
      disabled={disabled}
      activeOpacity={0.7}
      {...props}
    >
      {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
      <Text style={textStyles}>{label}</Text>
      {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      {onRemove && !disabled && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={onRemove}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          {/* You can replace this with your own remove icon */}
          <Text style={[textStyles, styles.removeIcon]}>×</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '500',
  },
  leftIcon: {
    marginRight: 6,
  },
  rightIcon: {
    marginLeft: 6,
  },
  removeButton: {
    marginLeft: 4,
    padding: 2,
  },
  removeIcon: {
    fontSize: 18,
    lineHeight: 18,
  },
}); 