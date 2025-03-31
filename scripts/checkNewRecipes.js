const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, getDoc, setDoc } = require('firebase/firestore');
const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');
const { AllRecipesParser } = require('../services/parsers/AllRecipesParser');

// Initialize Firebase (you'll need to add your config)
const firebaseConfig = {
  // Add your Firebase config here
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const PRODUCTION_COLLECTION = 'production_recipes';
const LAST_PARSED_DOC = 'metadata/last_parsed';
const CSV_FILE = 'parsed_recipes.csv';

async function getLastParsed() {
  try {
    const docRef = doc(db, LAST_PARSED_DOC);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      timestamp: data.timestamp.toDate(),
      url: data.url
    };
  } catch (error) {
    console.error('Error getting last parsed info:', error);
    return null;
  }
}

async function getNewRecipeUrls() {
  try {
    const baseUrl = 'https://www.allrecipes.com';
    const latestUrl = `${baseUrl}/recipes/new-recipes/`;
    
    console.log('Fetching latest recipes page...');
    const response = await fetch(latestUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch latest recipes: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Extract recipe URLs using regex
    const urlPattern = /href="(\/recipe\/[^"#]+)"/g;
    const matches = html.matchAll(urlPattern);
    const urls = new Set();
    
    for (const match of matches) {
      const relativeUrl = match[1];
      const fullUrl = `${baseUrl}${relativeUrl}`;
      urls.add(fullUrl);
    }
    
    console.log(`Found ${urls.size} recipe URLs`);
    return Array.from(urls);
  } catch (error) {
    console.error('Error getting new recipe URLs:', error);
    return [];
  }
}

async function parseAndStoreRecipe(url, parser) {
  try {
    console.log(`Parsing recipe from ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status}`);
      return null;
    }
    
    const html = await response.text();
    const parseResult = await parser.parse(html, url);
    
    if (!parseResult.success || !parseResult.recipe) {
      console.error(`Failed to parse recipe from ${url}`);
      return null;
    }

    const recipe = parseResult.recipe;
    
    // Store in Firestore production collection
    const recipeRef = doc(collection(db, PRODUCTION_COLLECTION), recipe.id);
    await setDoc(recipeRef, {
      ...recipe,
      source: 'allrecipes',
      status: 'production',
      parsedAt: new Date()
    });
    
    console.log(`Successfully parsed and stored recipe: ${recipe.title}`);
    return recipe;
  } catch (error) {
    console.error(`Error parsing recipe from ${url}:`, error);
    return null;
  }
}

async function updateLastParsed(url) {
  const lastParsedRef = doc(db, LAST_PARSED_DOC);
  await setDoc(lastParsedRef, {
    timestamp: new Date(),
    url
  });
}

async function appendToCSV(recipes) {
  // Read existing recipes
  let existingRecipes = [];
  if (fs.existsSync(CSV_FILE)) {
    const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');
    const parsed = parse(csvContent, { columns: true });
    existingRecipes = parsed.map(row => ({
      ...row,
      ingredients: row.Ingredients.split('\n').map(i => {
        const [amount, unit, ...nameParts] = i.split(' ');
        return {
          amount: parseFloat(amount),
          unit,
          name: nameParts.join(' '),
        };
      }),
      steps: row.Instructions.split('\n').map((text, index) => ({
        order: index + 1,
        description: text,
      })),
      tags: row.Tags ? row.Tags.split(', ') : [],
      cuisine: row.Cuisine ? row.Cuisine.split(', ') : [],
    }));
  }

  // Combine with new recipes
  const allRecipes = [...existingRecipes, ...recipes];

  // Save all recipes to CSV
  const csvData = allRecipes.map(recipe => ({
    Title: recipe.title,
    'Image URL': recipe.imageUrl,
    'Source URL': recipe.url,
    'Creator ID': recipe.creatorId,
    'Published At': recipe.publishedAt || '',
    'Prep Time (Minutes)': recipe.prepTime,
    'Cook Time (Minutes)': recipe.cookTime,
    Servings: recipe.servings,
    Ingredients: recipe.ingredients.map(i => 
      `${i.amount} ${i.unit} ${i.name}${i.notes ? ` (${i.notes})` : ''}`
    ).join('\n'),
    Instructions: recipe.steps.map(s => s.description).join('\n'),
    Tags: recipe.tags.join(', '),
    Cuisine: recipe.cuisine.join(', '),
    Difficulty: recipe.difficulty,
    'Dietary Info': recipe.dietaryInfo ? 
      Object.entries(recipe.dietaryInfo)
        .filter(([_, value]) => value)
        .map(([key]) => key)
        .join(', ') : '',
    'Rating': recipe.rating ? `${recipe.rating.average} (${recipe.rating.count} reviews)` : 'No ratings',
    'Nutrition Info': recipe.nutritionInfo ? 
      `Calories: ${recipe.nutritionInfo.calories}, Protein: ${recipe.nutritionInfo.protein}g, Carbs: ${recipe.nutritionInfo.carbs}g, Fat: ${recipe.nutritionInfo.fat}g` : 
      'No nutrition info'
  }));

  const csv = stringify(csvData, { header: true });
  fs.writeFileSync(CSV_FILE, csv);
  console.log(`Updated CSV file with ${recipes.length} new recipes (total: ${allRecipes.length})`);
}

async function main() {
  const lastParsed = await getLastParsed();
  if (!lastParsed) {
    console.log('No last parsed info found. Please run parseProductionRecipes.ts first.');
    return;
  }

  const parser = new AllRecipesParser();
  const newUrls = await getNewRecipeUrls();
  const recipes = [];

  for (const url of newUrls) {
    const recipe = await parseAndStoreRecipe(url, parser);
    if (recipe) {
      recipes.push(recipe);
    }
    // Add a small delay between requests to be nice to the server
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  if (recipes.length > 0) {
    await updateLastParsed(newUrls[newUrls.length - 1]);
    await appendToCSV(recipes);
    console.log(`Found and parsed ${recipes.length} new recipes`);
  } else {
    console.log('No new recipes found');
  }
}

// This script should be run by a cron job weekly
main().catch(console.error); 