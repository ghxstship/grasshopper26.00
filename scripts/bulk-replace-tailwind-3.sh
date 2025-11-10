#!/bin/bash
# Round 3: Most aggressive replacements

set -e

echo "🔄 Round 3: Aggressive Tailwind cleanup..."

# Replace complex multi-class patterns with generic styles
find src/app -name "*.tsx" -type f -exec perl -i -pe 's/className="[^"]*flex[^"]*items-center[^"]*"/className={styles.row}/g' {} \;
find src/app -name "*.tsx" -type f -exec perl -i -pe 's/className="[^"]*grid[^"]*gap-[^"]*"/className={styles.grid}/g' {} \;
find src/app -name "*.tsx" -type f -exec perl -i -pe 's/className="[^"]*bg-white[^"]*p-[^"]*rounded[^"]*"/className={styles.card}/g' {} \;
find src/app -name "*.tsx" -type f -exec perl -i -pe 's/className="[^"]*text-[0-9]xl[^"]*font-bold[^"]*"/className={styles.title}/g' {} \;
find src/app -name "*.tsx" -type f -exec perl -i -pe 's/className="[^"]*space-y-[^"]*"/className={styles.section}/g' {} \;

# Remove standalone utility classes
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="flex"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="grid"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="hidden"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="block"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="inline"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="relative"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="absolute"//g' {} \;

# Remove more spacing
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="p-4"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="p-6"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="p-8"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="px-4"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="py-4"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="m-4"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="mx-auto"//g' {} \;

# Remove text utilities
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="text-center"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="text-left"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="text-right"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="font-bold"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="font-semibold"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="uppercase"//g' {} \;

# Remove size utilities
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="w-full"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="h-full"//g' {} \;

# Clean up empty className again
find src/app -name "*.tsx" -type f -exec sed -i '' 's/ className=""//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="" //g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className=""//g' {} \;

echo "✅ Round 3 complete"
