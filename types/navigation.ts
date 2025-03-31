export type RootStackParamList = {
  '(auth)': undefined;
  '(tabs)': undefined;
};

export type AuthStackParamList = {
  'login': undefined;
  'register': undefined;
};

export type TabStackParamList = {
  'feed': undefined;
  'creators': undefined;
  'collections': undefined;
  'profile': undefined;
};

declare module 'expo-router' {
  type PathParamList = {
    '/(auth)/login': undefined;
    '/(auth)/register': undefined;
    '/(tabs)/feed': undefined;
    '/(tabs)/creators': undefined;
    '/(tabs)/collections': undefined;
    '/(tabs)/profile': undefined;
  };
} 