import { BaseParser } from './BaseParser';
import { Recipe, ParseResult, Ingredient, Step } from '../../types/Recipe';
import { v4 as uuidv4 } from 'uuid';

export class TasteOfHomeParser extends BaseParser {
  protected readonly domain = 'tasteofhome.com';
  protected readonly name = 'Taste of Home';
  protected readonly selectors = {
    title: '.recipe-title',
    description: '.recipe-description',
    image: '.recipe-hero-image img',
    ingredients: '.recipe-ingredients__list-item',
    instructions: '.recipe-directions__list-item',
    cookTime: '.recipe-time-yield .total-time',
    servings: '.recipe-time-yield .yields',
    author: '.recipe-author-name',
    rating: '.recipe-ratings__average-rating',
    ratingCount: '.recipe-ratings__count',
    nutrition: '.recipe-nutrition__list-item',
    tips: '.recipe-tips__item',
    collections: '.recipe-collections__list-item',
    prepNote: '.recipe-prep-note',
    skillLevel: '.recipe-skill-level'
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

      // Ingredients with prep notes
      if (recipe.ingredients.length === 0) {
        const ingredientElements = this.findElements(dom, this.selectors.ingredients);
        recipe.ingredients = ingredientElements.map(element => {
          const ingredient = this.parseIngredient(this.getTextContent(element));
          
          // Look for prep notes
          const prepNote = this.findElement([element], this.selectors.prepNote);
          if (prepNote) {
            ingredient.notes = this.getTextContent(prepNote);
          }
          
          return ingredient;
        });
      }

      // Instructions with tips
      if (recipe.steps.length === 0) {
        const instructionElements = this.findElements(dom, this.selectors.instructions);
        recipe.steps = instructionElements.map((element, index) => {
          const step = this.parseStep(this.getTextContent(element), index + 1);
          
          // Look for tips associated with this step
          const tipElement = this.findElement([element], '.step-tip');
          if (tipElement) {
            step.tips = [this.getTextContent(tipElement)];
          }

          return step;
        });

        // Add general cooking tips to the first step
        const tipElements = this.findElements(dom, this.selectors.tips);
        if (tipElements.length > 0 && recipe.steps.length > 0) {
          const tips = tipElements.map(element => this.getTextContent(element));
          recipe.steps[0].tips = recipe.steps[0].tips || [];
          recipe.steps[0].tips.push(...tips.map(tip => `Cooking Tip: ${tip}`));
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
      const nutritionElements = this.findElements(dom, this.selectors.nutrition);
      nutritionElements.forEach(element => {
        const text = this.getTextContent(element).toLowerCase();
        if (text.includes('calories')) {
          recipe.nutritionInfo!.calories = parseInt(text.match(/\d+/)?.[0] || '0');
        } else if (text.includes('protein')) {
          recipe.nutritionInfo!.protein = parseInt(text.match(/\d+/)?.[0] || '0');
        } else if (text.includes('carbohydrate')) {
          recipe.nutritionInfo!.carbs = parseInt(text.match(/\d+/)?.[0] || '0');
        } else if (text.includes('fat')) {
          recipe.nutritionInfo!.fat = parseInt(text.match(/\d+/)?.[0] || '0');
        }
      });

      // Difficulty (from skill level)
      const skillElement = this.findElement(dom, this.selectors.skillLevel);
      if (skillElement) {
        const skillText = this.getTextContent(skillElement).toLowerCase();
        if (skillText.includes('beginner') || skillText.includes('easy')) {
          recipe.difficulty = 'easy';
        } else if (skillText.includes('intermediate')) {
          recipe.difficulty = 'medium';
        } else if (skillText.includes('advanced')) {
          recipe.difficulty = 'hard';
        }
      }

      // Collections (for additional tags)
      const collectionElements = this.findElements(dom, this.selectors.collections);
      const collectionTags = collectionElements.map(element => 
        this.getTextContent(element).toLowerCase().replace(/\s+/g, '-')
      );
      recipe.tags = [...recipe.tags, ...collectionTags];

      // Detect dietary info, cuisine, and difficulty
      this.detectDietaryInfo(recipe);
      this.detectCuisine(recipe);
      if (!recipe.difficulty) {
        this.detectDifficulty(recipe);
      }

      // Extract tags
      recipe.tags = this.extractTags(recipe);

      return {
        success: true,
        recipe
      };
    } catch (error) {
      console.error(`Error parsing Taste of Home recipe:`, error);
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

    // Taste of Home specific tags
    const categories = [
      'contest-winning', 'potluck', 'holiday', 'comfort-food', 
      'family-favorite', 'make-ahead', 'freezer-meal'
    ];
    categories.forEach(category => {
      if (text.includes(category)) tags.add(category);
    });

    return Array.from(tags);
  }
} 