import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { Creator } from '../../types/Creator';
import { CreatorService } from '../../services/CreatorService';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';

interface CreatorCardProps {
  creator: Creator;
  onFollowToggle?: () => void;
}

export default function CreatorCard({ creator, onFollowToggle }: CreatorCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowToggle = async () => {
    if (!user) {
      router.push(ROUTES.AUTH.LOGIN);
      return;
    }

    try {
      setIsLoading(true);
      if (isFollowing) {
        await CreatorService.unfollowCreator(user.uid, creator.id);
      } else {
        await CreatorService.followCreator(user.uid, creator.id);
      }
      setIsFollowing(!isFollowing);
      onFollowToggle?.();
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardPress = () => {
    router.push(ROUTES.CREATOR.PROFILE(creator.id));
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handleCardPress}>
      <Image source={{ uri: creator.profileImage }} style={styles.profileImage} />
      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.name}>{creator.name}</Text>
            <Text style={styles.handle}>@{creator.handle}</Text>
          </View>
          <TouchableOpacity
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={handleFollowToggle}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.followButtonText}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <FontAwesome name="users" size={16} color="#666" />
            <Text style={styles.statText}>{creator.popularity} followers</Text>
          </View>
          <View style={styles.statItem}>
            <FontAwesome name="book" size={16} color="#666" />
            <Text style={styles.statText}>{creator.contentCount} recipes</Text>
          </View>
        </View>

        <View style={styles.tags}>
          {creator.cuisineTypes.slice(0, 3).map((cuisine, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{cuisine}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  handle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  followButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: '#666',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
}); 