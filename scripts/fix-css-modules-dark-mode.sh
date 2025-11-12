#!/bin/bash

# Fix CSS Modules dark mode selectors to use :global()
# CSS Modules require global selectors to be wrapped in :global()

echo "Fixing CSS Module dark mode selectors..."

# Find all .module.css files in (public) directory
find src/app/\(public\) -name "*.module.css" -type f | while read file; do
  echo "Processing: $file"
  
  # Replace [data-theme="dark"] with :global([data-theme="dark"])
  sed -i '' 's/\[data-theme="dark"\]/:global([data-theme="dark"])/g' "$file"
  
  echo "  ✓ Fixed"
done

echo ""
echo "✅ All CSS Module files fixed!"
