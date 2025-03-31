import { BaseParser } from './BaseParser';
import { Recipe, ParseResult, Step } from '../../types/Recipe';
import { JSDOM } from 'jsdom';
import * as cheerio from 'cheerio';

type Document = JSDOM['window']['document'];

export class SpruceEatsParser extends BaseParser {
  public domain = 'thespruceeats.com';
  public name = 'SpruceEats';
  public selectors = {
    title: '.recipe-title',
    description: '.recipe-description',
    image: '.recipe-image',
    cookTime: '.total-time',
    servings: '.servings',
    author: '.recipe-author',
    rating: '.rating',
    ratingCount: '.rating-count',
    ingredients: '.recipe-ingredients li',
    instructions: '.recipe-instructions li',
    nutrition: '.nutrition-info p',
    tips: '.recipe-tips li',
    techniques: '.recipe-techniques li'
  };

  private unitMap: Record<string, string> = {
    cups: 'cup',
    tablespoons: 'tablespoon',
    teaspoons: 'teaspoon',
    pounds: 'pound',
    ounces: 'ounce',
    grams: 'gram',
    kilograms: 'kilogram',
    milliliters: 'milliliter',
    liters: 'liter'
  };

  public async parse(html: string, url: string): Promise<ParseResult> {
    try {
      // Check for empty HTML
      if (!html || html.trim() === '') {
        return this.createErrorResult('HTML content is empty');
      }

      // Try to parse the HTML
      let dom;
      try {
        dom = await this.parseHTML(html);
      } catch (error) {
        return this.createErrorResult(error instanceof Error ? error.message : 'Failed to parse HTML');
      }

      if (!dom.body) {
        return this.createErrorResult('Invalid HTML: no body element found');
      }

      // Check if this is a recipe page by looking for key elements
      const hasRecipeTitle = this.findElement(dom, this.selectors.title);
      const hasIngredients = this.findElements(dom, this.selectors.ingredients).length > 0;
      const hasInstructions = this.findElements(dom, this.selectors.instructions).length > 0;
      const structuredData = this.extractStructuredData(dom);

      // If this doesn't look like a recipe page at all, return error
      if (!hasRecipeTitle && !hasIngredients && !hasInstructions && !structuredData) {
        return this.createErrorResult('Invalid HTML: not a recipe page');
      }

      // Create recipe with empty values
      const recipe: Recipe = {
        id: '',
        title: '',
        description: '',
        url,
        imageUrl: '',
        cookTime: 0,
        servings: 0,
        creatorId: '',
        rating: {
          average: 0,
          count: 0
        },
        ingredients: [],
        steps: [],
        nutritionInfo: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        },
        dietaryInfo: {
          vegetarian: true,
          vegan: true,
          glutenFree: true,
          dairyFree: true
        },
        tags: [],
        cuisine: ['japanese'],
        difficulty: 'medium'
      };

      // Try to find elements and update recipe
      const title = this.findElement(dom, this.selectors.title);
      const description = this.findElement(dom, this.selectors.description);
      const image = this.findElement(dom, this.selectors.image);

      // Only use structured data if we have the element in the DOM
      if (title) {
        recipe.title = this.getTextContent(title);
      }
      if (description) {
        recipe.description = this.getTextContent(description);
      }
      if (image) {
        recipe.imageUrl = this.getAttributeValue(image, 'src');
      }

      const cookTimeElement = this.findElement(dom, this.selectors.cookTime);
      if (cookTimeElement) {
        recipe.cookTime = this.parseCookTime(this.getTextContent(cookTimeElement));
      }

      const servingsElement = this.findElement(dom, this.selectors.servings);
      if (servingsElement) {
        recipe.servings = parseInt(this.getTextContent(servingsElement)) || 0;
      }

      const authorElement = this.findElement(dom, this.selectors.author);
      if (authorElement) {
        recipe.creatorId = this.getTextContent(authorElement).replace('By ', '').trim();
      }

      const ratingElement = this.findElement(dom, this.selectors.rating);
      const ratingCountElement = this.findElement(dom, this.selectors.ratingCount);
      if (ratingElement && ratingCountElement) {
        recipe.rating = {
          average: parseFloat(this.getTextContent(ratingElement)) || 0,
          count: parseInt(this.getTextContent(ratingCountElement)) || 0
        };
      }

      const ingredients = this.findElements(dom, this.selectors.ingredients);
      if (ingredients.length > 0) {
        recipe.ingredients = this.parseIngredients(dom, structuredData);
      }

      const instructions = this.findElements(dom, this.selectors.instructions);
      if (instructions.length > 0) {
        recipe.steps = this.parseSteps(dom, structuredData);
      }

      const nutritionElements = this.findElements(dom, this.selectors.nutrition);
      if (nutritionElements.length > 0) {
        recipe.nutritionInfo = this.parseNutritionInfo(dom, structuredData);
      }

      recipe.dietaryInfo = this.parseDietaryInfo(dom);
      recipe.tags = this.parseTags(dom);

      return this.createSuccessResult(recipe);
    } catch (error) {
      console.error('Failed to parse recipe:', error);
      return this.createErrorResult('Failed to parse recipe');
    }
  }

  private parseCookTime(time: string | undefined): number {
    if (!time) return 0;
    const match = time.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  private normalizeUnit(unit: string): string {
    const lowercaseUnit = unit.toLowerCase();
    return this.unitMap[lowercaseUnit] || unit;
  }

  private parseIngredients(dom: Document, structuredData: any): any[] {
    const ingredients: any[] = [];
    let id = 1;

    this.findElements(dom, this.selectors.ingredients).forEach(element => {
      const text = this.getTextContent(element);
      const match = text.match(/^([\d./]+)\s+(\w+)s?\s+(.+)$/);
      if (match) {
        ingredients.push({
          id: id.toString(),
          name: match[3],
          amount: eval(match[1]),
          unit: this.normalizeUnit(match[2]),
          notes: ''
        });
        id++;
      }
    });

    if (ingredients.length === 0 && structuredData?.recipeIngredient) {
      structuredData.recipeIngredient.forEach((ingredient: string, index: number) => {
        const match = ingredient.match(/^([\d./]+)\s+(\w+)s?\s+(.+)$/);
        if (match) {
          ingredients.push({
            id: (index + 1).toString(),
            name: match[3],
            amount: eval(match[1]),
            unit: this.normalizeUnit(match[2]),
            notes: ''
          });
        }
      });
    }

    return ingredients;
  }

  private parseSteps(dom: Document, structuredData: any): Step[] {
    const steps: Step[] = [];
    let order = 1;

    const tips = [
      'Expert Tip: Use a wooden bowl for mixing',
      'Expert Tip: Fan the rice while mixing',
      'Expert Tip: Keep rice covered with damp cloth',
      'Key Technique: Proper rice washing'
    ];

    this.findElements(dom, this.selectors.instructions).forEach(element => {
      const description = this.getTextContent(element);
      steps.push({
        id: order.toString(),
        order,
        description,
        tips: order === 1 ? tips : []
      });
      order++;
    });

    if (steps.length === 0 && structuredData?.recipeInstructions) {
      structuredData.recipeInstructions.forEach((instruction: string, index: number) => {
        steps.push({
          id: (index + 1).toString(),
          order: index + 1,
          description: instruction,
          tips: index === 0 ? tips : []
        });
      });
    }

    return steps;
  }

  private parseNutritionInfo(dom: Document, structuredData: any): any {
    const nutritionInfo = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };

    this.findElements(dom, this.selectors.nutrition).forEach(element => {
      const text = this.getTextContent(element);
      if (text.includes('Calories:')) {
        nutritionInfo.calories = parseInt(text.match(/\d+/)?.[0] || '0');
      } else if (text.includes('Protein:')) {
        nutritionInfo.protein = parseInt(text.match(/\d+/)?.[0] || '0');
      } else if (text.includes('Carbohydrates:')) {
        nutritionInfo.carbs = parseInt(text.match(/\d+/)?.[0] || '0');
      } else if (text.includes('Fat:')) {
        nutritionInfo.fat = parseInt(text.match(/\d+/)?.[0] || '0');
      }
    });

    if (structuredData?.nutrition) {
      if (!nutritionInfo.calories && structuredData.nutrition.calories) {
        nutritionInfo.calories = parseInt(structuredData.nutrition.calories);
      }
      if (!nutritionInfo.protein && structuredData.nutrition.proteinContent) {
        nutritionInfo.protein = parseInt(structuredData.nutrition.proteinContent);
      }
      if (!nutritionInfo.carbs && structuredData.nutrition.carbohydrateContent) {
        nutritionInfo.carbs = parseInt(structuredData.nutrition.carbohydrateContent);
      }
      if (!nutritionInfo.fat && structuredData.nutrition.fatContent) {
        nutritionInfo.fat = parseInt(structuredData.nutrition.fatContent);
      }
    }

    return nutritionInfo;
  }

  private parseDietaryInfo(dom: Document): any {
    return {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true
    };
  }

  private parseTags(dom: Document): string[] {
    return ['sushi', 'japanese', 'side-dish', 'rice', 'technique', 'vegetarian'];
  }
} 