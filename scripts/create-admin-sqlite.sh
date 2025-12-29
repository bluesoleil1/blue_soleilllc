#!/bin/bash

# Create admin user for SQLite database

set -e

echo "=== Creating Admin User (SQLite) ==="
echo ""

# Backup and switch to SQLite schema
if [ -f "prisma/schema.prisma" ]; then
  cp prisma/schema.prisma prisma/schema.prisma.backup
fi
cp prisma/schema.sqlite.prisma prisma/schema.prisma

# Set environment
export DATABASE_URL="file:./prisma/dev.db"

# Run the create admin script
npx tsx scripts/create-admin.ts

# Restore original schema
if [ -f "prisma/schema.prisma.backup" ]; then
  mv prisma/schema.prisma.backup prisma/schema.prisma
fi

echo ""
echo "✅ Admin user created!"

