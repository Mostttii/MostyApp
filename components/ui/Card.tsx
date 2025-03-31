import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ViewStyle,
  StyleProp,
  ViewProps,
  Pressable,
  Platform,
} from 'react-native';
import { useTheme, useThemeMode } from '../../context/ThemeContext';
import { Text } from './Text';

export interface CardProps extends ViewProps {
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

interface CardImageProps {
  source: { uri: string };
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

interface CardContentProps {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

interface CardTitleProps {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export function Card({
  onPress,
  variant = 'default',
  backgroundColor,
  style,
  children,
  ...props
}: CardProps) {
  const theme = useTheme();
  const { isDarkMode } = useThemeMode();
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;

  const getBackgroundColor = () => {
    if (backgroundColor) return backgroundColor;
    return variant === 'outlined' ? 'transparent' : colors.background.card;
  };

  const getBorderColor = () => {
    return variant === 'outlined' ? colors.border.default : 'transparent';
  };

  const getShadowStyle = () => {
    if (variant !== 'elevated') return {};

    return Platform.select({
      ios: {
        shadowColor: isDarkMode ? '#000000' : '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.4 : 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: isDarkMode
          ? '0px 2px 8px rgba(0, 0, 0, 0.4)'
          : '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
    });
  };

  const cardStyles = [
    styles.card,
    {
      backgroundColor: getBackgroundColor(),
      borderColor: getBorderColor(),
      borderWidth: variant === 'outlined' ? 1 : 0,
      borderRadius: theme.layout.borderRadius.lg,
      ...getShadowStyle(),
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          cardStyles,
          pressed && { opacity: 0.7 },
        ]}
        {...props}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={cardStyles} {...props}>
      {children}
    </View>
  );
}

Card.Image = function CardImage({ source, style, children }: CardImageProps) {
  const theme = useTheme();
  return (
    <ImageBackground
      source={source}
      style={[
        styles.image,
        { height: 200 },
        style
      ]}
      imageStyle={[
        styles.imageStyle,
        {
          borderTopLeftRadius: theme.layout.borderRadius.lg,
          borderTopRightRadius: theme.layout.borderRadius.lg,
        }
      ]}
    >
      {children}
    </ImageBackground>
  );
};

Card.Content = function CardContent({ style, children }: CardContentProps) {
  const theme = useTheme();
  return (
    <View style={[
      styles.content,
      { padding: theme.layout.spacing.md },
      style
    ]}>
      {children}
    </View>
  );
};

Card.Title = function CardTitle({ title, subtitle, left, right }: CardTitleProps) {
  const theme = useTheme();
  return (
    <View style={[
      styles.titleContainer,
      { paddingVertical: theme.layout.spacing.sm }
    ]}>
      <View style={styles.titleContent}>
        {left && (
          <View style={[
            styles.leftContainer,
            { marginRight: theme.layout.spacing.sm }
          ]}>
            {left}
          </View>
        )}
        <View style={styles.textContainer}>
          <Text variant="bodyMedium" numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text variant="caption" color={theme.colors.text.secondary} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {right && (
        <View style={[
          styles.rightContainer,
          { marginLeft: theme.layout.spacing.sm }
        ]}>
          {right}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    overflow: 'hidden',
  },
  imageStyle: {},
  content: {},
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftContainer: {},
  rightContainer: {},
  textContainer: {
    flex: 1,
  },
  card: {
    overflow: 'hidden',
  },
}); 