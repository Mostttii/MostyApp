import { getRecentRecipeUrls } from '../parseRecentAllRecipes';
import axios from 'axios';
import { JSDOM } from 'jsdom';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('getRecentRecipeUrls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should extract recipe URLs from the main page', async () => {
    // Mock the main page HTML response
    const mockMainPageHtml = `
      <html>
        <body>
          <a class="card__titleLink" href="https://www.allrecipes.com/recipe/123">Recipe 1</a>
          <a class="card__titleLink" href="https://www.allrecipes.com/recipe/456">Recipe 2</a>
          <a href="https://www.allrecipes.com/other">Not a recipe</a>
        </body>
      </html>
    `;

    mockedAxios.get.mockResolvedValueOnce({ data: mockMainPageHtml });

    const urls = await getRecentRecipeUrls();

    expect(urls).toHaveLength(2);
    expect(urls).toContain('https://www.allrecipes.com/recipe/123');
    expect(urls).toContain('https://www.allrecipes.com/recipe/456');
    expect(mockedAxios.get).toHaveBeenCalledWith('https://www.allrecipes.com/recipes/');
  });

  it('should fetch from "What\'s New" section if main page doesn\'t have enough recipes', async () => {
    // Mock the main page with only one recipe
    const mockMainPageHtml = `
      <html>
        <body>
          <a class="card__titleLink" href="https://www.allrecipes.com/recipe/123">Recipe 1</a>
        </body>
      </html>
    `;

    // Mock the "What's New" page with more recipes
    const mockWhatsNewHtml = `
      <html>
        <body>
          <a class="card__titleLink" href="https://www.allrecipes.com/recipe/456">Recipe 2</a>
          <a class="card__titleLink" href="https://www.allrecipes.com/recipe/789">Recipe 3</a>
        </body>
      </html>
    `;

    mockedAxios.get
      .mockResolvedValueOnce({ data: mockMainPageHtml })
      .mockResolvedValueOnce({ data: mockWhatsNewHtml });

    const urls = await getRecentRecipeUrls();

    expect(urls).toHaveLength(3);
    expect(urls).toContain('https://www.allrecipes.com/recipe/123');
    expect(urls).toContain('https://www.allrecipes.com/recipe/456');
    expect(urls).toContain('https://www.allrecipes.com/recipe/789');
    expect(mockedAxios.get).toHaveBeenCalledWith('https://www.allrecipes.com/recipes/what-s-new/');
  });

  it('should handle errors gracefully', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

    const urls = await getRecentRecipeUrls();
    expect(urls).toHaveLength(0);
  });
}); 