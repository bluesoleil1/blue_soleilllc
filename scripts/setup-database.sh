#!/bin/bash

# Database Setup Script
# Automatically detects and sets up SQLite (dev) or PostgreSQL (production)

set -e

echo "=== Blue Soleil Database Setup ==="
echo ""

# Check if DATABASE_PROVIDER is set
if [ -z "$DATABASE_PROVIDER" ]; then
  # Auto-detect based on DATABASE_URL
  if [[ "$DATABASE_URL" == *"sqlite"* ]] || [[ "$DATABASE_URL" == *".db"* ]] || [[ "$DATABASE_URL" == *"file:"* ]]; then
    export DATABASE_PROVIDER="sqlite"
    echo "🔍 Detected SQLite database (development mode)"
  else
    export DATABASE_PROVIDER="postgresql"
    echo "🔍 Detected PostgreSQL database (production mode)"
  fi
else
  echo "📋 Using DATABASE_PROVIDER: $DATABASE_PROVIDER"
fi

# Generate Prisma Client
echo ""
echo "📦 Generating Prisma Client..."
npx prisma generate

# Push schema to database
echo ""
echo "🚀 Pushing schema to database..."
npx prisma db push

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Create admin user: npx tsx scripts/create-admin.ts"
echo "2. Start dev server: npm run dev"
echo "3. Access admin at: http://localhost:5173/admin"

