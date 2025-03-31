import React from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  ViewStyle,
  StyleProp,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { Text } from './Text';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface TabItem {
  key: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  badge?: number;
}

export interface TabBarProps {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  style?: StyleProp<ViewStyle>;
}

export function TabBar({ items, activeKey, onChange, style }: TabBarProps) {
  const theme = useTheme();

  const getIconColor = (isActive: boolean) => {
    return isActive ? theme.colors.primary.default : theme.colors.text.secondary;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background.default,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border.light,
        },
        style,
      ]}
    >
      {items.map((item) => {
        const isActive = item.key === activeKey;

        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            style={({ pressed }) => [
              styles.tab,
              pressed && { backgroundColor: theme.colors.background.sage },
            ]}
          >
            <View style={styles.tabContent}>
              <MaterialCommunityIcons
                name={item.icon}
                size={24}
                color={getIconColor(isActive)}
              />
              <Text
                variant="caption"
                style={[
                  styles.label,
                  { color: getIconColor(isActive) },
                ]}
              >
                {item.label}
              </Text>
              {item.badge && (
                <View style={[styles.badge, { backgroundColor: theme.colors.primary.default }]}>
                  <Text variant="caption" style={[styles.badgeText, { color: theme.colors.background.default }]}>
                    {item.badge}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 64,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 4,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -12,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 12,
    lineHeight: 16,
  },
}); 