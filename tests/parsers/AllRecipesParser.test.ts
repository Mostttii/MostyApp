import { AllRecipesParser } from '../../services/parsers/AllRecipesParser';
import { BaseParserTest } from './BaseParser.test';
import { Recipe } from '../../types/Recipe';
import { expect, describe, it, beforeEach } from '@jest/globals';

describe('AllRecipesParser', () => {
  let testInstance: AllRecipesParserTest;

  beforeEach(() => {
    testInstance = new AllRecipesParserTest();
  });

  it('should parse basic recipe structure', async () => {
    await testInstance.testBasicStructure();
  });

  it('should parse ingredients correctly', async () => {
    await testInstance.testIngredientParsing();
  });

  it('should parse steps correctly', async () => {
    await testInstance.testStepParsing();
  });

  it('should parse nutrition information', async () => {
    await testInstance.testNutritionInfo();
  });

  it('should parse dietary information', async () => {
    await testInstance.testDietaryInfo();
  });

  it('should extract tags correctly', async () => {
    await testInstance.testTagExtraction();
  });

  it('should handle errors gracefully', async () => {
    await testInstance.testErrorHandling();
  });

  it('should pass all tests', async () => {
    await testInstance.runAllTests();
  });
});

export class AllRecipesParserTest extends BaseParserTest {
  constructor() {
    const expectedRecipe: Recipe = {
      id: 'test-id',
      title: 'Classic Chocolate Chip Cookies',
      description: 'A classic recipe for soft and chewy chocolate chip cookies.',
      url: 'https://www.allrecipes.com/recipe/classic-chocolate-chip-cookies',
      imageUrl: 'https://example.com/cookies.jpg',
      cookTime: 30,
      servings: 24,
      creatorId: 'allrecipes',
      ingredients: [
        {
          id: 'ingredient-1',
          amount: 2.25,
          unit: 'cups',
          name: 'all-purpose flour',
          notes: ''
        },
        {
          id: 'ingredient-2',
          amount: 1,
          unit: 'cup',
          name: 'butter',
          notes: 'softened'
        },
        {
          id: 'ingredient-3',
          amount: 0.75,
          unit: 'cup',
          name: 'granulated sugar',
          notes: ''
        },
        {
          id: 'ingredient-4',
          amount: 0.75,
          unit: 'cup',
          name: 'brown sugar',
          notes: 'packed'
        },
        {
          id: 'ingredient-5',
          amount: 2,
          unit: 'unit',
          name: 'eggs',
          notes: 'large'
        },
        {
          id: 'ingredient-6',
          amount: 1,
          unit: 'teaspoon',
          name: 'vanilla extract',
          notes: ''
        },
        {
          id: 'ingredient-7',
          amount: 1,
          unit: 'teaspoon',
          name: 'baking soda',
          notes: ''
        },
        {
          id: 'ingredient-8',
          amount: 0.5,
          unit: 'teaspoon',
          name: 'salt',
          notes: ''
        },
        {
          id: 'ingredient-9',
          amount: 2,
          unit: 'cups',
          name: 'chocolate chips',
          notes: ''
        }
      ],
      steps: [
        {
          id: 'step-1',
          order: 1,
          description: 'Preheat oven to 375°F (190°C). Line baking sheets with parchment paper.',
          tips: []
        },
        {
          id: 'step-2',
          order: 2,
          description: 'In a large bowl, cream together butter, granulated sugar, and brown sugar until smooth.',
          tips: []
        },
        {
          id: 'step-3',
          order: 3,
          description: 'Beat in eggs one at a time, then stir in vanilla.',
          tips: []
        },
        {
          id: 'step-4',
          order: 4,
          description: 'In a separate bowl, whisk together flour, baking soda, and salt.',
          tips: []
        },
        {
          id: 'step-5',
          order: 5,
          description: 'Gradually stir flour mixture into butter mixture. Mix in chocolate chips.',
          tips: []
        },
        {
          id: 'step-6',
          order: 6,
          description: 'Drop by rounded tablespoons onto prepared baking sheets.',
          tips: []
        },
        {
          id: 'step-7',
          order: 7,
          description: 'Bake for 9 to 11 minutes or until golden brown. Let stand on baking sheet two minutes before removing to cool on wire racks.',
          tips: []
        }
      ],
      tags: ['dessert', 'cookies', 'chocolate', 'american', 'baking'],
      cuisine: ['american'],
      difficulty: 'medium',
      dietaryInfo: {
        vegetarian: true,
        vegan: false,
        glutenFree: false,
        dairyFree: false
      },
      nutritionInfo: {
        calories: 150,
        protein: 2,
        carbs: 18,
        fat: 8
      },
      rating: {
        average: 4.5,
        count: 1234
      }
    };
    super(new AllRecipesParser(), expectedRecipe);
  }

  protected getTestHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Recipe",
              "name": "Classic Chocolate Chip Cookies",
              "description": "A classic recipe for soft and chewy chocolate chip cookies.",
              "image": "https://example.com/cookies.jpg",
              "author": {
                "@type": "Person",
                "name": "AllRecipes"
              },
              "datePublished": "2024-01-01",
              "prepTime": "PT15M",
              "cookTime": "PT30M",
              "totalTime": "PT45M",
              "recipeYield": "24 cookies",
              "recipeCategory": "Dessert",
              "recipeCuisine": "American",
              "difficulty": "Medium",
              "suitableForDiet": ["VegetarianDiet"],
              "nutrition": {
                "@type": "NutritionInformation",
                "calories": "150 calories",
                "proteinContent": "2 g",
                "carbohydrateContent": "18 g",
                "fatContent": "8 g"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.5",
                "reviewCount": "1234"
              }
            }
          </script>
        </head>
        <body>
          <h1 class="recipe-title">Classic Chocolate Chip Cookies</h1>
          <p class="recipe-description">A classic recipe for soft and chewy chocolate chip cookies.</p>
          <img class="recipe-image" src="https://example.com/cookies.jpg" alt="Classic Chocolate Chip Cookies">
          
          <div class="recipe-ingredients">
            <h2>Ingredients</h2>
            <ul>
              <li>2 1/4 cups all-purpose flour</li>
              <li>1 cup butter, softened</li>
              <li>3/4 cup granulated sugar</li>
              <li>3/4 cup brown sugar, packed</li>
              <li>2 large eggs</li>
              <li>1 teaspoon vanilla extract</li>
              <li>1 teaspoon baking soda</li>
              <li>1/2 teaspoon salt</li>
              <li>2 cups chocolate chips</li>
            </ul>
          </div>
          
          <div class="recipe-instructions">
            <h2>Instructions</h2>
            <ol>
              <li>Preheat oven to 375°F (190°C). Line baking sheets with parchment paper.</li>
              <li>In a large bowl, cream together butter, granulated sugar, and brown sugar until smooth.</li>
              <li>Beat in eggs one at a time, then stir in vanilla.</li>
              <li>In a separate bowl, whisk together flour, baking soda, and salt.</li>
              <li>Gradually stir flour mixture into butter mixture. Mix in chocolate chips.</li>
              <li>Drop by rounded tablespoons onto prepared baking sheets.</li>
              <li>Bake for 9 to 11 minutes or until golden brown. Let stand on baking sheet two minutes before removing to cool on wire racks.</li>
            </ol>
          </div>
          
          <div class="recipe-nutrition">
            <h2>Nutrition Information</h2>
            <p>Per serving: 150 calories, 2g protein, 18g carbohydrates, 8g fat</p>
          </div>
          
          <div class="recipe-rating">
            <span class="rating-value">4.5</span>
            <span class="rating-count">1234 reviews</span>
          </div>
          
          <div class="recipe-tags">
            <span class="tag">dessert</span>
            <span class="tag">cookies</span>
            <span class="tag">chocolate</span>
            <span class="tag">american</span>
            <span class="tag">baking</span>
          </div>
        </body>
      </html>
    `;
  }

  getTestURL(): string {
    return 'https://www.allrecipes.com/recipe/classic-chocolate-chip-cookies';
  }
} 