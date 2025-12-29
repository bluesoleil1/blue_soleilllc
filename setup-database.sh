#!/bin/bash

# Database Setup Script for Blue Soleil LLC
echo "=== Blue Soleil Database Setup ==="
echo ""

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "⚠️  PostgreSQL is not running."
    echo ""
    echo "Please start PostgreSQL using one of these methods:"
    echo ""
    echo "Option 1: Using Homebrew"
    echo "  brew services start postgresql@14"
    echo "  # or"
    echo "  brew services start postgresql"
    echo ""
    echo "Option 2: Manual start"
    echo "  pg_ctl -D /opt/homebrew/var/postgresql@14 start"
    echo ""
    echo "Option 3: Use a cloud database (recommended for production)"
    echo "  - Supabase (free tier): https://supabase.com"
    echo "  - Neon (free tier): https://neon.tech"
    echo "  - Railway (free tier): https://railway.app"
    echo ""
    read -p "Press Enter after starting PostgreSQL, or Ctrl+C to exit..."
fi

# Get database name
DB_NAME="${DB_NAME:-blue_soleil}"
DB_USER="${DB_USER:-$(whoami)}"

echo "Creating database: $DB_NAME"
echo "Using user: $DB_USER"
echo ""

# Create database
psql -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;" 2>&1 | grep -v "already exists" || echo "Database might already exist"

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Create a .env file with:"
echo "   DATABASE_URL=\"postgresql://$DB_USER@localhost:5432/$DB_NAME\""
echo "   JWT_SECRET=\"$(openssl rand -base64 32)\""
echo ""
echo "2. Run migrations:"
echo "   npm run db:push"
echo ""
echo "3. Create admin user:"
echo "   npm run db:studio"
echo "   # or run: npx tsx scripts/create-admin.ts"

