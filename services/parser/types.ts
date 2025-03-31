export type SupportedPlatform = 'youtube' | 'instagram' | 'facebook' | 'tiktok' | 'generic';
export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'it' | 'ar';

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients: Ingredient[];
  instructions: string[];
  servings: number;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  difficulty?: string;
  cuisine?: string;
  dietaryInfo: string[];
  sourceUrl: string;
  sourcePlatform: SupportedPlatform;
  language: SupportedLanguage;
  imageUrl?: string;
  videoUrl?: string;
}

export interface RecipeParser {
  platform: SupportedPlatform;
  language: SupportedLanguage;
  parseUrl(url: string): Promise<Recipe>;
  extractIngredients(content: string): Promise<Ingredient[]>;
  extractInstructions(content: string): Promise<string[]>;
}

export interface VideoContent {
  videoUrl: string;
  transcript?: string;
  frames?: string[]; // Base64 encoded frames for analysis
} 