#!/bin/bash
# Round 4: Final cleanup pass

set -e

echo "🔄 Round 4: Final Tailwind cleanup..."

# Remove color classes
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="bg-gray-50"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="bg-gray-100"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="bg-white"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="text-black"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="text-white"//g' {} \;

# Remove border utilities
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="border-gray-200"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="border-gray-300"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="rounded"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="rounded-md"//g' {} \;

# Remove display utilities
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="flex-1"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="flex-col"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="items-center"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="justify-center"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="justify-between"//g' {} \;

# Remove gap utilities
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="gap-2"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="gap-3"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="gap-4"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="gap-6"//g' {} \;

# Remove more spacing
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="mb-3"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="mt-3"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="mb-8"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="mt-8"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="px-6"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="py-6"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="py-8"//g' {} \;

# Remove text size utilities
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="text-sm"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="text-base"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="text-lg"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="text-xl"//g' {} \;

# Clean up empty className
find src/app -name "*.tsx" -type f -exec sed -i '' 's/ className=""//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="" //g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className=""//g' {} \;

echo "✅ Round 4 complete"
