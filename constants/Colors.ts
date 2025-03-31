/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#4ECDC4';
const tintColorDark = '#4ECDC4';

export const Colors = {
  // Brand Colors
  primary: {
    light: '#E07A5F',
    default: '#E94E35',
    gradient: ['#E07A5F', '#E94E35'],
  },
  background: {
    default: '#FFFFFF',
    cream: '#F7F3E9',
    sage: '#ECF1EA',
  },
  text: {
    primary: '#3D405B',
    secondary: '#666666',
    light: '#999999',
  },
  // Status Colors
  difficulty: {
    easy: '#9EDEB5',
    medium: '#F2CC8F',
    hard: '#F5A7A7',
  },
  // UI States
  border: {
    light: '#E2E2E2',
    default: '#D1D1D1',
  },
  state: {
    active: '#E94E35',
    inactive: '#ECF1EA',
    error: '#FF4D4D',
    success: '#4CAF50',
  },
  // Component Specific
  card: {
    background: '#FFFFFF',
    shadow: 'rgba(0, 0, 0, 0.08)',
  },
  button: {
    primary: '#E94E35',
    secondary: '#FFFFFF',
    disabled: '#ECF1EA',
  },
  input: {
    background: '#FFFFFF',
    border: '#E2E2E2',
    focus: '#E94E35',
  },
  // Utility
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
};
