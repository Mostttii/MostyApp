import { TasteOfHomeParser } from '../../services/parsers/TasteOfHomeParser';
import { BaseParserTest } from './BaseParser.test';
import { Recipe } from '../../types/Recipe';
import { expect, describe, it, beforeEach } from '@jest/globals';

describe('TasteOfHomeParser', () => {
  const testHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Classic Apple Pie</title>
        <meta name="description" content="A traditional apple pie with a flaky crust and cinnamon-spiced filling.">
        <script type="application/ld+json">
          {
            "@context": "https://schema.org/",
            "@type": "Recipe",
            "name": "Classic Apple Pie",
            "description": "A traditional apple pie with a flaky crust and cinnamon-spiced filling.",
            "image": "https://example.com/apple-pie.jpg",
            "cookTime": "PT60M",
            "recipeYield": "8",
            "author": {
              "@type": "Person",
              "name": "BakingMom"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "900"
            },
            "recipeIngredient": [
              "2 1/2 cups all-purpose flour",
              "1 cup cold butter",
              "1/4 cup ice water",
              "6 cups sliced apples",
              "3/4 cup sugar",
              "1 teaspoon ground cinnamon",
              "1/4 teaspoon ground nutmeg",
              "1/4 teaspoon salt",
              "2 tablespoons butter",
              "1 egg, beaten"
            ],
            "recipeInstructions": [
              "Make pie crust",
              "Mix apple filling",
              "Roll out bottom crust",
              "Add apple filling",
              "Roll out top crust",
              "Cut vents in top",
              "Brush with egg wash",
              "Bake until golden"
            ],
            "nutrition": {
              "@type": "NutritionInformation",
              "calories": "350",
              "proteinContent": "4",
              "carbohydrateContent": "45",
              "fatContent": "18"
            }
          }
        </script>
      </head>
      <body>
        <h1 class="recipe-title">Classic Apple Pie</h1>
        <div class="recipe-description">A traditional apple pie with a flaky crust and cinnamon-spiced filling.</div>
        <img class="recipe-image" src="https://example.com/apple-pie.jpg" alt="Apple Pie">
        <div class="recipe-time-yield">
          <span class="total-time">60 mins</span>
          <span class="servings">8 servings</span>
        </div>
        <div class="recipe-author">By BakingMom</div>
        <div class="recipe-ratings">
          <span class="rating">4.9</span>
          <span class="rating-count">900 ratings</span>
        </div>
        <div class="recipe-ingredients">
          <ul>
            <li>2 1/2 cups all-purpose flour</li>
            <li>1 cup cold butter</li>
            <li>1/4 cup ice water</li>
            <li>6 cups sliced apples</li>
            <li>3/4 cup sugar</li>
            <li>1 teaspoon ground cinnamon</li>
            <li>1/4 teaspoon ground nutmeg</li>
            <li>1/4 teaspoon salt</li>
            <li>2 tablespoons butter</li>
            <li>1 egg, beaten</li>
          </ul>
        </div>
        <div class="recipe-instructions">
          <ol>
            <li>Make pie crust</li>
            <li>Mix apple filling</li>
            <li>Roll out bottom crust</li>
            <li>Add apple filling</li>
            <li>Roll out top crust</li>
            <li>Cut vents in top</li>
            <li>Brush with egg wash</li>
            <li>Bake until golden</li>
          </ol>
        </div>
        <div class="nutrition-info">
          <p>Calories: 350</p>
          <p>Protein: 4g</p>
          <p>Carbohydrates: 45g</p>
          <p>Fat: 18g</p>
        </div>
        <div class="recipe-tips">
          <h3>Tips</h3>
          <ul>
            <li>Use a mix of sweet and tart apples</li>
            <li>Keep ingredients cold for flaky crust</li>
            <li>Let pie cool completely before slicing</li>
          </ul>
        </div>
        <div class="recipe-variations">
          <h3>Variations</h3>
          <ul>
            <li>Add caramel sauce</li>
            <li>Use lattice top</li>
            <li>Add chopped nuts</li>
          </ul>
        </div>
        <div class="recipe-prep-notes">
          <h3>Prep Notes</h3>
          <p>Chill dough for at least 1 hour before rolling. Peel and slice apples just before using to prevent browning.</p>
        </div>
        <div class="recipe-skill-level">
          <h3>Skill Level</h3>
          <p>Intermediate</p>
        </div>
        <div class="recipe-collections">
          <h3>Collections</h3>
          <ul>
            <li>Holiday Favorites</li>
            <li>Classic Desserts</li>
            <li>Family Recipes</li>
          </ul>
        </div>
      </body>
    </html>
  `;

  const expectedRecipe: Partial<Recipe> = {
    title: 'Classic Apple Pie',
    description: 'A traditional apple pie with a flaky crust and cinnamon-spiced filling.',
    imageUrl: 'https://example.com/apple-pie.jpg',
    cookTime: 60,
    servings: 8,
    creatorId: 'BakingMom',
    rating: {
      average: 4.9,
      count: 900
    },
    ingredients: [
      { id: '1', name: 'all-purpose flour', amount: 2.5, unit: 'cup' },
      { id: '2', name: 'cold butter', amount: 1, unit: 'cup' },
      { id: '3', name: 'ice water', amount: 0.25, unit: 'cup' },
      { id: '4', name: 'sliced apples', amount: 6, unit: 'cup' },
      { id: '5', name: 'sugar', amount: 0.75, unit: 'cup' },
      { id: '6', name: 'ground cinnamon', amount: 1, unit: 'teaspoon' },
      { id: '7', name: 'ground nutmeg', amount: 0.25, unit: 'teaspoon' },
      { id: '8', name: 'salt', amount: 0.25, unit: 'teaspoon' },
      { id: '9', name: 'butter', amount: 2, unit: 'tablespoon' },
      { id: '10', name: 'egg', amount: 1, unit: 'unit', notes: 'beaten' }
    ],
    steps: [
      { id: '1', order: 1, description: 'Make pie crust', tips: [] },
      { id: '2', order: 2, description: 'Mix apple filling', tips: [] },
      { id: '3', order: 3, description: 'Roll out bottom crust', tips: [] },
      { id: '4', order: 4, description: 'Add apple filling', tips: [] },
      { id: '5', order: 5, description: 'Roll out top crust', tips: [] },
      { id: '6', order: 6, description: 'Cut vents in top', tips: [] },
      { id: '7', order: 7, description: 'Brush with egg wash', tips: [] },
      { id: '8', order: 8, description: 'Bake until golden', tips: [] }
    ],
    nutritionInfo: {
      calories: 350,
      protein: 4,
      carbs: 45,
      fat: 18
    },
    dietaryInfo: {
      vegetarian: true,
      vegan: false,
      glutenFree: false,
      dairyFree: false
    },
    tags: [
      'pie',
      'dessert',
      'intermediate',
      'baking',
      'apple',
      'classic',
      'holiday'
    ]
  };

  let parserTest: BaseParserTest;

  beforeEach(() => {
    const parser = new TasteOfHomeParser();
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

  it('should parse tips, variations, prep notes, skill level, and collections', async () => {
    const parser = new TasteOfHomeParser();
    const result = await parser.parse(testHtml, 'https://test.com/recipe');
    
    expect(result.success).toBe(true);
    expect(result.recipe?.steps[0].tips).toContain('Tip: Use a mix of sweet and tart apples');
    expect(result.recipe?.steps[0].tips).toContain('Tip: Keep ingredients cold for flaky crust');
    expect(result.recipe?.steps[0].tips).toContain('Tip: Let pie cool completely before slicing');
    expect(result.recipe?.steps[0].tips).toContain('Variation: Add caramel sauce');
    expect(result.recipe?.steps[0].tips).toContain('Variation: Use lattice top');
    expect(result.recipe?.steps[0].tips).toContain('Variation: Add chopped nuts');
    expect(result.recipe?.steps[0].tips).toContain('Prep Note: Chill dough for at least 1 hour before rolling. Peel and slice apples just before using to prevent browning.');
    expect(result.recipe?.steps[0].tips).toContain('Skill Level: Intermediate');
    expect(result.recipe?.steps[0].tips).toContain('Collections: Holiday Favorites, Classic Desserts, Family Recipes');
  });

  it('should pass all tests', async () => {
    await parserTest.runAllTests();
  });
}); 