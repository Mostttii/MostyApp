import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { Text } from './Text';

export interface ProgressBarProps {
  progress?: number;
  indeterminate?: boolean;
  showPercentage?: boolean;
  height?: number;
  containerStyle?: StyleProp<ViewStyle>;
  color?: string;
  label?: string;
}

export function ProgressBar({
  progress = 0,
  indeterminate = false,
  showPercentage = false,
  height = 8,
  containerStyle,
  color,
  label,
}: ProgressBarProps) {
  const theme = useTheme();
  const progressWidth = useSharedValue(0);
  const translateX = useSharedValue(-1);

  const progressColor = color || theme.colors.primary.default;

  useEffect(() => {
    if (indeterminate) {
      translateX.value = withRepeat(
        withSequence(
          withTiming(-1, { duration: 0 }),
          withTiming(1, { duration: 1000 }),
        ),
        -1,
        false
      );
    } else {
      progressWidth.value = withSpring(progress, {
        damping: 15,
        stiffness: 100,
      });
    }
  }, [progress, indeterminate]);

  const progressStyle = useAnimatedStyle(() => ({
    width: indeterminate ? '100%' : `${progressWidth.value * 100}%`,
    transform: indeterminate ? [{ translateX: translateX.value * 100 }] : undefined,
  }));

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={[
          styles.labelContainer,
          { marginBottom: theme.layout.spacing.xs }
        ]}>
          <Text variant="caption" color={theme.colors.text.secondary}>
            {label}
          </Text>
          {showPercentage && !indeterminate && (
            <Text variant="caption" color={theme.colors.text.secondary}>
              {`${Math.round(progress * 100)}%`}
            </Text>
          )}
        </View>
      )}
      <View
        style={[
          styles.track,
          {
            height,
            backgroundColor: theme.colors.background.sage,
          }
        ]}
      >
        <Animated.View
          style={[
            styles.progress,
            { backgroundColor: progressColor },
            progressStyle,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  track: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 999,
  },
}); 