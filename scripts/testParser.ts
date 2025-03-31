import { AllRecipesParser } from '../services/parsers/AllRecipesParser';
import * as fs from 'fs';
import { createObjectCsvWriter } from 'csv-writer';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
};

const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);

// CSV writer setup
const csvWriter = createObjectCsvWriter({
  path: 'parsed_recipes.csv',
  header: [
    { id: 'title', title: 'Title' },
    { id: 'image_url', title: 'Image URL' },
    { id: 'source_url', title: 'Source URL' },
    { id: 'author_name', title: 'Author Name' },
    { id: 'published_at', title: 'Published At' },
    { id: 'prep_time_minutes', title: 'Prep Time (Minutes)' },
    { id: 'cook_time_minutes', title: 'Cook Time (Minutes)' },
    { id: 'servings', title: 'Servings' },
    { id: 'ingredients', title: 'Ingredients' },
    { id: 'instructions', title: 'Instructions' },
    { id: 'tags', title: 'Tags' }
  ]
});

// Random delay between requests (1-3 seconds)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const randomDelay = () => delay(Math.floor(Math.random() * 2000) + 1000);

// Function to copy CSV to desktop
async function copyToDesktop() {
  try {
    await fs.promises.copyFile('parsed_recipes.csv', '/Users/mostafa.ammar/Desktop/parsed_recipes.csv');
    console.log('Copied CSV file to desktop');
  } catch (error) {
    console.error('Error copying CSV to desktop:', error);
  }
}

async function getRecentRecipeUrls(): Promise<string[]> {
  const baseUrl = 'https://www.allrecipes.com';
  const urls: Set<string> = new Set();
  
  try {
    // First, check the main recipes page
    console.log('Fetching main recipes page...');
    const mainResponse = await axios.get(`${baseUrl}/recipes/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const mainDom = new JSDOM(mainResponse.data);
    const mainLinks = mainDom.window.document.querySelectorAll('a[href*="/recipe/"]');
    console.log(`Found ${mainLinks.length} recipe links on main page`);
    
    for (const link of mainLinks) {
      const url = link.getAttribute('href');
      if (url && url.includes('/recipe/') && !urls.has(url)) {
        urls.add(url);
        if (urls.size >= 30) break;
      }
    }

    // If we need more recipes, try the search page
    if (urls.size < 30) {
      console.log('Fetching search results page...');
      const searchUrl = `${baseUrl}/search?q=dinner&sort=newest`;
      const searchResponse = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const searchDom = new JSDOM(searchResponse.data);
      const searchLinks = searchDom.window.document.querySelectorAll('a[href*="/recipe/"]');
      console.log(`Found ${searchLinks.length} recipe links on search page`);
      
      for (const link of searchLinks) {
        const url = link.getAttribute('href');
        if (url && url.includes('/recipe/') && !urls.has(url)) {
          urls.add(url);
          if (urls.size >= 30) break;
        }
      }
    }

    // Get the list of already parsed URLs from Firestore
    const parsedRecipes = await db.collection('test_parsed_recipes')
      .where('source', '==', 'allrecipes')
      .select('url')
      .get();
    
    const parsedUrls = new Set(parsedRecipes.docs.map(doc => doc.data().url));
    console.log(`Found ${parsedUrls.size} already parsed recipes`);

    // Filter out already parsed URLs and ensure they are absolute URLs
    const newUrls = Array.from(urls)
      .map(url => url.startsWith('http') ? url : `${baseUrl}${url}`)
      .filter(url => !parsedUrls.has(url));
    console.log(`Found ${newUrls.length} new recipes to parse`);

    return newUrls;
  } catch (error) {
    console.error('Error fetching recipe URLs:', error);
    return [];
  }
}

async function storeRecipe(recipe: any) {
  try {
    // Store in Firestore
    const docRef = await db.collection('test_parsed_recipes').add({
      ...recipe,
      createdBy: 'seeding-script',
      dateAdded: new Date().toISOString()
    });
    console.log('Stored in Firestore with ID:', docRef.id);

    // Clean up ingredients list
    const ingredients = recipe.ingredients
      .map((i: any) => {
        const amount = i.amount?.toString().trim() || '';
        const unit = i.unit?.trim() || '';
        const name = i.name?.trim() || '';
        return [amount, unit, name].filter(Boolean).join(' ');
      })
      .filter(Boolean)
      .join('\n');

    // Clean up instructions
    const instructions = recipe.steps
      .map((s: any, index: number) => `${index + 1}. ${s.description.trim()}`)
      .filter(Boolean)
      .join('\n');

    // Clean up tags
    const tags = recipe.tags
      .map((tag: string) => tag.trim())
      .filter(Boolean)
      .join(', ');

    // Store in CSV
    const csvRow = {
      title: recipe.title.trim(),
      image_url: recipe.imageUrl || '',
      source_url: recipe.url,
      author_name: recipe.creatorId || '',
      published_at: recipe.publishedAt || '',
      prep_time_minutes: recipe.prepTime || '',
      cook_time_minutes: recipe.cookTime || '',
      servings: recipe.servings || '',
      ingredients,
      instructions,
      tags
    };
    await csvWriter.writeRecords([csvRow]);
    console.log('Stored in CSV file');

    // Copy to desktop
    await copyToDesktop();
  } catch (error) {
    console.error('Error storing recipe:', error);
    throw error;
  }
}

async function parseAndStore() {
  const parser = new AllRecipesParser();
  const urls = await getRecentRecipeUrls();
  console.log(`Starting to parse ${urls.length} recipes...`);

  const successfulRecipes = [];
  const failedUrls = [];

  for (const url of urls) {
    try {
      console.log(`\nFetching recipe from ${url}`);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      console.log('Response status:', response.status);
      console.log('HTML content length:', response.data.length);

      const parseResult = await parser.parse(response.data, url);
      
      if (!parseResult.success || !parseResult.recipe) {
        console.error(`Failed to parse recipe from ${url}`);
        failedUrls.push(url);
        continue;
      }

      const recipe = parseResult.recipe;
      await storeRecipe(recipe);
      successfulRecipes.push(recipe);

      // Add a random delay between requests (1-3 seconds)
      await randomDelay();
    } catch (error) {
      console.error(`Error processing recipe from ${url}:`, error);
      failedUrls.push(url);
    }
  }

  // Log summary
  console.log('\nParsing Summary:');
  console.log(`Successfully parsed and stored ${successfulRecipes.length} recipes`);
  console.log(`Failed to parse ${failedUrls.length} recipes`);
  
  if (failedUrls.length > 0) {
    console.log('\nFailed URLs:');
    failedUrls.forEach(url => console.log(`- ${url}`));
  }

  // Store metadata about this run
  await db.collection('metadata').doc('last_parse').set({
    timestamp: new Date(),
    successCount: successfulRecipes.length,
    failureCount: failedUrls.length,
    lastProcessedUrl: urls.length > 0 ? urls[urls.length - 1] : null,
    failedUrls
  });

  if (successfulRecipes.length > 0) {
    // Copy CSV to desktop
    await copyToDesktop();
  } else {
    console.log('No new recipes were parsed, skipping CSV file creation');
  }
}

// Run the script
parseAndStore().catch(console.error); 