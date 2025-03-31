import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
  View,
  ActivityIndicator,
} from 'react-native';
import { useTheme, useThemeMode } from '../../context/ThemeContext';

export type IconButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps extends TouchableOpacityProps {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  icon: React.ReactNode;
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function IconButton({
  variant = 'primary',
  size = 'md',
  icon,
  isLoading = false,
  style,
  disabled,
  ...props
}: IconButtonProps) {
  const theme = useTheme();
  const { isDarkMode } = useThemeMode();
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;

  const getBackgroundColor = () => {
    if (disabled) return colors.border.light;
    switch (variant) {
      case 'primary':
        return colors.primary.default;
      case 'secondary':
        return colors.background.card;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return colors.primary.default;
    }
  };

  const getBorderColor = () => {
    if (disabled) return colors.border.light;
    switch (variant) {
      case 'outline':
        return colors.border.default;
      default:
        return 'transparent';
    }
  };

  const getSize = () => {
    switch (size) {
      case 'sm':
        return 32;
      case 'lg':
        return 48;
      default:
        return 40;
    }
  };

  const buttonSize = getSize();

  const buttonStyles = [
    styles.button,
    {
      width: buttonSize,
      height: buttonSize,
      backgroundColor: getBackgroundColor(),
      borderColor: getBorderColor(),
      borderWidth: variant === 'outline' ? 1 : 0,
      opacity: disabled ? 0.6 : 1,
    },
    style,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      {...props}
    >
      <View style={styles.iconContainer}>
        {isLoading ? (
          <ActivityIndicator
            color={variant === 'primary' ? '#FFFFFF' : colors.text.primary}
            size={size === 'sm' ? 'small' : 'small'}
          />
        ) : (
          icon
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 