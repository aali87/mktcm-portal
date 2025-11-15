#!/bin/bash

# Seed Railway Database
# Set your Railway DATABASE_URL before running this

echo "🌱 Seeding Railway database..."
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  echo "Please set it to your Railway PostgreSQL connection string"
  exit 1
fi

# Run the seed
npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" lib/db/seed.ts

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Railway database seeded successfully!"
else
  echo ""
  echo "❌ Seeding failed. Check the error messages above."
  exit 1
fi
