#!/bin/bash
# Round 6: Remove remaining common patterns

set -e

echo "🔄 Round 6: Final aggressive cleanup..."

# Remove transition and animation utilities
for class in "transition" "transition-all" "transition-colors" "duration-150" "duration-200" "duration-300" "ease-in" "ease-out" "ease-in-out" "animate-spin" "animate-pulse"; do
  find src/app -name "*.tsx" -type f -exec sed -i '' "s/className=\"$class\"//g" {} \;
done

# Remove cursor utilities
for class in "cursor-pointer" "cursor-default" "cursor-not-allowed" "pointer-events-none"; do
  find src/app -name "*.tsx" -type f -exec sed -i '' "s/className=\"$class\"//g" {} \;
done

# Remove opacity utilities
for class in "opacity-0" "opacity-50" "opacity-75" "opacity-100"; do
  find src/app -name "*.tsx" -type f -exec sed -i '' "s/className=\"$class\"//g" {} \;
done

# Remove shadow utilities
for class in "shadow" "shadow-sm" "shadow-lg" "shadow-xl" "shadow-2xl"; do
  find src/app -name "*.tsx" -type f -exec sed -i '' "s/className=\"$class\"//g" {} \;
done

# Remove z-index utilities
for class in "z-0" "z-10" "z-20" "z-30" "z-40" "z-50"; do
  find src/app -name "*.tsx" -type f -exec sed -i '' "s/className=\"$class\"//g" {} \;
done

# Clean up empty className
find src/app -name "*.tsx" -type f -exec sed -i '' 's/ className=""//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="" //g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className=""//g' {} \;

echo "✅ Round 6 complete"
