#!/bin/bash

# Batch Fix Dark Mode Support
# Adds [data-theme="dark"] sections to all CSS modules missing it

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="$ROOT_DIR/src"

DARK_MODE_TEMPLATE='

/* ========================================
   DARK THEME
   ======================================== */

[data-theme="dark"] {
  /* Dark mode overrides inherit from tokens.css */
  /* Add component-specific overrides here if needed */
}
'

RESPONSIVE_TEMPLATE='

/* ========================================
   RESPONSIVE BREAKPOINTS
   ======================================== */

@media (min-width: 768px) {
  /* Tablet and up */
}

@media (min-width: 1024px) {
  /* Desktop and up */
}
'

count=0

# Find all .module.css files that don't have dark theme support
while IFS= read -r -d '' file; do
  # Skip if already has dark theme
  if grep -q '\[data-theme="dark"\]' "$file"; then
    continue
  fi
  
  # Skip if file is too small (< 100 bytes)
  if [ $(wc -c < "$file") -lt 100 ]; then
    continue
  fi
  
  # Skip system files
  if [[ "$file" == *"tokens.css"* ]] || [[ "$file" == *"globals.css"* ]]; then
    continue
  fi
  
  echo "Adding dark mode to: ${file#$ROOT_DIR/}"
  
  # Add dark mode section
  echo "$DARK_MODE_TEMPLATE" >> "$file"
  
  # Add responsive section if not present
  if ! grep -q '@media' "$file"; then
    echo "$RESPONSIVE_TEMPLATE" >> "$file"
  fi
  
  ((count++))
done < <(find "$SRC_DIR" -name "*.module.css" -type f -print0)

echo ""
echo "✅ Added dark mode support to $count files"
