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

interface RadioButtonProps extends ViewProps {
  checked: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  error?: string;
  style?: StyleProp<ViewStyle>;
}

export function RadioButton({
  checked,
  onValueChange,
  disabled = false,
  size = 'md',
  label,
  error,
  style,
  ...props
}: RadioButtonProps) {
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

  const getDotSize = () => {
    switch (size) {
      case 'sm':
        return 8;
      case 'lg':
        return 12;
      default:
        return 10;
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
  const dotSize = getDotSize();

  const getShadowStyle = () => {
    if (!checked) return {};

    if (Platform.OS === 'ios') {
      return {
        shadowColor: colors.primary.default,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      };
    }

    if (Platform.OS === 'android') {
      return {
        elevation: 2,
      };
    }

    return {};
  };

  return (
    <View style={[styles.container, style]} {...props}>
      <Pressable
        style={[
          styles.radio,
          {
            width: boxSize,
            height: boxSize,
            borderRadius: boxSize / 2,
            borderWidth: 2,
            borderColor: getBorderColor(),
            backgroundColor: 'transparent',
          },
          getShadowStyle(),
        ]}
        onPress={() => !disabled && onValueChange(!checked)}
        disabled={disabled}
      >
        {checked && (
          <View
            style={[
              styles.dot,
              {
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor: disabled ? colors.text.disabled : colors.primary.default,
              },
            ]}
          />
        )}
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
  radio: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    position: 'absolute',
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