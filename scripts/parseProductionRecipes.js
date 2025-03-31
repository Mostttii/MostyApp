const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');
const fs = require('fs');
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

async function getRecentRecipeUrls(count = 30) {
  const baseUrl = 'https://www.allrecipes.com';
  const urls = [
    '/recipe/269524/instant-pot-ground-beef-and-pasta/',
    '/recipe/263929/corned-beef-kimchi-fried-rice/',
    '/recipe/280509/air-fryer-chicken-thighs/',
    '/recipe/282852/creamy-baked-mac-and-cheese/',
    '/recipe/279715/classic-beef-stroganoff/',
    '/recipe/278271/instant-pot-chicken-and-dumplings/',
    '/recipe/275439/easy-homemade-pizza-dough/',
    '/recipe/277143/slow-cooker-pot-roast/',
    '/recipe/273864/classic-meatloaf/',
    '/recipe/276034/homemade-lasagna/',
    '/recipe/278968/crispy-fried-chicken/',
    '/recipe/275251/perfect-pancakes/',
    '/recipe/277192/classic-chili-con-carne/',
    '/recipe/279843/creamy-garlic-shrimp-pasta/',
    '/recipe/274563/homemade-chocolate-chip-cookies/',
    '/recipe/278432/easy-beef-stir-fry/',
    '/recipe/275892/classic-french-onion-soup/',
    '/recipe/279124/baked-salmon-with-herbs/',
    '/recipe/276789/creamy-mushroom-risotto/',
    '/recipe/277834/homemade-sushi-rolls/',
    '/recipe/278156/classic-beef-tacos/',
    '/recipe/275673/thai-green-curry/',
    '/recipe/279901/vegetarian-buddha-bowl/',
    '/recipe/276445/classic-eggs-benedict/',
    '/recipe/278567/homemade-ramen-noodle-soup/',
    '/recipe/275789/greek-moussaka/',
    '/recipe/279234/classic-beef-bourguignon/',
    '/recipe/276912/vegetable-biryani/',
    '/recipe/278345/homemade-falafel/',
    '/recipe/275567/classic-tiramisu/',
    '/recipe/279678/spanish-paella/',
    '/recipe/276123/beef-wellington/'
  ];
  
  return urls.map(url => baseUrl + url);
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

async function saveToCSV(recipes) {
  const csvData = recipes.map(recipe => ({
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
  console.log(`Saved ${recipes.length} recipes to ${CSV_FILE}`);
}

async function main() {
  const parser = new AllRecipesParser();
  const urls = await getRecentRecipeUrls();
  const recipes = [];

  for (const url of urls) {
    const recipe = await parseAndStoreRecipe(url, parser);
    if (recipe) {
      recipes.push(recipe);
    }
    // Add a small delay between requests to be nice to the server
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  if (recipes.length > 0) {
    await updateLastParsed(urls[urls.length - 1]);
    await saveToCSV(recipes);
  }

  console.log(`Completed parsing ${recipes.length} recipes`);
}

main().catch(console.error); 