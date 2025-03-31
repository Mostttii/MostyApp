import { Recipe, SupportedLanguage, Ingredient } from './types';
import { BaseParser } from './BaseParser';
import axios from 'axios';

export class GenericParser extends BaseParser {
  constructor(language: SupportedLanguage = 'en') {
    super('generic', language);
  }

  async parseUrl(url: string): Promise<Recipe> {
    try {
      if (this.isInstagramUrl(url)) {
        throw new Error('Instagram URLs require authentication and cannot be parsed directly. Please use Instagram Graph API integration.');
      }

      if (this.isSocialMediaUrl(url)) {
        throw new Error('Social media URLs may require authentication and specific API integration.');
      }

      // For now, we'll focus on parsing the text content
      // Later we can add more sophisticated parsing methods
      const response = await axios.get(url);
      const content = response.data;
      
      // Extract content between any potential recipe markers
      const recipeContent = this.extractRecipeContent(content);
      
      // Parse the content
      const ingredients = await this.extractIngredients(recipeContent);
      const instructions = await this.extractInstructions(recipeContent);
      
      // Extract basic metadata
      const title = this.extractTitle(content) || 'Untitled Recipe';
      const description = this.extractDescription(content) || '';
      const imageUrl = this.extractImage(content);
      const dietaryInfo = this.extractDietaryInfo(content);

      return {
        id: this.generateRecipeId(),
        title,
        description,
        ingredients,
        instructions,
        servings: 4, // Default value
        sourceUrl: url,
        sourcePlatform: this.platform,
        language: this.language,
        imageUrl,
        dietaryInfo,
      };
    } catch (error) {
      console.error('Error parsing URL:', error);
      throw new Error(`Failed to parse recipe URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private isInstagramUrl(url: string): boolean {
    return url.includes('instagram.com') || url.includes('instagr.am');
  }

  private isSocialMediaUrl(url: string): boolean {
    const socialMediaDomains = [
      'instagram.com',
      'instagr.am',
      'facebook.com',
      'fb.com',
      'twitter.com',
      'x.com',
      'tiktok.com',
      'pinterest.com'
    ];
    return socialMediaDomains.some(domain => url.includes(domain));
  }

  private extractRecipeContent(html: string): string {
    // Look for common recipe content markers
    const recipeMarkers = [
      /<div[^>]*class="[^"]*recipe[^"]*"[^>]*>(.*?)<\/div>/is,
      /<article[^>]*>(.*?)<\/article>/is,
      /<main[^>]*>(.*?)<\/main>/is
    ];

    for (const marker of recipeMarkers) {
      const match = html.match(marker);
      if (match && match[1]) {
        return this.cleanHtml(match[1]);
      }
    }

    return this.cleanHtml(html);
  }

  private cleanHtml(html: string): string {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')   // Remove styles
      .replace(/<[^>]+>/g, '\n')  // Replace HTML tags with newlines
      .replace(/&nbsp;/g, ' ')    // Replace HTML entities
      .replace(/\s+/g, ' ')       // Normalize whitespace
      .trim();
  }

  private extractTitle(html: string): string {
    // Try to find title in meta tags or h1
    const titleMatches = [
      /<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i,
      /<title>([^<]+)<\/title>/i,
      /<h1[^>]*>([^<]+)<\/h1>/i
    ];

    for (const pattern of titleMatches) {
      const match = html.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return '';
  }

  private extractDescription(html: string): string {
    // Try to find description in meta tags
    const descMatches = [
      /<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i,
      /<meta[^>]*name="description"[^>]*content="([^"]+)"/i
    ];

    for (const pattern of descMatches) {
      const match = html.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return '';
  }

  private extractImage(html: string): string | undefined {
    // Try to find image in meta tags or img tags
    const imageMatches = [
      /<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i,
      /<img[^>]*src="([^"]+)"[^>]*class="[^"]*hero[^"]*"/i,
      /<img[^>]*class="[^"]*hero[^"]*"[^>]*src="([^"]+)"/i
    ];

    for (const pattern of imageMatches) {
      const match = html.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return undefined;
  }

  private extractDietaryInfo(content: string): string[] {
    const dietaryTerms = [
      'vegan',
      'vegetarian',
      'gluten-free',
      'dairy-free',
      'keto',
      'paleo',
      'low-carb',
      'nut-free',
      'sugar-free',
      'kosher',
      'halal'
    ];

    return dietaryTerms.filter(term => 
      new RegExp(`\\b${term}\\b`, 'i').test(content)
    );
  }
} 