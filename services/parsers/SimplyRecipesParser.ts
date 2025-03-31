import { BaseParser } from './BaseParser';
import { Recipe, ParseResult, Ingredient, Step } from '../../types/Recipe';
import { v4 as uuidv4 } from 'uuid';

export class SimplyRecipesParser extends BaseParser {
  protected readonly domain = 'simplyrecipes.com';
  protected readonly name = 'Simply Recipes';
  protected readonly selectors = {
    title: 'h1.recipe-title',
    description: '.recipe-description',
    image: '.primary-image img',
    ingredients: '.structured-ingredients__list-item',
    instructions: '.structured-project__step',
    cookTime: '.total-time .meta-text__data',
    servings: '.recipe-serving .meta-text__data',
    author: '.author-name',
    rating: '.recipe-ratings__score',
    ratingCount: '.recipe-ratings__count',
    nutrition: '.nutrition-info',
    tips: '.recipe-tips li'
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

      // Ingredients
      if (recipe.ingredients.length === 0) {
        const ingredientElements = this.findElements(dom, this.selectors.ingredients);
        recipe.ingredients = ingredientElements.map(element => {
          const ingredient = this.parseIngredient(this.getTextContent(element));
          const note = this.getAttributeValue(element, 'data-note');
          if (note) {
            ingredient.notes = note;
          }
          return ingredient;
        });
      }

      // Instructions with tips
      if (recipe.steps.length === 0) {
        const instructionElements = this.findElements(dom, this.selectors.instructions);
        recipe.steps = instructionElements.map((element, index) => {
          const step = this.parseStep(this.getTextContent(element), index + 1);
          
          // Look for tips within the step
          const tipElement = this.findElement([element], '.tip');
          if (tipElement) {
            step.tips = [this.getTextContent(tipElement)];
          }
          
          // Look for images within the step
          const imageElement = this.findElement([element], 'img');
          if (imageElement) {
            step.imageUrl = this.getAttributeValue(imageElement, 'src');
          }

          return step;
        });

        // Add general recipe tips
        const tipElements = this.findElements(dom, this.selectors.tips);
        if (tipElements.length > 0) {
          const tips = tipElements.map(element => this.getTextContent(element));
          // Add general tips to the first step
          if (recipe.steps.length > 0) {
            recipe.steps[0].tips = recipe.steps[0].tips || [];
            recipe.steps[0].tips.push(...tips.map(tip => `General Tip: ${tip}`));
          }
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
        const protein = nutritionText.match(/protein:?\s*(\d+)/i);
        const carbs = nutritionText.match(/carbohydrates:?\s*(\d+)/i);
        const fat = nutritionText.match(/fat:?\s*(\d+)/i);

        if (calories) recipe.nutritionInfo.calories = parseInt(calories[1]);
        if (protein) recipe.nutritionInfo.protein = parseInt(protein[1]);
        if (carbs) recipe.nutritionInfo.carbs = parseInt(carbs[1]);
        if (fat) recipe.nutritionInfo.fat = parseInt(fat[1]);
      }

      // Detect dietary info, cuisine, and difficulty
      this.detectDietaryInfo(recipe);
      this.detectCuisine(recipe);
      this.detectDifficulty(recipe);

      // Extract tags
      recipe.tags = this.extractTags(recipe);

      return {
        success: true,
        recipe
      };
    } catch (error) {
      console.error(`Error parsing Simply Recipes recipe:`, error);
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

    // Simply Recipes specific tags
    const categories = ['quick', 'easy', 'healthy', 'budget', 'family-friendly', 'make-ahead'];
    categories.forEach(category => {
      if (text.includes(category)) tags.add(category);
    });

    return Array.from(tags);
  }
} 