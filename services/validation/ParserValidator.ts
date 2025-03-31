import { Recipe } from '../../types/Recipe';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

export interface ParserValidationConfig {
  requiredSelectors: string[];
  optionalSelectors: string[];
  structuredDataRequired: boolean;
}

export class ParserValidator {
  static validateRecipe(recipe: Recipe): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required fields
    if (!recipe.title) {
      errors.push({
        field: 'title',
        message: 'Recipe title is required',
        code: 'MISSING_TITLE'
      });
    }

    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      errors.push({
        field: 'ingredients',
        message: 'Recipe must have at least one ingredient',
        code: 'NO_INGREDIENTS'
      });
    }

    if (!recipe.steps || recipe.steps.length === 0) {
      errors.push({
        field: 'steps',
        message: 'Recipe must have at least one step',
        code: 'NO_STEPS'
      });
    }

    // Warnings for optional but recommended fields
    if (!recipe.description) {
      warnings.push({
        field: 'description',
        message: 'Recipe description is recommended',
        code: 'MISSING_DESCRIPTION'
      });
    }

    if (!recipe.imageUrl) {
      warnings.push({
        field: 'imageUrl',
        message: 'Recipe image is recommended',
        code: 'MISSING_IMAGE'
      });
    }

    if (recipe.cookTime === 0) {
      warnings.push({
        field: 'cookTime',
        message: 'Cook time should be specified',
        code: 'MISSING_COOK_TIME'
      });
    }

    // Validate ingredient structure
    recipe.ingredients.forEach((ingredient, index) => {
      if (!ingredient.name) {
        errors.push({
          field: `ingredients[${index}].name`,
          message: 'Ingredient name is required',
          code: 'INVALID_INGREDIENT'
        });
      }
    });

    // Validate step structure
    recipe.steps.forEach((step, index) => {
      if (!step.description) {
        errors.push({
          field: `steps[${index}].description`,
          message: 'Step description is required',
          code: 'INVALID_STEP'
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateParserStructure(html: string, config: ParserValidationConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check for required selectors
    config.requiredSelectors.forEach(selector => {
      if (!html.includes(selector)) {
        errors.push({
          field: selector,
          message: `Required selector "${selector}" not found in HTML`,
          code: 'MISSING_SELECTOR'
        });
      }
    });

    // Check for optional selectors
    config.optionalSelectors.forEach(selector => {
      if (!html.includes(selector)) {
        warnings.push({
          field: selector,
          message: `Optional selector "${selector}" not found in HTML`,
          code: 'MISSING_OPTIONAL_SELECTOR'
        });
      }
    });

    // Check for structured data if required
    if (config.structuredDataRequired && !html.includes('application/ld+json')) {
      errors.push({
        field: 'structuredData',
        message: 'Required structured data not found in HTML',
        code: 'MISSING_STRUCTURED_DATA'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
} 