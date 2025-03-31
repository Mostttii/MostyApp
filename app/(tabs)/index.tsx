import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { Header } from '../../components/home/Header';
import { NewUserOnboarding } from '../../components/home/NewUserOnboarding';
import { ContentFeed } from '../../components/home/ContentFeed';
import { CreatorSpotlights } from '../../components/home/CreatorSpotlights';
import { FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Theme } from '../../constants/Theme';
import { HomeHeader } from '../../components/home/HomeHeader';
import { WelcomeBanner } from '../../components/home/WelcomeBanner';
import { CategoryFilters } from '../../components/home/CategoryFilters';
import { RecipeCard } from '../../components/home/RecipeCard';
import { CreatorSpotlight } from '../../components/home/CreatorSpotlight';
import { Text } from '../../components/ui/Text';
import { Pressable } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { ContentItem } from '../../services/ContentService';
import { useCreatorSpotlights } from '../../hooks/useCreatorSpotlights';
import { ActivityIndicator } from 'react-native';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [latestContent, setLatestContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { featuredCreators, loading: creatorsLoading } = useCreatorSpotlights();

  useEffect(() => {
    loadLatestContent();
  }, [selectedCategory]);

  const loadLatestContent = async () => {
    try {
      setIsLoading(true);
      const contentRef = collection(db, 'content');
      
      // Create query based on selected category
      const baseQuery = selectedCategory === 'all'
        ? query(
            contentRef,
            orderBy('publishedAt', 'desc'),
            limit(20)
          )
        : query(
            contentRef,
            where('metadata.cuisineType', '==', selectedCategory.toLowerCase()),
            orderBy('publishedAt', 'desc'),
            limit(20)
          );
      
      const snapshot = await getDocs(baseQuery);
      const items = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as ContentItem[];

      setLatestContent(items);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSave = async (recipeId: string) => {
    // TODO: Implement save functionality
    console.log('Toggle save:', recipeId);
  };

  return (
    <ScrollView 
      style={[
        styles.container,
        { backgroundColor: theme.colors.background.default }
      ]}
    >
      <HomeHeader />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {showWelcome && (
          <WelcomeBanner
            onDismiss={() => setShowWelcome(false)}
          />
        )}
        <CategoryFilters
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="heading3">Latest Recipes</Text>
            <Pressable onPress={() => router.push('/(tabs)/my-recipes' as any)}>
              <Text
                variant="button"
                style={{ color: theme.colors.primary.default }}
              >
                See All
              </Text>
            </Pressable>
          </View>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary.default} />
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recipesContainer}
            >
              {latestContent.map(content => (
                <RecipeCard
                  key={content.id}
                  id={content.id}
                  title={content.title}
                  image={{ uri: content.thumbnail }}
                  creator={{
                    id: content.creatorId,
                    name: content.creatorName,
                    avatar: content.creatorAvatar ? { uri: content.creatorAvatar } : require('../../assets/images/default-avatar.png'),
                  }}
                  cookingTime={content.metadata.estimatedTime || 0}
                  difficulty="medium"
                  isSaved={false}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </ScrollView>
          )}
        </View>
        {creatorsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary.default} />
          </View>
        ) : (
          <CreatorSpotlight
            creators={featuredCreators}
            title="Featured Creators"
          />
        )}
      </ScrollView>
      
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/modal/add-recipe' as any)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 80,
  },
  section: {
    marginVertical: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  recipesContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
}); 