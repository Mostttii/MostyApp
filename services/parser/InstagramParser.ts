import { Recipe, SupportedLanguage } from './types';
import { BaseParser } from './BaseParser';

interface MockPostData {
  title: string;
  caption: string;
  imageUrl: string;
  videoUrl?: string;
}

export class InstagramParser extends BaseParser {
  constructor(language: SupportedLanguage = 'en') {
    super('instagram', language);
  }

  async parseUrl(url: string): Promise<Recipe> {
    // Validate Instagram URL
    if (!this.isValidInstagramUrl(url)) {
      throw new Error('Invalid Instagram URL');
    }

    try {
      // In a real implementation, we would:
      // 1. Use Instagram's Graph API or scrape the page
      // 2. Extract post content, images, and video
      // 3. Process caption for ingredients and instructions
      
      // For now, we'll use mock data
      const mockPostData = await this.fetchMockData(url);
      
      const ingredients = await this.extractIngredients(mockPostData.caption);
      const instructions = await this.extractInstructions(mockPostData.caption);

      return {
        id: this.generateRecipeId(),
        title: mockPostData.title,
        description: mockPostData.caption,
        ingredients,
        instructions,
        servings: 4, // Default value, would be extracted from caption if available
        sourceUrl: url,
        sourcePlatform: this.platform,
        language: this.language,
        imageUrl: mockPostData.imageUrl,
        videoUrl: mockPostData.videoUrl,
        dietaryInfo: this.extractDietaryInfo(mockPostData.caption),
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to parse Instagram URL: ${error.message}`);
      }
      throw new Error('Failed to parse Instagram URL: Unknown error');
    }
  }

  private isValidInstagramUrl(url: string): boolean {
    // Basic URL validation for Instagram
    const instagramRegex = /^https?:\/\/(www\.)?instagram\.com\/(p|reel)\/[\w-]+\/?/;
    return instagramRegex.test(url);
  }

  private extractDietaryInfo(caption: string): string[] {
    const dietaryTags = [
      'vegan',
      'vegetarian',
      'gluten-free',
      'dairy-free',
      'keto',
      'paleo',
      'low-carb',
    ];

    return dietaryTags.filter(tag => 
      new RegExp(`\\b${tag}\\b`, 'i').test(caption)
    );
  }

  private async fetchMockData(url: string): Promise<MockPostData> {
    // Mock data for testing
    return {
      title: 'Homemade Pizza Recipe',
      caption: `Delicious homemade pizza recipe! 🍕 #vegetarian

Ingredients:
2 cups all-purpose flour
1 cup warm water
2 tbsp olive oil
1 tsp salt
1 tsp sugar
2 cups mozzarella cheese
1 cup tomato sauce
Fresh basil leaves

Instructions:
1. Mix flour, water, oil, salt, and sugar
2. Knead for 10 minutes
3. Let rise for 1 hour
4. Roll out dough
5. Add sauce and toppings
6. Bake at 450°F for 15 minutes

#cooking #homemade #pizza`,
      imageUrl: 'https://example.com/mock-pizza-image.jpg',
      videoUrl: undefined,
    };
  }
} 