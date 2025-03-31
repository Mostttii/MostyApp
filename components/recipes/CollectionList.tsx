import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Card, Text, ActivityIndicator } from 'react-native-paper';
import { Collection } from '../../types/Collection';

interface CollectionListProps {
  collections: Collection[];
  viewMode: 'grid' | 'list';
  onSelect: (collection: Collection) => void;
  loading: boolean;
}

export function CollectionList({
  collections,
  viewMode,
  onSelect,
  loading,
}: CollectionListProps) {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const renderGridItem = ({ item }: { item: Collection }) => (
    <Card
      style={styles.gridCard}
      onPress={() => onSelect(item)}
    >
      {item.coverImageUrl && (
        <Card.Cover source={{ uri: item.coverImageUrl }} style={styles.cardCover} />
      )}
      <Card.Content>
        <Text variant="titleMedium" numberOfLines={1}>
          {item.name}
        </Text>
        <Text variant="bodySmall" style={styles.recipeCount}>
          {item.recipes.length} recipes
        </Text>
        {item.description && (
          <Text variant="bodySmall" numberOfLines={2} style={styles.description}>
            {item.description}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  const renderListItem = ({ item }: { item: Collection }) => (
    <Card
      style={styles.listCard}
      onPress={() => onSelect(item)}
    >
      <Card.Title
        title={item.name}
        subtitle={`${item.recipes.length} recipes`}
        left={props =>
          item.coverImageUrl ? (
            <Card.Cover
              {...props}
              source={{ uri: item.coverImageUrl }}
              style={styles.listCover}
            />
          ) : null
        }
      />
    </Card>
  );

  return (
    <FlatList
      data={collections}
      renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
      keyExtractor={item => item.id}
      numColumns={viewMode === 'grid' ? 2 : 1}
      key={viewMode} // Force re-render when view mode changes
      contentContainerStyle={styles.listContainer}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  recipeCount: {
    marginTop: 4,
    color: '#666',
  },
  description: {
    marginTop: 8,
    color: '#666',
  },
}); 