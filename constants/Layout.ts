import { Dimensions } from 'react-native';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

export const Layout = {
  // Window Dimensions
  window: {
    width: windowWidth,
    height: windowHeight,
  },

  // Spacing Scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border Radii
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 9999,
  },

  // Component Specific
  card: {
    minWidth: 160,
    maxWidth: '47%',
    aspectRatio: 3 / 4,
    spacing: 8,
    imageHeight: 120,
  },

  avatar: {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 80,
  },

  button: {
    height: {
      sm: 36,
      md: 44,
      lg: 52,
    },
    padding: {
      horizontal: {
        sm: 12,
        md: 16,
        lg: 20,
      },
    },
  },

  input: {
    height: 52,
    padding: {
      horizontal: 16,
      vertical: 12,
    },
  },

  // Grid System
  grid: {
    columns: {
      phone: 2,
      tablet: 3,
    },
    gutter: 16,
  },

  // Container
  container: {
    padding: 16,
    maxWidth: 1200,
  },

  // Shadow Styles
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 6,
    },
  },
}; 