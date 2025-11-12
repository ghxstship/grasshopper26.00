#!/bin/bash

# Fix CSS Modules dark theme syntax errors
# CSS Modules require at least one local class when using global selectors

echo "🔧 Fixing CSS Modules dark theme syntax..."

# Find all .module.css files with the problematic pattern
find src -name "*.module.css" -type f | while read -r file; do
  # Check if file contains the problematic pattern
  if grep -q '^\[data-theme="dark"\] {' "$file"; then
    echo "Fixing: $file"
    
    # Get the first class name from the file (excluding :global)
    first_class=$(grep -oP '^\.\w+' "$file" | head -1 | sed 's/^\.//')
    
    if [ -z "$first_class" ]; then
      # If no class found, use a generic selector
      sed -i '' 's/^\[data-theme="dark"\] {/:global([data-theme="dark"]) * {/' "$file"
    else
      # Replace with proper syntax using the first class
      sed -i '' "s/^\[data-theme=\"dark\"\] {/:global([data-theme=\"dark\"]) .$first_class {/" "$file"
    fi
  fi
done

echo "✅ Done! Fixed all CSS Modules dark theme syntax errors."
