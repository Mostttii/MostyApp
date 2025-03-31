export interface Collection {
  id: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  userId: string;
  recipes: string[]; // Array of recipe IDs
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_COLLECTIONS = [
  {
    name: 'Favorites',
    description: 'Your favorite recipes',
    color: '#FF6B6B',
    isDefault: true,
  },
  {
    name: 'Recently Cooked',
    description: 'Recipes you\'ve cooked recently',
    color: '#4ECDC4',
    isDefault: true,
  },
  {
    name: 'Want to Try',
    description: 'Recipes you want to try',
    color: '#FFD93D',
    isDefault: true,
  },
] as const; 