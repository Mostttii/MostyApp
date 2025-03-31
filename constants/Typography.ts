import { Platform } from 'react-native';

// Font families
const fontConfig = {
  inter: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semibold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
  workSans: {
    regular: 'WorkSans-Regular',
    medium: 'WorkSans-Medium',
    semibold: 'WorkSans-SemiBold',
    bold: 'WorkSans-Bold',
  },
  satoshi: {
    regular: 'Satoshi-Regular',
    medium: 'Satoshi-Medium',
    semibold: 'Satoshi-SemiBold',
    bold: 'Satoshi-Bold',
  },
  system: {
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      default: 'System',
    }),
    semibold: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'Roboto-Bold',
      default: 'System',
    }),
  },
};

// Use system fonts as fallback until custom fonts are loaded
const fonts = fontConfig.system;

export const Typography = {
  // Font Families
  fonts,

  // Font Sizes
  sizes: {
    h1: 32, // Large titles
    h2: 28, // Section headers
    h3: 24, // Sub-section headers
    h4: 22, // Card titles
    h5: 18, // Small headers
    body: 16, // Body text
    caption: 14, // Labels, metadata
    small: 13, // Helper text
    tiny: 12, // Very small text
  },

  // Line Heights (1.5x font size as per spec)
  lineHeights: {
    h1: 48,
    h2: 42,
    h3: 36,
    h4: 33,
    h5: 27,
    body: 24,
    caption: 21,
    small: 20,
    tiny: 18,
  },

  // Letter Spacing
  letterSpacing: {
    tight: -0.24,
    normal: 0,
    wide: 0.24,
    extraWide: 0.5,
  },

  // Predefined Text Styles
  styles: {
    // Headers
    heading1: {
      fontSize: 32,
      fontFamily: fonts.bold,
      lineHeight: 48,
      letterSpacing: -0.24,
    },
    heading2: {
      fontSize: 28,
      fontFamily: fonts.bold,
      lineHeight: 42,
      letterSpacing: -0.24,
    },
    heading3: {
      fontSize: 24,
      fontFamily: fonts.semibold,
      lineHeight: 36,
    },
    heading4: {
      fontSize: 22,
      fontFamily: fonts.semibold,
      lineHeight: 33,
    },
    heading5: {
      fontSize: 18,
      fontFamily: fonts.medium,
      lineHeight: 27,
    },

    // Body text
    body: {
      fontSize: 16,
      fontFamily: fonts.regular,
      lineHeight: 24,
    },
    bodyMedium: {
      fontSize: 16,
      fontFamily: fonts.medium,
      lineHeight: 24,
    },
    bodySemibold: {
      fontSize: 16,
      fontFamily: fonts.semibold,
      lineHeight: 24,
    },

    // Supporting text
    caption: {
      fontSize: 14,
      fontFamily: fonts.regular,
      lineHeight: 21,
    },
    captionMedium: {
      fontSize: 14,
      fontFamily: fonts.medium,
      lineHeight: 21,
    },
    small: {
      fontSize: 13,
      fontFamily: fonts.regular,
      lineHeight: 20,
    },
    smallMedium: {
      fontSize: 13,
      fontFamily: fonts.medium,
      lineHeight: 20,
    },
    tiny: {
      fontSize: 12,
      fontFamily: fonts.regular,
      lineHeight: 18,
    },

    // Interactive elements
    button: {
      fontSize: 16,
      fontFamily: fonts.medium,
      lineHeight: 24,
      letterSpacing: 0.24,
    },
    buttonSmall: {
      fontSize: 14,
      fontFamily: fonts.medium,
      lineHeight: 21,
      letterSpacing: 0.24,
    },
    link: {
      fontSize: 16,
      fontFamily: fonts.medium,
      lineHeight: 24,
      letterSpacing: 0.24,
      textDecorationLine: 'underline',
    },
  },
};

export type TypographyStyles = keyof typeof Typography.styles; 