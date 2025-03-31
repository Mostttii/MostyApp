import { Recipe } from '../../types/Recipe';
import { JSDOM } from 'jsdom';
import { parseDocument } from 'htmlparser2';
import { selectAll } from 'css-select';
import { v4 as uuidv4 } from 'uuid';

type HTMLElement = JSDOM['window']['document']['documentElement'];
type Element = globalThis.Element;
type Document = globalThis.Document;

export interface StructuredData {
  '@type': string;
  name?: string;
  description?: string;
  image?: string | string[];
  recipeYield?: string;
  recipeIngredient?: string[];
  recipeInstructions?: Array<string | { '@type': string; text: string }>;
  cookTime?: string;
  author?: {
    '@type': string;
    name: string;
  };
  aggregateRating?: {
    '@type': string;
    ratingValue: string;
    reviewCount: string;
  };
  nutrition?: {
    calories?: string;
    proteinContent?: string;
    carbohydrateContent?: string;
    fatContent?: string;
  };
}

export interface ParseError {
  code: string;
  message: string;
}

export interface ParseResult {
  success: boolean;
  recipe?: Recipe;
  error?: ParseError;
}

export abstract class BaseParser {
  protected abstract readonly domain: string;
  protected abstract readonly name: string;
  protected abstract readonly selectors: Record<string, string>;

  canParse(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes(this.domain);
    } catch {
      return false;
    }
  }

  abstract parse(html: string, url: string): Promise<ParseResult>;

  protected async parseHTML(html: string): Promise<Document> {
    try {
      if (!html || typeof html !== 'string' || html.trim().length === 0) {
        throw new Error('Invalid HTML: empty or not a string');
      }

      const dom = new JSDOM(html);
      if (!dom.window.document.body) {
        throw new Error('Invalid HTML: no body element found');
      }

      return dom.window.document;
    } catch (error) {
      throw new Error(`Failed to parse HTML: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  protected findElement(dom: Document, selector: string): Element | null {
    return dom.querySelector(selector);
  }

  protected findElements(dom: Document, selector: string): Element[] {
    return Array.from(dom.querySelectorAll(selector));
  }

  protected getTextContent(element: Element | null): string {
    return element?.textContent?.trim() || '';
  }

  protected getAttributeValue(element: Element | null, attribute: string): string {
    return element?.getAttribute(attribute)?.trim() || '';
  }

  protected createDefaultRecipe(url: string): Recipe {
    return {
      id: '',
      title: '',
      description: '',
      url,
      imageUrl: '',
      prepTime: 0,
      cookTime: 0,
      servings: 0,
      creatorId: '',
      ingredients: [],
      steps: [],
      tags: [],
      cuisine: [],
      difficulty: 'medium',
      dietaryInfo: {
        vegetarian: false,
        vegan: false,
        glutenFree: false,
        dairyFree: false
      },
      nutritionInfo: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      },
      rating: {
        average: 0,
        count: 0
      }
    };
  }

  protected createErrorResult(message: string, code: string = 'PARSER_ERROR'): ParseResult {
    return {
      success: false,
      error: {
        code,
        message
      }
    };
  }

  protected createSuccessResult(recipe: Recipe): ParseResult {
    return {
      success: true,
      recipe
    };
  }

  protected extractStructuredData(dom: Document): any {
    try {
      const scripts = dom.querySelectorAll('script[type="application/ld+json"]');
      for (const script of scripts) {
        try {
          const json = JSON.parse(script.textContent || '');
          if (json['@type'] === 'Recipe') {
            return json;
          }
        } catch (e) {
          console.warn(`Failed to parse JSON-LD in ${this.name}: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }
      }
      return null;
    } catch (error) {
      console.warn(`Failed to extract structured data in ${this.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }

  protected parseTime(timeString: string | undefined): number {
    if (!timeString) return 0;

    // Parse ISO 8601 duration
    const ptMatch = timeString.match(/PT(\d+)([HM])/i);
    if (ptMatch) {
      const value = parseInt(ptMatch[1]);
      const unit = ptMatch[2].toUpperCase();
      return unit === 'H' ? value * 60 : value;
    }

    // Parse human-readable time
    const numericMatch = timeString.match(/(\d+)\s*(hour|hr|minute|min)/i);
    if (numericMatch) {
      const value = parseInt(numericMatch[1]);
      const unit = numericMatch[2].toLowerCase();
      return unit.startsWith('h') ? value * 60 : value;
    }

    return 0;
  }

  protected detectDietaryInfo(recipe: Recipe): void {
    const ingredients = recipe.ingredients.map(i => i.name.toLowerCase());
    const description = recipe.description?.toLowerCase() || '';
    const title = recipe.title.toLowerCase();

    // Detect vegetarian
    const meatKeywords = ['meat', 'chicken', 'beef', 'pork', 'fish', 'seafood', 'lamb'];
    recipe.dietaryInfo.vegetarian = !meatKeywords.some(keyword => 
      ingredients.some(i => i.includes(keyword)) ||
      description.includes(keyword) ||
      title.includes(keyword)
    );

    // Detect vegan
    const nonVeganKeywords = [...meatKeywords, 'egg', 'milk', 'cream', 'cheese', 'butter', 'honey'];
    recipe.dietaryInfo.vegan = !nonVeganKeywords.some(keyword => 
      ingredients.some(i => i.includes(keyword)) ||
      description.includes(keyword) ||
      title.includes(keyword)
    );

    // Detect gluten-free
    const glutenKeywords = ['flour', 'wheat', 'barley', 'rye', 'bread', 'pasta', 'noodle'];
    recipe.dietaryInfo.glutenFree = !glutenKeywords.some(keyword => 
      ingredients.some(i => i.includes(keyword)) ||
      description.includes(keyword) ||
      title.includes(keyword)
    );

    // Detect dairy-free
    const dairyKeywords = ['milk', 'cream', 'cheese', 'butter', 'yogurt'];
    recipe.dietaryInfo.dairyFree = !dairyKeywords.some(keyword => 
      ingredients.some(i => i.includes(keyword)) ||
      description.includes(keyword) ||
      title.includes(keyword)
    );
  }

  protected detectCuisine(recipe: Recipe): void {
    const text = `${recipe.title} ${recipe.description || ''} ${recipe.tags.join(' ')}`.toLowerCase();
    
    const cuisineKeywords: Record<string, string[]> = {
      'italian': ['italian', 'pasta', 'pizza', 'risotto'],
      'mexican': ['mexican', 'taco', 'burrito', 'enchilada'],
      'chinese': ['chinese', 'stir-fry', 'wok', 'dumpling'],
      'indian': ['indian', 'curry', 'masala', 'tandoori'],
      'japanese': ['japanese', 'sushi', 'ramen', 'tempura'],
      'thai': ['thai', 'curry', 'pad thai'],
      'french': ['french', 'coq au vin', 'ratatouille'],
      'mediterranean': ['mediterranean', 'greek', 'hummus', 'falafel']
    };

    recipe.cuisine = Object.entries(cuisineKeywords)
      .filter(([_, keywords]) => keywords.some(keyword => text.includes(keyword)))
      .map(([cuisine]) => cuisine);

    if (recipe.cuisine.length === 0) {
      recipe.cuisine = ['other'];
    }
  }

  protected detectDifficulty(recipe: Recipe): void {
    const factors = {
      ingredientCount: recipe.ingredients.length,
      stepCount: recipe.steps.length,
      cookTime: recipe.cookTime,
      specialEquipment: recipe.steps.some(step => 
        /thermometer|processor|blender|mixer|special|equipment/i.test(step.description)
      )
    };

    if (
      factors.ingredientCount <= 5 &&
      factors.stepCount <= 5 &&
      factors.cookTime <= 30 &&
      !factors.specialEquipment
    ) {
      recipe.difficulty = 'easy';
    } else if (
      factors.ingredientCount >= 12 ||
      factors.stepCount >= 10 ||
      factors.cookTime >= 90 ||
      factors.specialEquipment
    ) {
      recipe.difficulty = 'hard';
    } else {
      recipe.difficulty = 'medium';
    }
  }
} 