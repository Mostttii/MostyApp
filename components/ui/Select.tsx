import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ViewProps,
  StyleProp,
  ViewStyle,
  TextStyle,
  Pressable,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { useTheme, useThemeMode } from '../../context/ThemeContext';
import { Text } from './Text';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends ViewProps {
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  error?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Select an option',
  disabled = false,
  size = 'md',
  label,
  error,
  style,
  textStyle,
  ...props
}: SelectProps) {
  const theme = useTheme();
  const { isDarkMode } = useThemeMode();
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
  const [isOpen, setIsOpen] = useState(false);

  const getHeight = () => {
    switch (size) {
      case 'sm':
        return 32;
      case 'lg':
        return 48;
      default:
        return 40;
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
    if (isOpen) return colors.primary.default;
    return colors.border.default;
  };

  const getSelectedOption = () => {
    return options.find((option) => option.value === value);
  };

  const ChevronIcon = () => (
    <View
      style={[
        styles.chevron,
        {
          borderColor: error
            ? colors.status.error
            : disabled
            ? colors.text.disabled
            : colors.text.secondary,
          transform: [{ rotate: isOpen ? '225deg' : '45deg' }],
        },
      ]}
    />
  );

  const height = getHeight();
  const fontSize = getFontSize();

  return (
    <View style={[styles.container, style]} {...props}>
      {label && (
        <Text
          variant="body2"
          style={[
            styles.label,
            {
              color: error ? colors.status.error : colors.text.secondary,
            },
          ]}
        >
          {label}
        </Text>
      )}
      <Pressable
        style={[
          styles.select,
          {
            height,
            borderColor: getBorderColor(),
            backgroundColor: disabled ? colors.border.light : colors.background.default,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
      >
        <Text
          style={[
            styles.selectText,
            {
              fontSize,
              color: value
                ? colors.text.primary
                : disabled
                ? colors.text.disabled
                : colors.text.secondary,
            },
            textStyle,
          ]}
          numberOfLines={1}
        >
          {getSelectedOption()?.label || placeholder}
        </Text>
        <ChevronIcon />
      </Pressable>
      {error && (
        <Text
          variant="caption"
          style={[
            styles.error,
            {
              color: colors.status.error,
            },
          ]}
        >
          {error}
        </Text>
      )}
      <Modal visible={isOpen} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.background.default,
                ...Platform.select({
                  ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                  },
                  android: {
                    elevation: 8,
                  },
                }),
              },
            ]}
          >
            <ScrollView style={styles.optionsList}>
              {options.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.option,
                    {
                      backgroundColor:
                        option.value === value
                          ? colors.primary.default + '15'
                          : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    onValueChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        fontSize,
                        color:
                          option.value === value
                            ? colors.primary.default
                            : colors.text.primary,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: 4,
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  selectText: {
    flex: 1,
    marginRight: 8,
    fontFamily: 'Inter-Regular',
  },
  chevron: {
    width: 8,
    height: 8,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    marginTop: -4,
  },
  error: {
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionsList: {
    flexGrow: 0,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionText: {
    fontFamily: 'Inter-Regular',
  },
}); 