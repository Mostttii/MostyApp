import React, { forwardRef, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { useTheme, useThemeMode } from '../../context/ThemeContext';
import { Text } from './Text';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helper,
      leftIcon,
      rightIcon,
      containerStyle,
      inputStyle,
      style,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();
    const { isDarkMode } = useThemeMode();
    const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
    const [isFocused, setIsFocused] = useState(false);

    const getBorderColor = () => {
      if (error) return colors.status.error;
      if (isFocused) return colors.primary.default;
      return colors.border.default;
    };

    const containerStyles = [
      styles.container,
      containerStyle,
    ];

    const inputContainerStyles = [
      styles.inputContainer,
      {
        borderColor: getBorderColor(),
        backgroundColor: colors.background.default,
      },
      style,
    ];

    const textInputStyles = [
      styles.input,
      {
        color: colors.text.primary,
        fontFamily: theme.typography.fontFamily.inter,
        fontSize: theme.typography.fontSize.md,
      },
      inputStyle,
    ];

    const handleFocus = (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <View style={containerStyles}>
        {label && (
          <Text
            variant="body2"
            style={[
              styles.label,
              { color: error ? colors.status.error : colors.text.secondary },
            ]}
          >
            {label}
          </Text>
        )}
        <View style={inputContainerStyles}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <TextInput
            ref={ref}
            placeholderTextColor={colors.text.disabled}
            style={textInputStyles}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
        {(error || helper) && (
          <Text
            variant="caption"
            style={[
              styles.helperText,
              { color: error ? colors.status.error : colors.text.secondary },
            ]}
          >
            {error || helper}
          </Text>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 40,
    ...Platform.select({
      ios: {
        paddingVertical: 10,
      },
      android: {
        paddingVertical: 8,
      },
      default: {
        paddingVertical: 8,
      },
    }),
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    ...Platform.select({
      web: {
        outline: 'none',
      },
    }),
  },
  leftIcon: {
    paddingLeft: 12,
  },
  rightIcon: {
    paddingRight: 12,
  },
  helperText: {
    marginTop: 4,
  },
}); 