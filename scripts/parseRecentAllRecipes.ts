import { AllRecipesParser } from '../services/parsers/AllRecipesParser';
import { db } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import * as fs from 'fs';
import { createObjectCsvWriter } from 'csv-writer';
import axios from 'axios';
import { JSDOM } from 'jsdom';

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
    { id: 'servings', title: 'Servings' },
    { id: 'ingredients', title: 'Ingredients' },
    { id: 'instructions', title: 'Instructions' },
    { id: 'tags', title: 'Tags' }
  ]
});

// Random delay between requests (1-3 seconds)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const randomDelay = () => delay(Math.floor(Math.random() * 2000) + 1000);

async function getRecentRecipeUrls(): Promise<string[]> {
  // AllRecipes recently added recipes can be found at:
  const baseUrl = 'https://www.allrecipes.com/recipes/';
  const urls: string[] = [];
  
  try {
    console.log('Fetching main recipes page...');
    const response = await axios.get(baseUrl);
    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    
    // Find recipe cards in the main feed
    const recipeCards = document.querySelectorAll('a.card__titleLink');
    console.log(`Found ${recipeCards.length} recipe cards on main page`);
    
    for (const link of recipeCards) {
      const url = link.getAttribute('href');
      if (url && url.includes('/recipe/') && !urls.includes(url)) {
        urls.push(url);
        console.log(`Found recipe URL: ${url}`);
        if (urls.length >= 2) break; // Only get 2 recipes for testing
      }
    }

    if (urls.length < 2) {
      console.log('Not enough recipes found on main page, trying "What\'s New" section...');
      const whatsNewUrl = 'https://www.allrecipes.com/recipes/what-s-new/';
      const whatsNewResponse = await axios.get(whatsNewUrl);
      const whatsNewDom = new JSDOM(whatsNewResponse.data);
      const whatsNewLinks = whatsNewDom.window.document.querySelectorAll('a.card__titleLink');
      console.log(`Found ${whatsNewLinks.length} recipe cards on "What's New" page`);
      
      for (const link of whatsNewLinks) {
        const url = link.getAttribute('href');
        if (url && url.includes('/recipe/') && !urls.includes(url)) {
          urls.push(url);
          console.log(`Found recipe URL: ${url}`);
          if (urls.length >= 2) break;
        }
      }
    }
  } catch (error) {
    console.error('Error fetching recipe URLs:', error);
  }
  
  console.log(`Total unique recipe URLs found: ${urls.length}`);
  return urls;
}

async function parseAndStore() {
  const parser = new AllRecipesParser();
  const urls = await getRecentRecipeUrls();
  const results = [];
  
  console.log(`\nStarting to parse ${urls.length} recipes...`);
  
  for (const url of urls) {
    try {
      console.log(`\n=== Processing ${url} ===`);
      
      // Parse recipe
      console.log('Fetching recipe page...');
      const response = await axios.get(url);
      console.log('Parsing recipe data...');
      const result = await parser.parse(response.data, url);
      
      if (!result.success || !result.recipe) {
        console.log(`Failed to parse ${url}`);
        continue;
      }
      
      const recipe = result.recipe;
      console.log('Successfully parsed recipe:');
      console.log(`- Title: ${recipe.title}`);
      console.log(`- Servings: ${recipe.servings}`);
      console.log(`- Ingredients: ${recipe.ingredients.length}`);
      console.log(`- Steps: ${recipe.steps.length}`);
      
      // Format data for storage
      const recipeData = {
        title: recipe.title,
        image_url: recipe.imageUrl,
        source_url: url,
        author_name: recipe.creatorId || null,
        published_at: null, // TODO: Extract from page if available
        prep_time_minutes: recipe.cookTime || null,
        servings: recipe.servings,
        ingredients: recipe.ingredients.map(i => `${i.amount} ${i.unit} ${i.name}`).join('\n'),
        instructions: recipe.steps.map(s => s.description).join('\n'),
        tags: recipe.tags.join(', '),
        parsed_at: new Date().toISOString(),
        parse_status: 'success'
      };
      
      // Store in Firestore
      console.log('Storing in Firestore...');
      await addDoc(collection(db, 'test_parsed_recipes'), recipeData);
      
      // Add to results for CSV
      results.push(recipeData);
      
      console.log(`Successfully stored recipe in Firestore and CSV`);
      
      // Random delay before next request
      await randomDelay();
      
    } catch (error) {
      console.error(`Error processing ${url}:`, error);
      
      // Log error to Firestore
      await addDoc(collection(db, 'test_parsed_recipes'), {
        source_url: url,
        parsed_at: new Date().toISOString(),
        parse_status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // Write to CSV
  console.log('\nWriting results to CSV...');
  await csvWriter.writeRecords(results);
  console.log('Finished writing to CSV');
}

// Run the script
parseAndStore().catch(console.error); 