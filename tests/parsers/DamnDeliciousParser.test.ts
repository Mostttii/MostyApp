import { DamnDeliciousParser } from '../../services/parsers/DamnDeliciousParser';
import { BaseParserTest } from './BaseParser.test';
import { Recipe } from '../../types/Recipe';
import { expect, describe, it, beforeEach } from '@jest/globals';

describe('DamnDeliciousParser', () => {
  const testHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>One-Pot Garlic Parmesan Pasta</title>
        <meta name="description" content="A creamy, cheesy pasta dish that comes together in one pot with minimal cleanup.">
        <script type="application/ld+json">
          {
            "@context": "https://schema.org/",
            "@type": "Recipe",
            "name": "One-Pot Garlic Parmesan Pasta",
            "description": "A creamy, cheesy pasta dish that comes together in one pot with minimal cleanup.",
            "image": "https://example.com/pasta.jpg",
            "cookTime": "PT25M",
            "recipeYield": "4",
            "author": {
              "@type": "Person",
              "name": "QuickCook"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.7",
              "reviewCount": "800"
            },
            "recipeIngredient": [
              "1 pound spaghetti",
              "4 cups chicken broth",
              "2 cups water",
              "4 cloves garlic, minced",
              "1/2 teaspoon dried oregano",
              "1/2 teaspoon dried basil",
              "1/4 teaspoon crushed red pepper flakes",
              "1/2 teaspoon salt",
              "1/4 teaspoon black pepper",
              "1/2 cup heavy cream",
              "1/2 cup grated Parmesan cheese",
              "2 tablespoons chopped fresh parsley"
            ],
            "recipeInstructions": [
              "Add pasta, broth, and water to pot",
              "Bring to a boil",
              "Add garlic and seasonings",
              "Cook until pasta is al dente",
              "Stir in cream and cheese",
              "Garnish with parsley",
              "Serve immediately"
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
        <h1 class="recipe-title">One-Pot Garlic Parmesan Pasta</h1>
        <div class="recipe-description">A creamy, cheesy pasta dish that comes together in one pot with minimal cleanup.</div>
        <img class="recipe-image" src="https://example.com/pasta.jpg" alt="Garlic Parmesan Pasta">
        <div class="recipe-time-yield">
          <span class="total-time">25 mins</span>
          <span class="servings">4 servings</span>
        </div>
        <div class="recipe-author">By QuickCook</div>
        <div class="recipe-ratings">
          <span class="rating">4.7</span>
          <span class="rating-count">800 ratings</span>
        </div>
        <div class="recipe-ingredients">
          <ul>
            <li>1 pound spaghetti</li>
            <li>4 cups chicken broth</li>
            <li>2 cups water</li>
            <li>4 cloves garlic, minced</li>
            <li>1/2 teaspoon dried oregano</li>
            <li>1/2 teaspoon dried basil</li>
            <li>1/4 teaspoon crushed red pepper flakes</li>
            <li>1/2 teaspoon salt</li>
            <li>1/4 teaspoon black pepper</li>
            <li>1/2 cup heavy cream</li>
            <li>1/2 cup grated Parmesan cheese</li>
            <li>2 tablespoons chopped fresh parsley</li>
          </ul>
        </div>
        <div class="recipe-instructions">
          <ol>
            <li>Add pasta, broth, and water to pot</li>
            <li>Bring to a boil</li>
            <li>Add garlic and seasonings</li>
            <li>Cook until pasta is al dente</li>
            <li>Stir in cream and cheese</li>
            <li>Garnish with parsley</li>
            <li>Serve immediately</li>
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
            <li>Use a large pot to prevent overflow</li>
            <li>Stir frequently to prevent sticking</li>
            <li>Add more broth if needed</li>
          </ul>
        </div>
        <div class="recipe-variations">
          <h3>Variations</h3>
          <ul>
            <li>Add cooked chicken</li>
            <li>Use different pasta shapes</li>
            <li>Add vegetables like spinach</li>
          </ul>
        </div>
        <div class="recipe-video">
          <h3>Watch How to Make It</h3>
          <iframe src="https://www.youtube.com/embed/example" frameborder="0" allowfullscreen></iframe>
        </div>
        <div class="recipe-storage">
          <h3>Storage</h3>
          <p>Store in an airtight container in the refrigerator for up to 3 days. Reheat with a splash of milk or broth.</p>
        </div>
      </body>
    </html>
  `;

  const expectedRecipe: Partial<Recipe> = {
    title: 'One-Pot Garlic Parmesan Pasta',
    description: 'A creamy, cheesy pasta dish that comes together in one pot with minimal cleanup.',
    imageUrl: 'https://example.com/pasta.jpg',
    cookTime: 25,
    servings: 4,
    creatorId: 'QuickCook',
    rating: {
      average: 4.7,
      count: 800
    },
    ingredients: [
      { id: '1', name: 'spaghetti', amount: 1, unit: 'pound' },
      { id: '2', name: 'chicken broth', amount: 4, unit: 'cup' },
      { id: '3', name: 'water', amount: 2, unit: 'cup' },
      { id: '4', name: 'garlic', amount: 4, unit: 'clove', notes: 'minced' },
      { id: '5', name: 'dried oregano', amount: 0.5, unit: 'teaspoon' },
      { id: '6', name: 'dried basil', amount: 0.5, unit: 'teaspoon' },
      { id: '7', name: 'crushed red pepper flakes', amount: 0.25, unit: 'teaspoon' },
      { id: '8', name: 'salt', amount: 0.5, unit: 'teaspoon' },
      { id: '9', name: 'black pepper', amount: 0.25, unit: 'teaspoon' },
      { id: '10', name: 'heavy cream', amount: 0.5, unit: 'cup' },
      { id: '11', name: 'Parmesan cheese', amount: 0.5, unit: 'cup', notes: 'grated' },
      { id: '12', name: 'fresh parsley', amount: 2, unit: 'tablespoon', notes: 'chopped' }
    ],
    steps: [
      { id: '1', order: 1, description: 'Add pasta, broth, and water to pot', tips: [] },
      { id: '2', order: 2, description: 'Bring to a boil', tips: [] },
      { id: '3', order: 3, description: 'Add garlic and seasonings', tips: [] },
      { id: '4', order: 4, description: 'Cook until pasta is al dente', tips: [] },
      { id: '5', order: 5, description: 'Stir in cream and cheese', tips: [] },
      { id: '6', order: 6, description: 'Garnish with parsley', tips: [] },
      { id: '7', order: 7, description: 'Serve immediately', tips: [] }
    ],
    nutritionInfo: {
      calories: 450,
      protein: 15,
      carbs: 65,
      fat: 18
    },
    dietaryInfo: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      dairyFree: false
    },
    tags: [
      'pasta',
      'italian',
      'easy',
      'dinner',
      'one-pot',
      'quick',
      'comfort-food'
    ]
  };

  let parserTest: BaseParserTest;

  beforeEach(() => {
    const parser = new DamnDeliciousParser();
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

  it('should parse tips, variations, video, and storage info', async () => {
    const parser = new DamnDeliciousParser();
    const result = await parser.parse(testHtml, 'https://test.com/recipe');
    
    expect(result.success).toBe(true);
    expect(result.recipe?.steps[0].tips).toContain('Tip: Use a large pot to prevent overflow');
    expect(result.recipe?.steps[0].tips).toContain('Tip: Stir frequently to prevent sticking');
    expect(result.recipe?.steps[0].tips).toContain('Tip: Add more broth if needed');
    expect(result.recipe?.steps[0].tips).toContain('Variation: Add cooked chicken');
    expect(result.recipe?.steps[0].tips).toContain('Variation: Use different pasta shapes');
    expect(result.recipe?.steps[0].tips).toContain('Variation: Add vegetables like spinach');
    expect(result.recipe?.steps[0].tips).toContain('Video Tutorial: https://www.youtube.com/embed/example');
    expect(result.recipe?.steps[0].tips).toContain('Storage: Store in an airtight container in the refrigerator for up to 3 days. Reheat with a splash of milk or broth.');
  });

  it('should pass all tests', async () => {
    await parserTest.runAllTests();
  });
}); 