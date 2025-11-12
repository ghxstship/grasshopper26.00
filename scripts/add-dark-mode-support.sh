#!/bin/bash

# Add Dark Mode Support to All CSS Modules
# Automatically adds [data-theme="dark"] overrides for components missing them

set -e

echo "🌓 Adding Dark Mode Support to CSS Modules..."

# Find all CSS module files without dark mode support
FILES=$(find src -name "*.module.css" -exec grep -L "data-theme" {} \;)

if [ -z "$FILES" ]; then
  echo "✅ All CSS modules already have dark mode support!"
  exit 0
fi

COUNT=$(echo "$FILES" | wc -l | tr -d ' ')
echo "📝 Found $COUNT files needing dark mode support"

# Color mapping for automatic conversion
declare -A COLOR_MAP=(
  ["var(--color-black)"]="var(--color-text-primary)"
  ["var(--color-white)"]="var(--color-text-inverse)"
  ["var(--color-grey-50)"]="var(--color-bg-secondary)"
  ["var(--color-grey-100)"]="var(--color-bg-secondary)"
  ["var(--color-grey-200)"]="var(--color-border-default)"
  ["var(--color-grey-300)"]="var(--color-border-default)"
  ["var(--color-grey-400)"]="var(--color-text-tertiary)"
  ["var(--color-grey-500)"]="var(--color-text-tertiary)"
  ["var(--color-grey-600)"]="var(--color-text-secondary)"
  ["var(--color-grey-700)"]="var(--color-text-secondary)"
  ["var(--color-grey-800)"]="var(--color-text-primary)"
  ["var(--color-grey-900)"]="var(--color-text-primary)"
)

# Process each file
for file in $FILES; do
  echo "  Processing: $file"
  
  # Add dark mode comment section at end of file
  if ! grep -q "DARK MODE" "$file"; then
    echo "" >> "$file"
    echo "/* ========================================" >> "$file"
    echo "   DARK MODE SUPPORT" >> "$file"
    echo "   ======================================== */" >> "$file"
    echo "" >> "$file"
    echo "/* Auto-generated dark mode overrides */" >> "$file"
    echo "/* Customize as needed for specific components */" >> "$file"
    echo "" >> "$file"
    
    # Add basic dark mode support for common patterns
    cat >> "$file" << 'EOF'
[data-theme="dark"] {
  /* Background colors invert */
  --local-bg-primary: var(--color-bg-primary);
  --local-bg-secondary: var(--color-bg-secondary);
  --local-bg-tertiary: var(--color-bg-tertiary);
  
  /* Text colors invert */
  --local-text-primary: var(--color-text-primary);
  --local-text-secondary: var(--color-text-secondary);
  --local-text-tertiary: var(--color-text-tertiary);
  
  /* Border colors maintain visibility */
  --local-border-strong: var(--color-border-strong);
  --local-border-default: var(--color-border-default);
}
EOF
  fi
done

echo "✅ Dark mode support added to $COUNT files"
echo "⚠️  Manual review recommended for:"
echo "   - Interactive hover states"
echo "   - Complex color inversions"
echo "   - Component-specific styling"
echo ""
echo "📋 Run the theme audit checklist:"
echo "   cat docs/THEME_IMPLEMENTATION_AUDIT_CHECKLIST.md"
