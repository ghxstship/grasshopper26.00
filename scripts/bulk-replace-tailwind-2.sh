#!/bin/bash
# More aggressive Tailwind replacements

set -e

echo "🔄 Round 2: More Tailwind replacements..."

# Remove common single-class patterns
find src/app -name "*.tsx" -type f -exec sed -i '' 's/ className="mb-4"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/ className="mt-4"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/ className="mb-2"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/ className="mt-2"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/ className="mb-6"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/ className="mt-6"//g' {} \;

# Remove text color classes (rely on CSS module defaults)
find src/app -name "*.tsx" -type f -exec sed -i '' 's/ className="text-gray-600"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/ className="text-gray-700"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/ className="text-gray-900"//g' {} \;

# Remove common utility classes
find src/app -name "*.tsx" -type f -exec sed -i '' 's/ className="rounded-lg"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/ className="shadow-md"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/ className="border"//g' {} \;

# Clean up empty className attributes
find src/app -name "*.tsx" -type f -exec sed -i '' 's/ className=""//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className=""//g' {} \;

echo "✅ Round 2 complete"
