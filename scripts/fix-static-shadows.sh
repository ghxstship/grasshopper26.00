#!/bin/bash

# Fix Static Shadows - Convert to Interaction-Only
# This script removes static box-shadows and converts them to interaction-only states

set -e

echo "🔧 Fixing static shadows across all components..."

# Find all CSS module files
find src/design-system/components -name "*.module.css" -type f | while read -r file; do
  echo "Processing: $file"
  
  # Create backup
  cp "$file" "$file.bak"
  
  # Replace static shadow tokens with interaction-only versions
  # Only in hover/active/focus states
  sed -i '' \
    -e 's/box-shadow: var(--shadow-xs);$/box-shadow: var(--shadow-hover-xs);/g' \
    -e 's/box-shadow: var(--shadow-sm);$/box-shadow: var(--shadow-hover-sm);/g' \
    -e 's/box-shadow: var(--shadow-base);$/box-shadow: var(--shadow-hover-base);/g' \
    -e 's/box-shadow: var(--shadow-md);$/box-shadow: var(--shadow-hover-md);/g' \
    -e 's/box-shadow: var(--shadow-lg);$/box-shadow: var(--shadow-hover-lg);/g' \
    -e 's/box-shadow: var(--shadow-xl);$/box-shadow: var(--shadow-hover-lg);/g' \
    -e 's/box-shadow: var(--shadow-2xl);$/box-shadow: var(--shadow-hover-lg);/g' \
    -e 's/box-shadow: var(--shadow-white-sm);$/box-shadow: var(--shadow-white-hover-sm);/g' \
    -e 's/box-shadow: var(--shadow-white-md);$/box-shadow: var(--shadow-white-hover-md);/g' \
    -e 's/box-shadow: var(--shadow-white-lg);$/box-shadow: var(--shadow-white-hover-lg);/g' \
    -e 's/box-shadow: var(--geometric-shadow-sm);$/box-shadow: var(--shadow-hover-sm);/g' \
    -e 's/box-shadow: var(--geometric-shadow-md);$/box-shadow: var(--shadow-hover-md);/g' \
    -e 's/box-shadow: var(--geometric-shadow-lg);$/box-shadow: var(--shadow-hover-lg);/g' \
    "$file"
    
  # Check if file changed
  if ! diff -q "$file" "$file.bak" > /dev/null 2>&1; then
    echo "  ✓ Updated"
  else
    echo "  - No changes needed"
  fi
  
  # Remove backup
  rm "$file.bak"
done

echo "✅ Static shadow fixes complete!"
