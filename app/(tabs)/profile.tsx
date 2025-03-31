import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../hooks/useAuth';
import { router } from 'expo-router';
import { NotificationService } from '../../services/NotificationService';
import { UserService } from '../../services/UserService';
import { Card, Button, Avatar, Divider, Text as PaperText } from 'react-native-paper';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Creator } from '../../types/Creator';
import { Text } from '../../components/ui/Text';
import AuthService from '../../services/auth/AuthService';

interface DietaryPreference {
  id: string;
  name: string;
  enabled: boolean;
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreference[]>([
    { id: '1', name: 'Vegetarian', enabled: false },
    { id: '2', name: 'Vegan', enabled: false },
    { id: '3', name: 'Gluten-Free', enabled: false },
    { id: '4', name: 'Dairy-Free', enabled: false },
    { id: '5', name: 'Nut-Free', enabled: false },
  ]);
  const auth = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followedCreators, setFollowedCreators] = useState<Creator[]>([]);

  useEffect(() => {
    if (auth.user) {
      loadNotifications();
      loadFollowedCreators();
    }
  }, [auth.user]);

  const loadNotifications = async () => {
    if (!auth.user) return;
    const userNotifications = await NotificationService.getUserNotifications(auth.user.uid);
    setNotifications(userNotifications);
  };

  const handleNotificationPress = async (notificationId: string) => {
    await NotificationService.markNotificationAsRead(notificationId);
    loadNotifications();
  };

  const handleClearNotifications = async () => {
    if (!auth.user) return;
    await NotificationService.markAllNotificationsAsRead(auth.user.uid);
    loadNotifications();
  };

  const togglePreference = (id: string) => {
    setDietaryPreferences(prev =>
      prev.map(pref =>
        pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
      )
    );
  };

  const loadFollowedCreators = async () => {
    if (!auth.user) return;

    try {
      setLoading(true);
      const followedIds = await UserService.getFollowedCreators(auth.user.uid);
      
      if (followedIds.length > 0) {
        const creatorsSnapshot = await getDocs(
          query(collection(db, 'creators'), where('id', 'in', followedIds))
        );
        const creatorsData = creatorsSnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        })) as Creator[];
        setFollowedCreators(creatorsData);
      } else {
        setFollowedCreators([]);
      }
    } catch (error) {
      console.error('Error loading followed creators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollowCreator = async (creatorId: string) => {
    if (!auth.user) return;

    try {
      await UserService.unfollowCreator(auth.user.uid, creatorId);
      await loadFollowedCreators();
    } catch (error) {
      console.error('Error unfollowing creator:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await AuthService.getInstance().signOut();
      router.push('/(auth)/login' as never);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderCreator = (creator: Creator) => (
    <Card key={creator.id} style={styles.creatorCard}>
      <Card.Title
        title={creator.name}
        subtitle={`${creator.statistics.followers} followers`}
        left={props => (
          <Avatar.Image
            {...props}
            size={40}
            source={{ uri: creator.avatar || creator.profileImage }}
          />
        )}
      />
      <Card.Content>
        <PaperText>{creator.bio}</PaperText>
      </Card.Content>
      <Card.Actions>
        <Button
          mode="outlined"
          onPress={() => handleUnfollowCreator(creator.id)}
        >
          Unfollow
        </Button>
      </Card.Actions>
    </Card>
  );

  if (!auth.user) {
    return (
      <View style={styles.container}>
        <Text variant="heading2">Profile</Text>
        <Text variant="body" style={styles.message}>
          Sign in to manage your account and see your followed creators
        </Text>
        <Button mode="contained" onPress={() => router.push('/(auth)/login' as never)}>
          Sign In
        </Button>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          style={styles.avatar}
          source={auth.user.photoURL ? { uri: auth.user.photoURL } : require('../../assets/images/default-avatar.png')}
        />
        <View style={styles.userInfo}>
          <Text variant="heading3">{auth.user.displayName || 'User'}</Text>
          <Text variant="body" style={styles.email}>{auth.user.email}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="heading3">Account Management</Text>
        <Button
          mode="outlined"
          onPress={() => router.push('settings' as never)}
          style={styles.button}
        >
          Settings
        </Button>
        <Button
          mode="outlined"
          onPress={handleSignOut}
          style={styles.button}
        >
          Sign Out
        </Button>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text variant="heading3">Followed Creators</Text>
        {followedCreators.length === 0 ? (
          <Text variant="body" style={styles.message}>You haven't followed any creators yet</Text>
        ) : (
          followedCreators.map(renderCreator)
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  userInfo: {
    marginLeft: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  button: {
    marginBottom: 8,
  },
  divider: {
    marginVertical: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginVertical: 16,
  },
  creatorCard: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
}); 