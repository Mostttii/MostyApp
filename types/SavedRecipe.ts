export interface SavedRecipe {
  id: string;
  recipeId: string;
  userId: string;
  collections: string[]; // Array of collection IDs
  notes?: string;
  rating?: number;
  cookHistory: {
    lastCooked?: Date;
    timesCooked: number;
    servingsSizes: number[];
  };
  customizations?: {
    servings?: number;
    ingredients?: {
      id: string;
      amount?: number;
      unit?: string;
      substitution?: string;
    }[];
    notes?: string[];
    tags?: string[];
  };
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
} 