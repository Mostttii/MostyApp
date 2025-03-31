import { SimplyRecipesParser } from '../../services/parsers/SimplyRecipesParser';
import { BaseParserTest } from './BaseParser.test';
import { Recipe } from '../../types/Recipe';
import { expect, describe, it, beforeEach } from '@jest/globals';

describe('SimplyRecipesParser', () => {
  const testHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Classic Margherita Pizza</title>
        <meta name="description" content="A simple and delicious homemade Margherita pizza with fresh basil and mozzarella.">
        <script type="application/ld+json">
          {
            "@context": "https://schema.org/",
            "@type": "Recipe",
            "name": "Classic Margherita Pizza",
            "description": "A simple and delicious homemade Margherita pizza with fresh basil and mozzarella.",
            "image": "https://example.com/pizza.jpg",
            "cookTime": "PT30M",
            "recipeYield": "4",
            "author": {
              "@type": "Person",
              "name": "PizzaPro"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.7",
              "reviewCount": "800"
            },
            "recipeIngredient": [
              "1 pound pizza dough",
              "1/2 cup tomato sauce",
              "8 ounces fresh mozzarella",
              "1/4 cup fresh basil leaves",
              "2 tablespoons olive oil",
              "1/4 teaspoon salt",
              "1/4 teaspoon black pepper"
            ],
            "recipeInstructions": [
              "Preheat oven to 500°F",
              "Roll out pizza dough",
              "Spread tomato sauce",
              "Add mozzarella",
              "Bake for 10-12 minutes",
              "Top with fresh basil",
              "Drizzle with olive oil"
            ],
            "nutrition": {
              "@type": "NutritionInformation",
              "calories": "350",
              "proteinContent": "15",
              "carbohydrateContent": "45",
              "fatContent": "12"
            }
          }
        </script>
      </head>
      <body>
        <h1 class="recipe-title">Classic Margherita Pizza</h1>
        <div class="recipe-description">A simple and delicious homemade Margherita pizza with fresh basil and mozzarella.</div>
        <img class="recipe-image" src="https://example.com/pizza.jpg" alt="Margherita Pizza">
        <div class="recipe-time-yield">
          <span class="total-time">30 mins</span>
          <span class="servings">4 servings</span>
        </div>
        <div class="recipe-author">By PizzaPro</div>
        <div class="recipe-ratings">
          <span class="rating">4.7</span>
          <span class="rating-count">800 ratings</span>
        </div>
        <div class="recipe-ingredients">
          <ul>
            <li>1 pound pizza dough</li>
            <li>1/2 cup tomato sauce</li>
            <li>8 ounces fresh mozzarella</li>
            <li>1/4 cup fresh basil leaves</li>
            <li>2 tablespoons olive oil</li>
            <li>1/4 teaspoon salt</li>
            <li>1/4 teaspoon black pepper</li>
          </ul>
        </div>
        <div class="recipe-instructions">
          <ol>
            <li>Preheat oven to 500°F</li>
            <li>Roll out pizza dough</li>
            <li>Spread tomato sauce</li>
            <li>Add mozzarella</li>
            <li>Bake for 10-12 minutes</li>
            <li>Top with fresh basil</li>
            <li>Drizzle with olive oil</li>
          </ol>
        </div>
        <div class="nutrition-info">
          <p>Calories: 350</p>
          <p>Protein: 15g</p>
          <p>Carbohydrates: 45g</p>
          <p>Fat: 12g</p>
        </div>
        <div class="recipe-tips">
          <h3>Tips for Success</h3>
          <ul>
            <li>Use a pizza stone for the best crust</li>
            <li>Let the dough rest at room temperature</li>
            <li>Don't overload with toppings</li>
          </ul>
        </div>
        <div class="recipe-variations">
          <h3>Variations</h3>
          <ul>
            <li>Add sliced mushrooms</li>
            <li>Use buffalo mozzarella</li>
            <li>Add fresh garlic</li>
          </ul>
        </div>
        <div class="recipe-storage">
          <h3>Storage</h3>
          <p>Store leftovers in an airtight container in the refrigerator for up to 3 days.</p>
        </div>
      </body>
    </html>
  `;

  const expectedRecipe: Partial<Recipe> = {
    title: 'Classic Margherita Pizza',
    description: 'A simple and delicious homemade Margherita pizza with fresh basil and mozzarella.',
    imageUrl: 'https://example.com/pizza.jpg',
    cookTime: 30,
    servings: 4,
    creatorId: 'PizzaPro',
    rating: {
      average: 4.7,
      count: 800
    },
    ingredients: [
      { id: '1', name: 'pizza dough', amount: 1, unit: 'pound' },
      { id: '2', name: 'tomato sauce', amount: 0.5, unit: 'cup' },
      { id: '3', name: 'fresh mozzarella', amount: 8, unit: 'ounce' },
      { id: '4', name: 'fresh basil leaves', amount: 0.25, unit: 'cup' },
      { id: '5', name: 'olive oil', amount: 2, unit: 'tablespoon' },
      { id: '6', name: 'salt', amount: 0.25, unit: 'teaspoon' },
      { id: '7', name: 'black pepper', amount: 0.25, unit: 'teaspoon' }
    ],
    steps: [
      { id: '1', order: 1, description: 'Preheat oven to 500°F', tips: [] },
      { id: '2', order: 2, description: 'Roll out pizza dough', tips: [] },
      { id: '3', order: 3, description: 'Spread tomato sauce', tips: [] },
      { id: '4', order: 4, description: 'Add mozzarella', tips: [] },
      { id: '5', order: 5, description: 'Bake for 10-12 minutes', tips: [] },
      { id: '6', order: 6, description: 'Top with fresh basil', tips: [] },
      { id: '7', order: 7, description: 'Drizzle with olive oil', tips: [] }
    ],
    nutritionInfo: {
      calories: 350,
      protein: 15,
      carbs: 45,
      fat: 12
    },
    dietaryInfo: {
      vegetarian: true,
      vegan: false,
      glutenFree: false,
      dairyFree: false
    },
    tags: [
      'pizza',
      'italian',
      'medium',
      'dinner',
      'oven',
      'vegetarian',
      'classic'
    ]
  };

  let parserTest: BaseParserTest;

  beforeEach(() => {
    const parser = new SimplyRecipesParser();
    parserTest = new BaseParserTest(parser, testHtml, expectedRecipe);
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

  it('should parse tips, variations, and storage info', async () => {
    const parser = new SimplyRecipesParser();
    const result = await parser.parse(testHtml, 'https://test.com/recipe');
    
    expect(result.success).toBe(true);
    expect(result.recipe?.steps[0].tips).toContain('Tip: Use a pizza stone for the best crust');
    expect(result.recipe?.steps[0].tips).toContain('Tip: Let the dough rest at room temperature');
    expect(result.recipe?.steps[0].tips).toContain('Tip: Don\'t overload with toppings');
    expect(result.recipe?.steps[0].tips).toContain('Variation: Add sliced mushrooms');
    expect(result.recipe?.steps[0].tips).toContain('Variation: Use buffalo mozzarella');
    expect(result.recipe?.steps[0].tips).toContain('Variation: Add fresh garlic');
    expect(result.recipe?.steps[0].tips).toContain('Storage: Store leftovers in an airtight container in the refrigerator for up to 3 days.');
  });

  it('should pass all tests', async () => {
    await parserTest.runAllTests();
  });
}); 