import { AppRoutes, DynamicRoutes } from '../app/types';

type StaticRoutes = Exclude<AppRoutes, keyof DynamicRoutes>;

export const ROUTES = {
  AUTH: {
    LOGIN: '/(auth)/login' as StaticRoutes,
    REGISTER: '/(auth)/register' as StaticRoutes,
  },
  TABS: {
    FEED: '/(tabs)' as StaticRoutes,
    CREATORS: '/(tabs)/creators' as StaticRoutes,
    RECIPES: '/(tabs)/recipes' as StaticRoutes,
    PROFILE: '/(tabs)/profile' as StaticRoutes,
  },
  CREATOR: {
    PROFILE: (id: string) => `/creator/${id}` as const,
  },
} as const; 