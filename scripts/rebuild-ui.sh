#!/bin/bash

# GHXSTSHIP UI Rebuild Script
# This script deletes all UI files and prepares for atomic design system rebuild

set -e

echo "🚨 GHXSTSHIP UI REBUILD - Deleting all UI files..."
echo "⚠️  This will preserve: API routes, lib, contexts, hooks, database, tests"
echo ""

# Delete all page UI files (keep page.tsx shells for routing)
echo "📄 Deleting page CSS modules..."
find src/app -name "*.module.css" -type f -delete
find src/app -name "*-client.tsx" -type f -delete
find src/app -name "*-client.module.css" -type f -delete

# Delete old design system components
echo "🗑️  Deleting old design system components..."
rm -rf src/design-system/components/atoms/*
rm -rf src/design-system/components/molecules/*
rm -rf src/design-system/components/organisms/*
rm -rf src/design-system/components/templates/*

# Delete old component exports
echo "🗑️  Deleting old component index..."
rm -f src/components/index.ts

# Delete global CSS (will rebuild)
echo "🗑️  Clearing globals.css for rebuild..."
# Keep the file but we'll rebuild it

echo ""
echo "✅ UI deletion complete!"
echo "📦 Preserved:"
echo "   - API routes (src/app/api)"
echo "   - Business logic (src/lib)"
echo "   - Contexts (src/contexts)"
echo "   - Hooks (src/hooks)"
echo "   - Database (supabase)"
echo "   - Tests infrastructure"
echo "   - Design tokens (src/design-system/tokens)"
echo ""
echo "🎨 Ready for GHXSTSHIP atomic design system rebuild!"
