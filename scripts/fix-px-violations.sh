#!/bin/bash
# Automated remediation of hardcoded px values to rem units
# Zero tolerance design system compliance

set -e

echo "🔧 Starting automated px to rem conversion..."

# Common px to rem conversions (assuming 16px base)
declare -A PX_TO_REM=(
  ["1px"]="var(--space-px)"
  ["2px"]="0.125rem"
  ["3px"]="0.1875rem"
  ["4px"]="0.25rem"
  ["5px"]="0.3125rem"
  ["6px"]="0.375rem"
  ["8px"]="0.5rem"
  ["10px"]="0.625rem"
  ["12px"]="0.75rem"
  ["14px"]="0.875rem"
  ["15px"]="0.9375rem"
  ["16px"]="1rem"
  ["18px"]="1.125rem"
  ["20px"]="1.25rem"
  ["24px"]="1.5rem"
  ["28px"]="1.75rem"
  ["30px"]="1.875rem"
  ["32px"]="2rem"
  ["36px"]="2.25rem"
  ["40px"]="2.5rem"
  ["44px"]="2.75rem"
  ["48px"]="3rem"
  ["50px"]="3.125rem"
  ["56px"]="3.5rem"
  ["60px"]="3.75rem"
  ["64px"]="4rem"
  ["72px"]="4.5rem"
  ["80px"]="5rem"
  ["96px"]="6rem"
  ["100px"]="6.25rem"
  ["112px"]="7rem"
  ["120px"]="7.5rem"
  ["128px"]="8rem"
  ["144px"]="9rem"
  ["160px"]="10rem"
  ["176px"]="11rem"
  ["192px"]="12rem"
  ["200px"]="12.5rem"
  ["224px"]="14rem"
  ["256px"]="16rem"
  ["280px"]="17.5rem"
  ["288px"]="18rem"
  ["300px"]="18.75rem"
  ["320px"]="20rem"
  ["350px"]="21.875rem"
  ["384px"]="24rem"
  ["400px"]="25rem"
  ["448px"]="28rem"
  ["480px"]="30rem"
  ["500px"]="31.25rem"
  ["512px"]="32rem"
  ["600px"]="37.5rem"
  ["640px"]="40rem"
  ["672px"]="42rem"
  ["768px"]="48rem"
  ["800px"]="50rem"
  ["896px"]="56rem"
  ["960px"]="60rem"
  ["1024px"]="64rem"
  ["1200px"]="75rem"
  ["1280px"]="80rem"
  ["1400px"]="87.5rem"
  ["1536px"]="96rem"
  ["1792px"]="112rem"
)

# Files to process
FILES=$(find src -name "*.module.css" -o -name "*.css" | grep -v node_modules | grep -v ".next")

COUNT=0
for file in $FILES; do
  # Skip token definition files (they're allowed to have px in comments)
  if [[ "$file" == *"tokens.css"* ]] || [[ "$file" == *"geometric-patterns.css"* ]]; then
    continue
  fi
  
  # Check if file has px violations
  if grep -q "[0-9]\+px" "$file" 2>/dev/null; then
    echo "  Fixing: $file"
    
    # Create backup
    cp "$file" "$file.bak"
    
    # Apply conversions for common values
    for px in "${!PX_TO_REM[@]}"; do
      rem="${PX_TO_REM[$px]}"
      # Match property values only (not in comments or URLs)
      sed -i '' "s/: ${px}/: ${rem}/g" "$file"
      sed -i '' "s/ ${px}/ ${rem}/g" "$file"
      sed -i '' "s/(${px}/(${rem}/g" "$file"
      sed -i '' "s/,${px}/,${rem}/g" "$file"
    done
    
    # Fix media queries
    sed -i '' 's/@media (max-width: 768px)/@media (max-width: 48rem)/g' "$file"
    sed -i '' 's/@media (min-width: 768px)/@media (min-width: 48rem)/g' "$file"
    sed -i '' 's/@media (max-width: 767px)/@media (max-width: 47.9375rem)/g' "$file"
    sed -i '' 's/@media (min-width: 1024px)/@media (min-width: 64rem)/g' "$file"
    sed -i '' 's/@media (max-width: 1024px)/@media (max-width: 64rem)/g' "$file"
    
    # Fix outline-offset (common accessibility pattern)
    sed -i '' 's/outline-offset: 2px/outline-offset: 0.125rem/g' "$file"
    
    COUNT=$((COUNT + 1))
  fi
done

echo "✅ Fixed $COUNT files"
echo "🔍 Checking remaining violations..."

# Count remaining violations
REMAINING=$(grep -rn "[0-9]\+px" src --include="*.css" --include="*.module.css" | grep -v "var(--" | grep -v "node_modules" | grep -v "tokens.css" | grep -v "geometric-patterns.css" | wc -l | tr -d ' ')

echo "📊 Remaining violations: $REMAINING"

if [ "$REMAINING" -eq "0" ]; then
  echo "🎉 ZERO VIOLATIONS ACHIEVED!"
  # Clean up backups
  find src -name "*.css.bak" -delete
  exit 0
else
  echo "⚠️  Manual review required for remaining violations"
  exit 1
fi
