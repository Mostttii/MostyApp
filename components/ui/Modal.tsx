import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
  Pressable,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Text } from './Text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  showCloseButton?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export function Modal({
  visible,
  onClose,
  title,
  showCloseButton = true,
  contentStyle,
  children,
}: ModalProps) {
  const { height: SCREEN_HEIGHT } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 200,
      });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withSpring(SCREEN_HEIGHT, {
        damping: 20,
        stiffness: 200,
      });
    }
  }, [visible, SCREEN_HEIGHT]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleBackdropPress = () => {
    onClose();
  };

  return (
    <View style={[
      StyleSheet.absoluteFill,
      styles.wrapper,
      !visible && styles.hidden
    ]}>
      <AnimatedPressable
        style={[styles.backdrop, backdropStyle]}
        onPress={handleBackdropPress}
      />
      <Animated.View
        style={[
          styles.container,
          {
            paddingBottom: insets.bottom,
            backgroundColor: theme.colors.background.default,
            borderTopLeftRadius: theme.layout.borderRadius.lg,
            borderTopRightRadius: theme.layout.borderRadius.lg,
            maxHeight: '90%',
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              },
              android: {
                elevation: 4,
              },
            }),
          },
          containerStyle,
          contentStyle,
        ]}
      >
        {(title || showCloseButton) && (
          <View style={[
            styles.header,
            {
              borderBottomColor: theme.colors.border.light,
              paddingHorizontal: theme.layout.spacing.md,
              paddingTop: theme.layout.spacing.md,
              paddingBottom: theme.layout.spacing.sm,
            }
          ]}>
            {title && (
              <Text variant="heading3" style={styles.title}>
                {title}
              </Text>
            )}
            {showCloseButton && (
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.closeButton,
                  {
                    padding: theme.layout.spacing.xs,
                    borderRadius: theme.layout.borderRadius.round,
                  },
                  pressed && {
                    backgroundColor: theme.colors.background.sage,
                  }
                ]}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={theme.colors.text.secondary}
                />
              </Pressable>
            )}
          </View>
        )}
        <View style={[
          styles.content,
          {
            paddingHorizontal: theme.layout.spacing.md,
            paddingVertical: theme.layout.spacing.md,
          }
        ]}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  hidden: {
    display: 'none',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: Theme.colors.background.default,
    borderTopLeftRadius: Theme.layout.borderRadius.lg,
    borderTopRightRadius: Theme.layout.borderRadius.lg,
    maxHeight: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  title: {
    flex: 1,
  },
  closeButton: {
    padding: Theme.layout.spacing.xs,
    borderRadius: Theme.layout.borderRadius.round,
  },
  closeButtonPressed: {
    backgroundColor: Theme.colors.background.sage,
  },
  content: {
    flex: 1,
  },
}); 