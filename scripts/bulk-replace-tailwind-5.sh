#!/bin/bash
# Round 5: Remove all simple single-word Tailwind classes

set -e

echo "🔄 Round 5: Removing simple Tailwind utilities..."

# Remove all simple layout utilities
for class in "container" "mx-4" "my-4" "px-2" "px-3" "py-2" "py-3" "m-2" "m-3" "p-2" "p-3"; do
  find src/app -name "*.tsx" -type f -exec sed -i '' "s/className=\"$class\"//g" {} \;
done

# Remove all simple display utilities
for class in "inline-block" "inline-flex" "table" "grid-cols-1" "grid-cols-2" "grid-cols-3"; do
  find src/app -name "*.tsx" -type f -exec sed -i '' "s/className=\"$class\"//g" {} \;
done

# Remove all simple text utilities
for class in "text-xs" "text-2xl" "text-3xl" "font-medium" "font-normal" "italic" "underline"; do
  find src/app -name "*.tsx" -type f -exec sed -i '' "s/className=\"$class\"//g" {} \;
done

# Remove all simple color utilities
for class in "bg-gray-200" "bg-gray-300" "bg-gray-400" "bg-gray-500" "bg-gray-600" "bg-gray-700" "bg-gray-800" "bg-gray-900"; do
  find src/app -name "*.tsx" -type f -exec sed -i '' "s/className=\"$class\"//g" {} \;
done

for class in "text-gray-100" "text-gray-200" "text-gray-300" "text-gray-400" "text-gray-500" "text-gray-800"; do
  find src/app -name "*.tsx" -type f -exec sed -i '' "s/className=\"$class\"//g" {} \;
done

# Remove all simple border utilities
for class in "border-2" "border-3" "border-t" "border-b" "border-l" "border-r"; do
  find src/app -name "*.tsx" -type f -exec sed -i '' "s/className=\"$class\"//g" {} \;
done

# Remove all simple sizing utilities
for class in "w-auto" "h-auto" "w-screen" "h-screen" "min-w-0" "min-h-0" "max-w-full" "max-h-full"; do
  find src/app -name "*.tsx" -type f -exec sed -i '' "s/className=\"$class\"//g" {} \;
done

# Remove all simple positioning utilities
for class in "static" "fixed" "sticky" "top-0" "bottom-0" "left-0" "right-0" "inset-0"; do
  find src/app -name "*.tsx" -type f -exec sed -i '' "s/className=\"$class\"//g" {} \;
done

# Remove overflow utilities
for class in "overflow-hidden" "overflow-auto" "overflow-scroll" "overflow-x-auto" "overflow-y-auto"; do
  find src/app -name "*.tsx" -type f -exec sed -i '' "s/className=\"$class\"//g" {} \;
done

# Clean up empty className
find src/app -name "*.tsx" -type f -exec sed -i '' 's/ className=""//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="" //g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className=""//g' {} \;

echo "✅ Round 5 complete"
