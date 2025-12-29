#!/bin/bash

# Initialize SQLite database for development

set -e

echo "=== Setting up SQLite Database for Development ==="
echo ""

# Backup original schema
if [ -f "prisma/schema.prisma" ]; then
  cp prisma/schema.prisma prisma/schema.prisma.backup
fi

# Copy SQLite schema
cp prisma/schema.sqlite.prisma prisma/schema.prisma

echo "📁 Database location: ./prisma/dev.db"
echo ""

# Create prisma directory if it doesn't exist
mkdir -p prisma

# Set environment variable
export DATABASE_URL="file:./prisma/dev.db"

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Push schema to database
echo "🚀 Creating database and pushing schema..."
npx prisma db push --accept-data-loss

# Restore original schema
if [ -f "prisma/schema.prisma.backup" ]; then
  mv prisma/schema.prisma.backup prisma/schema.prisma
fi

echo ""
echo "✅ SQLite database setup complete!"
echo ""
echo "Database file: ./prisma/dev.db"
echo ""
echo "Next steps:"
echo "1. Create admin user: npm run db:create-admin:sqlite"
echo "2. Start dev server: npm run dev"
echo "3. Access admin at: http://localhost:5173/admin"
echo "4. View database: npm run db:studio:sqlite"

