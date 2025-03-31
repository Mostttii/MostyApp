import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Card, Text, IconButton, ActivityIndicator } from 'react-native-paper';
import { Collection } from '../../types/Collection';
import { Recipe } from '../../types/Recipe';

interface CollectionViewProps {
  collection: Collection;
  viewMode: 'grid' | 'list';
  onRecipePress: (recipe: Recipe) => void;
  onBack: () => void;
  loading: boolean;
}

export function CollectionView({
  collection,
  viewMode,
  onRecipePress,
  onBack,
  loading,
}: CollectionViewProps) {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const renderGridItem = ({ item }: { item: Recipe }) => (
    <Card
      style={styles.gridCard}
      onPress={() => onRecipePress(item)}
    >
      {item.imageUrl && (
        <Card.Cover source={{ uri: item.imageUrl }} style={styles.cardCover} />
      )}
      <Card.Content>
        <Text variant="titleMedium" numberOfLines={1}>
          {item.title}
        </Text>
        <Text variant="bodySmall" style={styles.cookTime}>
          {item.cookTime} mins
        </Text>
        {item.description && (
          <Text variant="bodySmall" numberOfLines={2} style={styles.description}>
            {item.description}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  const renderListItem = ({ item }: { item: Recipe }) => (
    <Card
      style={styles.listCard}
      onPress={() => onRecipePress(item)}
    >
      <Card.Title
        title={item.title}
        subtitle={`${item.cookTime} mins`}
        left={props =>
          item.imageUrl ? (
            <Card.Cover
              {...props}
              source={{ uri: item.imageUrl }}
              style={styles.listCover}
            />
          ) : null
        }
      />
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          onPress={onBack}
        />
        <Text variant="headlineMedium" style={styles.title}>
          {collection.name}
        </Text>
      </View>
      <FlatList
        data={collection.recipes}
        renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
        keyExtractor={item => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode} // Force re-render when view mode changes
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  title: {
    flex: 1,
    marginLeft: 8,
  },
  listContainer: {
    padding: 8,
  },
  gridCard: {
    flex: 1,
    margin: 8,
    maxWidth: '47%',
  },
  listCard: {
    margin: 8,
  },
  cardCover: {
    height: 120,
  },
  listCover: {
    width: 60,
    height: 60,
    borderRadius: 4,
  },
  cookTime: {
    marginTop: 4,
    color: '#666',
  },
  description: {
    marginTop: 8,
    color: '#666',
  },
}); 