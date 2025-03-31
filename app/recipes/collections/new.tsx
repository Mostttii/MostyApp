import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, useThemeMode } from '../../../context/ThemeContext';
import { Text } from '../../../components/ui/Text';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useCollections } from '../../../hooks/useCollections';
import { Toast } from '../../../components/ui/Toast';

export default function NewCollectionScreen() {
  const theme = useTheme();
  const { isDarkMode } = useThemeMode();
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [showToast, setShowToast] = useState(false);
  
  const { createCollection } = useCollections();

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Please enter a collection name');
      return;
    }

    try {
      setLoading(true);
      setError(undefined);
      
      await createCollection({
        name: name.trim(),
        description: description.trim(),
        recipes: [],
      });

      setShowToast(true);
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create collection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.default }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="h1" style={styles.title}>
          New Collection
        </Text>
        
        <View style={styles.form}>
          <Input
            label="Name"
            placeholder="Enter collection name"
            value={name}
            onChangeText={setName}
            error={error}
            maxLength={50}
            style={styles.input}
          />
          
          <Input
            label="Description (Optional)"
            placeholder="Enter collection description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            maxLength={200}
            style={styles.input}
          />
        </View>

        <View style={styles.actions}>
          <Button
            variant="outline"
            style={styles.button}
            onPress={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            style={styles.button}
            onPress={handleCreate}
            isLoading={loading}
          >
            Create Collection
          </Button>
        </View>
      </ScrollView>

      <Toast
        visible={showToast}
        message="Collection created successfully!"
        type="success"
        onDismiss={() => setShowToast(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  input: {
    width: '100%',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  button: {
    minWidth: 120,
  },
}); 