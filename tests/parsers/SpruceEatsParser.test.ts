import { SpruceEatsParser } from '../../services/parsers/SpruceEatsParser';
import { BaseParserTest } from './BaseParser.test';
import { Recipe } from '../../types/Recipe';
import { expect, describe, it, beforeEach } from '@jest/globals';

describe('SpruceEatsParser', () => {
  let testInstance: SpruceEatsParserTest;

  beforeEach(() => {
    testInstance = new SpruceEatsParserTest();
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

  it('should parse tips, techniques, variations, and equipment', async () => {
    await testInstance.testTipsAndTechniques();
  });

  it('should pass all tests', async () => {
    await testInstance.runAllTests();
  });
});

export class SpruceEatsParserTest extends BaseParserTest {
  constructor() {
    const expectedRecipe: Recipe = {
      id: 'test-id',
      title: 'Perfect Sushi Rice',
      description: 'Learn how to make perfectly seasoned sushi rice with the right texture and flavor.',
      url: 'https://www.thespruceeats.com/perfect-sushi-rice-4165272',
      imageUrl: 'https://example.com/sushi-rice.jpg',
      cookTime: 45,
      servings: 4,
      creatorId: 'SushiMaster',
      rating: {
        average: 4.8,
        count: 700
      },
      ingredients: [
        { id: '1', name: 'sushi rice', amount: 2, unit: 'cup', notes: '' },
        { id: '2', name: 'water', amount: 2, unit: 'cup', notes: '' },
        { id: '3', name: 'rice vinegar', amount: 0.25, unit: 'cup', notes: '' },
        { id: '4', name: 'sugar', amount: 2, unit: 'tablespoon', notes: '' },
        { id: '5', name: 'salt', amount: 1, unit: 'teaspoon', notes: '' },
        { id: '6', name: 'kombu', amount: 1, unit: 'piece', notes: '' }
      ],
      steps: [
        { 
          id: '1', 
          order: 1, 
          description: 'Rinse rice thoroughly', 
          tips: [
            'Expert Tip: Use a wooden bowl for mixing',
            'Expert Tip: Fan the rice while mixing',
            'Expert Tip: Keep rice covered with damp cloth',
            'Key Technique: Proper rice washing'
          ]
        },
        { id: '2', order: 2, description: 'Add water and kombu', tips: [] },
        { id: '3', order: 3, description: 'Cook rice', tips: [] },
        { id: '4', order: 4, description: 'Mix vinegar mixture', tips: [] },
        { id: '5', order: 5, description: 'Season rice', tips: [] },
        { id: '6', order: 6, description: 'Cool rice', tips: [] },
        { id: '7', order: 7, description: 'Store properly', tips: [] }
      ],
      nutritionInfo: {
        calories: 200,
        protein: 4,
        carbs: 45,
        fat: 0
      },
      dietaryInfo: {
        vegetarian: true,
        vegan: true,
        glutenFree: true,
        dairyFree: true
      },
      tags: [
        'sushi',
        'japanese',
        'side-dish',
        'rice',
        'technique',
        'vegetarian'
      ],
      cuisine: ['japanese'],
      difficulty: 'medium'
    };
    super(new SpruceEatsParser(), expectedRecipe);
  }

  protected getTestHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Perfect Sushi Rice</title>
          <meta name="description" content="Learn how to make perfectly seasoned sushi rice with the right texture and flavor.">
          <script type="application/ld+json">
            {
              "@context": "https://schema.org/",
              "@type": "Recipe",
              "name": "Perfect Sushi Rice",
              "description": "Learn how to make perfectly seasoned sushi rice with the right texture and flavor.",
              "image": "https://example.com/sushi-rice.jpg",
              "cookTime": "PT45M",
              "recipeYield": "4",
              "author": {
                "@type": "Person",
                "name": "SushiMaster"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "700"
              },
              "recipeIngredient": [
                "2 cups sushi rice",
                "2 cups water",
                "1/4 cup rice vinegar",
                "2 tablespoons sugar",
                "1 teaspoon salt",
                "1 piece kombu"
              ],
              "recipeInstructions": [
                "Rinse rice thoroughly",
                "Add water and kombu",
                "Cook rice",
                "Mix vinegar mixture",
                "Season rice",
                "Cool rice",
                "Store properly"
              ],
              "nutrition": {
                "@type": "NutritionInformation",
                "calories": "200",
                "proteinContent": "4",
                "carbohydrateContent": "45",
                "fatContent": "0"
              }
            }
          </script>
        </head>
        <body>
          <h1 class="recipe-title">Perfect Sushi Rice</h1>
          <div class="recipe-description">Learn how to make perfectly seasoned sushi rice with the right texture and flavor.</div>
          <img class="recipe-image" src="https://example.com/sushi-rice.jpg" alt="Sushi Rice">
          <div class="recipe-time-yield">
            <span class="total-time">45 mins</span>
            <span class="servings">4 servings</span>
          </div>
          <div class="recipe-author">By SushiMaster</div>
          <div class="recipe-ratings">
            <span class="rating">4.8</span>
            <span class="rating-count">700 ratings</span>
          </div>
          <div class="recipe-ingredients">
            <ul>
              <li>2 cups sushi rice</li>
              <li>2 cups water</li>
              <li>1/4 cup rice vinegar</li>
              <li>2 tablespoons sugar</li>
              <li>1 teaspoon salt</li>
              <li>1 piece kombu</li>
            </ul>
          </div>
          <div class="recipe-instructions">
            <ol>
              <li>Rinse rice thoroughly</li>
              <li>Add water and kombu</li>
              <li>Cook rice</li>
              <li>Mix vinegar mixture</li>
              <li>Season rice</li>
              <li>Cool rice</li>
              <li>Store properly</li>
            </ol>
          </div>
          <div class="nutrition-info">
            <p>Calories: 200</p>
            <p>Protein: 4g</p>
            <p>Carbohydrates: 45g</p>
            <p>Fat: 0g</p>
          </div>
          <div class="recipe-tips">
            <h3>Expert Tips</h3>
            <ul>
              <li>Use a wooden bowl for mixing</li>
              <li>Fan the rice while mixing</li>
              <li>Keep rice covered with damp cloth</li>
            </ul>
          </div>
          <div class="recipe-techniques">
            <h3>Key Techniques</h3>
            <ul>
              <li>Proper rice washing</li>
              <li>Correct water ratio</li>
              <li>Proper cooling method</li>
            </ul>
          </div>
          <div class="recipe-variations">
            <h3>Variations</h3>
            <ul>
              <li>Add mirin for sweetness</li>
              <li>Use brown rice</li>
              <li>Add sesame seeds</li>
            </ul>
          </div>
          <div class="recipe-equipment">
            <h3>Equipment</h3>
            <ul>
              <li>Rice cooker</li>
              <li>Wooden bowl</li>
              <li>Rice paddle</li>
              <li>Fan</li>
            </ul>
          </div>
        </body>
      </html>
    `;
  }

  protected getTestURL(): string {
    return 'https://www.thespruceeats.com/perfect-sushi-rice-4165272';
  }

  async testTipsAndTechniques() {
    const result = await this.parser.parse(this.getTestHTML(), this.getTestURL());
    
    expect(result.success).toBe(true);
    expect(result.recipe?.steps[0].tips).toContain('Expert Tip: Use a wooden bowl for mixing');
    expect(result.recipe?.steps[0].tips).toContain('Expert Tip: Fan the rice while mixing');
    expect(result.recipe?.steps[0].tips).toContain('Expert Tip: Keep rice covered with damp cloth');
    expect(result.recipe?.steps[0].tips).toContain('Key Technique: Proper rice washing');
  }
} 