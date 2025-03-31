import requests
from bs4 import BeautifulSoup
from fuzzywuzzy import fuzz
import random
from datetime import datetime
import firebase_admin
from firebase_admin import firestore
from .models import Session, Parser, ParseError
import time
import json
import os

def get_live_recipe_data(url):
    """Fetch current recipe data from AllRecipes"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract ingredients from the live page
        ingredients = []
        ingredient_elements = soup.select('[data-ingredient]')
        for element in ingredient_elements:
            ingredients.append(element.get_text().strip())
            
        return ingredients
    except Exception as e:
        print(f"Error fetching live data from {url}: {str(e)}")
        return None

def compare_ingredients(parsed_ingredients, live_ingredients):
    """Compare parsed ingredients with live ingredients using fuzzy matching"""
    if not parsed_ingredients or not live_ingredients:
        return 0
    
    total_score = 0
    matches_found = 0
    
    for parsed in parsed_ingredients:
        # Get the best match score for this ingredient
        best_score = max(
            fuzz.ratio(parsed.lower(), live.lower())
            for live in live_ingredients
        )
        total_score += best_score
        matches_found += 1
    
    return total_score / matches_found if matches_found > 0 else 0

def get_recent_recipes():
    """Get recent recipes from either Firestore or local JSON"""
    try:
        # Try Firestore first
        if firebase_admin._apps:
            db = firestore.client()
            recipes = db.collection('test_parsed_recipes').order_by('dateAdded', direction=firestore.Query.DESCENDING).limit(30).get()
            return [doc.to_dict() for doc in recipes]
    except Exception as e:
        print(f"Failed to get recipes from Firestore: {e}")
    
    # Fallback to local JSON
    try:
        if os.path.exists('data/recent_recipes.json'):
            with open('data/recent_recipes.json', 'r') as f:
                return json.load(f)
    except Exception as e:
        print(f"Failed to load local recipes: {e}")
    
    return []

async def check_parser_accuracy():
    """Check accuracy for all parsers"""
    session = Session()
    
    try:
        # Get AllRecipes parser
        parser = session.query(Parser).filter_by(name='allrecipes').first()
        if not parser:
            return
        
        # Get recent recipes
        recipes = get_recent_recipes()
        if not recipes:
            print("No recipes found to check accuracy")
            return
        
        # Select 5 random recipes for checking
        sample_recipes = random.sample(recipes, min(5, len(recipes)))
        
        total_accuracy = 0
        checked_count = 0
        start_time = time.time()
        
        for recipe in sample_recipes:
            url = recipe.get('url')
            
            if not url:
                continue
                
            # Get current ingredients from live page
            live_ingredients = get_live_recipe_data(url)
            
            if live_ingredients:
                # Get parsed ingredients
                parsed_ingredients = [
                    f"{ing.get('amount', '')} {ing.get('unit', '')} {ing.get('name', '')}".strip()
                    for ing in recipe.get('ingredients', [])
                ]
                
                # Compare and calculate accuracy
                accuracy = compare_ingredients(parsed_ingredients, live_ingredients)
                total_accuracy += accuracy
                checked_count += 1
            
            # Add delay between requests
            time.sleep(2)
        
        if checked_count > 0:
            # Update parser stats
            parser.accuracy_score = total_accuracy / checked_count
            parser.avg_parse_time = (time.time() - start_time) / checked_count
            parser.last_run = datetime.utcnow()
            session.commit()
            
    except Exception as e:
        print(f"Error checking accuracy: {str(e)}")
    finally:
        session.close() 