import { InstagramParser } from '../InstagramParser';

describe('InstagramParser', () => {
  let parser: InstagramParser;

  beforeEach(() => {
    parser = new InstagramParser();
  });

  it('should parse a valid Instagram URL', async () => {
    console.log('Starting test...');
    const url = 'https://www.instagram.com/p/abc123/';
    const recipe = await parser.parseUrl(url);
    console.log('Parsed recipe:', JSON.stringify(recipe, null, 2));

    // Check basic recipe properties
    expect(recipe).toBeDefined();
    expect(recipe.id).toBeDefined();
    expect(recipe.title).toBe('Homemade Pizza Recipe');
    expect(recipe.sourcePlatform).toBe('instagram');
    expect(recipe.language).toBe('en');

    // Check ingredients
    console.log('First ingredient:', JSON.stringify(recipe.ingredients[0], null, 2));
    expect(recipe.ingredients).toHaveLength(8);
    expect(recipe.ingredients[0]).toEqual({
      name: 'all-purpose flour',
      quantity: 2,
      unit: 'cups'
    });

    // Check instructions
    expect(recipe.instructions).toHaveLength(6);
    expect(recipe.instructions[0]).toContain('Mix flour');

    // Check dietary info
    expect(recipe.dietaryInfo).toContain('vegetarian');
  });

  it('should throw error for invalid Instagram URL', async () => {
    const url = 'https://invalid-url.com';
    await expect(parser.parseUrl(url)).rejects.toThrow('Invalid Instagram URL');
  });
}); 