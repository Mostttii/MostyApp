#!/bin/bash

# Set up environment variables
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export NODE_ENV="production"

# Change to the project directory
cd "$(dirname "$0")/../.."

# Create logs and reports directories if they don't exist
mkdir -p logs reports

# Run the report generator
echo "Starting report generator at $(date)" >> logs/report-generator.log
curl -X POST http://localhost:8000/generate-report >> logs/report-generator.log 2>&1
echo "Finished report generator at $(date)" >> logs/report-generator.log 