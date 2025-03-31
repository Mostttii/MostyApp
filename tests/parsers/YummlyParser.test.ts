import { YummlyParser } from '../../services/parsers/YummlyParser';
import { BaseParserTest } from './BaseParser.test';
import { Recipe } from '../../types/Recipe';
import { expect, describe, it, beforeEach } from '@jest/globals';

describe('YummlyParser', () => {
  const testHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Healthy Buddha Bowl</title>
        <meta name="description" content="A nutritious and colorful Buddha bowl packed with quinoa, roasted vegetables, and tahini dressing.">
        <script type="application/ld+json">
          {
            "@context": "https://schema.org/",
            "@type": "Recipe",
            "name": "Healthy Buddha Bowl",
            "description": "A nutritious and colorful Buddha bowl packed with quinoa, roasted vegetables, and tahini dressing.",
            "image": "https://example.com/buddha-bowl.jpg",
            "cookTime": "PT40M",
            "recipeYield": "4",
            "author": {
              "@type": "Person",
              "name": "HealthyChef"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "600"
            },
            "recipeIngredient": [
              "1 cup quinoa",
              "2 cups water",
              "1 sweet potato",
              "1 red bell pepper",
              "1 cup chickpeas",
              "2 cups kale",
              "1 avocado",
              "1/4 cup tahini",
              "2 tablespoons lemon juice",
              "1 tablespoon olive oil",
              "1/4 teaspoon salt"
            ],
            "recipeInstructions": [
              "Cook quinoa in water",
              "Roast sweet potato and bell pepper",
              "Massage kale with olive oil",
              "Make tahini dressing",
              "Assemble bowl",
              "Top with avocado",
              "Drizzle with dressing"
            ],
            "nutrition": {
              "@type": "NutritionInformation",
              "calories": "450",
              "proteinContent": "15",
              "carbohydrateContent": "65",
              "fatContent": "18"
            }
          }
        </script>
      </head>
      <body>
        <h1 class="recipe-title">Healthy Buddha Bowl</h1>
        <div class="recipe-description">A nutritious and colorful Buddha bowl packed with quinoa, roasted vegetables, and tahini dressing.</div>
        <img class="recipe-image" src="https://example.com/buddha-bowl.jpg" alt="Buddha Bowl">
        <div class="recipe-time-yield">
          <span class="total-time">40 mins</span>
          <span class="servings">4 servings</span>
        </div>
        <div class="recipe-author">By HealthyChef</div>
        <div class="recipe-ratings">
          <span class="rating">4.8</span>
          <span class="rating-count">600 ratings</span>
        </div>
        <div class="recipe-ingredients">
          <ul>
            <li>1 cup quinoa</li>
            <li>2 cups water</li>
            <li>1 sweet potato</li>
            <li>1 red bell pepper</li>
            <li>1 cup chickpeas</li>
            <li>2 cups kale</li>
            <li>1 avocado</li>
            <li>1/4 cup tahini</li>
            <li>2 tablespoons lemon juice</li>
            <li>1 tablespoon olive oil</li>
            <li>1/4 teaspoon salt</li>
          </ul>
        </div>
        <div class="recipe-instructions">
          <ol>
            <li>Cook quinoa in water</li>
            <li>Roast sweet potato and bell pepper</li>
            <li>Massage kale with olive oil</li>
            <li>Make tahini dressing</li>
            <li>Assemble bowl</li>
            <li>Top with avocado</li>
            <li>Drizzle with dressing</li>
          </ol>
        </div>
        <div class="nutrition-info">
          <p>Calories: 450</p>
          <p>Protein: 15g</p>
          <p>Carbohydrates: 65g</p>
          <p>Fat: 18g</p>
        </div>
        <div class="recipe-tips">
          <h3>Tips</h3>
          <ul>
            <li>Use pre-cooked quinoa for faster prep</li>
            <li>Roast vegetables in advance</li>
            <li>Store dressing separately</li>
          </ul>
        </div>
        <div class="recipe-variations">
          <h3>Variations</h3>
          <ul>
            <li>Add grilled tofu</li>
            <li>Use brown rice instead of quinoa</li>
            <li>Add roasted nuts</li>
          </ul>
        </div>
        <div class="recipe-difficulty">
          <h3>Difficulty Level</h3>
          <p>Easy</p>
        </div>
        <div class="recipe-cuisine">
          <h3>Cuisine</h3>
          <p>Mediterranean</p>
        </div>
        <div class="dietary-tags">
          <span>Vegetarian</span>
          <span>Vegan</span>
          <span>Gluten-Free</span>
        </div>
      </body>
    </html>
  `;

  const expectedRecipe: Partial<Recipe> = {
    title: 'Healthy Buddha Bowl',
    description: 'A nutritious and colorful Buddha bowl packed with quinoa, roasted vegetables, and tahini dressing.',
    imageUrl: 'https://example.com/buddha-bowl.jpg',
    cookTime: 40,
    servings: 4,
    creatorId: 'HealthyChef',
    rating: {
      average: 4.8,
      count: 600
    },
    ingredients: [
      { id: '1', name: 'quinoa', amount: 1, unit: 'cup' },
      { id: '2', name: 'water', amount: 2, unit: 'cup' },
      { id: '3', name: 'sweet potato', amount: 1, unit: 'unit' },
      { id: '4', name: 'red bell pepper', amount: 1, unit: 'unit' },
      { id: '5', name: 'chickpeas', amount: 1, unit: 'cup' },
      { id: '6', name: 'kale', amount: 2, unit: 'cup' },
      { id: '7', name: 'avocado', amount: 1, unit: 'unit' },
      { id: '8', name: 'tahini', amount: 0.25, unit: 'cup' },
      { id: '9', name: 'lemon juice', amount: 2, unit: 'tablespoon' },
      { id: '10', name: 'olive oil', amount: 1, unit: 'tablespoon' },
      { id: '11', name: 'salt', amount: 0.25, unit: 'teaspoon' }
    ],
    steps: [
      { id: '1', order: 1, description: 'Cook quinoa in water', tips: [] },
      { id: '2', order: 2, description: 'Roast sweet potato and bell pepper', tips: [] },
      { id: '3', order: 3, description: 'Massage kale with olive oil', tips: [] },
      { id: '4', order: 4, description: 'Make tahini dressing', tips: [] },
      { id: '5', order: 5, description: 'Assemble bowl', tips: [] },
      { id: '6', order: 6, description: 'Top with avocado', tips: [] },
      { id: '7', order: 7, description: 'Drizzle with dressing', tips: [] }
    ],
    nutritionInfo: {
      calories: 450,
      protein: 15,
      carbs: 65,
      fat: 18
    },
    dietaryInfo: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true
    },
    tags: [
      'buddha-bowl',
      'mediterranean',
      'easy',
      'lunch',
      'healthy',
      'vegetarian',
      'vegan'
    ]
  };

  let parserTest: BaseParserTest;

  beforeEach(() => {
    const parser = new YummlyParser();
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

  it('should parse tips, variations, difficulty, and cuisine', async () => {
    const parser = new YummlyParser();
    const result = await parser.parse(testHtml, 'https://test.com/recipe');
    
    expect(result.success).toBe(true);
    expect(result.recipe?.steps[0].tips).toContain('Tip: Use pre-cooked quinoa for faster prep');
    expect(result.recipe?.steps[0].tips).toContain('Tip: Roast vegetables in advance');
    expect(result.recipe?.steps[0].tips).toContain('Tip: Store dressing separately');
    expect(result.recipe?.steps[0].tips).toContain('Variation: Add grilled tofu');
    expect(result.recipe?.steps[0].tips).toContain('Variation: Use brown rice instead of quinoa');
    expect(result.recipe?.steps[0].tips).toContain('Variation: Add roasted nuts');
    expect(result.recipe?.steps[0].tips).toContain('Difficulty Level: Easy');
    expect(result.recipe?.steps[0].tips).toContain('Cuisine: Mediterranean');
  });

  it('should pass all tests', async () => {
    await parserTest.runAllTests();
  });
}); 