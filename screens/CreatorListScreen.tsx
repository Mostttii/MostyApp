import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { CreatorService } from '../services/CreatorService';
import { Creator } from '../types/Creator';
import { useNavigation } from '@react-navigation/native';

export const CreatorListScreen: React.FC = () => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    loadCreators();
  }, []);

  const loadCreators = async () => {
    try {
      const data = await CreatorService.getAllCreators();
      setCreators(data);
      setError(null);
    } catch (err) {
      setError('Failed to load creators');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatorPress = (creator: Creator) => {
    if (creator.platforms.blog?.website) {
      navigation.navigate('InAppBrowser', {
        url: creator.platforms.blog.website,
      });
    }
  };

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

  const renderCreator = ({ item: creator }: { item: Creator }) => (
    <TouchableOpacity
      style={styles.creatorCard}
      onPress={() => handleCreatorPress(creator)}
    >
      <Image source={{ uri: creator.avatar }} style={styles.avatar} />
      <View style={styles.creatorInfo}>
        <Text style={styles.name}>{creator.name}</Text>
        <Text style={styles.bio} numberOfLines={2}>
          {creator.bio}
        </Text>
        <View style={styles.tags}>
          {creator.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={creators}
        renderItem={renderCreator}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
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
  },
  list: {
    padding: 16,
  },
  creatorCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  creatorInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  errorText: {
    color: '#ff0000',
    fontSize: 16,
  },
}); 