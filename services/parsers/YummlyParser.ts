import { BaseParser } from './BaseParser';
import { Recipe, ParseResult, Ingredient, Step } from '../../types/Recipe';
import { v4 as uuidv4 } from 'uuid';

export class YummlyParser extends BaseParser {
  protected readonly domain = 'yummly.com';
  protected readonly name = 'Yummly';
  protected readonly selectors = {
    title: '.recipe-title',
    description: '.recipe-summary',
    image: '.recipe-image img',
    ingredients: '.IngredientLine',
    instructions: '.step',
    cookTime: '.recipe-time-yield .unit',
    servings: '.servings .value',
    author: '.author-name',
    rating: '.rating .average',
    ratingCount: '.rating .count',
    nutrition: '.nutrition-section',
    difficulty: '.difficulty-level',
    cuisine: '.recipe-cuisine',
    dietaryTags: '.dietary-tag'
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

      // Ingredients (Yummly specific format with scaling info)
      if (recipe.ingredients.length === 0) {
        const ingredientElements = this.findElements(dom, this.selectors.ingredients);
        recipe.ingredients = ingredientElements.map(element => {
          const ingredient = this.parseIngredient(this.getTextContent(element));
          
          // Extract scaling information
          const scaleData = this.getAttributeValue(element, 'data-scaling');
          if (scaleData) {
            try {
              const scaling = JSON.parse(scaleData);
              ingredient.notes = `Scaling: ${scaling.min}-${scaling.max} ${scaling.unit}`;
            } catch (e) {
              // Ignore scaling parse errors
            }
          }
          
          return ingredient;
        });
      }

      // Instructions with step timers
      if (recipe.steps.length === 0) {
        const instructionElements = this.findElements(dom, this.selectors.instructions);
        recipe.steps = instructionElements.map((element, index) => {
          const step = this.parseStep(this.getTextContent(element), index + 1);
          
          // Extract step duration if available
          const duration = this.getAttributeValue(element, 'data-timer');
          if (duration) {
            step.duration = parseInt(duration);
          }
          
          // Extract step tips
          const tipElement = this.findElement([element], '.step-tip');
          if (tipElement) {
            step.tips = [this.getTextContent(tipElement)];
          }

          // Extract step image
          const imageElement = this.findElement([element], '.step-image');
          if (imageElement) {
            step.imageUrl = this.getAttributeValue(imageElement, 'src');
          }

          return step;
        });
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

      // Difficulty (Yummly specific)
      const difficultyElement = this.findElement(dom, this.selectors.difficulty);
      if (difficultyElement) {
        const difficultyText = this.getTextContent(difficultyElement).toLowerCase();
        if (difficultyText.includes('easy')) {
          recipe.difficulty = 'easy';
        } else if (difficultyText.includes('intermediate') || difficultyText.includes('medium')) {
          recipe.difficulty = 'medium';
        } else if (difficultyText.includes('hard') || difficultyText.includes('advanced')) {
          recipe.difficulty = 'hard';
        }
      }

      // Cuisine
      const cuisineElement = this.findElement(dom, this.selectors.cuisine);
      if (cuisineElement) {
        recipe.cuisine = [this.getTextContent(cuisineElement)];
      }

      // Dietary Info (Yummly specific tags)
      const dietaryElements = this.findElements(dom, this.selectors.dietaryTags);
      dietaryElements.forEach(element => {
        const tag = this.getTextContent(element).toLowerCase();
        if (tag.includes('vegetarian')) recipe.dietaryInfo.vegetarian = true;
        if (tag.includes('vegan')) recipe.dietaryInfo.vegan = true;
        if (tag.includes('gluten-free')) recipe.dietaryInfo.glutenFree = true;
        if (tag.includes('dairy-free')) recipe.dietaryInfo.dairyFree = true;
      });

      // Extract tags
      recipe.tags = this.extractTags(recipe);

      return {
        success: true,
        recipe
      };
    } catch (error) {
      console.error(`Error parsing Yummly recipe:`, error);
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

    // Yummly specific tags
    const categories = ['quick', 'easy', 'healthy', 'budget', 'kid-friendly', 'meal-prep'];
    categories.forEach(category => {
      if (text.includes(category)) tags.add(category);
    });

    return Array.from(tags);
  }
} 