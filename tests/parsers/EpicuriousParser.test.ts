import { EpicuriousParser } from '../../services/parsers/EpicuriousParser';
import { BaseParserTest } from './BaseParser.test';
import { Recipe } from '../../types/Recipe';
import { expect, describe, it, beforeEach } from '@jest/globals';

describe('EpicuriousParser', () => {
  const testHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Classic French Onion Soup</title>
        <meta name="description" content="A rich and flavorful French onion soup with caramelized onions and melted cheese.">
        <script type="application/ld+json">
          {
            "@context": "https://schema.org/",
            "@type": "Recipe",
            "name": "Classic French Onion Soup",
            "description": "A rich and flavorful French onion soup with caramelized onions and melted cheese.",
            "image": "https://example.com/soup.jpg",
            "cookTime": "PT90M",
            "recipeYield": "4",
            "author": {
              "@type": "Person",
              "name": "Chef Jacques"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "850"
            },
            "recipeIngredient": [
              "4 large yellow onions",
              "4 tablespoons butter",
              "2 tablespoons olive oil",
              "1 teaspoon sugar",
              "1/2 teaspoon salt",
              "1/4 teaspoon black pepper",
              "6 cups beef broth",
              "1/2 cup dry white wine",
              "1 tablespoon fresh thyme",
              "4 slices French bread",
              "1 cup Gruyère cheese"
            ],
            "recipeInstructions": [
              "Slice onions thinly",
              "Melt butter with olive oil",
              "Add onions and cook until caramelized",
              "Add wine and reduce",
              "Add broth and simmer",
              "Toast bread and top with cheese",
              "Broil until cheese melts"
            ],
            "nutrition": {
              "@type": "NutritionInformation",
              "calories": "450",
              "proteinContent": "25",
              "carbohydrateContent": "35",
              "fatContent": "22"
            }
          }
        </script>
      </head>
      <body>
        <h1 class="recipe-title">Classic French Onion Soup</h1>
        <div class="recipe-description">A rich and flavorful French onion soup with caramelized onions and melted cheese.</div>
        <img class="recipe-image" src="https://example.com/soup.jpg" alt="French Onion Soup">
        <div class="recipe-time-yield">
          <span class="total-time">90 mins</span>
          <span class="servings">4 servings</span>
        </div>
        <div class="recipe-author">By Chef Jacques</div>
        <div class="recipe-ratings">
          <span class="rating">4.9</span>
          <span class="rating-count">850 ratings</span>
        </div>
        <div class="recipe-ingredients">
          <ul>
            <li>4 large yellow onions</li>
            <li>4 tablespoons butter</li>
            <li>2 tablespoons olive oil</li>
            <li>1 teaspoon sugar</li>
            <li>1/2 teaspoon salt</li>
            <li>1/4 teaspoon black pepper</li>
            <li>6 cups beef broth</li>
            <li>1/2 cup dry white wine</li>
            <li>1 tablespoon fresh thyme</li>
            <li>4 slices French bread</li>
            <li>1 cup Gruyère cheese</li>
          </ul>
        </div>
        <div class="recipe-instructions">
          <ol>
            <li>Slice onions thinly</li>
            <li>Melt butter with olive oil</li>
            <li>Add onions and cook until caramelized</li>
            <li>Add wine and reduce</li>
            <li>Add broth and simmer</li>
            <li>Toast bread and top with cheese</li>
            <li>Broil until cheese melts</li>
          </ol>
        </div>
        <div class="nutrition-info">
          <p>Calories: 450</p>
          <p>Protein: 25g</p>
          <p>Carbohydrates: 35g</p>
          <p>Fat: 22g</p>
        </div>
        <div class="chef-notes">
          <h3>Chef's Notes</h3>
          <p>For the best flavor, use homemade beef broth and caramelize the onions slowly over medium heat.</p>
        </div>
        <div class="wine-pairing">
          <h3>Wine Pairing</h3>
          <p>This soup pairs beautifully with a medium-bodied red wine like a Côtes du Rhône or a light Pinot Noir.</p>
        </div>
      </body>
    </html>
  `;

  const expectedRecipe: Partial<Recipe> = {
    title: 'Classic French Onion Soup',
    description: 'A rich and flavorful French onion soup with caramelized onions and melted cheese.',
    imageUrl: 'https://example.com/soup.jpg',
    cookTime: 90,
    servings: 4,
    creatorId: 'Chef Jacques',
    rating: {
      average: 4.9,
      count: 850
    },
    ingredients: [
      { id: '1', name: 'yellow onions', amount: 4, unit: 'unit', notes: 'large' },
      { id: '2', name: 'butter', amount: 4, unit: 'tablespoon' },
      { id: '3', name: 'olive oil', amount: 2, unit: 'tablespoon' },
      { id: '4', name: 'sugar', amount: 1, unit: 'teaspoon' },
      { id: '5', name: 'salt', amount: 0.5, unit: 'teaspoon' },
      { id: '6', name: 'black pepper', amount: 0.25, unit: 'teaspoon' },
      { id: '7', name: 'beef broth', amount: 6, unit: 'cup' },
      { id: '8', name: 'white wine', amount: 0.5, unit: 'cup', notes: 'dry' },
      { id: '9', name: 'fresh thyme', amount: 1, unit: 'tablespoon' },
      { id: '10', name: 'French bread', amount: 4, unit: 'slice' },
      { id: '11', name: 'Gruyère cheese', amount: 1, unit: 'cup' }
    ],
    steps: [
      { id: '1', order: 1, description: 'Slice onions thinly', tips: [] },
      { id: '2', order: 2, description: 'Melt butter with olive oil', tips: [] },
      { id: '3', order: 3, description: 'Add onions and cook until caramelized', tips: [] },
      { id: '4', order: 4, description: 'Add wine and reduce', tips: [] },
      { id: '5', order: 5, description: 'Add broth and simmer', tips: [] },
      { id: '6', order: 6, description: 'Toast bread and top with cheese', tips: [] },
      { id: '7', order: 7, description: 'Broil until cheese melts', tips: [] }
    ],
    nutritionInfo: {
      calories: 450,
      protein: 25,
      carbs: 35,
      fat: 22
    },
    dietaryInfo: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      dairyFree: false
    },
    tags: [
      'french',
      'soup',
      'medium',
      'dinner',
      'stovetop',
      'classic',
      'comfort-food'
    ]
  };

  let parserTest: BaseParserTest;

  beforeEach(() => {
    const parser = new EpicuriousParser();
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

  it('should parse chef notes and wine pairing', async () => {
    const parser = new EpicuriousParser();
    const result = await parser.parse(testHtml, 'https://test.com/recipe');
    
    expect(result.success).toBe(true);
    expect(result.recipe?.steps[0].tips).toContain('Chef\'s Note: For the best flavor, use homemade beef broth and caramelize the onions slowly over medium heat.');
    expect(result.recipe?.steps[0].tips).toContain('Wine Pairing: This soup pairs beautifully with a medium-bodied red wine like a Côtes du Rhône or a light Pinot Noir.');
  });

  it('should pass all tests', async () => {
    await parserTest.runAllTests();
  });
}); 