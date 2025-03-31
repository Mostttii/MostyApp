import { Recipe, RecipeParser, Ingredient, SupportedPlatform, SupportedLanguage } from './types';

export abstract class BaseParser implements RecipeParser {
  constructor(
    public platform: SupportedPlatform,
    public language: SupportedLanguage = 'en'
  ) {}

  abstract parseUrl(url: string): Promise<Recipe>;

  protected generateRecipeId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  public async extractIngredients(content: string): Promise<Ingredient[]> {
    // Basic ingredient extraction logic
    // This will be enhanced with NLP and machine learning later
    const lines = content.split('\n');
    const ingredients: Ingredient[] = [];

    const quantityRegex = /(\d+(?:[.,]\d+)?)\s*(cup|cups|g|gram|grams|kg|ml|l|tbsp|tsp|pound|pounds|lb|lbs|oz|ounce|ounces)?/i;
    
    for (const line of lines) {
      if (this.looksLikeIngredient(line)) {
        console.log('Processing ingredient line:', line);
        // Clean up the line
        const cleanLine = line.trim();
        console.log('Cleaned line:', cleanLine);
          
        const match = cleanLine.match(quantityRegex);
        console.log('Quantity match:', match);
        
        if (match) {
          // Extract the quantity and unit from the match
          const quantity = parseFloat(match[1]);
          const unit = this.normalizeUnit(match[2] || 'piece');
          
          // Get the ingredient name by removing the quantity and unit
          const name = cleanLine
            .replace(new RegExp(`^${match[1]}\\s*${match[2] || ''}\\s*`), '')  // Remove quantity and unit
            .replace(/^[sS]\s+/, '')  // Remove any remaining leading 's'
            .trim();
          
          console.log('Extracted ingredient:', { name, quantity, unit });
          
          ingredients.push({
            name,
            quantity,
            unit,
          });
        } else {
          // Handle ingredients without quantities (like "Fresh basil leaves")
          const name = cleanLine.replace(/^Fresh\s+/i, '').trim();
          console.log('Extracted ingredient without quantity:', { name, quantity: 1, unit: 'piece' });
          
          ingredients.push({
            name,
            quantity: 1,
            unit: 'piece',
          });
        }
      }
    }

    return ingredients;
  }

  private normalizeUnit(unit: string): string {
    const unitMap: Record<string, string> = {
      'cup': 'cups',
      'gram': 'grams',
      'pound': 'pounds',
      'lb': 'lbs',
      'ounce': 'ounces',
    };
    return unitMap[unit.toLowerCase()] || unit.toLowerCase();
  }

  public async extractInstructions(content: string): Promise<string[]> {
    // Basic instruction extraction logic
    // This will be enhanced with NLP and machine learning later
    const lines = content.split('\n');
    return lines
      .filter(line => this.looksLikeInstruction(line))
      .map(line => line.trim());
  }

  private looksLikeIngredient(line: string): boolean {
    // Skip empty lines and section headers
    if (!line.trim() || /^Ingredients:/i.test(line) || /^Instructions:/i.test(line)) {
      return false;
    }

    // Basic heuristic for identifying ingredient lines
    const ingredientIndicators = [
      /^\d+\s*(cup|cups|g|gram|grams|kg|ml|l|tbsp|tsp|pound|pounds|lb|lbs|oz|ounce|ounces)/i,  // Quantities with units
      /^Fresh\s+/i,  // Fresh ingredients
    ];

    return ingredientIndicators.some(pattern => pattern.test(line));
  }

  private looksLikeInstruction(line: string): boolean {
    // Basic heuristic for identifying instruction lines
    const instructionIndicators = [
      /^\d+\.\s+/,
      /^step\s+\d+/i,
      /^[-•*]\s+/,
    ];

    return (
      instructionIndicators.some(pattern => pattern.test(line)) &&
      line.length > 10 // Arbitrary minimum length for an instruction
    );
  }

  protected sanitizeText(text: string): string {
    return text
      .replace(/[^\w\s.,;:()[\]{}!?-]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
} 