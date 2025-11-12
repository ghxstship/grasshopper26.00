#!/bin/bash

# Fix ALL CSS Modules dark mode selectors to use :global()
# CSS Modules require global selectors to be wrapped in :global()

echo "Fixing ALL CSS Module dark mode selectors..."

# Find all .module.css files in src directory
find src -name "*.module.css" -type f | while read file; do
  # Check if file contains [data-theme="dark"] without :global
  if grep -q '\[data-theme="dark"\]' "$file" && ! grep -q ':global(\[data-theme="dark"\])' "$file"; then
    echo "Processing: $file"
    
    # Replace [data-theme="dark"] with :global([data-theme="dark"])
    sed -i '' 's/\[data-theme="dark"\]/:global([data-theme="dark"])/g' "$file"
    
    echo "  ✓ Fixed"
  fi
done

echo ""
echo "✅ All CSS Module files fixed!"
