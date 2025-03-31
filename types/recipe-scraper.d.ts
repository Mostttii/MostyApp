declare module 'recipe-scraper' {
  interface ScrapedRecipe {
    name: string;
    description?: string;
    image: string;
    prepTime?: string;
    cookTime?: string;
    totalTime?: string;
    servings: string;
    ingredients: string[];
    instructions: string[];
  }

  function recipeScraper(url: string): Promise<ScrapedRecipe>;
  export = recipeScraper;
} 