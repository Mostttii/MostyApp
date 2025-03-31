import { BaseParser } from './BaseParser';
import { Recipe, ParseResult, Ingredient, Step } from '../../types/Recipe';
import { v4 as uuidv4 } from 'uuid';
import { JSDOM } from 'jsdom';

export class AllRecipesParser extends BaseParser {
  protected readonly domain = 'allrecipes.com';
  protected readonly name = 'AllRecipes';
  protected readonly selectors = {
    title: 'h1',
    description: '[class*="article-subheading"]',
    image: '[class*="primary-image"] img, [class*="recipe-image"] img, [class*="recipe__image"] img, [class*="universal-image"] img',
    ingredients: '[class*="structured-ingredients"] li',
    instructions: '.mm-recipes-steps__content',
    nutrition: '[class*="nutrition-section"] p',
    rating: '[class*="recipe-ratings"] [class*="rating"]',
    ratingCount: '[class*="recipe-ratings"] [class*="count"]',
    tags: '[class*="recipe-tags"] [class*="tag"], [class*="recipe-categories"] [class*="category"], [class*="recipe-cuisine"] [class*="cuisine"], [class*="recipe-dietary"] [class*="dietary"]',
    breadcrumbs: '[class*="breadcrumbs"] [class*="breadcrumb"]',
    category: '[class*="recipe-categories"] [class*="category"]',
    author: '[class*="bylines"] [class*="bylines__item"]',
    details: '.mm-recipes-details__item',
    publishedDate: '[class*="article-date"], [class*="published-date"], [class*="recipe-date"], [class*="bylines"] [class*="date"]'
  };

  protected parseTime(timeString: string | undefined): number {
    if (!timeString) return 0;
    const match = timeString.match(/(\d+)\s*(min|hr|hour)/i);
    if (!match) return 0;
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    return unit === 'hr' || unit === 'hour' ? value * 60 : value;
  }

  protected parseDate(dateString: string | undefined): string {
    if (!dateString) return '';
    // Try to parse various date formats
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString();
  }

  protected parseFraction(amount: string): number {
    if (!amount) return 0;
    amount = amount.trim();
    
    // Convert unicode fractions to regular fractions
    amount = amount
      .replace(/¼/g, '1/4')
      .replace(/½/g, '1/2')
      .replace(/¾/g, '3/4')
      .replace(/⅓/g, '1/3')
      .replace(/⅔/g, '2/3')
      .replace(/⅕/g, '1/5')
      .replace(/⅖/g, '2/5')
      .replace(/⅗/g, '3/5')
      .replace(/⅘/g, '4/5')
      .replace(/⅙/g, '1/6')
      .replace(/⅚/g, '5/6')
      .replace(/⅛/g, '1/8')
      .replace(/⅜/g, '3/8')
      .replace(/⅝/g, '5/8')
      .replace(/⅞/g, '7/8');
    
    // Handle decimal numbers
    const decimalMatch = amount.match(/^(\d*\.\d+)$/);
    if (decimalMatch) {
      return parseFloat(decimalMatch[1]);
    }
    
    // Handle mixed numbers like "1 1/2"
    const parts = amount.split(' ');
    if (parts.length === 2) {
      const whole = parseInt(parts[0]);
      const fraction = this.parseFraction(parts[1]);
      return whole + fraction;
    }

    // Handle simple fractions like "1/2"
    const fractionMatch = amount.match(/^(\d+)\/(\d+)$/);
    if (fractionMatch) {
      const numerator = parseInt(fractionMatch[1]);
      const denominator = parseInt(fractionMatch[2]);
      return numerator / denominator;
    }

    // Handle whole numbers
    return parseInt(amount) || 0;
  }

  protected parseIngredient(text: string): Ingredient {
    // Remove any non-breaking spaces and normalize whitespace
    text = text.replace(/\u00A0/g, ' ').trim();
    
    // Skip non-ingredient text
    if (text.toLowerCase().includes('keep screen awake') || 
        text.toLowerCase().includes('cook mode') ||
        text.toLowerCase().includes('original recipe yields')) {
      return {
        id: uuidv4(),
        amount: 0,
        unit: '',
        name: ''
      };
    }

    // Clean the ingredient text first
    text = this.cleanIngredientText(text);

    // Match the ingredient pattern
    const match = text.match(/^([\d\s./¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]+)?\s*([a-zA-Z]+)?\s*(.+)$/);
    if (match) {
      const [, amount, unit, name] = match;
      const parsedAmount = amount ? this.parseFraction(amount) : 0;
      
      // Format the amount without leading zeros for decimals
      const formattedAmount = parsedAmount === 0 ? '0' : 
        parsedAmount % 1 === 0 ? parsedAmount.toString() : 
        parsedAmount.toString().replace(/^0+/, '');

      return {
        id: uuidv4(),
        amount: parseFloat(formattedAmount),
        unit: unit?.trim().toLowerCase() || '',
        name: name.trim()
      };
    }

    // If no match, treat the whole text as the name
    return {
      id: uuidv4(),
      amount: 0,
      unit: '',
      name: text.trim()
    };
  }

  private cleanIngredientText(text: string): string {
    // Handle unicode fractions with leading zeros (e.g., "0 ¼" -> "¼")
    text = text.replace(/\b0+\s*([¼½¾])\b/g, '$1');
    text = text.replace(/\b0+\s*([¼½¾])\s+(cup|tablespoon|teaspoon|pound|ounce|gram|ml|g|oz|lb|tsp|tbsp)\b/gi, '$1 $2');

    // Handle mixed numbers with unicode fractions (e.g., "0 1 ¼" -> "1 ¼")
    text = text.replace(/\b0+\s*(\d+\s*[¼½¾])\b/g, '$1');
    text = text.replace(/\b0+\s*(\d+\s*[¼½¾])\s+(cup|tablespoon|teaspoon|pound|ounce|gram|ml|g|oz|lb|tsp|tbsp)\b/gi, '$1 $2');

    // Handle regular fractions with leading zeros (e.g., "0 1/2" -> "1/2")
    text = text.replace(/\b0+\s*(\d+\/\d+)\b/g, '$1');
    text = text.replace(/\b0+\s*(\d+\/\d+)\s+(cup|tablespoon|teaspoon|pound|ounce|gram|ml|g|oz|lb|tsp|tbsp)\b/gi, '$1 $2');

    // Handle mixed numbers with regular fractions (e.g., "0 1 1/2" -> "1 1/2")
    text = text.replace(/\b0+\s*(\d+\s+\d+\/\d+)\b/g, '$1');
    text = text.replace(/\b0+\s*(\d+\s+\d+\/\d+)\s+(cup|tablespoon|teaspoon|pound|ounce|gram|ml|g|oz|lb|tsp|tbsp)\b/gi, '$1 $2');

    // Handle decimal numbers (e.g., "0.5" -> ".5")
    text = text.replace(/\b0+(\.\d+)\b/g, '$1');
    text = text.replace(/\b0+(\.\d+)\s+(cup|tablespoon|teaspoon|pound|ounce|gram|ml|g|oz|lb|tsp|tbsp)\b/gi, '$1 $2');

    // Handle whole numbers (e.g., "01" -> "1")
    text = text.replace(/\b0+(\d+)\b/g, '$1');
    text = text.replace(/\b0+(\d+)\s+(cup|tablespoon|teaspoon|pound|ounce|gram|ml|g|oz|lb|tsp|tbsp)\b/gi, '$1 $2');

    // Normalize whitespace
    text = text.replace(/\s+/g, ' ').trim();

    return text;
  }

  private findDetailValue(document: Document, label: string): string {
    const details = document.querySelectorAll(this.selectors.details);
    for (const detail of Array.from(details)) {
      const labelElement = detail.querySelector('.mm-recipes-details__label');
      if (labelElement?.textContent?.includes(label)) {
        const valueElement = detail.querySelector('.mm-recipes-details__value');
        return valueElement?.textContent?.trim() || '';
      }
    }
    return '';
  }

  protected extractTags(document: Document): string[] {
    const tags: Set<string> = new Set();

    // Extract keywords from meta tags
    const keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (keywordsMeta) {
        const keywords = keywordsMeta.getAttribute('content')?.split(',') || [];
        keywords.forEach((k: string) => tags.add(k.toLowerCase().trim()));
    }

    // Extract dietary information
    const dietaryDivs = document.querySelectorAll('div[class*="dietary"]');
    dietaryDivs.forEach(div => {
        const text = div.textContent?.toLowerCase().trim();
        if (text) tags.add(text);
    });

    // Extract from structured data
    const scriptTags = document.querySelectorAll('script[type="application/ld+json"]');
    scriptTags.forEach(script => {
        try {
            const data = JSON.parse(script.textContent || '{}');
            if (data.keywords) {
                (Array.isArray(data.keywords) ? data.keywords : [data.keywords])
                    .forEach((k: string) => tags.add(k.toLowerCase().trim()));
            }
            if (data.recipeCategory) {
                (Array.isArray(data.recipeCategory) ? data.recipeCategory : [data.recipeCategory])
                    .forEach((c: string) => tags.add(c.toLowerCase().trim()));
            }
            if (data.recipeCuisine) {
                (Array.isArray(data.recipeCuisine) ? data.recipeCuisine : [data.recipeCuisine])
                    .forEach((c: string) => tags.add(c.toLowerCase().trim()));
            }
        } catch (e) {
            console.error('Error parsing structured data:', e);
        }
    });

    return Array.from(tags).filter(tag => tag.length > 0);
  }

  protected extractPublishedDate(document: Document): string | undefined {
    // Try to get date from structured data first
    const scriptTags = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scriptTags) {
        try {
            const data = JSON.parse(script.textContent || '{}');
            if (data.datePublished) {
                return new Date(data.datePublished).toISOString();
            }
        } catch (e) {
            console.error('Error parsing structured data for date:', e);
        }
    }

    // Try meta tags
    const dateMeta = document.querySelector('meta[property="article:published_time"]');
    if (dateMeta) {
        const date = dateMeta.getAttribute('content');
        if (date) return new Date(date).toISOString();
    }

    // Try time tag
    const timeTag = document.querySelector('time[datetime]');
    if (timeTag) {
        const date = timeTag.getAttribute('datetime');
        if (date) return new Date(date).toISOString();
    }

    return undefined;
  }

  async parse(html: string, url: string): Promise<ParseResult> {
    try {
      const dom = new JSDOM(html);
      const document = dom.window.document;

      // Extract structured data
      const structuredData = await this.extractStructuredData(document);
      const recipe = this.createDefaultRecipe(url);

      // Find title
      const titleElement = document.querySelector(this.selectors.title);
      if (!titleElement) {
        return { success: false, error: { code: 'MISSING_ELEMENT', message: 'Title not found' } };
      }
      recipe.title = titleElement.textContent?.trim() || '';

      // Find image URL
      const imageElement = document.querySelector(this.selectors.image);
      if (imageElement) {
        const src = imageElement.getAttribute('src') || imageElement.getAttribute('data-src') || '';
        recipe.imageUrl = src.startsWith('http') ? src : `https:${src}`;
      }

      // Find author
      const authorElement = document.querySelector(this.selectors.author);
      if (authorElement) {
        const authorText = authorElement.textContent?.trim() || '';
        const authorMatch = authorText.match(/By\s+([^—\n]+)/);
        recipe.creatorId = authorMatch ? authorMatch[1].trim() : authorText;
      }

      // Find published date
      if (structuredData?.datePublished) {
        recipe.publishedAt = this.parseDate(structuredData.datePublished);
      } else {
        const metaDate = document.querySelector('meta[property="article:published_time"]');
        if (metaDate) {
          const content = metaDate.getAttribute('content');
          if (content) {
            recipe.publishedAt = this.parseDate(content);
          }
        }
      }

      // Find prep time, cook time, and servings
      const prepTimeText = this.findDetailValue(document, 'Prep Time');
      const cookTimeText = this.findDetailValue(document, 'Cook Time');
      const servingsText = this.findDetailValue(document, 'Servings');

      recipe.description = `Prep Time: ${prepTimeText}\nCook Time: ${cookTimeText}`;
      recipe.prepTime = this.parseTime(prepTimeText);
      recipe.cookTime = this.parseTime(cookTimeText);
      recipe.servings = parseInt(servingsText) || 0;

      // Extract tags
      recipe.tags = this.extractTags(document);

      // Set required fields with default values
      recipe.cuisine = [];
      recipe.difficulty = 'medium';
      recipe.dietaryInfo = {
        vegetarian: recipe.tags.some(tag => tag.toLowerCase().includes('vegetarian')),
        vegan: recipe.tags.some(tag => tag.toLowerCase().includes('vegan')),
        glutenFree: recipe.tags.some(tag => tag.toLowerCase().includes('gluten free')),
        dairyFree: recipe.tags.some(tag => tag.toLowerCase().includes('dairy free'))
      };

      // Parse ingredients - prioritize structured data
      if (structuredData?.recipeIngredient) {
        recipe.ingredients = structuredData.recipeIngredient
          .map((text: string) => this.parseIngredient(text))
          .filter((ingredient: Ingredient) => ingredient.name.length > 0);
      } else {
        // Fallback to DOM parsing if no structured data
        const ingredientElements = document.querySelectorAll(this.selectors.ingredients);
        if (!ingredientElements || ingredientElements.length === 0) {
          return { success: false, error: { code: 'MISSING_ELEMENT', message: 'Ingredients not found' } };
        }

        recipe.ingredients = Array.from(ingredientElements)
          .map(item => this.parseIngredient(item.textContent?.trim() || ''))
          .filter(ingredient => ingredient.name.length > 0);
      }

      // Extract steps
      if (structuredData?.recipeInstructions) {
        recipe.steps = structuredData.recipeInstructions.map((instruction: { text: string } | string, index: number) => ({
          id: (index + 1).toString(),
          order: index + 1,
          description: typeof instruction === 'string' ? instruction : instruction.text,
          tips: []
        }));
      } else {
        const instructionsContainer = document.querySelector(this.selectors.instructions);
        if (!instructionsContainer) {
          return { success: false, error: { code: 'MISSING_ELEMENT', message: 'Instructions not found' } };
        }

        recipe.steps = instructionsContainer.textContent?.trim()
          .split(/\s*\n\s*/)
          .filter(text => text.length > 0)
          .map((text, index) => ({
            id: (index + 1).toString(),
            order: index + 1,
            description: text.trim(),
            tips: []
          })) || [];
      }

      // Extract rating
      const ratingElement = document.querySelector(this.selectors.rating);
      const ratingCountElement = document.querySelector(this.selectors.ratingCount);
      if (ratingElement && ratingCountElement) {
        recipe.rating = {
          average: parseFloat(ratingElement.textContent?.trim() || '0'),
          count: parseInt(ratingCountElement.textContent?.trim() || '0')
        };
      }

      // Extract nutrition info
      const nutritionElement = document.querySelector(this.selectors.nutrition);
      if (nutritionElement) {
        const text = nutritionElement.textContent?.trim() || '';
        const calories = text.match(/(\d+)\s*calories/i)?.[1];
        const protein = text.match(/(\d+)g\s*protein/i)?.[1];
        const carbs = text.match(/(\d+)g\s*carbs/i)?.[1];
        const fat = text.match(/(\d+)g\s*fat/i)?.[1];

        recipe.nutritionInfo = {
          calories: parseInt(calories || '0'),
          protein: parseInt(protein || '0'),
          carbs: parseInt(carbs || '0'),
          fat: parseInt(fat || '0')
        };
      }

      return { success: true, recipe };
    } catch (error) {
      return { 
        success: false, 
        error: { 
          code: 'PARSE_ERROR', 
          message: error instanceof Error ? error.message : 'Unknown error occurred' 
        } 
      };
    }
  }

  protected extractStructuredData(document: Document): any | null {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scripts) {
      try {
        const data = JSON.parse(script.textContent || '');
        // Handle both single recipe and array of recipes
        const recipes = Array.isArray(data) ? data : [data];
        for (const item of recipes) {
          // Look for Recipe type in @graph array
          if (item['@graph']) {
            const recipe = item['@graph'].find((node: any) => node['@type'] === 'Recipe');
            if (recipe) {
              return recipe;
            }
          }
          // Direct Recipe type
          if (item['@type'] === 'Recipe') {
            return item;
          }
        }
      } catch (error) {
        console.warn('Failed to parse structured data:', error);
      }
    }
    return null;
  }
} 