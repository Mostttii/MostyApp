import { FoodComParser } from '../../services/parsers/FoodComParser';
import { BaseParserTest } from './BaseParser.test';
import { Recipe } from '../../types/Recipe';
import { expect, describe, it, beforeEach } from '@jest/globals';

describe('FoodComParser', () => {
  const testHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Classic Chocolate Chip Cookies</title>
        <meta name="description" content="Soft and chewy chocolate chip cookies with crispy edges.">
        <script type="application/ld+json">
          {
            "@context": "https://schema.org/",
            "@type": "Recipe",
            "name": "Classic Chocolate Chip Cookies",
            "description": "Soft and chewy chocolate chip cookies with crispy edges.",
            "image": "https://example.com/cookies.jpg",
            "cookTime": "PT25M",
            "recipeYield": "24",
            "author": {
              "@type": "Person",
              "name": "BakingPro"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "1200"
            },
            "recipeIngredient": [
              "2 1/4 cups all-purpose flour",
              "1 cup butter, softened",
              "3/4 cup granulated sugar",
              "3/4 cup brown sugar",
              "2 large eggs",
              "1 teaspoon vanilla extract",
              "1 teaspoon baking soda",
              "1/2 teaspoon salt",
              "2 cups chocolate chips"
            ],
            "recipeInstructions": [
              "Preheat oven to 375°F",
              "Cream butter and sugars",
              "Add eggs and vanilla",
              "Mix in dry ingredients",
              "Stir in chocolate chips",
              "Drop by rounded tablespoons",
              "Bake for 10-12 minutes"
            ],
            "nutrition": {
              "@type": "NutritionInformation",
              "calories": "150",
              "proteinContent": "2",
              "carbohydrateContent": "18",
              "fatContent": "8"
            }
          }
        </script>
      </head>
      <body>
        <h1 class="recipe-title">Classic Chocolate Chip Cookies</h1>
        <div class="recipe-description">Soft and chewy chocolate chip cookies with crispy edges.</div>
        <img class="recipe-image" src="https://example.com/cookies.jpg" alt="Chocolate Chip Cookies">
        <div class="recipe-time-yield">
          <span class="total-time">25 mins</span>
          <span class="servings">24 cookies</span>
        </div>
        <div class="recipe-author">By BakingPro</div>
        <div class="recipe-ratings">
          <span class="rating">4.8</span>
          <span class="rating-count">1200 ratings</span>
        </div>
        <div class="recipe-ingredients">
          <ul>
            <li>2 1/4 cups all-purpose flour</li>
            <li>1 cup butter, softened</li>
            <li>3/4 cup granulated sugar</li>
            <li>3/4 cup brown sugar</li>
            <li>2 large eggs</li>
            <li>1 teaspoon vanilla extract</li>
            <li>1 teaspoon baking soda</li>
            <li>1/2 teaspoon salt</li>
            <li>2 cups chocolate chips</li>
          </ul>
        </div>
        <div class="recipe-instructions">
          <ol>
            <li>Preheat oven to 375°F</li>
            <li>Cream butter and sugars</li>
            <li>Add eggs and vanilla</li>
            <li>Mix in dry ingredients</li>
            <li>Stir in chocolate chips</li>
            <li>Drop by rounded tablespoons</li>
            <li>Bake for 10-12 minutes</li>
          </ol>
        </div>
        <div class="nutrition-info">
          <p>Calories: 150</p>
          <p>Protein: 2g</p>
          <p>Carbohydrates: 18g</p>
          <p>Fat: 8g</p>
        </div>
        <div class="recipe-tips">
          <h3>Tips</h3>
          <ul>
            <li>Make sure butter is at room temperature for best results</li>
            <li>Don't overmix the dough</li>
            <li>Let cookies cool on baking sheet for 5 minutes</li>
          </ul>
        </div>
        <div class="recipe-variations">
          <h3>Variations</h3>
          <ul>
            <li>Add 1 cup chopped nuts</li>
            <li>Use dark chocolate chips</li>
            <li>Add 1 teaspoon cinnamon</li>
          </ul>
        </div>
      </body>
    </html>
  `;

  const expectedRecipe: Partial<Recipe> = {
    title: 'Classic Chocolate Chip Cookies',
    description: 'Soft and chewy chocolate chip cookies with crispy edges.',
    imageUrl: 'https://example.com/cookies.jpg',
    cookTime: 25,
    servings: 24,
    creatorId: 'BakingPro',
    rating: {
      average: 4.8,
      count: 1200
    },
    ingredients: [
      { id: '1', name: 'all-purpose flour', amount: 2.25, unit: 'cup' },
      { id: '2', name: 'butter', amount: 1, unit: 'cup', notes: 'softened' },
      { id: '3', name: 'granulated sugar', amount: 0.75, unit: 'cup' },
      { id: '4', name: 'brown sugar', amount: 0.75, unit: 'cup' },
      { id: '5', name: 'eggs', amount: 2, unit: 'unit', notes: 'large' },
      { id: '6', name: 'vanilla extract', amount: 1, unit: 'teaspoon' },
      { id: '7', name: 'baking soda', amount: 1, unit: 'teaspoon' },
      { id: '8', name: 'salt', amount: 0.5, unit: 'teaspoon' },
      { id: '9', name: 'chocolate chips', amount: 2, unit: 'cup' }
    ],
    steps: [
      { id: '1', order: 1, description: 'Preheat oven to 375°F', tips: [] },
      { id: '2', order: 2, description: 'Cream butter and sugars', tips: ['Tip: Make sure butter is at room temperature for best results'] },
      { id: '3', order: 3, description: 'Add eggs and vanilla', tips: [] },
      { id: '4', order: 4, description: 'Mix in dry ingredients', tips: ['Tip: Don\'t overmix the dough'] },
      { id: '5', order: 5, description: 'Stir in chocolate chips', tips: [] },
      { id: '6', order: 6, description: 'Drop by rounded tablespoons', tips: [] },
      { id: '7', order: 7, description: 'Bake for 10-12 minutes', tips: ['Tip: Let cookies cool on baking sheet for 5 minutes'] }
    ],
    nutritionInfo: {
      calories: 150,
      protein: 2,
      carbs: 18,
      fat: 8
    },
    dietaryInfo: {
      vegetarian: true,
      vegan: false,
      glutenFree: false,
      dairyFree: false
    },
    tags: [
      'dessert',
      'cookies',
      'easy',
      'baking',
      'chocolate',
      'classic',
      'snack'
    ]
  };

  let parserTest: BaseParserTest;

  class FoodComParserTest extends BaseParserTest {
    protected getTestHTML(): string {
      return testHtml;
    }

    protected getTestURL(): string {
      return 'https://food.com/recipe/test';
    }
  }

  beforeEach(() => {
    const parser = new FoodComParser();
    parserTest = new FoodComParserTest(parser, expectedRecipe as Recipe);
  });

  it('should parse basic recipe structure', async () => {
    await parserTest.testBasicStructure();
  });

  it('should parse ingredients correctly', async () => {
    await parserTest.testIngredientParsing();
  });

  it('should parse steps correctly', async () => {
    await parserTest.testStepParsing();
  });

  it('should parse nutrition information', async () => {
    await parserTest.testNutritionInfo();
  });

  it('should parse dietary information', async () => {
    await parserTest.testDietaryInfo();
  });

  it('should extract tags correctly', async () => {
    await parserTest.testTagExtraction();
  });

  it('should handle errors gracefully', async () => {
    await parserTest.testErrorHandling();
  });

  it('should parse tips and variations', async () => {
    const parser = new FoodComParser();
    const result = await parser.parse(testHtml, 'https://test.com/recipe');
    
    expect(result.success).toBe(true);
    expect(result.recipe).toBeDefined();
    if (!result.recipe) return;

    // Check that tips and variations are distributed across steps
    const allTips = result.recipe.steps.flatMap(step => step.tips);
    expect(allTips).toContain('Tip: Make sure butter is at room temperature for best results');
    expect(allTips).toContain('Tip: Don\'t overmix the dough');
    expect(allTips).toContain('Tip: Let cookies cool on baking sheet for 5 minutes');
    expect(allTips).toContain('Variation: Add 1 cup chopped nuts');
    expect(allTips).toContain('Variation: Use dark chocolate chips');
    expect(allTips).toContain('Variation: Add 1 teaspoon cinnamon');

    // Verify tips are associated with relevant steps
    const creamingStep = result.recipe.steps.find(step => step.description.toLowerCase().includes('cream butter'));
    expect(creamingStep?.tips).toContain('Tip: Make sure butter is at room temperature for best results');

    const mixingStep = result.recipe.steps.find(step => step.description.toLowerCase().includes('mix'));
    expect(mixingStep?.tips).toContain('Tip: Don\'t overmix the dough');

    const bakingStep = result.recipe.steps.find(step => step.description.toLowerCase().includes('bake'));
    expect(bakingStep?.tips).toContain('Tip: Let cookies cool on baking sheet for 5 minutes');
  });

  it('should pass all tests', async () => {
    await parserTest.runAllTests();
  });
}); 