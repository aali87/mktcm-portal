#!/bin/bash
# Script to seed Railway database

echo "Seeding Railway database..."

# Use the DATABASE_URL from Railway
npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" lib/db/seed.ts

echo "Seeding complete!"
