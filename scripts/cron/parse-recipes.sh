#!/bin/bash

# Set up environment variables
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export NODE_ENV="production"

# Change to the project directory
cd "$(dirname "$0")/../.."

# Create logs directory if it doesn't exist
mkdir -p logs

# Run the recipe parser script
echo "Starting recipe parser at $(date)" >> logs/recipe-parser.log
npx tsx scripts/testParser.ts >> logs/recipe-parser.log 2>&1
echo "Finished recipe parser at $(date)" >> logs/recipe-parser.log 