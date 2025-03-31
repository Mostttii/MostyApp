import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { ContentItem } from '../services/ContentService';
import { format } from 'date-fns';

interface ContentCardProps {
  item: ContentItem;
  onPress: (item: ContentItem) => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({ item, onPress }) => {
  const formattedDate = format(item.publishedAt.toDate(), 'MMM d, yyyy');
  
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress(item)}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: item.thumbnail }} 
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Image 
            source={{ uri: item.creatorAvatar }} 
            style={styles.avatar}
          />
          <View style={styles.headerText}>
            <Text style={styles.creatorName}>{item.creatorName}</Text>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
        </View>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
        <View style={styles.footer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item.type}</Text>
          </View>
          {item.metadata?.estimatedTime && (
            <Text style={styles.readTime}>{item.metadata.estimatedTime} min read</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  headerText: {
    flex: 1,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  date: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#4a4a4a',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#666666',
    textTransform: 'capitalize',
  },
  readTime: {
    fontSize: 12,
    color: '#666666',
  },
}); 