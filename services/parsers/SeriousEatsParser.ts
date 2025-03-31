import { BaseParser } from './BaseParser';
import { Recipe, ParseResult, Ingredient, Step } from '../../types/Recipe';
import { v4 as uuidv4 } from 'uuid';

export class SeriousEatsParser extends BaseParser {
  protected readonly domain = 'seriouseats.com';
  protected readonly name = 'Serious Eats';
  protected readonly selectors = {
    title: 'h1.recipe-title',
    description: '.recipe-introduction',
    image: '.primary-image img',
    ingredients: '.ingredient-list li',
    ingredientGroups: '.ingredient-group',
    instructions: '.recipe-procedure-text',
    instructionGroups: '.recipe-procedure-group',
    notes: '.recipe-note',
    tips: '.recipe-tip',
    cookTime: '.recipe-meta-item--cook-time .recipe-meta-item-body',
    servings: '.recipe-meta-item--yield .recipe-meta-item-body',
    author: '.author-name',
    rating: '.recipe-rating-value',
    ratingCount: '.recipe-ratings-count',
    nutrition: '.nutrition-info'
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

      // Ingredients (with groups)
      if (recipe.ingredients.length === 0) {
        const ingredientGroups = this.findElements(dom, this.selectors.ingredientGroups);
        
        if (ingredientGroups.length > 0) {
          // Handle grouped ingredients
          recipe.ingredients = ingredientGroups.flatMap(group => {
            const groupName = this.getTextContent(this.findElement([group], 'h3'));
            return this.findElements([group], this.selectors.ingredients).map(element => {
              const ingredient = this.parseIngredient(this.getTextContent(element));
              if (groupName) {
                ingredient.notes = `Group: ${groupName}`;
              }
              return ingredient;
            });
          });
        } else {
          // Handle flat list of ingredients
          const ingredientElements = this.findElements(dom, this.selectors.ingredients);
          recipe.ingredients = ingredientElements.map(element => 
            this.parseIngredient(this.getTextContent(element))
          );
        }
      }

      // Instructions (with groups and notes)
      if (recipe.steps.length === 0) {
        const instructionGroups = this.findElements(dom, this.selectors.instructionGroups);
        let stepOrder = 1;

        if (instructionGroups.length > 0) {
          // Handle grouped instructions
          recipe.steps = instructionGroups.flatMap(group => {
            const groupName = this.getTextContent(this.findElement([group], 'h3'));
            return this.findElements([group], this.selectors.instructions).map(element => {
              const step = this.parseStep(this.getTextContent(element), stepOrder++);
              if (groupName) {
                step.tips = [`Section: ${groupName}`];
              }
              return step;
            });
          });
        } else {
          // Handle flat list of instructions
          const instructionElements = this.findElements(dom, this.selectors.instructions);
          recipe.steps = instructionElements.map((element, index) => 
            this.parseStep(this.getTextContent(element), index + 1)
          );
        }

        // Add notes and tips to steps
        const notes = this.findElements(dom, this.selectors.notes);
        const tips = this.findElements(dom, this.selectors.tips);

        notes.forEach(noteElement => {
          const noteText = this.getTextContent(noteElement);
          const stepIndex = this.findStepIndexForNote(noteText, recipe.steps);
          if (stepIndex !== -1 && recipe.steps[stepIndex]) {
            if (!recipe.steps[stepIndex].tips) {
              recipe.steps[stepIndex].tips = [];
            }
            recipe.steps[stepIndex].tips!.push(`Note: ${noteText}`);
          }
        });

        tips.forEach(tipElement => {
          const tipText = this.getTextContent(tipElement);
          const stepIndex = this.findStepIndexForTip(tipText, recipe.steps);
          if (stepIndex !== -1 && recipe.steps[stepIndex]) {
            if (!recipe.steps[stepIndex].tips) {
              recipe.steps[stepIndex].tips = [];
            }
            recipe.steps[stepIndex].tips!.push(tipText);
          }
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
      console.error(`Error parsing Serious Eats recipe:`, error);
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

  private findStepIndexForNote(noteText: string, steps: Step[]): number {
    // Try to find the step that this note is most relevant to
    // This is a simple implementation that could be improved with NLP
    const words = noteText.toLowerCase().split(/\W+/);
    
    return steps.findIndex(step => {
      const stepWords = step.description.toLowerCase().split(/\W+/);
      const commonWords = words.filter(word => 
        word.length > 3 && stepWords.includes(word)
      );
      return commonWords.length >= 2;
    });
  }

  private findStepIndexForTip(tipText: string, steps: Step[]): number {
    // Similar to findStepIndexForNote but for tips
    return this.findStepIndexForNote(tipText, steps);
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

    // Serious Eats specific tags
    const techniques = ['sous-vide', 'pressure-cooker', 'wok', 'braised', 'fermented'];
    techniques.forEach(technique => {
      if (text.includes(technique)) tags.add(technique);
    });

    return Array.from(tags);
  }
} 