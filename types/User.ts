export interface UserPreferences {
  notificationSettings: {
    pushEnabled: boolean;
    emailEnabled: boolean;
    contentTypes: string[];
  };
  unitsPreference: 'imperial' | 'metric';
  themePreference: 'light' | 'dark' | 'system';
}

export interface UserStatistics {
  recipesSaved: number;
  collectionsCreated: number;
  estimatedCookCount: number;
}

export interface User {
  id: string;
  displayName: string;
  email: string;
  profileImage?: string;
  preferences: {
    notificationSettings: {
      pushEnabled: boolean;
      emailEnabled: boolean;
      contentTypes: ('recipes' | 'creators')[];
    };
    unitsPreference: 'metric' | 'imperial';
    themePreference: 'light' | 'dark' | 'system';
  };
  followedCreators: string[]; // Array of creator IDs
  statistics: {
    recipesSaved: number;
    collectionsCreated: number;
    estimatedCookCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
} 