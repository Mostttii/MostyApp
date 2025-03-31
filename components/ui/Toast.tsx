import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
  Pressable,
  Platform,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, useThemeMode } from '../../context/ThemeContext';
import { Text } from './Text';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss?: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
  style?: StyleProp<ViewStyle>;
}

export function Toast({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onDismiss,
  action,
  style,
}: ToastProps) {
  const theme = useTheme();
  const { isDarkMode } = useThemeMode();
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      if (duration > 0) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, duration);

        return () => clearTimeout(timer);
      }
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'check-circle' as IconName,
          color: colors.status.success,
          backgroundColor: colors.status.success + '15',
        };
      case 'error':
        return {
          icon: 'alert-circle' as IconName,
          color: colors.status.error,
          backgroundColor: colors.status.error + '15',
        };
      case 'warning':
        return {
          icon: 'alert' as IconName,
          color: colors.status.warning,
          backgroundColor: colors.status.warning + '15',
        };
      default:
        return {
          icon: 'information' as IconName,
          color: colors.primary.default,
          backgroundColor: colors.primary.default + '15',
        };
    }
  };

  const typeConfig = getTypeConfig();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.background.default,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
            },
            android: {
              elevation: 4,
            },
          }),
        },
        {
          transform: [{ translateY }],
          opacity,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.content,
          {
            backgroundColor: typeConfig.backgroundColor,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={typeConfig.icon}
          size={24}
          color={typeConfig.color}
          style={styles.icon}
        />
        <Text
          variant="body2"
          style={[
            styles.message,
            { color: colors.text.primary },
          ]}
        >
          {message}
        </Text>
        {action && (
          <Pressable
            onPress={action.onPress}
            style={({ pressed }) => [
              styles.action,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text
              variant="button"
              style={{ color: colors.primary.default }}
            >
              {action.label}
            </Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    marginRight: 8,
  },
  action: {
    marginLeft: 16,
  },
}); 