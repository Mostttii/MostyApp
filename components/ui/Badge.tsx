import React from 'react';
import {
  View,
  StyleSheet,
  ViewProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme, useThemeMode } from '../../context/ThemeContext';
import { Text } from './Text';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends ViewProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  label?: string;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Badge({
  variant = 'default',
  size = 'md',
  label,
  icon,
  style,
  textStyle,
  ...props
}: BadgeProps) {
  const theme = useTheme();
  const { isDarkMode } = useThemeMode();
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;

  const getBackgroundColor = () => {
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
        return colors.text.secondary;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: 2,
          paddingHorizontal: 6,
        };
      case 'lg':
        return {
          paddingVertical: 6,
          paddingHorizontal: 12,
        };
      default:
        return {
          paddingVertical: 4,
          paddingHorizontal: 8,
        };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return theme.typography.fontSize.xs;
      case 'lg':
        return theme.typography.fontSize.sm;
      default:
        return theme.typography.fontSize.xs;
    }
  };

  const badgeStyles = [
    styles.badge,
    {
      backgroundColor: getBackgroundColor(),
      ...getPadding(),
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
    <View style={badgeStyles} {...props}>
      {icon && <View style={styles.icon}>{icon}</View>}
      {label && <Text style={textStyles}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: '500',
  },
}); 