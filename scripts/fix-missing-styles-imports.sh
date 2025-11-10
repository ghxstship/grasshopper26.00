#!/bin/bash

# Script to add missing CSS module imports to all files that reference 'styles'
# This fixes the "Cannot find name 'styles'" TypeScript errors

# List of files that need styles import
FILES=(
  "src/app/admin/products/new/page.tsx"
  "src/components/membership/available-benefits.tsx"
  "src/components/membership/quick-stats.tsx"
  "src/design-system/components/atoms/confirmation-dialog.tsx"
  "src/design-system/components/atoms/dialog.tsx"
  "src/design-system/components/atoms/image-upload.tsx"
  "src/design-system/components/atoms/pagination.tsx"
  "src/design-system/components/atoms/progress.tsx"
  "src/design-system/components/atoms/scroll-area.tsx"
  "src/design-system/components/atoms/slider.tsx"
  "src/design-system/components/molecules/add-to-cart-button.tsx"
  "src/design-system/components/organisms/admin/AdminSidebar.tsx"
  "src/design-system/components/organisms/artists/artist-filters.tsx"
  "src/design-system/components/organisms/artists/artist-grid.tsx"
  "src/design-system/components/organisms/content/post-grid.tsx"
  "src/design-system/components/organisms/membership/available-benefits.tsx"
  "src/design-system/components/organisms/membership/quick-stats.tsx"
  "src/design-system/components/organisms/membership/upcoming-events.tsx"
  "src/design-system/components/organisms/shop/product-grid.tsx"
  "src/design-system/components/organisms/shop/shop-filters.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    # Get the directory and filename
    dir=$(dirname "$file")
    filename=$(basename "$file" .tsx)
    
    # Check if file already has styles import
    if ! grep -q "import styles from" "$file"; then
      # Find the last import line
      last_import_line=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)
      
      if [ -n "$last_import_line" ]; then
        # Add the styles import after the last import
        sed -i.bak "${last_import_line}a\\
import styles from './${filename}.module.css';
" "$file"
        echo "✅ Added styles import to $file"
        rm "${file}.bak"
      fi
    else
      echo "⏭️  Skipped $file (already has styles import)"
    fi
  else
    echo "❌ File not found: $file"
  fi
done

echo ""
echo "✅ Finished adding missing styles imports"
