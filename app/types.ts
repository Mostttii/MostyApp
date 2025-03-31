declare global {
  namespace ReactNavigation {
    interface RootParamList {
      '/(auth)/login': undefined;
      '/(auth)/register': undefined;
      '/(tabs)': undefined;
      '/(tabs)/creators': undefined;
      '/(tabs)/recipes': undefined;
      '/(tabs)/profile': undefined;
      '/creator/[id]': { id: string };
    }
  }
}

export type AppRoutes = keyof ReactNavigation.RootParamList;

export type DynamicRoutes = {
  '/creator/[id]': (id: string) => `/creator/${string}`;
};

export {}; 