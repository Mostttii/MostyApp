import React from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRecentSearches } from '../../hooks/useRecentSearches';
import { useTheme } from '../../context/ThemeContext';
import { Text } from '../ui';

export interface RecentSearchesProps {
  onSelect: (query: string) => void;
}

export function RecentSearches({ onSelect }: RecentSearchesProps) {
  const { searches, removeSearch, clearSearches } = useRecentSearches();
  const theme = useTheme();

  if (searches.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="body" color={theme.colors.text.secondary}>
          No recent searches
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.default }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border.light }]}>
        <Text variant="heading3">Recent Searches</Text>
        <Pressable
          onPress={clearSearches}
          style={({ pressed }) => [
            styles.clearButton,
            { backgroundColor: pressed ? theme.colors.background.sage : 'transparent' }
          ]}
        >
          <MaterialCommunityIcons
            name="delete-sweep"
            size={24}
            color={theme.colors.text.secondary}
          />
        </Pressable>
      </View>
      <ScrollView style={styles.searchList}>
        {searches.map((search, index) => (
          <Pressable
            key={index}
            onPress={() => onSelect(search)}
            style={({ pressed }) => [
              styles.searchItem,
              { backgroundColor: pressed ? theme.colors.background.sage : 'transparent' }
            ]}
          >
            <MaterialCommunityIcons
              name="history"
              size={24}
              color={theme.colors.text.secondary}
              style={styles.searchIcon}
            />
            <Text variant="body" style={styles.searchText}>{search}</Text>
            <Pressable
              onPress={() => removeSearch(search)}
              style={({ pressed }) => [
                styles.removeButton,
                { backgroundColor: pressed ? theme.colors.background.cream : 'transparent' }
              ]}
            >
              <MaterialCommunityIcons
                name="close"
                size={20}
                color={theme.colors.text.secondary}
              />
            </Pressable>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  clearButton: {
    padding: 8,
    borderRadius: 8,
  },
  searchList: {
    flex: 1,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchText: {
    flex: 1,
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
}); 