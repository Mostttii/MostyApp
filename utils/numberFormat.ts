export function decimalToFraction(decimal: number): string {
  // Handle whole numbers
  if (decimal % 1 === 0) {
    return decimal.toString();
  }

  // Common fractions map for better readability
  const commonFractions: { [key: string]: string } = {
    '0.25': '¼',
    '0.5': '½',
    '0.75': '¾',
    '0.33': '⅓',
    '0.67': '⅔',
    '0.2': '⅕',
    '0.4': '⅖',
    '0.6': '⅗',
    '0.8': '⅘',
    '0.17': '⅙',
    '0.83': '⅚',
    '0.125': '⅛',
    '0.375': '⅜',
    '0.625': '⅝',
    '0.875': '⅞'
  };

  // Handle mixed numbers (e.g., 1.5 -> "1 ½")
  const wholePart = Math.floor(decimal);
  const decimalPart = decimal - wholePart;

  // Round to 3 decimal places to match our common fractions
  const roundedDecimal = decimalPart.toFixed(3);
  
  // Check if we have a common fraction match
  const fraction = commonFractions[roundedDecimal];
  if (fraction) {
    return wholePart > 0 ? `${wholePart} ${fraction}` : fraction;
  }

  // If no match found, return the decimal
  return decimal.toString();
}

export function formatIngredientAmount(amount: number): string {
  return decimalToFraction(amount);
} 