import { BaseParser } from './BaseParser';
import { Recipe, ParseResult, Ingredient, Step } from '../../types/Recipe';
import { v4 as uuidv4 } from 'uuid';

export class DamnDeliciousParser extends BaseParser {
  protected readonly domain = 'damndelicious.net';
  protected readonly name = 'Damn Delicious';
  protected readonly selectors = {
    title: '.entry-title',
    description: '.recipe-description',
    image: '.recipe-image img',
    ingredients: '.ingredients li',
    instructions: '.instructions li',
    cookTime: '.total-time',
    servings: '.servings',
    author: '.author-name',
    rating: '.recipe-rating',
    ratingCount: '.rating-count',
    nutrition: '.nutrition-info',
    quickTips: '.quick-tip',
    stepPhotos: '.step-photo',
    videoUrl: '.recipe-video',
    equipmentList: '.equipment-list li',
    prepNotes: '.prep-notes',
    difficultyLevel: '.difficulty-level'
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

      // Video URL
      const videoElement = this.findElement(dom, this.selectors.videoUrl);
      if (videoElement) {
        const videoUrl = this.getAttributeValue(videoElement, 'src');
        if (videoUrl && recipe.steps.length > 0) {
          recipe.steps[0].tips = recipe.steps[0].tips || [];
          recipe.steps[0].tips.push(`Video Guide: ${videoUrl}`);
        }
      }

      // Ingredients with equipment list
      if (recipe.ingredients.length === 0) {
        const ingredientElements = this.findElements(dom, this.selectors.ingredients);
        recipe.ingredients = ingredientElements.map(element => this.parseIngredient(this.getTextContent(element)));

        // Add equipment list as special ingredients
        const equipmentElements = this.findElements(dom, this.selectors.equipmentList);
        if (equipmentElements.length > 0) {
          const equipmentIngredients = equipmentElements.map(element => ({
            id: uuidv4(),
            name: this.getTextContent(element),
            amount: 1,
            unit: 'piece',
            category: 'equipment'
          }));
          recipe.ingredients.push(...equipmentIngredients);
        }
      }

      // Instructions with step photos
      if (recipe.steps.length === 0) {
        const instructionElements = this.findElements(dom, this.selectors.instructions);
        recipe.steps = instructionElements.map((element, index) => {
          const step = this.parseStep(this.getTextContent(element), index + 1);
          
          // Look for step photos
          const stepPhoto = this.findElement([element], this.selectors.stepPhotos);
          if (stepPhoto) {
            step.imageUrl = this.getAttributeValue(stepPhoto, 'src');
          }

          // Look for quick tips
          const quickTip = this.findElement([element], this.selectors.quickTips);
          if (quickTip) {
            step.tips = step.tips || [];
            step.tips.push(`Quick Tip: ${this.getTextContent(quickTip)}`);
          }

          return step;
        });

        // Add prep notes to the first step
        const prepNotesElement = this.findElement(dom, this.selectors.prepNotes);
        if (prepNotesElement && recipe.steps.length > 0) {
          const firstStep = recipe.steps[0];
          firstStep.tips = firstStep.tips || [];
          firstStep.tips.push(`Prep Note: ${this.getTextContent(prepNotesElement)}`);
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

      // Difficulty Level
      const difficultyElement = this.findElement(dom, this.selectors.difficultyLevel);
      if (difficultyElement) {
        const difficultyText = this.getTextContent(difficultyElement).toLowerCase();
        recipe.difficulty = difficultyText.includes('easy') ? 'easy' :
                          difficultyText.includes('medium') ? 'medium' : 'hard';
      } else {
        this.detectDifficulty(recipe);
      }

      // Detect cuisine
      this.detectCuisine(recipe);

      // Extract tags
      recipe.tags = this.extractTags(recipe);

      return {
        success: true,
        recipe
      };
    } catch (error) {
      console.error(`Error parsing Damn Delicious recipe:`, error);
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

    // Damn Delicious specific tags
    const categories = [
      'quick', 'easy', '30-minute', 'one-pot', 'weeknight',
      'meal-prep', 'budget-friendly', 'family-friendly'
    ];
    categories.forEach(category => {
      if (text.includes(category)) tags.add(category);
    });

    // Add dietary tags if mentioned
    const dietaryTags = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'low-carb'];
    dietaryTags.forEach(tag => {
      if (text.includes(tag)) {
        tags.add(tag);
        if (tag === 'vegetarian') recipe.dietaryInfo.vegetarian = true;
        if (tag === 'vegan') recipe.dietaryInfo.vegan = true;
        if (tag === 'gluten-free') recipe.dietaryInfo.glutenFree = true;
        if (tag === 'dairy-free') recipe.dietaryInfo.dairyFree = true;
      }
    });

    return Array.from(tags);
  }
} 