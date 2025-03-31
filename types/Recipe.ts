import { Timestamp } from 'firebase/firestore';

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  notes?: string;
}

export interface Step {
  id: string;
  order: number;
  description: string;
  imageUrl?: string;
  duration?: number; // in minutes
  tips?: string[];
}

export interface Instruction {
  step: number;
  text: string;
  image?: string;
}

export interface RecipeMetadata {
  sourceUrl: string;
  sourceName: string;  // e.g., "Food Network", "AllRecipes"
  sourceType: 'website' | 'instagram' | 'tiktok' | 'youtube';
  datePublished?: string;
  dateAdded: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  cookTime: number;
  prepTime: number;
  servings: number;
  creatorId: string;
  publishedAt?: string;
  ingredients: Ingredient[];
  steps: Step[];
  tags: string[];
  cuisine: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  dietaryInfo: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
  };
  rating?: {
    average: number;
    count: number;
  };
  nutritionInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  recipeCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  recipeCount: number;
  createdAt: Timestamp;
}

export interface Review {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

// Parser Result type
export interface ParseResult {
  success: boolean;
  recipe?: Recipe;
  error?: {
    code: string;
    message: string;
  };
} 