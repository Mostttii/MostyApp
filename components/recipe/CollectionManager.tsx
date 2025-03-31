import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Collection } from '../../types/Collection';
import { CollectionService } from '../../services/CollectionService';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onSelectCollection?: (collectionId: string) => void;
  selectedCollectionId?: string;
  mode?: 'select' | 'manage';
}

export default function CollectionManager({ 
  onSelectCollection,
  selectedCollectionId,
  mode = 'manage'
}: Props) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const userCollections = await CollectionService.getUserCollections(user.uid);
      setCollections(userCollections);
    } catch (error) {
      Alert.alert('Error', 'Failed to load collections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!user) return;
    if (!newCollectionName.trim()) {
      Alert.alert('Error', 'Please enter a collection name');
      return;
    }

    try {
      await CollectionService.createCollection(
        newCollectionName.trim(),
        newCollectionDescription.trim() || undefined,
        undefined,
        user
      );
      setShowCreateModal(false);
      setNewCollectionName('');
      setNewCollectionDescription('');
      loadCollections();
    } catch (error) {
      Alert.alert('Error', 'Failed to create collection');
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    if (!user) return;

    Alert.alert(
      'Delete Collection',
      'Are you sure you want to delete this collection? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await CollectionService.deleteCollection(collectionId, user.uid);
              loadCollections();
            } catch (error) {
              if (error instanceof Error && error.message.includes('default')) {
                Alert.alert('Error', 'Cannot delete default collections');
              } else {
                Alert.alert('Error', 'Failed to delete collection');
              }
            }
          },
        },
      ]
    );
  };

  const renderCollection = (collection: Collection) => (
    <TouchableOpacity
      key={collection.id}
      style={[
        styles.collectionItem,
        selectedCollectionId === collection.id && styles.selectedCollection,
        { backgroundColor: collection.color || '#f8f8f8' },
      ]}
      onPress={() => onSelectCollection?.(collection.id)}
    >
      <View style={styles.collectionContent}>
        <Text style={styles.collectionName}>{collection.name}</Text>
        {collection.description && (
          <Text style={styles.collectionDescription}>{collection.description}</Text>
        )}
      </View>
      {mode === 'manage' && !collection.isDefault && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteCollection(collection.id)}
        >
          <FontAwesome name="trash" size={16} color="#FF6B6B" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {mode === 'manage' && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <FontAwesome name="plus" size={16} color="#fff" />
          <Text style={styles.createButtonText}>Create Collection</Text>
        </TouchableOpacity>
      )}

      <ScrollView style={styles.collectionsList}>
        {collections.map(renderCollection)}
      </ScrollView>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Collection</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Collection Name"
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              maxLength={50}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={newCollectionDescription}
              onChangeText={setNewCollectionDescription}
              multiline
              maxLength={200}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.createModalButton]}
                onPress={handleCreateCollection}
              >
                <Text style={styles.createModalButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  createButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  collectionsList: {
    flex: 1,
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f8f8f8',
  },
  selectedCollection: {
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  collectionContent: {
    flex: 1,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  collectionDescription: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f8f8f8',
  },
  cancelButtonText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  createModalButton: {
    backgroundColor: '#4ECDC4',
  },
  createModalButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
}); 