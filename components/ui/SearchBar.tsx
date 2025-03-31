import React from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TextInputProps,
  Pressable,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface SearchBarProps extends TextInputProps {
  onClear?: () => void;
}

export function SearchBar({ value, onClear, style, ...props }: SearchBarProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background.cream,
          borderColor: theme.colors.border.default,
        },
        style,
      ]}
    >
      <MaterialCommunityIcons
        name="magnify"
        size={20}
        color={theme.colors.text.secondary}
        style={styles.searchIcon}
      />
      <TextInput
        style={[
          styles.input,
          {
            color: theme.colors.text.primary,
          },
        ]}
        placeholderTextColor={theme.colors.text.secondary}
        value={value}
        {...props}
      />
      {value && onClear && (
        <Pressable
          onPress={onClear}
          style={({ pressed }) => [
            styles.clearButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <MaterialCommunityIcons
            name="close-circle"
            size={20}
            color={theme.colors.text.secondary}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  clearButton: {
    marginLeft: 8,
    padding: 2,
  },
}); 