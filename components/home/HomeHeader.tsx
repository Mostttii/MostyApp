import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { router } from 'expo-router';
import { Text } from '../ui';
import { useAuth } from '../../context/AuthContext';

export function HomeHeader() {
  const theme = useTheme();
  const { user } = useAuth();

  const handleSearchPress = () => {
    router.push('/modal/search' as any);
  };

  const handleNotificationsPress = () => {
    // For now, we'll just go back since notifications aren't implemented yet
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.default }]}>
      <View style={styles.leftSection}>
        <Image
          style={styles.avatar}
          source={user?.photoURL ? { uri: user.photoURL } : require('../../assets/images/default-avatar.png')}
        />
        <View style={styles.welcomeContainer}>
          <Text variant="body">Welcome back,</Text>
          <Text variant="heading3">{user?.displayName || 'Chef'}</Text>
        </View>
      </View>
      <View style={styles.rightSection}>
        <Pressable
          onPress={handleSearchPress}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && { backgroundColor: theme.colors.background.sage }
          ]}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={24}
            color={theme.colors.text.primary}
          />
        </Pressable>
        <Pressable
          onPress={handleNotificationsPress}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && { backgroundColor: theme.colors.background.sage }
          ]}
        >
          <MaterialCommunityIcons
            name="bell-outline"
            size={24}
            color={theme.colors.text.primary}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  welcomeContainer: {
    gap: 2,
  },
  rightSection: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
}); 