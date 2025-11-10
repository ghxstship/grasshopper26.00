#!/bin/bash
# Target complex multi-class patterns

set -e

echo "🔄 Replacing complex patterns..."

# Common icon patterns
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="h-4 w-4"/className={styles.icon}/g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="h-5 w-5"/className={styles.icon}/g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="h-6 w-6"/className={styles.icon}/g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="mr-2 h-4 w-4"/className={styles.icon}/g' {} \;

# Common flex patterns
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="flex gap-4"/className={styles.row}/g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="flex gap-2"/className={styles.row}/g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="flex gap-3"/className={styles.row}/g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="flex gap-6"/className={styles.row}/g' {} \;

# Common container patterns
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="container mx-auto px-4"/className={styles.content}/g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="max-w-4xl mx-auto"/className={styles.content}/g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="max-w-7xl mx-auto px-4"/className={styles.content}/g' {} \;

# Common text patterns
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="text-center"/className={styles.header}/g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="py-12 text-center"/className={styles.section}/g' {} \;

# Common card patterns
find src/app -name "*.tsx" -type f -exec perl -i -pe 's/className="[^"]*bg-white[^"]*p-[46][^"]*rounded[^"]*"/className={styles.card}/g' {} \;

# Common button patterns  
find src/app -name "*.tsx" -type f -exec perl -i -pe 's/className="[^"]*px-[46][^"]*py-[23][^"]*bg-[^"]*rounded[^"]*"/className={styles.button}/g' {} \;

# Common grid patterns
find src/app -name "*.tsx" -type f -exec perl -i -pe 's/className="grid[^"]*gap-[^"]*"/className={styles.grid}/g' {} \;

# Clean up empty className
find src/app -name "*.tsx" -type f -exec sed -i '' 's/ className=""//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="" //g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className=""//g' {} \;

echo "✅ Complex patterns replaced"
