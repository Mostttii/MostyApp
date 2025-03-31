import React from 'react';
import {
  Pressable,
  StyleSheet,
  ViewProps,
  StyleProp,
  ViewStyle,
  Animated,
  Platform,
} from 'react-native';
import { useTheme, useThemeMode } from '../../context/ThemeContext';

interface SwitchProps extends ViewProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
}

export function Switch({
  value,
  onValueChange,
  disabled = false,
  size = 'md',
  style,
  ...props
}: SwitchProps) {
  const theme = useTheme();
  const { isDarkMode } = useThemeMode();
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;

  const [animatedValue] = React.useState(new Animated.Value(value ? 1 : 0));

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: theme.animation.normal,
      useNativeDriver: false,
    }).start();
  }, [value, animatedValue]);

  const getTrackSize = () => {
    switch (size) {
      case 'sm':
        return {
          width: 32,
          height: 18,
        };
      case 'lg':
        return {
          width: 52,
          height: 28,
        };
      default:
        return {
          width: 44,
          height: 24,
        };
    }
  };

  const getThumbSize = () => {
    switch (size) {
      case 'sm':
        return 14;
      case 'lg':
        return 24;
      default:
        return 20;
    }
  };

  const getTrackColor = () => {
    if (disabled) {
      return value ? colors.border.light : colors.border.default;
    }
    return value ? colors.primary.default : colors.border.default;
  };

  const getThumbColor = () => {
    if (disabled) {
      return value ? colors.border.light : colors.border.default;
    }
    return '#FFFFFF';
  };

  const trackSize = getTrackSize();
  const thumbSize = getThumbSize();
  const thumbOffset = trackSize.height - thumbSize - 2;

  const animatedTrackStyle = {
    backgroundColor: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.border.default, colors.primary.default],
    }),
  };

  const animatedThumbStyle = {
    transform: [
      {
        translateX: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [2, trackSize.width - thumbSize - 2],
        }),
      },
    ],
  };

  return (
    <Pressable
      style={[style, { opacity: disabled ? 0.6 : 1 }]}
      onPress={() => !disabled && onValueChange(!value)}
      {...props}
    >
      <Animated.View
        style={[
          styles.track,
          {
            width: trackSize.width,
            height: trackSize.height,
            borderRadius: trackSize.height / 2,
          },
          animatedTrackStyle,
          Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            android: {
              elevation: 2,
            },
          }),
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              backgroundColor: getThumbColor(),
            },
            animatedThumbStyle,
            Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              },
              android: {
                elevation: 4,
              },
            }),
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
  },
}); 