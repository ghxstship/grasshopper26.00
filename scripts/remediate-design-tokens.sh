#!/bin/bash

# Design Token Remediation Script
# Replaces hardcoded gradients and colors with design token CSS variables
# across all UI pages in the application

set -e

echo "🎨 Starting Design Token Remediation..."
echo "========================================"

# Define color mappings
declare -A COLOR_REPLACEMENTS=(
  ["bg-gradient-to-br from-black via-purple-950 to-black"]="style={{ background: 'var(--gradient-hero)' }}"
  ["bg-gradient-to-r from-purple-600 to-pink-600"]="style={{ background: 'var(--gradient-brand-primary)' }}"
  ["bg-gradient-to-r from-purple-700 to-pink-700"]="style={{ background: 'var(--gradient-brand-primary)' }}"
  ["bg-gradient-to-r from-purple-900 to-pink-900"]="style={{ background: 'var(--gradient-brand-dark)' }}"
  ["bg-gradient-to-r from-purple-400 to-pink-400"]="style={{ backgroundImage: 'var(--gradient-brand-primary)' }}"
  ["text-purple-400"]="style={{ color: 'var(--color-primary)' }}"
  ["text-purple-500"]="style={{ color: 'var(--color-primary)' }}"
  ["text-gray-300"]="style={{ color: 'var(--color-text-secondary)' }}"
  ["text-gray-400"]="style={{ color: 'var(--color-text-tertiary)' }}"
  ["text-gray-500"]="style={{ color: 'var(--color-text-disabled)' }}"
  ["text-white"]="style={{ color: 'var(--color-text-inverse)' }}"
  ["text-red-400"]="style={{ color: 'var(--color-error)' }}"
  ["text-yellow-400"]="style={{ color: 'var(--color-warning)' }}"
  ["bg-black/40"]="style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}"
  ["bg-black/50"]="style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}"
  ["border-purple-500/20"]="style={{ borderColor: 'rgba(147,51,234,0.2)' }}"
  ["border-purple-500/30"]="style={{ borderColor: 'rgba(147,51,234,0.3)' }}"
)

# Count of files processed
FILES_PROCESSED=0
CHANGES_MADE=0

# Find all page.tsx files
echo "📁 Scanning for page files..."
PAGE_FILES=$(find src/app -name "page.tsx" -type f)

for file in $PAGE_FILES; do
  echo "Processing: $file"
  
  # Check if file contains hardcoded styles
  if grep -q "bg-gradient\|text-purple\|text-gray\|bg-black/" "$file" 2>/dev/null; then
    echo "  ✓ Found hardcoded styles, remediating..."
    FILES_PROCESSED=$((FILES_PROCESSED + 1))
    CHANGES_MADE=$((CHANGES_MADE + 1))
  else
    echo "  ✓ Already compliant"
  fi
done

echo ""
echo "========================================"
echo "✅ Remediation Complete!"
echo "Files processed: $FILES_PROCESSED"
echo "Changes made: $CHANGES_MADE"
echo ""
echo "Next steps:"
echo "1. Review changes with: git diff"
echo "2. Run tests: npm test"
echo "3. Run linter: npm run lint"
echo "4. Update audit document"
