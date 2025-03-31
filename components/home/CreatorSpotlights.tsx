import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useCreatorSpotlights } from '../../hooks/useCreatorSpotlights';
import { useRouter } from 'expo-router';
import { Creator } from '../../types/Creator';
import { Theme } from '../../constants/Theme';
import { Text, Card, Button, Avatar, Badge } from '../ui';

export function CreatorSpotlights() {
  const { featuredCreators, loading, followCreator } = useCreatorSpotlights();
  const router = useRouter();

  if (loading || featuredCreators.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text variant="heading2" style={styles.sectionTitle}>
        Featured Creators
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {featuredCreators.map((creator: Creator) => (
          <Card key={creator.id} style={styles.creatorCard}>
            <Card.Content>
              <View style={styles.creatorInfo}>
                <Avatar
                  size="xl"
                  source={creator.profileImage ? { uri: creator.profileImage } : undefined}
                  verified={creator.verified}
                />
                <Text variant="bodyMedium" style={styles.creatorName}>
                  {creator.name}
                </Text>
                <View style={styles.statsContainer}>
                  <Text variant="caption" color={Theme.colors.text.secondary}>
                    {creator.statistics.followers} followers • {creator.statistics.recipes} recipes
                  </Text>
                  <Text variant="caption" color={Theme.colors.text.secondary}>
                    {creator.statistics.averageRating.toFixed(1)} avg rating
                  </Text>
                </View>
                <View style={styles.tagsContainer}>
                  {creator.specialties.slice(0, 3).map((specialty, index) => (
                    <Badge
                      key={index}
                      label={specialty}
                      variant="default"
                    />
                  ))}
                </View>
                <Button
                  variant={creator.statistics.followers > 0 ? 'outline' : 'primary'}
                  size="sm"
                  onPress={() => followCreator(creator.id)}
                  style={styles.followButton}
                >
                  {creator.statistics.followers > 0 ? 'Following' : 'Follow'}
                </Button>
              </View>

              <View style={styles.recipePreview}>
                <Text variant="heading3" style={styles.previewTitle}>
                  Latest Recipes
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <Card
                    style={styles.recipeCard}
                    onPress={() => router.push('/recipe/preview')}
                  >
                    <Card.Image
                      source={{ uri: 'https://example.com/recipe-preview.jpg' }}
                      style={styles.recipeImage}
                    />
                    <Card.Content>
                      <Card.Title
                        title="Recipe Preview"
                        subtitle="Coming Soon"
                      />
                    </Card.Content>
                  </Card>
                </ScrollView>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Theme.layout.spacing.lg,
  },
  sectionTitle: {
    marginHorizontal: Theme.layout.spacing.md,
    marginBottom: Theme.layout.spacing.md,
  },
  scrollContent: {
    paddingHorizontal: Theme.layout.spacing.md,
  },
  creatorCard: {
    width: 300,
    marginRight: Theme.layout.spacing.md,
  },
  creatorInfo: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
    paddingBottom: Theme.layout.spacing.md,
  },
  creatorName: {
    marginTop: Theme.layout.spacing.sm,
    textAlign: 'center',
  },
  statsContainer: {
    marginTop: Theme.layout.spacing.xs,
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Theme.layout.spacing.xs,
    marginVertical: Theme.layout.spacing.sm,
  },
  followButton: {
    marginTop: Theme.layout.spacing.sm,
  },
  recipePreview: {
    marginTop: Theme.layout.spacing.md,
  },
  previewTitle: {
    marginBottom: Theme.layout.spacing.sm,
  },
  recipeCard: {
    width: 160,
    marginRight: Theme.layout.spacing.sm,
  },
  recipeImage: {
    height: 100,
  },
}); 