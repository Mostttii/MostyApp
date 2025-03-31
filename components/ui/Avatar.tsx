import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  ViewProps,
  StyleProp,
  ViewStyle,
  ImageStyle,
  ImageSourcePropType,
} from 'react-native';
import { useTheme, useThemeMode } from '../../context/ThemeContext';
import { Text } from './Text';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarVariant = 'circle' | 'rounded' | 'square';

interface AvatarProps extends ViewProps {
  size?: AvatarSize;
  variant?: AvatarVariant;
  source?: ImageSourcePropType;
  name?: string;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
}

export function Avatar({
  size = 'md',
  variant = 'circle',
  source,
  name,
  style,
  imageStyle,
  ...props
}: AvatarProps) {
  const theme = useTheme();
  const { isDarkMode } = useThemeMode();
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;

  const getSize = () => {
    switch (size) {
      case 'xs':
        return 24;
      case 'sm':
        return 32;
      case 'lg':
        return 48;
      case 'xl':
        return 64;
      default:
        return 40;
    }
  };

  const getBorderRadius = () => {
    const avatarSize = getSize();
    switch (variant) {
      case 'circle':
        return avatarSize / 2;
      case 'rounded':
        return theme.layout.borderRadius.lg;
      default:
        return 0;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'xs':
        return theme.typography.fontSize.xs;
      case 'sm':
        return theme.typography.fontSize.sm;
      case 'lg':
        return theme.typography.fontSize.lg;
      case 'xl':
        return theme.typography.fontSize.xl;
      default:
        return theme.typography.fontSize.md;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarSize = getSize();
  const borderRadius = getBorderRadius();

  const containerStyles = [
    styles.container,
    {
      width: avatarSize,
      height: avatarSize,
      borderRadius,
      backgroundColor: source ? 'transparent' : colors.background.card,
    },
    style,
  ];

  const imageStyles = [
    styles.image,
    {
      width: avatarSize,
      height: avatarSize,
      borderRadius,
    },
    imageStyle,
  ];

  return (
    <View style={containerStyles} {...props}>
      {source ? (
        <Image source={source} style={imageStyles} />
      ) : name ? (
        <Text
          style={[
            styles.initials,
            {
              fontSize: getFontSize(),
              color: colors.text.secondary,
            },
          ]}
        >
          {getInitials(name)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontWeight: '600',
  },
}); 