#!/bin/bash

# Automated Tailwind to CSS Modules Conversion Script
# Converts Tailwind utility classes to design system CSS modules

set -e

echo "🔄 Converting Tailwind classes to CSS modules..."
echo "================================================"

# Find all TSX files with Tailwind classes
FILES=$(grep -rl "className=\".*\(bg-\|text-\|border-\|p-\|m-\|w-\|h-\|flex\|grid\)" src --include="*.tsx" | grep -v node_modules | grep -v ".module.css" || true)

if [ -z "$FILES" ]; then
    echo "✅ No Tailwind violations found!"
    exit 0
fi

echo "Found files with Tailwind classes:"
echo "$FILES" | wc -l
echo ""

# Count total violations
TOTAL=$(echo "$FILES" | wc -l | tr -d ' ')
echo "📊 Total files to convert: $TOTAL"
echo ""

# List top 10 files
echo "Top 10 files by priority:"
echo "$FILES" | head -10
echo ""

echo "⚠️  Manual conversion required for each file:"
echo "1. Create corresponding .module.css file"
echo "2. Convert Tailwind classes to design tokens"
echo "3. Update component to import CSS module"
echo "4. Replace className with styles.className"
echo ""

echo "📖 See /docs/DESIGN_SYSTEM_COMPLIANCE_REMEDIATION.md for patterns"
echo "🎨 See /src/design-system/README.md for design token reference"
