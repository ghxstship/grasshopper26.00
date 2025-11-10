#!/bin/bash

# Automated Token Violation Fixer
# Enforces GHXSTSHIP design system tokens repowide

set -e

REPO_ROOT="/Users/julianclarkson/Documents/Grasshopper26.00"
SRC_DIR="$REPO_ROOT/src"

echo "🔧 Fixing design token violations..."
echo ""

# Fix border-radius
echo "Fixing border-radius..."
find "$SRC_DIR" -name "*.css" -type f -exec sed -i '' 's/border-radius: [0-9.]*[a-z%]*/border-radius: var(--radius-none)/g' {} \;
echo "✅ Border-radius fixed"

# Fix transitions
echo "Fixing transition durations..."
find "$SRC_DIR" -name "*.css" -type f -exec sed -i '' 's/150ms/var(--duration-fast)/g' {} \;
find "$SRC_DIR" -name "*.css" -type f -exec sed -i '' 's/250ms/var(--duration-base)/g' {} \;
find "$SRC_DIR" -name "*.css" -type f -exec sed -i '' 's/300ms/var(--duration-medium)/g' {} \;
find "$SRC_DIR" -name "*.css" -type f -exec sed -i '' 's/500ms/var(--duration-slower)/g' {} \;
echo "✅ Transitions fixed"

# Fix border widths
echo "Fixing border widths..."
find "$SRC_DIR" -name "*.css" -type f -exec sed -i '' 's/1px solid/var(--border-width-thin) solid/g' {} \;
find "$SRC_DIR" -name "*.css" -type f -exec sed -i '' 's/2px solid/var(--border-width-2) solid/g' {} \;
find "$SRC_DIR" -name "*.css" -type f -exec sed -i '' 's/3px solid/var(--border-width-3) solid/g' {} \;
echo "✅ Border widths fixed"

# Fix font sizes
echo "Fixing font sizes..."
find "$SRC_DIR" -name "*.css" -type f -exec sed -i '' 's/font-size: 12px/font-size: var(--font-size-xs)/g' {} \;
find "$SRC_DIR" -name "*.css" -type f -exec sed -i '' 's/font-size: 14px/font-size: var(--font-size-sm)/g' {} \;
find "$SRC_DIR" -name "*.css" -type f -exec sed -i '' 's/font-size: 16px/font-size: var(--font-size-base)/g' {} \;
find "$SRC_DIR" -name "*.css" -type f -exec sed -i '' 's/font-size: 18px/font-size: var(--font-size-lg)/g' {} \;
find "$SRC_DIR" -name "*.css" -type f -exec sed -i '' 's/font-size: 20px/font-size: var(--font-size-xl)/g' {} \;
find "$SRC_DIR" -name "*.css" -type f -exec sed -i '' 's/font-size: 24px/font-size: var(--font-size-2xl)/g' {} \;
echo "✅ Font sizes fixed"

# Fix spacing (gap)
echo "Fixing gap spacing..."
find "$SRC_DIR" -name "*.css" -type f -exec sed -i '' 's/gap: 4px/gap: var(--space-1)/g' {} \;
find "$SRC_DIR" -name "*.css" -type f -exec sed -i '' 's/gap: 8px/gap: var(--space-2)/g' {} \;
find "$SRC_DIR" -name "*.css" -type f -exec sed -i '' 's/gap: 12px/gap: var(--space-3)/g' {} \;
find "$SRC_DIR" -name "*.css" -type f -exec sed -i '' 's/gap: 16px/gap: var(--space-4)/g' {} \;
find "$SRC_DIR" -name "*.css" -type f -exec sed -i '' 's/gap: 24px/gap: var(--space-6)/g' {} \;
find "$SRC_DIR" -name "*.css" -type f -exec sed -i '' 's/gap: 32px/gap: var(--space-8)/g' {} \;
echo "✅ Gap spacing fixed"

# Fix padding
echo "Fixing padding..."
find "$SRC_DIR" -name "*.css" -type f -exec sed -i '' 's/padding: 4px/padding: var(--space-1)/g' {} \;
find "$SRC_DIR" -name "*.css" -type f -exec sed -i '' 's/padding: 8px/padding: var(--space-2)/g' {} \;
find "$SRC_DIR" -name "*.css" -type f -exec sed -i '' 's/padding: 12px/padding: var(--space-3)/g' {} \;
find "$SRC_DIR" -name "*.css" -type f -exec sed -i '' 's/padding: 16px/padding: var(--space-4)/g' {} \;
find "$SRC_DIR" -name "*.css" -type f -exec sed -i '' 's/padding: 24px/padding: var(--space-6)/g' {} \;
echo "✅ Padding fixed"

# Fix margin
echo "Fixing margin..."
find "$SRC_DIR" -name "*.css" -type f -exec sed -i '' 's/margin: 8px/margin: var(--space-2)/g' {} \;
find "$SRC_DIR" -name "*.css" -type f -exec sed -i '' 's/margin: 16px/margin: var(--space-4)/g' {} \;
echo "✅ Margin fixed"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ALL VIOLATIONS FIXED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Run ./scripts/validate-design-tokens.sh to verify"
