#!/bin/bash

# Fix button visibility issues repo-wide
# Replaces problematic color tokens with explicit black/white values

echo "Fixing button visibility issues across the repo..."

# Find all CSS files in design-system
find src/design-system -name "*.module.css" -type f | while read file; do
  # Skip if file doesn't exist
  [ ! -f "$file" ] && continue
  
  # Create backup
  cp "$file" "$file.bak"
  
  # Fix common patterns:
  # 1. background-color: var(--color-primary) + color: var(--color-text-inverse) -> black bg + white text
  # 2. Active/hover states that create invisible text
  
  # Pattern 1: Filled buttons/badges with primary background
  sed -i '' 's/background-color: var(--color-primary);$/background-color: var(--color-black);/g' "$file"
  
  # Pattern 2: Text inverse color (white text)
  # Only replace when it's likely on a dark background
  perl -i -pe 's/color: var\(--color-text-inverse\);/color: var(--color-white);/g' "$file"
  
  # Pattern 3: Hover states with primary background
  perl -i -pe 's/(\.[\w-]+:hover[^{]*\{[^}]*background-color: )var\(--color-primary\)/$1var(--color-black)/g' "$file"
  
  # Pattern 4: Active states with primary background  
  perl -i -pe 's/(\.[\w-]+\.active[^{]*\{[^}]*background-color: )var\(--color-primary\)/$1var(--color-black)/g' "$file"
  
  # Check if file changed
  if ! cmp -s "$file" "$file.bak"; then
    echo "Fixed: $file"
  fi
  
  # Remove backup
  rm "$file.bak"
done

# Fix app-specific CSS files
find src/app -name "*.module.css" -type f | while read file; do
  [ ! -f "$file" ] && continue
  cp "$file" "$file.bak"
  
  sed -i '' 's/background-color: var(--color-primary);$/background-color: var(--color-black);/g' "$file"
  perl -i -pe 's/color: var\(--color-text-inverse\);/color: var(--color-white);/g' "$file"
  
  if ! cmp -s "$file" "$file.bak"; then
    echo "Fixed: $file"
  fi
  
  rm "$file.bak"
done

echo "Done! All button visibility issues fixed."
