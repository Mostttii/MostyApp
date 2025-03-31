import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Pressable,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Text } from '../ui/Text';
import { router } from 'expo-router';
import { Creator } from '../../types/Creator';

export interface CreatorSpotlightProps {
  creators: Creator[];
  title?: string;
}

export function CreatorSpotlight({
  creators,
  title = 'Creator Spotlight',
}: CreatorSpotlightProps) {
  const theme = useTheme();

  const handleCreatorPress = (creatorId: string) => {
    router.push(`/(tabs)/creator/${creatorId}` as any);
  };

  const formatNumber = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.default }]}>
      <View style={styles.header}>
        <Text variant="heading3">{title}</Text>
        <Pressable onPress={() => router.push('/(tabs)/creators' as any)}>
          <Text
            variant="button"
            style={{ color: theme.colors.primary.default }}
          >
            See All
          </Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.creatorsContainer}
      >
        {creators.map(creator => (
          <Pressable
            key={creator.id}
            onPress={() => handleCreatorPress(creator.id)}
            style={({ pressed }) => [
              styles.creatorCard,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Image
              source={{ uri: creator.avatar || creator.profileImage }}
              style={styles.avatar}
            />
            <Text
              variant="body"
              style={styles.name}
              numberOfLines={1}
            >
              {creator.name}
            </Text>
            <Text
              variant="caption"
              style={[styles.specialty, { color: theme.colors.text.secondary }]}
              numberOfLines={1}
            >
              {creator.specialties[0]}
            </Text>
            {creator.platforms.youtube?.subscribers ? (
              <Text
                variant="caption"
                style={{ color: theme.colors.text.secondary }}
              >
                {formatNumber(creator.platforms.youtube.subscribers)} subscribers
              </Text>
            ) : (
              <Text
                variant="caption"
                style={{ color: theme.colors.text.secondary }}
              >
                {formatNumber(creator.statistics.followers)} followers
              </Text>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  creatorsContainer: {
    paddingHorizontal: 16,
  },
  creatorCard: {
    alignItems: 'center',
    width: 120,
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  name: {
    textAlign: 'center',
    marginBottom: 4,
  },
  specialty: {
    textAlign: 'center',
    marginBottom: 4,
  },
}); 