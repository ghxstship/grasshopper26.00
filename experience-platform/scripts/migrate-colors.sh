#!/bin/bash

# Color Migration Script
# Automatically replaces hardcoded Tailwind colors with design token equivalents

echo "🎨 Starting color migration to design tokens..."

# Define replacement patterns
declare -A replacements=(
  # Purple (Brand Primary)
  ["bg-purple-500/20"]="bg-brand-subtle"
  ["bg-purple-500/10"]="bg-brand-subtle/50"
  ["bg-purple-900/20"]="bg-brand-subtle"
  ["bg-purple-600"]="bg-brand"
  ["bg-purple-500"]="bg-brand"
  ["border-purple-500/30"]="border-brand/30"
  ["border-purple-500/20"]="border-brand/20"
  ["border-purple-500/50"]="border-brand/50"
  ["border-purple-500"]="border-brand"
  ["text-purple-400"]="text-brand"
  ["text-purple-300"]="text-brand"
  ["hover:bg-purple-500/10"]="hover:bg-brand-subtle/50"
  ["hover:border-purple-500/50"]="hover:border-brand/50"
  ["data-\\[state=active\\]:bg-purple-600"]="data-[state=active]:bg-brand"
  
  # Pink (Brand Accent)
  ["bg-pink-600"]="bg-brand-accent"
  ["bg-pink-500"]="bg-brand-accent"
  ["text-pink-600"]="text-brand-accent"
  ["text-pink-400"]="text-brand-accent"
  
  # Red (Error)
  ["bg-red-600"]="bg-error"
  ["bg-red-500"]="bg-error"
  ["bg-red-500/20"]="bg-error-bg"
  ["bg-red-500/10"]="bg-error-bg/50"
  ["border-red-500/30"]="border-error/30"
  ["text-red-400"]="text-error"
  ["text-red-300"]="text-error"
  ["hover:bg-red-500/10"]="hover:bg-error-bg/50"
  ["hover:text-red-300"]="hover:text-error"
  
  # Yellow (Warning)
  ["bg-yellow-500"]="bg-warning"
  ["bg-yellow-400"]="bg-warning"
  ["text-yellow-500"]="text-warning"
  
  # Green (Success)
  ["bg-green-600"]="bg-success"
  ["bg-green-500"]="bg-success"
  ["text-green-400"]="text-success"
  
  # Blue (Info)
  ["bg-blue-600"]="bg-info"
  ["bg-blue-500"]="bg-info"
  ["text-blue-400"]="text-info"
  
  # Gray (Neutral - handled by Tailwind defaults)
  # These are generally OK as they map to neutral tokens
)

# Count total replacements
total=0

# Perform replacements
for old in "${!replacements[@]}"; do
  new="${replacements[$old]}"
  
  # Find and replace in all TSX files
  count=$(find src -name "*.tsx" -type f -exec grep -l "$old" {} \; | wc -l)
  
  if [ $count -gt 0 ]; then
    echo "  Replacing '$old' → '$new' ($count files)"
    find src -name "*.tsx" -type f -exec sed -i '' "s/$old/$new/g" {} \;
    ((total+=count))
  fi
done

echo "✅ Migration complete! Updated $total file instances."
echo ""
echo "⚠️  Manual review required for:"
echo "  - Gradient classes (from-purple-*, to-pink-*)"
echo "  - Complex opacity values"
echo "  - Context-specific colors"
echo ""
echo "Run 'npm run validate-tokens' to verify compliance."
