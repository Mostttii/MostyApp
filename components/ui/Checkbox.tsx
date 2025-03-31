import React from 'react';
import {
  Pressable,
  StyleSheet,
  ViewProps,
  StyleProp,
  ViewStyle,
  View,
  Platform,
} from 'react-native';
import { useTheme, useThemeMode } from '../../context/ThemeContext';
import { Text } from './Text';

interface CheckboxProps extends ViewProps {
  checked: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  error?: string;
  style?: StyleProp<ViewStyle>;
}

export function Checkbox({
  checked,
  onValueChange,
  disabled = false,
  size = 'md',
  label,
  error,
  style,
  ...props
}: CheckboxProps) {
  const theme = useTheme();
  const { isDarkMode } = useThemeMode();
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;

  const getSize = () => {
    switch (size) {
      case 'sm':
        return 16;
      case 'lg':
        return 24;
      default:
        return 20;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 12;
      case 'lg':
        return 18;
      default:
        return 14;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return theme.typography.fontSize.sm;
      case 'lg':
        return theme.typography.fontSize.lg;
      default:
        return theme.typography.fontSize.md;
    }
  };

  const getBorderColor = () => {
    if (error) return colors.status.error;
    if (disabled) return colors.border.light;
    if (checked) return colors.primary.default;
    return colors.border.default;
  };

  const getBackgroundColor = () => {
    if (disabled) return colors.border.light;
    if (checked) return colors.primary.default;
    return 'transparent';
  };

  const boxSize = getSize();
  const iconSize = getIconSize();

  const CheckIcon = () => (
    <View style={[styles.checkIcon, { width: iconSize, height: iconSize }]}>
      <View
        style={[
          styles.checkIconLine1,
          {
            width: iconSize * 0.55,
            height: 2,
            backgroundColor: disabled ? colors.text.disabled : '#FFFFFF',
          },
        ]}
      />
      <View
        style={[
          styles.checkIconLine2,
          {
            width: iconSize * 0.3,
            height: 2,
            backgroundColor: disabled ? colors.text.disabled : '#FFFFFF',
          },
        ]}
      />
    </View>
  );

  return (
    <View style={[styles.container, style]} {...props}>
      <Pressable
        style={[
          styles.checkbox,
          {
            width: boxSize,
            height: boxSize,
            borderRadius: 4,
            borderWidth: 2,
            borderColor: getBorderColor(),
            backgroundColor: getBackgroundColor(),
          },
          Platform.select({
            ios: checked && {
              shadowColor: colors.primary.default,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
            },
            android: checked && {
              elevation: 2,
            },
          }),
        ]}
        onPress={() => !disabled && onValueChange(!checked)}
        disabled={disabled}
      >
        {checked && <CheckIcon />}
      </Pressable>
      {label && (
        <Pressable
          onPress={() => !disabled && onValueChange(!checked)}
          style={styles.labelContainer}
        >
          <Text
            style={[
              styles.label,
              {
                fontSize: getFontSize(),
                color: error
                  ? colors.status.error
                  : disabled
                  ? colors.text.disabled
                  : colors.text.primary,
                marginLeft: size === 'sm' ? 8 : size === 'lg' ? 12 : 10,
              },
            ]}
          >
            {label}
          </Text>
        </Pressable>
      )}
      {error && (
        <Text
          variant="caption"
          style={[
            styles.error,
            {
              color: colors.status.error,
              marginLeft: label ? (size === 'sm' ? 8 : size === 'lg' ? 12 : 10) : 0,
            },
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    position: 'relative',
    transform: [{ rotate: '-45deg' }],
  },
  checkIconLine1: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  checkIconLine2: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontFamily: 'Inter-Regular',
  },
  error: {
    marginTop: 4,
  },
}); 