import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Theme } from '../../constants/Theme';
import { Text } from '../ui';

export function Header() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text variant="appName" style={styles.logo}>Recipe Hubtopia</Text>
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.iconButton,
          pressed && styles.iconButtonPressed
        ]}
        onPress={() => router.push('/(tabs)/notifications')}
      >
        <MaterialCommunityIcons
          name="bell-outline"
          size={24}
          color={Theme.colors.text.primary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.layout.spacing.md,
    paddingVertical: Theme.layout.spacing.sm,
    backgroundColor: Theme.colors.background.default,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.light,
  },
  logoContainer: {
    flex: 1,
  },
  logo: {
    color: Theme.colors.primary.default,
  },
  iconButton: {
    padding: Theme.layout.spacing.xs,
    borderRadius: Theme.layout.borderRadius.round,
  },
  iconButtonPressed: {
    backgroundColor: Theme.colors.background.sage,
  },
}); 