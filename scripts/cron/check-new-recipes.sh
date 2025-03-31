#!/bin/bash

# Set up environment variables
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export NODE_ENV="production"

# Change to the project directory
cd "$(dirname "$0")/../.."

# Run the recipe checker script
node scripts/checkNewRecipes.js >> logs/recipe-checker.log 2>&1 