#!/bin/bash

# Database initialization and seeding script for Docker
# This script runs inside the backend container to set up the database

echo "🔄 Waiting for MySQL to be ready..."

# Simple retry loop - just try to run db-init until it works
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if node src/db-init.js 2>/dev/null; then
    echo "✅ Database initialization successful!"
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
    echo "⏳ Database init failed. Retry $RETRY_COUNT/$MAX_RETRIES in 2s..."
    sleep 2
  fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "⚠️  Database initialization failed after $MAX_RETRIES attempts"
  echo "⚠️  Continuing to start app anyway - database may not be ready"
fi

echo ""
echo "👤 Creating default users..."
node src/seed.js 2>/dev/null || echo "⚠️  Could not seed users"

echo ""
echo "🤖 Creating machine inventory..."
node src/seed-machines.js 2>/dev/null || echo "⚠️  Could not seed machines"

echo ""
echo "⚠️ Creating breakdown records..."
node src/seed-pannes.js 2>/dev/null || echo "⚠️  Could not seed pannes"

echo ""
echo "🔧 Creating maintenance records..."
node src/seed-maintenance.js 2>/dev/null || echo "⚠️  Could not seed maintenance"

echo ""
echo "📈 Creating usage data..."
node src/seed-usage.js 2>/dev/null || echo "⚠️  Could not seed usage"

echo ""
echo "💰 Creating financial records..."
node src/seed-financial.js 2>/dev/null || echo "⚠️  Could not seed financial"

echo ""
echo "✅ Seeding complete!"
echo ""
echo "🚀 Starting application server..."

# Start the main application
exec node src/index.js
