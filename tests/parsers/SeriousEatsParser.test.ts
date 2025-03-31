import { SeriousEatsParser } from '../../services/parsers/SeriousEatsParser';
import { BaseParserTest } from './BaseParser.test';
import { Recipe } from '../../types/Recipe';
import { expect, describe, it, beforeEach } from '@jest/globals';

describe('SeriousEatsParser', () => {
  const testHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Perfect Pan-Seared Steak</title>
        <meta name="description" content="A foolproof method for cooking restaurant-quality steaks at home.">
        <script type="application/ld+json">
          {
            "@context": "https://schema.org/",
            "@type": "Recipe",
            "name": "Perfect Pan-Seared Steak",
            "description": "A foolproof method for cooking restaurant-quality steaks at home.",
            "image": "https://example.com/steak.jpg",
            "cookTime": "PT15M",
            "recipeYield": "2",
            "author": {
              "@type": "Person",
              "name": "SteakMaster"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "500"
            },
            "recipeIngredient": [
              "2 (1-inch-thick) rib-eye steaks",
              "Kosher salt",
              "Freshly ground black pepper",
              "2 tablespoons vegetable oil",
              "2 tablespoons unsalted butter",
              "4 sprigs fresh thyme",
              "4 cloves garlic, smashed"
            ],
            "recipeInstructions": [
              "Season steaks generously with salt and pepper",
              "Heat oil in a heavy skillet over high heat",
              "Add steaks and cook until well-browned",
              "Add butter, thyme, and garlic",
              "Baste steaks with butter mixture",
              "Cook to desired doneness",
              "Let rest for 5 minutes"
            ],
            "nutrition": {
              "@type": "NutritionInformation",
              "calories": "800",
              "proteinContent": "65",
              "carbohydrateContent": "0",
              "fatContent": "55"
            }
          }
        </script>
      </head>
      <body>
        <h1 class="recipe-title">Perfect Pan-Seared Steak</h1>
        <div class="recipe-description">A foolproof method for cooking restaurant-quality steaks at home.</div>
        <img class="recipe-image" src="https://example.com/steak.jpg" alt="Pan-Seared Steak">
        <div class="recipe-time-yield">
          <span class="total-time">15 mins</span>
          <span class="servings">2 servings</span>
        </div>
        <div class="recipe-author">By SteakMaster</div>
        <div class="recipe-ratings">
          <span class="rating">4.9</span>
          <span class="rating-count">500 ratings</span>
        </div>
        <div class="recipe-ingredients">
          <ul>
            <li>2 (1-inch-thick) rib-eye steaks</li>
            <li>Kosher salt</li>
            <li>Freshly ground black pepper</li>
            <li>2 tablespoons vegetable oil</li>
            <li>2 tablespoons unsalted butter</li>
            <li>4 sprigs fresh thyme</li>
            <li>4 cloves garlic, smashed</li>
          </ul>
        </div>
        <div class="recipe-instructions">
          <ol>
            <li>Season steaks generously with salt and pepper</li>
            <li>Heat oil in a heavy skillet over high heat</li>
            <li>Add steaks and cook until well-browned</li>
            <li>Add butter, thyme, and garlic</li>
            <li>Baste steaks with butter mixture</li>
            <li>Cook to desired doneness</li>
            <li>Let rest for 5 minutes</li>
          </ol>
        </div>
        <div class="nutrition-info">
          <p>Calories: 800</p>
          <p>Protein: 65g</p>
          <p>Carbohydrates: 0g</p>
          <p>Fat: 55g</p>
        </div>
        <div class="recipe-notes">
          <h3>Why This Recipe Works</h3>
          <p>Starting with room-temperature steaks ensures even cooking. The high heat creates a perfect crust, while basting with butter adds flavor and helps prevent overcooking.</p>
        </div>
        <div class="recipe-tips">
          <h3>Key Techniques</h3>
          <ul>
            <li>Use a heavy-bottomed skillet for even heat distribution</li>
            <li>Don't move the steaks until they release easily from the pan</li>
            <li>Let the steaks rest to allow juices to redistribute</li>
          </ul>
        </div>
        <div class="recipe-equipment">
          <h3>Equipment</h3>
          <ul>
            <li>12-inch cast iron skillet</li>
            <li>Instant-read thermometer</li>
            <li>Tongs</li>
          </ul>
        </div>
      </body>
    </html>
  `;

  const expectedRecipe: Partial<Recipe> = {
    title: 'Perfect Pan-Seared Steak',
    description: 'A foolproof method for cooking restaurant-quality steaks at home.',
    imageUrl: 'https://example.com/steak.jpg',
    cookTime: 15,
    servings: 2,
    creatorId: 'SteakMaster',
    rating: {
      average: 4.9,
      count: 500
    },
    ingredients: [
      { id: '1', name: 'rib-eye steaks', amount: 2, unit: 'unit', notes: '1-inch-thick' },
      { id: '2', name: 'kosher salt', amount: 1, unit: 'to taste' },
      { id: '3', name: 'black pepper', amount: 1, unit: 'to taste', notes: 'freshly ground' },
      { id: '4', name: 'vegetable oil', amount: 2, unit: 'tablespoon' },
      { id: '5', name: 'unsalted butter', amount: 2, unit: 'tablespoon' },
      { id: '6', name: 'fresh thyme', amount: 4, unit: 'sprig' },
      { id: '7', name: 'garlic', amount: 4, unit: 'clove', notes: 'smashed' }
    ],
    steps: [
      { id: '1', order: 1, description: 'Season steaks generously with salt and pepper', tips: [] },
      { id: '2', order: 2, description: 'Heat oil in a heavy skillet over high heat', tips: [] },
      { id: '3', order: 3, description: 'Add steaks and cook until well-browned', tips: [] },
      { id: '4', order: 4, description: 'Add butter, thyme, and garlic', tips: [] },
      { id: '5', order: 5, description: 'Baste steaks with butter mixture', tips: [] },
      { id: '6', order: 6, description: 'Cook to desired doneness', tips: [] },
      { id: '7', order: 7, description: 'Let rest for 5 minutes', tips: [] }
    ],
    nutritionInfo: {
      calories: 800,
      protein: 65,
      carbs: 0,
      fat: 55
    },
    dietaryInfo: {
      vegetarian: false,
      vegan: false,
      glutenFree: true,
      dairyFree: false
    },
    tags: [
      'steak',
      'beef',
      'medium',
      'dinner',
      'stovetop',
      'technique',
      'restaurant-quality'
    ]
  };

  let parserTest: BaseParserTest;

  beforeEach(() => {
    const parser = new SeriousEatsParser();
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

  it('should parse notes, tips, and equipment', async () => {
    const parser = new SeriousEatsParser();
    const result = await parser.parse(testHtml, 'https://test.com/recipe');
    
    expect(result.success).toBe(true);
    expect(result.recipe?.steps[0].tips).toContain('Why This Recipe Works: Starting with room-temperature steaks ensures even cooking. The high heat creates a perfect crust, while basting with butter adds flavor and helps prevent overcooking.');
    expect(result.recipe?.steps[0].tips).toContain('Key Technique: Use a heavy-bottomed skillet for even heat distribution');
    expect(result.recipe?.steps[0].tips).toContain('Key Technique: Don\'t move the steaks until they release easily from the pan');
    expect(result.recipe?.steps[0].tips).toContain('Key Technique: Let the steaks rest to allow juices to redistribute');
    expect(result.recipe?.steps[0].tips).toContain('Equipment Needed: 12-inch cast iron skillet, Instant-read thermometer, Tongs');
  });

  it('should pass all tests', async () => {
    await parserTest.runAllTests();
  });
}); 