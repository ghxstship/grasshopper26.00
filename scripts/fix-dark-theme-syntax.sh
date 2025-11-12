#!/bin/bash

# Fix :global([data-theme="dark"]) syntax errors in CSS Modules
# This syntax is invalid in CSS Modules - we need to remove :global() wrapper

echo "Fixing dark theme syntax in CSS Modules..."

# Find all CSS module files with the invalid syntax
find src/design-system -name "*.module.css" -type f | while read file; do
  if grep -q ':global(\[data-theme="dark"\])' "$file"; then
    echo "Fixing: $file"
    # Remove :global() wrapper from [data-theme="dark"] selectors
    sed -i '' 's/:global(\[data-theme="dark"\])/[data-theme="dark"]/g' "$file"
  fi
done

echo "Done! Fixed all dark theme syntax errors."
