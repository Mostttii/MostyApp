export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  department: string;
  checked: boolean;
  recipeSource?: {
    recipeId: string;
    ingredientId: string;
  };
}

export interface ShoppingList {
  id: string;
  userId: string;
  name: string;
  items: ShoppingListItem[];
  associatedRecipes: string[]; // Array of recipe IDs
  createdAt: Date;
  updatedAt: Date;
} 