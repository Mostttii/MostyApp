import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useTheme, useThemeMode } from '../../context/ThemeContext';
import { Text } from './Text';

interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  disabled?: boolean;
  label?: string;
  showValue?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Slider({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  disabled = false,
  label,
  showValue = false,
  style,
}: SliderProps) {
  const theme = useTheme();
  const { isDarkMode } = useThemeMode();
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
  const width = useSharedValue(0);
  const translateX = useSharedValue(0);
  const isPressed = useSharedValue(false);

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      width.value = event.nativeEvent.layout.width;
      const progress = (value - minimumValue) / (maximumValue - minimumValue);
      translateX.value = progress * width.value;
    },
    [value, minimumValue, maximumValue]
  );

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: { startX: number }) => {
      ctx.startX = translateX.value;
      isPressed.value = true;
    },
    onActive: (event, ctx) => {
      const newTranslateX = Math.min(
        Math.max(ctx.startX + event.translationX, 0),
        width.value
      );
      translateX.value = newTranslateX;

      const progress = newTranslateX / width.value;
      const newValue =
        minimumValue + Math.round((maximumValue - minimumValue) * progress / step) * step;
      runOnJS(onValueChange)(newValue);
    },
    onEnd: () => {
      isPressed.value = false;
    },
  });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value - 12 }],
    backgroundColor: isPressed.value
      ? colors.primary.dark
      : colors.primary.default,
    opacity: disabled ? 0.5 : 1,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: translateX.value,
    backgroundColor: disabled
      ? colors.primary.light
      : colors.primary.default,
  }));

  return (
    <View style={[styles.container, style]}>
      {(label || showValue) && (
        <View style={styles.header}>
          {label && (
            <Text
              variant="body2"
              style={[
                styles.label,
                { color: disabled ? colors.text.disabled : colors.text.secondary },
              ]}
            >
              {label}
            </Text>
          )}
          {showValue && (
            <Text
              variant="body2"
              style={{
                color: disabled ? colors.text.disabled : colors.text.primary,
              }}
            >
              {value}
            </Text>
          )}
        </View>
      )}
      <View
        style={[
          styles.track,
          {
            backgroundColor: colors.border.light,
            height: 4,
            borderRadius: 2,
          },
        ]}
        onLayout={onLayout}
      >
        <Animated.View
          style={[
            styles.progress,
            {
              height: 4,
              borderRadius: 2,
            },
            progressStyle,
          ]}
        />
        <PanGestureHandler onGestureEvent={gestureHandler} enabled={!disabled}>
          <Animated.View
            style={[
              styles.thumb,
              {
                width: 24,
                height: 24,
                borderRadius: 12,
                ...Platform.select({
                  ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 3,
                  },
                  android: {
                    elevation: 3,
                  },
                }),
              },
              thumbStyle,
            ]}
          />
        </PanGestureHandler>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    flex: 1,
    marginRight: 8,
  },
  track: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progress: {
    position: 'absolute',
    left: 0,
    height: 4,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    top: -10,
    left: 0,
  },
}); 