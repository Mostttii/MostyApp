import { Recipe, ParseResult, Ingredient, Step } from '../types/Recipe';
import axios from 'axios';
import { Parser } from 'htmlparser2';
import { DomHandler } from 'domhandler';
import { Element, Node } from 'domhandler';
import { parseDocument } from 'htmlparser2';
import { selectAll } from 'css-select';
import { v4 as uuidv4 } from 'uuid';

// Supported recipe websites and their domains
const SUPPORTED_SITES = {
  'allrecipes.com': 'AllRecipes',
  'foodnetwork.com': 'Food Network',
  'epicurious.com': 'Epicurious',
  'simplyrecipes.com': 'Simply Recipes',
  'tasty.co': 'Tasty',
  'bonappetit.com': 'Bon Appétit',
  'seriouseats.com': 'Serious Eats',
  'food52.com': 'Food52',
  'thekitchn.com': 'The Kitchn',
  'delish.com': 'Delish',
  // Add more supported sites here
};

// Social media patterns
const SOCIAL_PATTERNS = {
  instagram: /^https?:\/\/(www\.)?instagram\.com\/(p|reel)\/[\w-]+/,
  tiktok: /^https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/,
  youtube: /^https?:\/\/(www\.)?youtube\.com\/(watch\?v=|shorts\/)[\w-]+/,
};

// Interfaces
interface IRecipeParser {
  canParse(url: string): boolean;
  parse(html: string, url: string): Promise<Recipe>;
}

interface RecipeParseResult {
  success: boolean;
  recipe?: Recipe;
  error?: {
    code: string;
    message: string;
  };
}

interface StructuredData {
  '@type': string;
  name?: string;
  description?: string;
  image?: string | string[];
  recipeYield?: string;
  recipeIngredient?: string[];
  recipeInstructions?: Array<string | { '@type': string; text: string }>;
  cookTime?: string;
  nutrition?: {
    calories?: string;
    proteinContent?: string;
    carbohydrateContent?: string;
    fatContent?: string;
  };
}

// Base class for recipe parsers
abstract class BaseRecipeParser implements IRecipeParser {
  protected abstract domain: string;
  protected abstract selectors: Record<string, string>;

  canParse(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes(this.domain);
    } catch {
      return false;
    }
  }

  abstract parse(html: string, url: string): Promise<Recipe>;

  protected createDefaultRecipe(url: string): Recipe {
    return {
      id: uuidv4(),
      title: '',
      description: '',
      imageUrl: '',
      cookTime: 0,
      servings: 4,
      ingredients: [],
      steps: [],
      difficulty: 'medium',
      cuisine: [],
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
      creatorId: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      rating: {
        average: 0,
        count: 0
      },
      tags: []
    };
  }

  protected parseIngredientText(text: string): Ingredient {
    const amountMatch = text.match(/^(\d+(?:\.\d+)?(?:\s*[-\/]\s*\d+(?:\.\d+)?)?)/);
    const unitMatch = text.match(/(?:cup|tablespoon|teaspoon|pound|ounce|gram|ml|g|oz|lb|tbsp|tsp)s?/i);
    
    let amount = 0;
    let unit = 'unit';
    let name = text.trim();

    if (amountMatch) {
      amount = parseFloat(amountMatch[0]);
      name = name.slice(amountMatch[0].length).trim();
    }

    if (unitMatch) {
      unit = unitMatch[0].trim().toLowerCase();
      name = name.replace(unitMatch[0], '').trim();
    }

    return {
      id: uuidv4(),
      name,
      amount,
      unit
    };
  }

  protected parseInstructionToStep(text: string, order: number): Step {
    return {
      id: uuidv4(),
      order,
      description: text.trim(),
      tips: []
    };
  }

  protected parseTime(timeString: string): number {
    if (!timeString) return 0;

    const ptMatch = timeString.match(/PT(\d+)([HM])/i);
    if (ptMatch) {
      const value = parseInt(ptMatch[1]);
      const unit = ptMatch[2].toUpperCase();
      return unit === 'H' ? value * 60 : value;
    }

    const numericMatch = timeString.match(/(\d+)\s*(hour|hr|minute|min)/i);
    if (numericMatch) {
      const value = parseInt(numericMatch[1]);
      const unit = numericMatch[2].toLowerCase();
      return unit.startsWith('h') ? value * 60 : value;
    }

    return 0;
  }

  protected async parseHTML(html: string): Promise<Element[]> {
    return parseDocument(html).children as Element[];
  }

  protected findElement(dom: Element[], selector: string): Element | null {
    const elements = selectAll(selector, dom);
    return elements.length > 0 ? elements[0] : null;
  }

  protected findNodes(dom: Element[], predicate: (node: Element) => boolean): Element[] {
    return selectAll('*', dom).filter(predicate as any);
  }

  protected getTextContent(element: Element): string {
    if (!element || !element.children) return '';
    
    return element.children
      .map(child => {
        if (!child) return '';
        if ('data' in child && typeof child.data === 'string') return child.data;
        if ('children' in child && Array.isArray(child.children)) {
          return this.getTextContent(child as Element);
        }
        return '';
      })
      .filter(Boolean)
      .join('')
      .trim();
  }

  protected async extractStructuredData(html: string): Promise<StructuredData | null> {
    try {
      const dom = await this.parseHTML(html);
      const scripts = this.findNodes(dom, node => 
        node.type === 'script' && 
        node.attribs?.type === 'application/ld+json'
      );

      for (const script of scripts) {
        try {
          const content = this.getTextContent(script);
          if (!content) continue;
          
          const data = JSON.parse(content);
          const recipes = Array.isArray(data) ? data : [data];
          const recipe = recipes.find(item => item['@type'] === 'Recipe');
          
          if (recipe) {
            return recipe as StructuredData;
          }
        } catch (e) {
          console.warn('Failed to parse JSON-LD script:', e);
        }
      }
    } catch (e) {
      console.warn('Failed to extract structured data:', e);
    }
    return null;
  }
}

// Specific parser implementations
class AllRecipesParser extends BaseRecipeParser {
  protected domain = 'allrecipes.com';
  protected selectors = {
    title: '[class*="headline heading-content"]',
    description: '[class*="recipe-summary"]',
    ingredients: '[class*="ingredients-item"]',
    instructions: '[class*="instructions-section"]',
    image: '[class*="recipe-image"]',
    prepTime: '[class*="recipe-meta-item-body"]',
    cookTime: '[class*="recipe-meta-item-body"]',
    servings: '[class*="recipe-meta-item-body"]'
  };

  async parse(html: string, url: string): Promise<Recipe> {
    console.log('Starting to parse recipe from:', url);
    const recipe = this.createDefaultRecipe(url);

    try {
      // Try to extract structured data first
      const structuredData = await this.extractStructuredData(html);
      if (structuredData) {
        recipe.title = structuredData.name;
        recipe.description = structuredData.description;
        recipe.imageUrl = Array.isArray(structuredData.image) 
          ? structuredData.image[0] 
          : structuredData.image || '';
        recipe.cookTime = this.parseTime(structuredData.cookTime);
        recipe.servings = parseInt(structuredData.recipeYield || '4');
        
        if (structuredData.recipeIngredient) {
          recipe.ingredients = structuredData.recipeIngredient.map(text => 
            this.parseIngredientText(text)
          );
        }

        if (structuredData.recipeInstructions) {
          recipe.steps = structuredData.recipeInstructions.map((instruction, index) => {
            const text = typeof instruction === 'string' ? instruction : instruction.text;
            return this.parseInstructionToStep(text, index + 1);
          });
        }

        // Extract nutrition information if available
        if (structuredData.nutrition) {
          recipe.nutritionInfo = {
            calories: parseInt(structuredData.nutrition.calories || '0'),
            protein: parseInt(structuredData.nutrition.proteinContent || '0'),
            carbs: parseInt(structuredData.nutrition.carbohydrateContent || '0'),
            fat: parseInt(structuredData.nutrition.fatContent || '0'),
          };
        }

        return recipe;
      }

      // Fallback to DOM parsing if structured data is not available
      const dom = await this.parseHTML(html);
      
      // Find title
      const titleElement = this.findElement(dom, this.selectors.title);
      if (titleElement) {
        recipe.title = this.getTextContent(titleElement).trim();
        console.log('Found title:', recipe.title);
      }

      // Find description
      const descElement = this.findElement(dom, this.selectors.description);
      if (descElement) {
        recipe.description = this.getTextContent(descElement).trim();
        console.log('Found description:', recipe.description);
      }

      // Find ingredients
      const ingredientElements = this.findNodes(dom, node => 
        node.attribs?.class?.includes('ingredients-item')
      );
      recipe.ingredients = ingredientElements.map(element => {
        const text = this.getTextContent(element).trim();
        console.log('Found ingredient:', text);
        return this.parseIngredientText(text);
      });

      // Find instructions
      const instructionElements = this.findNodes(dom, node => 
        node.attribs?.class?.includes('instructions-section')
      );
      recipe.steps = instructionElements.map((element, index) => {
        const text = this.getTextContent(element).trim();
        console.log('Found instruction:', text);
        return this.parseInstructionToStep(text, index + 1);
      });

      // Find image
      const imageElement = this.findElement(dom, this.selectors.image);
      if (imageElement && imageElement.attribs?.src) {
        recipe.imageUrl = imageElement.attribs.src;
        console.log('Found image:', recipe.imageUrl);
      }

      // Find cooking time
      const timeElements = this.findNodes(dom, node => 
        node.attribs?.class?.includes('recipe-meta-item-body')
      );
      timeElements.forEach(element => {
        const text = this.getTextContent(element).toLowerCase();
        if (text.includes('cook')) {
          recipe.cookTime = this.parseTime(`PT${text.match(/\d+/)?.[0] || '0'}M`);
        }
      });

      // Find servings
      const servingsElement = this.findElement(dom, this.selectors.servings);
      if (servingsElement) {
        const servingsText = this.getTextContent(servingsElement);
        const servingsMatch = servingsText.match(/\d+/);
        if (servingsMatch) {
          recipe.servings = parseInt(servingsMatch[0]);
        }
      }

      return recipe;
    } catch (error) {
      console.error('Error parsing recipe:', error);
      throw error;
    }
  }
}

// Recipe Parser Factory
class RecipeParserFactory {
  private static parsers: IRecipeParser[] = [
    new AllRecipesParser(),
    // Add more parsers here
  ];

  static getParser(url: string): IRecipeParser | null {
    return this.parsers.find(parser => parser.canParse(url)) || null;
  }
}

// Main Parser Service
export class RecipeParser {
  static async validateAndCleanUrl(url: string): Promise<string> {
    try {
      // Follow redirects to get final URL
      const response = await axios.head(url, {
        maxRedirects: 5,
        validateStatus: (status) => status < 400,
      });
      
      // Get canonical URL if available
      const finalUrl = response.request.res.responseUrl || url;
      
      return finalUrl;
    } catch (error) {
      console.error('Error validating URL:', error);
      return url;
    }
  }

  static validateUrl(url: string): { isValid: boolean; source?: string; error?: string } {
    try {
      const urlObj = new URL(url);
      
      // Check for social media patterns
      for (const [platform, pattern] of Object.entries(SOCIAL_PATTERNS)) {
        if (pattern.test(url)) {
          return { isValid: true, source: platform };
        }
      }

      // Check for supported recipe websites
      const domain = urlObj.hostname.replace('www.', '');
      const siteName = SUPPORTED_SITES[domain as keyof typeof SUPPORTED_SITES];
      
      if (siteName) {
        return { isValid: true, source: siteName };
      }

      return { 
        isValid: false, 
        error: 'This website is not currently supported. We support major recipe websites and social media platforms.' 
      };
    } catch (error) {
      return { 
        isValid: false, 
        error: 'Invalid URL format. Please check the URL and try again.' 
      };
    }
  }

  static async parseUrl(url: string): Promise<RecipeParseResult> {
    try {
      // Validate and clean URL
      const cleanUrl = await this.validateAndCleanUrl(url);
      
      // Get appropriate parser
      const parser = RecipeParserFactory.getParser(cleanUrl);
      if (!parser) {
        return {
          success: false,
          error: {
            code: 'UNSUPPORTED_SITE',
            message: 'This website is not currently supported'
          }
        };
      }

      // Fetch HTML with retries and fallbacks
      const html = await this.fetchWithFallback(cleanUrl);
      
      // Parse recipe using the specific parser instance
      const recipe = await parser.parse(html, cleanUrl);
      
      return {
        success: true,
        recipe
      };
    } catch (error) {
      console.error('Error parsing recipe:', error);
      return {
        success: false,
        error: {
          code: 'PARSING_ERROR',
          message: error instanceof Error ? error.message : 'Failed to parse recipe'
        }
      };
    }
  }

  private static async fetchWithFallback(url: string): Promise<string> {
    const fallbackProxies = [
      (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      (url: string) => `https://cors-anywhere.herokuapp.com/${url}`,
    ];

    let lastError: Error | null = null;

    // Try direct fetch first
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RecipeBot/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        },
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      lastError = error as Error;
    }

    // Try each proxy in sequence
    for (const proxyUrl of fallbackProxies) {
      try {
        const response = await axios.get(proxyUrl(url), {
          timeout: 5000
        });
        return response.data;
      } catch (error) {
        lastError = error as Error;
        continue;
      }
    }

    throw lastError || new Error('Failed to fetch recipe');
  }
} 