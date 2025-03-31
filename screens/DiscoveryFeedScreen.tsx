import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
} from 'react-native';
import { ContentCard } from '../components/ContentCard';
import { ContentItem } from '../services/ContentService';
import { CreatorService } from '../services/CreatorService';
import { ContentRefreshService } from '../services/ContentRefreshService';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export const DiscoveryFeedScreen: React.FC = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = async () => {
    try {
      const contentRef = collection(db, 'content');
      const q = query(
        contentRef,
        orderBy('publishedAt', 'desc'),
        limit(20)
      );
      
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as ContentItem[];
      
      setContent(items);
      setError(null);
    } catch (err) {
      setError('Failed to load content. Please try again.');
      console.error('Error fetching content:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await ContentRefreshService.refreshAllContent();
    await fetchContent();
  };

  const handleContentPress = (item: ContentItem) => {
    // TODO: Navigate to content detail screen
    console.log('Content pressed:', item);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={content}
        renderItem={({ item }) => (
          <ContentCard
            item={item}
            onPress={handleContentPress}
          />
        )}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    paddingVertical: 16,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 32,
  },
}); 