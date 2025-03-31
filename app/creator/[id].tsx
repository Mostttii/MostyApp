import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { Creator, ContentItem } from '../../types/Creator';
import { CreatorService } from '../../services/CreatorService';
import { useAuth } from '../../context/AuthContext';
import { Text } from '../../components/ui/Text';
import { VerificationBadge } from '../../components/ui/VerificationBadge';
import WebView from 'react-native-webview';
import { useTheme } from '../../context/ThemeContext';

export default function CreatorProfileScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const theme = useTheme();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);

  useEffect(() => {
    loadCreatorData();
  }, [id]);

  const loadCreatorData = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const creatorData = await CreatorService.getCreator(id as string);
      if (creatorData) {
        setCreator(creatorData);
        if (user) {
          const followedCreators = await CreatorService.getFollowedCreators(user.uid);
          setIsFollowing(followedCreators.some(c => c.id === id));
        }
        const creatorContent = await CreatorService.getCreatorContent(id as string);
        setContent(creatorContent as unknown as ContentItem[]);
      }
    } catch (error) {
      console.error('Error loading creator:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user || !creator) return;

    try {
      if (isFollowing) {
        await CreatorService.unfollowCreator(user.uid, creator.id);
      } else {
        await CreatorService.followCreator(user.uid, creator.id);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const renderContentItem = ({ item }: { item: ContentItem }) => (
    <TouchableOpacity
      style={styles.contentItem}
      onPress={() => setSelectedContent(item)}
    >
      {item.thumbnail && (
        <Image
          source={{ uri: item.thumbnail }}
          style={styles.contentThumbnail}
        />
      )}
      <View style={styles.contentInfo}>
        <Text variant="bodyMedium" numberOfLines={2}>
          {item.title}
        </Text>
        <Text variant="caption" style={{ color: theme.colors.text.secondary }}>
          {item.platform} • {item.publishedAt.toDate().toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading || !creator) {
    return (
      <View style={[styles.container, styles.loading]}>
        <ActivityIndicator size="large" color={theme.colors.primary.default} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: creator.name,
          headerRight: () => (
            <TouchableOpacity
              style={styles.followButton}
              onPress={handleFollowToggle}
            >
              <Text variant="button" style={{ color: theme.colors.text.light }}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      <FlatList
        data={content}
        renderItem={renderContentItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <Image
              source={{ uri: creator.profileImage || creator.avatar }}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <View style={styles.nameContainer}>
                <Text variant="heading2" style={styles.name}>
                  {creator.name}
                </Text>
                <VerificationBadge
                  status={creator.verification?.status || 'unverified'}
                  size="medium"
                  showLabel={false}
                />
              </View>
              <Text variant="body" style={styles.handle}>
                @{creator.handle}
              </Text>
              {creator.bio && (
                <Text variant="body" style={styles.bio}>
                  {creator.bio}
                </Text>
              )}

              <View style={styles.stats}>
                <View style={styles.statItem}>
                  <Text variant="heading3" style={styles.statValue}>
                    {creator.statistics?.followers || 0}
                  </Text>
                  <Text variant="caption" style={styles.statLabel}>
                    Followers
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text variant="heading3" style={styles.statValue}>
                    {creator.statistics?.recipes || 0}
                  </Text>
                  <Text variant="caption" style={styles.statLabel}>
                    Recipes
                  </Text>
                </View>
              </View>

              <View style={styles.socialLinks}>
                {Object.entries(creator.platforms).map(([platform, data]) => {
                  if (!data) return null;
                  const url = platform === 'youtube'
                    ? `https://youtube.com/channel/${data.channelId}`
                    : platform === 'instagram'
                    ? `https://instagram.com/${data.username}`
                    : platform === 'tiktok'
                    ? `https://tiktok.com/@${data.username}`
                    : platform === 'blog'
                    ? data.url
                    : null;

                  if (!url) return null;

                  return (
                    <TouchableOpacity
                      key={platform}
                      style={styles.socialButton}
                      onPress={() => Linking.openURL(url)}
                    >
                      <FontAwesome
                        name={platform as any}
                        size={20}
                        color={theme.colors.text.secondary}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.cuisineTypes}>
                {creator.cuisineTypes.map((cuisine) => (
                  <View
                    key={cuisine}
                    style={[
                      styles.cuisineTag,
                      { backgroundColor: theme.colors.background.cream },
                    ]}
                  >
                    <Text variant="caption" style={styles.cuisineText}>
                      {cuisine}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        }
        contentContainerStyle={styles.contentList}
      />

      {selectedContent && (
        <View style={styles.webviewContainer}>
          <WebView
            source={{ uri: selectedContent.originalUrl }}
            style={styles.webview}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedContent(null)}
          >
            <FontAwesome name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    marginRight: 8,
  },
  handle: {
    color: '#666',
    marginBottom: 8,
  },
  bio: {
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    marginRight: 24,
  },
  statValue: {
    marginBottom: 4,
  },
  statLabel: {
    color: '#666',
  },
  socialLinks: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  socialButton: {
    marginRight: 16,
  },
  cuisineTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  cuisineTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  cuisineText: {
    color: '#666',
  },
  followButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  contentList: {
    paddingBottom: 16,
  },
  contentItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  contentThumbnail: {
    width: 120,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  contentInfo: {
    flex: 1,
  },
  webviewContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 