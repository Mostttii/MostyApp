import { LoveAndLemonsParser } from '../../services/parsers/LoveAndLemonsParser';
import { BaseParserTest } from './BaseParser.test';
import { Recipe } from '../../types/Recipe';
import { expect, describe, it, beforeEach } from '@jest/globals';

describe('LoveAndLemonsParser', () => {
  const testHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Rainbow Buddha Bowl</title>
        <meta name="description" content="A vibrant and healthy Buddha bowl packed with seasonal vegetables and a creamy tahini dressing.">
        <script type="application/ld+json">
          {
            "@context": "https://schema.org/",
            "@type": "Recipe",
            "name": "Rainbow Buddha Bowl",
            "description": "A vibrant and healthy Buddha bowl packed with seasonal vegetables and a creamy tahini dressing.",
            "image": "https://example.com/buddha-bowl.jpg",
            "cookTime": "PT35M",
            "recipeYield": "4",
            "author": {
              "@type": "Person",
              "name": "PlantBasedChef"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "500"
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
        <h1 class="recipe-title">Rainbow Buddha Bowl</h1>
        <div class="recipe-description">A vibrant and healthy Buddha bowl packed with seasonal vegetables and a creamy tahini dressing.</div>
        <img class="recipe-image" src="https://example.com/buddha-bowl.jpg" alt="Buddha Bowl">
        <div class="recipe-time-yield">
          <span class="total-time">35 mins</span>
          <span class="servings">4 servings</span>
        </div>
        <div class="recipe-author">By PlantBasedChef</div>
        <div class="recipe-ratings">
          <span class="rating">4.9</span>
          <span class="rating-count">500 ratings</span>
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
        <div class="recipe-seasonal">
          <h3>Seasonal Notes</h3>
          <p>This recipe works best with fresh summer vegetables. In winter, try using roasted root vegetables instead.</p>
        </div>
        <div class="recipe-storage">
          <h3>Storage</h3>
          <p>Store components separately in airtight containers. The dressing will keep for up to 5 days in the refrigerator.</p>
        </div>
        <div class="recipe-substitutions">
          <h3>Substitutions</h3>
          <ul>
            <li>Quinoa → Brown rice or farro</li>
            <li>Tahini → Cashew butter</li>
            <li>Kale → Spinach or arugula</li>
          </ul>
        </div>
      </body>
    </html>
  `;

  const expectedRecipe: Partial<Recipe> = {
    title: 'Rainbow Buddha Bowl',
    description: 'A vibrant and healthy Buddha bowl packed with seasonal vegetables and a creamy tahini dressing.',
    imageUrl: 'https://example.com/buddha-bowl.jpg',
    cookTime: 35,
    servings: 4,
    creatorId: 'PlantBasedChef',
    rating: {
      average: 4.9,
      count: 500
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
      'vegetarian',
      'easy',
      'lunch',
      'healthy',
      'vegan',
      'seasonal'
    ]
  };

  let parserTest: BaseParserTest;

  beforeEach(() => {
    const parser = new LoveAndLemonsParser();
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

  it('should parse tips, variations, seasonal notes, storage, and substitutions', async () => {
    const parser = new LoveAndLemonsParser();
    const result = await parser.parse(testHtml, 'https://test.com/recipe');
    
    expect(result.success).toBe(true);
    expect(result.recipe?.steps[0].tips).toContain('Tip: Use pre-cooked quinoa for faster prep');
    expect(result.recipe?.steps[0].tips).toContain('Tip: Roast vegetables in advance');
    expect(result.recipe?.steps[0].tips).toContain('Tip: Store dressing separately');
    expect(result.recipe?.steps[0].tips).toContain('Variation: Add grilled tofu');
    expect(result.recipe?.steps[0].tips).toContain('Variation: Use brown rice instead of quinoa');
    expect(result.recipe?.steps[0].tips).toContain('Variation: Add roasted nuts');
    expect(result.recipe?.steps[0].tips).toContain('Seasonal Note: This recipe works best with fresh summer vegetables. In winter, try using roasted root vegetables instead.');
    expect(result.recipe?.steps[0].tips).toContain('Storage: Store components separately in airtight containers. The dressing will keep for up to 5 days in the refrigerator.');
    expect(result.recipe?.steps[0].tips).toContain('Substitution: Quinoa → Brown rice or farro');
    expect(result.recipe?.steps[0].tips).toContain('Substitution: Tahini → Cashew butter');
    expect(result.recipe?.steps[0].tips).toContain('Substitution: Kale → Spinach or arugula');
  });

  it('should pass all tests', async () => {
    await parserTest.runAllTests();
  });
}); 