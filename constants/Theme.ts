import { Colors } from './Colors';
import { Typography } from './Typography';
import { Layout } from './Layout';
import { Platform } from 'react-native';

// Animation durations
export const ANIMATION = {
  fast: 200,
  normal: 300,
  slow: 500,
};

// Utility function to create linear gradient stops
export const createGradient = (direction: 'vertical' | 'horizontal' = 'horizontal') => {
  return {
    colors: Colors.primary.gradient,
    start: direction === 'horizontal' ? { x: 0, y: 0 } : { x: 0, y: 0 },
    end: direction === 'horizontal' ? { x: 1, y: 0 } : { x: 0, y: 1 },
  };
};

// Utility function to get difficulty style
export const getDifficultyStyle = (level: 'easy' | 'medium' | 'hard') => {
  const color = Colors.difficulty[level];
  return {
    backgroundColor: `${color}20`, // 20% opacity
    color: color,
  };
};

// Common style mixins
export const StyleMixins = {
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  center: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  card: {
    backgroundColor: '#FAF9F6',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  touchableArea: {
    minWidth: 44,
    minHeight: 44,
  },
};

// Theme object that combines all design system elements
export const Theme = {
  colors: {
    light: {
      primary: {
        default: '#FF6B6B',
        light: '#FF8787',
        dark: '#FF4949',
      },
      background: {
        default: '#FFFFFF',
        card: '#FAF9F6',
        cream: '#FFF5E6',
        sage: '#E8F3D6',
        mint: '#E0F5E9',
        blush: '#FFE9E9',
        cornflower: '#E6F0FF',
      },
      text: {
        primary: '#1A1A1A',
        secondary: '#4A4A4A',
        light: '#767676',
        disabled: '#A1A1A1',
      },
      border: {
        default: '#E0E0E0',
        light: '#F0F0F0',
        dark: '#CCCCCC',
      },
      status: {
        success: '#4CAF50',
        warning: '#FFC107',
        error: '#F44336',
        info: '#2196F3',
      },
      difficulty: {
        beginner: '#4CAF50',
        intermediate: '#FFC107',
        advanced: '#F44336',
      },
    },
    dark: {
      primary: {
        default: '#FF6B6B',
        light: '#FF8787',
        dark: '#FF4949',
      },
      background: {
        default: '#121212',
        card: '#1E1E1E',
        cream: '#2A2520',
        sage: '#1F2A1A',
        mint: '#1A2A20',
        blush: '#2A1A1A',
        cornflower: '#1A202A',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#B0B0B0',
        light: '#808080',
        disabled: '#595959',
      },
      border: {
        default: '#333333',
        light: '#404040',
        dark: '#262626',
      },
      status: {
        success: '#4CAF50',
        warning: '#FFC107',
        error: '#F44336',
        info: '#2196F3',
      },
      difficulty: {
        beginner: '#4CAF50',
        intermediate: '#FFC107',
        advanced: '#F44336',
      },
    },
    overlay: 'rgba(45, 42, 38, 0.4)', // based on text.primary
  },
  typography: {
    fontFamily: {
      inter: Platform.select({
        ios: 'Inter',
        android: 'Inter-Regular',
        default: 'Inter',
      }),
      workSans: Platform.select({
        ios: 'Work Sans',
        android: 'WorkSans-Regular',
        default: 'Work Sans',
      }),
      satoshi: Platform.select({
        ios: 'Satoshi',
        android: 'Satoshi-Regular',
        default: 'Satoshi',
      }),
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
    },
    lineHeight: {
      xs: 18,
      sm: 21,
      md: 24,
      lg: 27,
      xl: 30,
      '2xl': 36,
      '3xl': 45,
      '4xl': 54,
    },
  },
  layout: {
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      '2xl': 48,
      '3xl': 64,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      full: 9999,
    },
    button: {
      height: {
        sm: 32,
        md: 40,
        lg: 48,
      },
    },
    icon: {
      sm: 16,
      md: 24,
      lg: 32,
    },
    bottomBar: {
      height: 64,
    },
    card: {
      spacing: 16,
      imageRatio: 16 / 9,
    },
  },
  mixins: StyleMixins,
  animation: ANIMATION,
  utils: {
    createGradient,
    getDifficultyStyle,
  },
};

// Type definitions for theme
export type ThemeColors = typeof Theme.colors;
export type ThemeTypography = typeof Typography;
export type ThemeLayout = typeof Theme.layout;
export type ThemeMixins = typeof StyleMixins;

// Default export
export default Theme; 