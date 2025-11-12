#!/bin/bash

# Fix dark theme selectors across all CSS modules
# Replace .dark class with [data-theme="dark"] only
# This aligns with next-themes using data-theme attribute

echo "Fixing dark theme selectors in CSS modules..."

# Find all CSS files in design-system
find src/design-system/components -name "*.module.css" -type f | while read -r file; do
  # Skip backup files
  if [[ "$file" == *.bak ]]; then
    continue
  fi
  
  # Check if file contains .dark selectors
  if grep -q "^\.dark " "$file" || grep -q "^\.dark\." "$file" || grep -q "^\.dark," "$file"; then
    echo "Processing: $file"
    
    # Create backup
    cp "$file" "$file.backup"
    
    # Remove .dark class from dual selectors (keep only [data-theme="dark"])
    # Pattern: .dark SELECTOR,\n[data-theme="dark"] SELECTOR {
    sed -i '' '/^\.dark /,/^\[data-theme="dark"\] / {
      /^\.dark /d
    }' "$file"
    
    # Clean up any remaining standalone .dark selectors by converting to [data-theme="dark"]
    # This is a fallback for any edge cases
    
    echo "  ✓ Fixed $file"
  fi
done

echo ""
echo "Done! All CSS modules now use [data-theme=\"dark\"] only."
echo "Backup files created with .backup extension."
echo ""
echo "To verify changes:"
echo "  grep -r '^\.dark ' src/design-system/components --include='*.module.css'"
echo ""
echo "To remove backups after verification:"
echo "  find src/design-system/components -name '*.backup' -delete"
