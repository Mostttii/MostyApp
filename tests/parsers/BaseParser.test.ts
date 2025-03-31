import { BaseParser } from '../../services/parsers/BaseParser';
import { Recipe, ParseResult } from '../../types/Recipe';
import { expect, describe, it, beforeEach } from '@jest/globals';

export abstract class BaseParserTest {
  protected parser: BaseParser;
  protected expectedRecipe: Recipe;

  constructor(parser: BaseParser, expectedRecipe: Recipe) {
    this.parser = parser;
    this.expectedRecipe = expectedRecipe;
  }

  protected abstract getTestHTML(): string;
  protected abstract getTestURL(): string;

  protected validateRecipeCriteria(recipe: Recipe): string[] {
    const errors: string[] = [];

    // Check title
    if (!recipe.title || recipe.title.trim().length === 0) {
      errors.push('Recipe title is missing or empty');
    }

    // Check ingredients
    if (!recipe.ingredients || recipe.ingredients.length < 4) {
      errors.push(`Recipe has insufficient ingredients (${recipe.ingredients?.length || 0}, expected at least 4)`);
    }

    // Check steps
    if (!recipe.steps || recipe.steps.length < 3) {
      errors.push(`Recipe has insufficient steps (${recipe.steps?.length || 0}, expected at least 3)`);
    }

    // Check URL
    if (!recipe.url || !recipe.url.startsWith('http')) {
      errors.push('Recipe URL is missing or invalid');
    }

    // Check image
    if (!recipe.imageUrl || !recipe.imageUrl.startsWith('http')) {
      errors.push('Recipe image URL is missing or invalid');
    }

    // Check cooking time
    if (!recipe.cookTime || recipe.cookTime <= 0) {
      errors.push('Recipe cooking time is missing or invalid');
    }

    // Check difficulty
    if (!recipe.difficulty || !['easy', 'medium', 'hard'].includes(recipe.difficulty)) {
      errors.push('Recipe difficulty is missing or invalid');
    }

    // Check tags
    if (!recipe.tags || recipe.tags.length === 0) {
      errors.push('Recipe has no tags');
    }

    // Check servings
    if (!recipe.servings || recipe.servings <= 0) {
      errors.push('Recipe servings is missing or invalid');
    }

    return errors;
  }

  async testBasicStructure() {
    const result = await this.parser.parse(this.getTestHTML(), this.getTestURL());
    expect(result.success).toBe(true);
    expect(result.recipe).toBeDefined();
    if (!result.recipe) return;

    const errors = this.validateRecipeCriteria(result.recipe);
    if (errors.length > 0) {
      throw new Error(`Recipe validation failed:\n${errors.join('\n')}`);
    }

    // Compare with expected recipe
    expect(result.recipe.title).toBe(this.expectedRecipe.title);
    expect(result.recipe.description).toBe(this.expectedRecipe.description);
    expect(result.recipe.cookTime).toBe(this.expectedRecipe.cookTime);
    expect(result.recipe.servings).toBe(this.expectedRecipe.servings);
    expect(result.recipe.creatorId).toBe(this.expectedRecipe.creatorId);
    expect(result.recipe.rating).toEqual(this.expectedRecipe.rating);
  }

  async testIngredientParsing() {
    const result = await this.parser.parse(this.getTestHTML(), this.getTestURL());
    expect(result.success).toBe(true);
    expect(result.recipe).toBeDefined();
    if (!result.recipe) return;

    const errors = this.validateRecipeCriteria(result.recipe);
    if (errors.length > 0) {
      throw new Error(`Recipe validation failed:\n${errors.join('\n')}`);
    }

    // Compare with expected ingredients (ignoring IDs)
    const expectedIngredients = this.expectedRecipe.ingredients?.map(({ id, ...rest }) => rest) || [];
    const actualIngredients = result.recipe.ingredients.map(({ id, ...rest }) => rest);
    expect(actualIngredients).toEqual(expectedIngredients);
  }

  async testStepParsing() {
    const result = await this.parser.parse(this.getTestHTML(), this.getTestURL());
    expect(result.success).toBe(true);
    expect(result.recipe).toBeDefined();
    if (!result.recipe) return;

    const errors = this.validateRecipeCriteria(result.recipe);
    if (errors.length > 0) {
      throw new Error(`Recipe validation failed:\n${errors.join('\n')}`);
    }

    // Test step structure
    result.recipe.steps.forEach((step, index) => {
      expect(step.id).toBeDefined();
      expect(step.order).toBe(index + 1);
      expect(step.description).toBeDefined();
      expect(Array.isArray(step.tips)).toBe(true);
    });

    // Compare with expected steps (ignoring IDs)
    const expectedSteps = this.expectedRecipe.steps?.map(({ id, ...rest }) => rest) || [];
    const actualSteps = result.recipe.steps.map(({ id, ...rest }) => rest);
    expect(actualSteps).toEqual(expectedSteps);
  }

  async testNutritionInfo() {
    const result = await this.parser.parse(this.getTestHTML(), this.getTestURL());
    
    expect(result.success).toBe(true);
    expect(result.recipe?.nutritionInfo).toBeDefined();
    if (!result.recipe?.nutritionInfo) return;

    const { nutritionInfo } = result.recipe;
    expect(typeof nutritionInfo.calories).toBe('number');
    expect(typeof nutritionInfo.protein).toBe('number');
    expect(typeof nutritionInfo.carbs).toBe('number');
    expect(typeof nutritionInfo.fat).toBe('number');

    // Compare with expected nutrition info
    expect(nutritionInfo).toEqual(this.expectedRecipe.nutritionInfo);
  }

  async testDietaryInfo() {
    const result = await this.parser.parse(this.getTestHTML(), this.getTestURL());
    expect(result.success).toBe(true);
    expect(result.recipe).toBeDefined();
    if (!result.recipe) return;

    const errors = this.validateRecipeCriteria(result.recipe);
    if (errors.length > 0) {
      throw new Error(`Recipe validation failed:\n${errors.join('\n')}`);
    }

    // Compare with expected dietary info
    expect(result.recipe.dietaryInfo).toEqual(this.expectedRecipe.dietaryInfo);
  }

  async testTagExtraction() {
    const result = await this.parser.parse(this.getTestHTML(), this.getTestURL());
    expect(result.success).toBe(true);
    expect(result.recipe).toBeDefined();
    if (!result.recipe) return;

    const errors = this.validateRecipeCriteria(result.recipe);
    if (errors.length > 0) {
      throw new Error(`Recipe validation failed:\n${errors.join('\n')}`);
    }

    // Compare with expected tags
    expect(result.recipe.tags).toEqual(this.expectedRecipe.tags);
  }

  async testErrorHandling() {
    // Test with invalid HTML
    const invalidResult = await this.parser.parse('<invalid>html</invalid>', this.getTestURL());
    expect(invalidResult.success).toBe(false);
    expect(invalidResult.error).toBeDefined();
    expect(invalidResult.error?.code).toBe('PARSER_ERROR');

    // Test with empty HTML
    const emptyResult = await this.parser.parse('', this.getTestURL());
    expect(emptyResult.success).toBe(false);
    expect(emptyResult.error).toBeDefined();
    expect(emptyResult.error?.code).toBe('PARSER_ERROR');

    // Test with missing required fields
    const missingFieldsHtml = this.getTestHTML().replace(/<h1 class="recipe-title">.*?<\/h1>/, '');
    const missingFieldsResult = await this.parser.parse(missingFieldsHtml, this.getTestURL());
    expect(missingFieldsResult.success).toBe(true);
    expect(missingFieldsResult.recipe?.title).toBe('');
  }

  async runAllTests() {
    await this.testBasicStructure();
    await this.testIngredientParsing();
    await this.testStepParsing();
    await this.testNutritionInfo();
    await this.testDietaryInfo();
    await this.testTagExtraction();
    await this.testErrorHandling();
  }
} 