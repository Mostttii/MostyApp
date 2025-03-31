import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Searchbar, Text } from 'react-native-paper';
import { CreatorDirectory } from '../../components/discover/CreatorDirectory';
import { CategoryBrowser } from '../../components/discover/CategoryBrowser';
import { RecentSearches } from '../../components/discover/RecentSearches';

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showRecentSearches, setShowRecentSearches] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowRecentSearches(false);
    // TODO: Implement search functionality
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search recipes, creators, cuisines..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onFocus={() => setShowRecentSearches(true)}
          onSubmitEditing={() => handleSearch(searchQuery)}
          style={styles.searchBar}
        />
      </View>

      {showRecentSearches ? (
        <RecentSearches onSelect={handleSearch} />
      ) : (
        <ScrollView style={styles.content}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Browse by Category
          </Text>
          <CategoryBrowser />

          <Text variant="titleLarge" style={styles.sectionTitle}>
            Popular Creators
          </Text>
          <CreatorDirectory />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e2e2',
  },
  searchBar: {
    elevation: 0,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
    fontWeight: 'bold',
  },
}); 