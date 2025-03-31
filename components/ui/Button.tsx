import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme, useThemeMode } from '../../context/ThemeContext';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  children,
  disabled,
  ...props
}: ButtonProps) {
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

  const getTextColor = () => {
    if (disabled) return colors.text.disabled;
    switch (variant) {
      case 'primary':
        return '#FFFFFF';
      case 'secondary':
      case 'outline':
      case 'ghost':
        return colors.text.primary;
      default:
        return '#FFFFFF';
    }
  };

  const buttonHeight = theme.layout.button.height[size];
  const fontSize = size === 'lg' ? theme.typography.fontSize.lg : 
                  size === 'sm' ? theme.typography.fontSize.sm :
                  theme.typography.fontSize.md;
  
  const buttonStyles = [
    styles.button,
    {
      height: buttonHeight,
      backgroundColor: getBackgroundColor(),
      borderColor: getBorderColor(),
      borderWidth: variant === 'outline' ? 1 : 0,
      opacity: disabled ? 0.6 : 1,
    },
    style,
  ];

  const contentStyles = [
    styles.content,
    {
      paddingHorizontal: size === 'lg' ? 24 : size === 'sm' ? 12 : 16,
    },
  ];

  const textStyles = [
    styles.text,
    {
      color: getTextColor(),
      fontSize,
      fontFamily: theme.typography.fontFamily.inter,
    },
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      {...props}
    >
      <View style={contentStyles}>
        {isLoading ? (
          <ActivityIndicator color={getTextColor()} />
        ) : (
          <>
            {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
            <Text style={textStyles}>{children}</Text>
            {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
          </>
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
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    fontWeight: '600',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
}); 