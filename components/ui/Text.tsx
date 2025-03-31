import React from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleSheet,
  StyleProp,
  TextStyle,
  Platform,
} from 'react-native';
import { useTheme, useThemeMode } from '../../context/ThemeContext';

type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'button'
  | 'overline';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  style?: StyleProp<TextStyle>;
  color?: string;
}

export function Text({
  variant = 'body1',
  weight = 'regular',
  style,
  color,
  children,
  ...props
}: TextProps) {
  const theme = useTheme();
  const { isDarkMode } = useThemeMode();
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;

  const getFontFamily = () => {
    switch (weight) {
      case 'bold':
        return Platform.select({
          ios: 'Inter-Bold',
          android: 'Inter-Bold',
          default: 'Inter-Bold',
        });
      case 'semibold':
        return Platform.select({
          ios: 'Inter-SemiBold',
          android: 'Inter-SemiBold',
          default: 'Inter-SemiBold',
        });
      case 'medium':
        return Platform.select({
          ios: 'Inter-Medium',
          android: 'Inter-Medium',
          default: 'Inter-Medium',
        });
      default:
        return Platform.select({
          ios: 'Inter-Regular',
          android: 'Inter-Regular',
          default: 'Inter-Regular',
        });
    }
  };

  const getVariantStyle = (): TextStyle => {
    switch (variant) {
      case 'h1':
        return {
          fontSize: theme.typography.fontSize['4xl'],
          lineHeight: theme.typography.lineHeight['4xl'],
          letterSpacing: -1,
        };
      case 'h2':
        return {
          fontSize: theme.typography.fontSize['3xl'],
          lineHeight: theme.typography.lineHeight['3xl'],
          letterSpacing: -0.5,
        };
      case 'h3':
        return {
          fontSize: theme.typography.fontSize['2xl'],
          lineHeight: theme.typography.lineHeight['2xl'],
          letterSpacing: -0.25,
        };
      case 'h4':
        return {
          fontSize: theme.typography.fontSize.xl,
          lineHeight: theme.typography.lineHeight.xl,
          letterSpacing: 0,
        };
      case 'body1':
        return {
          fontSize: theme.typography.fontSize.md,
          lineHeight: theme.typography.lineHeight.md,
          letterSpacing: 0.15,
        };
      case 'body2':
        return {
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
          letterSpacing: 0.25,
        };
      case 'caption':
        return {
          fontSize: theme.typography.fontSize.xs,
          lineHeight: theme.typography.lineHeight.xs,
          letterSpacing: 0.4,
        };
      case 'button':
        return {
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
          letterSpacing: 0.25,
          textTransform: 'uppercase',
        };
      case 'overline':
        return {
          fontSize: theme.typography.fontSize.xs,
          lineHeight: theme.typography.lineHeight.xs,
          letterSpacing: 1,
          textTransform: 'uppercase',
        };
      default:
        return {
          fontSize: theme.typography.fontSize.md,
          lineHeight: theme.typography.lineHeight.md,
          letterSpacing: 0.15,
        };
    }
  };

  const textStyles = [
    {
      color: color || colors.text.primary,
      fontFamily: getFontFamily(),
    },
    getVariantStyle(),
    style,
  ];

  return (
    <RNText style={textStyles} {...props}>
      {children}
    </RNText>
  );
}

// Predefined Text variants
export const Heading1 = (props: TextProps) => <Text variant="h1" {...props} />;
export const Heading2 = (props: TextProps) => <Text variant="h2" {...props} />;
export const Heading3 = (props: TextProps) => <Text variant="h3" {...props} />;
export const Body = (props: TextProps) => <Text variant="body1" {...props} />;
export const BodyMedium = (props: TextProps) => <Text variant="body2" {...props} />;
export const Caption = (props: TextProps) => <Text variant="caption" {...props} />;
export const CaptionMedium = (props: TextProps) => <Text variant="caption" {...props} />;
export const Small = (props: TextProps) => <Text variant="caption" {...props} />;
export const TextButton = (props: TextProps) => <Text variant="button" {...props} />; 