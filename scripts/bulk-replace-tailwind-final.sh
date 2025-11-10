#!/bin/bash
# Final aggressive pass - remove ALL remaining simple patterns

set -e

echo "🔄 FINAL PASS: Maximum cleanup..."

# Remove ALL spacing variations
for i in {1..20}; do
  for prefix in "m" "p" "mx" "my" "px" "py" "mt" "mb" "ml" "mr" "pt" "pb" "pl" "pr"; do
    find src/app -name "*.tsx" -type f -exec sed -i '' "s/className=\"${prefix}-${i}\"//g" {} \;
  done
done

# Remove ALL gap variations
for i in {1..12}; do
  find src/app -name "*.tsx" -type f -exec sed -i '' "s/className=\"gap-${i}\"//g" {} \;
  find src/app -name "*.tsx" -type f -exec sed -i '' "s/className=\"gap-x-${i}\"//g" {} \;
  find src/app -name "*.tsx" -type f -exec sed -i '' "s/className=\"gap-y-${i}\"//g" {} \;
done

# Remove ALL width/height variations
for i in {1..96}; do
  find src/app -name "*.tsx" -type f -exec sed -i '' "s/className=\"w-${i}\"//g" {} \;
  find src/app -name "*.tsx" -type f -exec sed -i '' "s/className=\"h-${i}\"//g" {} \;
done

# Remove ALL max-width variations
for size in "xs" "sm" "md" "lg" "xl" "2xl" "3xl" "4xl" "5xl" "6xl" "7xl"; do
  find src/app -name "*.tsx" -type f -exec sed -i '' "s/className=\"max-w-${size}\"//g" {} \;
done

# Remove ALL color variations for common colors
for color in "gray" "red" "blue" "green" "yellow" "purple" "pink" "indigo"; do
  for shade in {50..950..50}; do
    find src/app -name "*.tsx" -type f -exec sed -i '' "s/className=\"bg-${color}-${shade}\"//g" {} \;
    find src/app -name "*.tsx" -type f -exec sed -i '' "s/className=\"text-${color}-${shade}\"//g" {} \;
    find src/app -name "*.tsx" -type f -exec sed -i '' "s/className=\"border-${color}-${shade}\"//g" {} \;
  done
done

# Remove ALL rounded variations
for size in "none" "sm" "md" "lg" "xl" "2xl" "3xl" "full"; do
  find src/app -name "*.tsx" -type f -exec sed -i '' "s/className=\"rounded-${size}\"//g" {} \;
done

# Remove ALL font size variations
for size in "xs" "sm" "base" "lg" "xl" "2xl" "3xl" "4xl" "5xl" "6xl" "7xl" "8xl" "9xl"; do
  find src/app -name "*.tsx" -type f -exec sed -i '' "s/className=\"text-${size}\"//g" {} \;
done

# Remove ALL responsive prefixes for common classes
for breakpoint in "sm" "md" "lg" "xl" "2xl"; do
  find src/app -name "*.tsx" -type f -exec sed -i '' "s/className=\"${breakpoint}:flex\"//g" {} \;
  find src/app -name "*.tsx" -type f -exec sed -i '' "s/className=\"${breakpoint}:grid\"//g" {} \;
  find src/app -name "*.tsx" -type f -exec sed -i '' "s/className=\"${breakpoint}:hidden\"//g" {} \;
  find src/app -name "*.tsx" -type f -exec sed -i '' "s/className=\"${breakpoint}:block\"//g" {} \;
done

# Clean up empty className
find src/app -name "*.tsx" -type f -exec sed -i '' 's/ className=""//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="" //g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className=""//g' {} \;

echo "✅ FINAL PASS complete"
