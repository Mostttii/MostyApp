import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, ImageSourcePropType, Dimensions } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { useTheme } from '../../context/ThemeContext';
import { Text } from '../../components/ui/Text';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { YouTubeService } from '../../services/YouTubeService';
import { Video } from '../../types/Video';
import { RecipeCard } from '../../components/home/RecipeCard';

const { width } = Dimensions.get('window');

export default function SearchModal() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Video[]>([]);
  const theme = useTheme();
  const router = useRouter();

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const videos = await YouTubeService.getChannelVideos(query);
      setResults(videos);
    } catch (error) {
      console.error('Error searching videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Video }) => (
    <View style={styles.cardContainer}>
      <RecipeCard
        id={item.id}
        title={item.title}
        image={item.thumbnail ? { uri: item.thumbnail } : { uri: '' }}
        creator={{
          id: item.creatorId,
          name: item.creatorName,
          avatar: item.creatorAvatar ? { uri: item.creatorAvatar } : require('../../assets/images/default-avatar.png'),
        }}
        cookingTime={item.metadata.estimatedTime || 0}
        difficulty="medium"
        isSaved={false}
        onToggleSave={() => {}}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.default }]}>
      <View style={styles.header}>
        <MaterialCommunityIcons 
          name="close" 
          size={24} 
          color={theme.colors.text.primary}
          onPress={() => router.back()}
          style={styles.closeButton}
        />
        <Searchbar
          placeholder="Search recipes..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={() => handleSearch(searchQuery)}
          style={[
            styles.searchBar,
            { backgroundColor: theme.colors.background.cream }
          ]}
          iconColor={theme.colors.text.secondary}
          inputStyle={{ color: theme.colors.text.primary }}
          placeholderTextColor={theme.colors.text.secondary}
          autoFocus
        />
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary.default} />
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.centerContent}>
          <MaterialCommunityIcons
            name="magnify"
            size={48}
            color={theme.colors.text.secondary}
          />
          <Text
            variant="body"
            style={[
              styles.emptyText,
              { color: theme.colors.text.secondary }
            ]}
          >
            {searchQuery ? 'No results found' : 'Search for recipes by name, ingredient, or creator'}
          </Text>
        </View>
      )}
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
    padding: 16,
    gap: 12,
  },
  closeButton: {
    padding: 8,
  },
  searchBar: {
    flex: 1,
    elevation: 0,
    borderRadius: 12,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
  },
  resultsList: {
    padding: 16,
    gap: 16,
  },
  cardContainer: {
    marginBottom: 16,
  },
  thumbnailFallback: {
    width: width - 32,
    height: (width - 32) * 9/16, // 16:9 aspect ratio
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
  },
}); 