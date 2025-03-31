import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { useCreatorDirectory } from '../../hooks/useCreatorDirectory';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { Text, Card, Badge, Avatar, Button } from '../ui';
import { Creator } from '../../types/Creator';

const FILTER_OPTIONS = {
  cuisineTypes: ['All', 'Italian', 'Japanese', 'Mexican', 'Indian', 'French'],
  specialties: ['All', 'Baking', 'Grilling', 'Vegan', 'Desserts', 'Healthy'],
  difficulty: ['All', 'Beginner', 'Intermediate', 'Advanced'],
};

export function CreatorDirectory() {
  const [filters, setFilters] = useState({
    cuisineType: 'All',
    specialty: 'All',
    difficulty: 'All',
  });

  const { creators } = useCreatorDirectory(filters);
  const router = useRouter();
  const theme = useTheme();

  const renderFilterSection = (title: string, options: string[], selectedFilter: string, onSelect: (value: string) => void) => (
    <View style={styles.filterSection}>
      <Text variant="heading3" style={styles.filterTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterList}>
        {options.map((option) => (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
          >
            <Badge
              variant={selectedFilter === option ? 'default' : 'outline'}
              size="small"
            >
              {option}
            </Badge>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  const renderCreatorCard = (creator: Creator) => (
    <Card
      key={creator.id}
      variant="elevated"
      style={styles.creatorCard}
      onPress={() => router.push(`/creator/${creator.id}`)}
    >
      <View style={styles.creatorInfo}>
        <Avatar size="medium" source={creator.profileImage ? { uri: creator.profileImage } : undefined} />
        <View style={styles.textContainer}>
          <Text variant="heading3">{creator.name}</Text>
          <Text variant="caption" color={theme.colors.text.secondary}>
            {creator.statistics.followers} followers
          </Text>
          <Text variant="body" color={theme.colors.text.secondary} numberOfLines={2} style={styles.bio}>
            {creator.bio}
          </Text>
        </View>
      </View>
      <View style={styles.specialties}>
        {creator.specialties.map((specialty: string, index: number) => (
          <View key={index} style={styles.specialtyBadge}>
            <Badge variant="outline" size="small">
              {specialty}
            </Badge>
          </View>
        ))}
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.default }]}>
      <View>
        {renderFilterSection(
          'Cuisine Type',
          FILTER_OPTIONS.cuisineTypes,
          filters.cuisineType,
          (value) => setFilters(prev => ({ ...prev, cuisineType: value }))
        )}
        {renderFilterSection(
          'Specialty',
          FILTER_OPTIONS.specialties,
          filters.specialty,
          (value) => setFilters(prev => ({ ...prev, specialty: value }))
        )}
        {renderFilterSection(
          'Difficulty Level',
          FILTER_OPTIONS.difficulty,
          filters.difficulty,
          (value) => setFilters(prev => ({ ...prev, difficulty: value }))
        )}
      </View>
      <ScrollView>
        {creators.map((creator: Creator) => (
          <Card
            key={creator.id}
            variant="elevated"
            style={styles.creatorCard}
            onPress={() => router.push(`/creator/${creator.id}`)}
          >
            <View style={styles.creatorInfo}>
              <Avatar size="medium" source={creator.profileImage ? { uri: creator.profileImage } : undefined} />
              <View style={styles.textContainer}>
                <Text variant="heading3">{creator.name}</Text>
                <Text variant="caption" color={theme.colors.text.secondary}>
                  {creator.statistics.followers} followers
                </Text>
                <Text variant="body" color={theme.colors.text.secondary} numberOfLines={2} style={styles.bio}>
                  {creator.bio}
                </Text>
              </View>
            </View>
            <View style={styles.specialties}>
              {creator.specialties.map((specialty: string, index: number) => (
                <View key={index} style={styles.specialtyBadge}>
                  <Badge variant="outline" size="small">
                    {specialty}
                  </Badge>
                </View>
              ))}
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  filterList: {
    paddingHorizontal: 16,
  },
  creatorCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  bio: {
    marginTop: 4,
  },
  specialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  specialtyBadge: {
    marginRight: 8,
    marginBottom: 4,
  },
}); 