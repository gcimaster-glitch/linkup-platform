#!/bin/bash

# ========================================
# LinkUp Database Setup Script
# ========================================
# This script:
# 1. Creates/updates D1 database schema
# 2. Seeds demo data for development/testing
# 3. Can be safely run in production (demo data optional)
# ========================================

set -e  # Exit on error

echo "🚀 LinkUp Database Setup"
echo "========================"
echo ""

# Configuration
DATABASE_NAME="linkup-db"
DATABASE_ID="8f2745e9-0943-45ef-8a5e-4b15f494d023"
SCHEMA_FILE="database/schema.sql"
SEED_FILE="data/seed.json"

# Check if Cloudflare API token is set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "⚠️  CLOUDFLARE_API_TOKEN not set"
    echo "   Please set it: export CLOUDFLARE_API_TOKEN=\"your_token\""
    exit 1
fi

echo "✅ Cloudflare API Token detected"
echo ""

# Step 1: Run schema migration
echo "📊 Step 1: Creating/Updating Database Schema..."
echo "================================================"
cd backend
wrangler d1 execute $DATABASE_NAME --file=../$SCHEMA_FILE --remote
if [ $? -eq 0 ]; then
    echo "✅ Schema migration completed successfully"
else
    echo "❌ Schema migration failed"
    exit 1
fi
echo ""

# Step 2: Ask if user wants to seed demo data
echo "🌱 Step 2: Seed Demo Data"
echo "========================="
read -p "Do you want to seed demo data? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📦 Seeding demo data..."
    
    # Generate SQL from JSON seed data
    node ../database/generate-seed-sql.js
    
    # Execute seed SQL
    wrangler d1 execute $DATABASE_NAME --file=../database/seed.sql --remote
    
    if [ $? -eq 0 ]; then
        echo "✅ Demo data seeded successfully"
        echo ""
        echo "📊 Seeded Data Summary:"
        echo "   - Users: 5"
        echo "   - Venues: 3"
        echo "   - Events: 3"
        echo "   - Tickets: 6"
        echo "   - Category Images: 8"
    else
        echo "❌ Seeding failed"
        exit 1
    fi
else
    echo "⏭️  Skipping demo data"
fi

cd ..
echo ""
echo "🎉 Database setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Deploy backend: cd backend && wrangler deploy"
echo "   2. Test API: curl https://linkup-backend.gcimaster.workers.dev/api/events"
echo "   3. Deploy frontend: Cloudflare Pages auto-deploys on push"
echo ""
