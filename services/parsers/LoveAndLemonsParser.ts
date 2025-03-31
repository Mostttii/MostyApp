import { BaseParser } from './BaseParser';
import { Recipe, ParseResult, Ingredient, Step } from '../../types/Recipe';
import { v4 as uuidv4 } from 'uuid';

export class LoveAndLemonsParser extends BaseParser {
  protected readonly domain = 'loveandlemons.com';
  protected readonly name = 'Love and Lemons';
  protected readonly selectors = {
    title: '.entry-title',
    description: '.recipe-description',
    image: '.recipe-image img',
    ingredients: '.wprm-recipe-ingredient',
    instructions: '.wprm-recipe-instruction',
    cookTime: '.wprm-recipe-total-time',
    servings: '.wprm-recipe-servings',
    author: '.entry-author',
    rating: '.wprm-recipe-rating-average',
    ratingCount: '.wprm-recipe-rating-count',
    nutrition: '.wprm-nutrition-label-container',
    seasonalNotes: '.seasonal-note',
    substitutions: '.substitution-note',
    storageInfo: '.storage-info',
    mealPrepTips: '.meal-prep-tip',
    dietaryInfo: '.dietary-info'
  };

  async parse(html: string, url: string): Promise<ParseResult> {
    try {
      const structuredData = await this.extractStructuredData(html);
      const recipe = this.createDefaultRecipe(url);

      if (structuredData) {
        // Parse structured data
        recipe.title = structuredData.name || '';
        recipe.description = structuredData.description || '';
        recipe.imageUrl = Array.isArray(structuredData.image) 
          ? structuredData.image[0] 
          : structuredData.image || '';
        recipe.cookTime = this.parseTime(structuredData.cookTime);
        recipe.servings = parseInt(structuredData.recipeYield || '4');

        // Parse ingredients
        if (structuredData.recipeIngredient) {
          recipe.ingredients = structuredData.recipeIngredient.map(text => this.parseIngredient(text));
        }

        // Parse instructions
        if (structuredData.recipeInstructions) {
          recipe.steps = structuredData.recipeInstructions.map((instruction, index) => {
            const text = typeof instruction === 'string' ? instruction : instruction.text;
            return this.parseStep(text, index + 1);
          });
        }

        // Parse nutrition
        if (structuredData.nutrition) {
          recipe.nutritionInfo = {
            calories: parseInt(structuredData.nutrition.calories || '0'),
            protein: parseInt(structuredData.nutrition.proteinContent || '0'),
            carbs: parseInt(structuredData.nutrition.carbohydrateContent || '0'),
            fat: parseInt(structuredData.nutrition.fatContent || '0')
          };
        }
      }

      // Fallback to DOM parsing
      const dom = await this.parseHTML(html);

      // Title
      if (!recipe.title) {
        const titleElement = this.findElement(dom, this.selectors.title);
        recipe.title = this.getTextContent(titleElement);
      }

      // Description
      if (!recipe.description) {
        const descElement = this.findElement(dom, this.selectors.description);
        recipe.description = this.getTextContent(descElement);
      }

      // Image
      if (!recipe.imageUrl) {
        const imageElement = this.findElement(dom, this.selectors.image);
        recipe.imageUrl = this.getAttributeValue(imageElement, 'src');
      }

      // Ingredients with seasonal notes
      if (recipe.ingredients.length === 0) {
        const ingredientElements = this.findElements(dom, this.selectors.ingredients);
        recipe.ingredients = ingredientElements.map(element => {
          const ingredient = this.parseIngredient(this.getTextContent(element));
          
          // Look for seasonal notes
          const seasonalNote = this.findElement([element], this.selectors.seasonalNotes);
          if (seasonalNote) {
            ingredient.notes = `Seasonal note: ${this.getTextContent(seasonalNote)}`;
          }
          
          // Look for substitutions
          const substitutionNote = this.findElement([element], this.selectors.substitutions);
          if (substitutionNote) {
            const existingNote = ingredient.notes ? `${ingredient.notes}. ` : '';
            ingredient.notes = `${existingNote}Substitutions: ${this.getTextContent(substitutionNote)}`;
          }
          
          return ingredient;
        });
      }

      // Instructions with meal prep tips
      if (recipe.steps.length === 0) {
        const instructionElements = this.findElements(dom, this.selectors.instructions);
        recipe.steps = instructionElements.map((element, index) => {
          const step = this.parseStep(this.getTextContent(element), index + 1);
          
          // Look for meal prep tips
          const mealPrepTip = this.findElement([element], this.selectors.mealPrepTips);
          if (mealPrepTip) {
            step.tips = step.tips || [];
            step.tips.push(`Meal Prep Tip: ${this.getTextContent(mealPrepTip)}`);
          }

          return step;
        });

        // Add storage information to the last step
        const storageElement = this.findElement(dom, this.selectors.storageInfo);
        if (storageElement && recipe.steps.length > 0) {
          const lastStep = recipe.steps[recipe.steps.length - 1];
          lastStep.tips = lastStep.tips || [];
          lastStep.tips.push(`Storage: ${this.getTextContent(storageElement)}`);
        }
      }

      // Rating
      const ratingElement = this.findElement(dom, this.selectors.rating);
      const ratingCountElement = this.findElement(dom, this.selectors.ratingCount);
      if (ratingElement && ratingCountElement) {
        const ratingText = this.getTextContent(ratingElement);
        const countText = this.getTextContent(ratingCountElement).match(/\d+/)?.[0];
        recipe.rating = {
          average: parseFloat(ratingText || '0'),
          count: parseInt(countText || '0')
        };
      }

      // Author/Creator
      const authorElement = this.findElement(dom, this.selectors.author);
      if (authorElement) {
        recipe.creatorId = this.getTextContent(authorElement);
      }

      // Nutrition
      if (!recipe.nutritionInfo) {
        recipe.nutritionInfo = {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        };
      }
      const nutritionElement = this.findElement(dom, this.selectors.nutrition);
      if (nutritionElement) {
        const nutritionText = this.getTextContent(nutritionElement);
        const calories = nutritionText.match(/calories:?\s*(\d+)/i);
        const protein = nutritionText.match(/protein:?\s*(\d+)g/i);
        const carbs = nutritionText.match(/carbohydrates:?\s*(\d+)g/i);
        const fat = nutritionText.match(/fat:?\s*(\d+)g/i);

        if (calories) recipe.nutritionInfo.calories = parseInt(calories[1]);
        if (protein) recipe.nutritionInfo.protein = parseInt(protein[1]);
        if (carbs) recipe.nutritionInfo.carbs = parseInt(carbs[1]);
        if (fat) recipe.nutritionInfo.fat = parseInt(fat[1]);
      }

      // Dietary Info (Love and Lemons specific)
      const dietaryElement = this.findElement(dom, this.selectors.dietaryInfo);
      if (dietaryElement) {
        const dietaryText = this.getTextContent(dietaryElement).toLowerCase();
        recipe.dietaryInfo = {
          vegetarian: dietaryText.includes('vegetarian'),
          vegan: dietaryText.includes('vegan'),
          glutenFree: dietaryText.includes('gluten-free'),
          dairyFree: dietaryText.includes('dairy-free')
        };
      } else {
        // Love and Lemons is primarily vegetarian
        recipe.dietaryInfo.vegetarian = true;
      }

      // Detect cuisine and difficulty
      this.detectCuisine(recipe);
      this.detectDifficulty(recipe);

      // Extract tags
      recipe.tags = this.extractTags(recipe);

      return {
        success: true,
        recipe
      };
    } catch (error) {
      console.error(`Error parsing Love and Lemons recipe:`, error);
      return {
        success: false,
        error: {
          code: 'PARSER_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      };
    }
  }

  private parseIngredient(text: string): Ingredient {
    const amountMatch = text.match(/^([\d./]+(?:\s*-\s*[\d./]+)?)/);
    const unitMatch = text.match(/(?:cup|tablespoon|teaspoon|pound|ounce|gram|ml|g|oz|lb|tbsp|tsp)s?/i);
    
    let amount = 0;
    let unit = 'unit';
    let name = text.trim();

    if (amountMatch) {
      const amountStr = amountMatch[1].replace(/\s*-\s*/, '-');
      amount = amountStr.includes('-') 
        ? parseFloat(amountStr.split('-')[0]) 
        : parseFloat(amountStr);
      name = text.slice(amountMatch[0].length).trim();
    }

    if (unitMatch) {
      unit = unitMatch[0].toLowerCase();
      name = name.replace(unitMatch[0], '').trim();
    }

    return {
      id: uuidv4(),
      name,
      amount,
      unit
    };
  }

  private parseStep(text: string, order: number): Step {
    return {
      id: uuidv4(),
      order,
      description: text.trim(),
      tips: []
    };
  }

  private extractTags(recipe: Recipe): string[] {
    const tags = new Set<string>();
    const text = `${recipe.title} ${recipe.description || ''}`.toLowerCase();

    // Add cuisine tags
    recipe.cuisine.forEach(cuisine => tags.add(cuisine));

    // Add dietary tags
    if (recipe.dietaryInfo.vegetarian) tags.add('vegetarian');
    if (recipe.dietaryInfo.vegan) tags.add('vegan');
    if (recipe.dietaryInfo.glutenFree) tags.add('gluten-free');
    if (recipe.dietaryInfo.dairyFree) tags.add('dairy-free');

    // Add difficulty tag
    tags.add(recipe.difficulty);

    // Add meal type tags
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'appetizer'];
    mealTypes.forEach(type => {
      if (text.includes(type)) tags.add(type);
    });

    // Add cooking method tags
    const methods = ['baked', 'grilled', 'fried', 'roasted', 'slow-cooked', 'steamed'];
    methods.forEach(method => {
      if (text.includes(method)) tags.add(method);
    });

    // Love and Lemons specific tags
    const categories = [
      'seasonal', 'plant-based', 'healthy', 'fresh', 
      'farmers-market', 'meal-prep', 'weeknight'
    ];
    categories.forEach(category => {
      if (text.includes(category)) tags.add(category);
    });

    // Add seasonal tags
    const seasons = ['spring', 'summer', 'fall', 'winter'];
    seasons.forEach(season => {
      if (text.includes(season)) tags.add(season);
    });

    return Array.from(tags);
  }
} 