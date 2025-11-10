#!/bin/bash
# Bulk replace common Tailwind patterns with CSS module equivalents

set -e

echo "🔄 Bulk replacing Tailwind classes..."

# Common container patterns
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="min-h-screen bg-white"/className={styles.container}/g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="min-h-screen bg-gray-50"/className={styles.container}/g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="max-w-7xl mx-auto"/className={styles.content}/g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="max-w-6xl mx-auto"/className={styles.content}/g' {} \;

# Common spacing patterns
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="p-6"/className={styles.card}/g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="p-8"/className={styles.card}/g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="mb-8"/className={styles.section}/g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="mb-6"/className={styles.section}/g' {} \;

# Common text patterns  
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="text-3xl font-bold"/className={styles.title}/g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="text-2xl font-bold"/className={styles.title}/g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="text-xl font-semibold"/className={styles.cardTitle}/g' {} \;

# Common grid patterns
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"/className={styles.grid}/g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="grid md:grid-cols-2 gap-6"/className={styles.grid}/g' {} \;

# Common flex patterns
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="flex items-center justify-between"/className={styles.header}/g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="flex items-center gap-4"/className={styles.row}/g' {} \;

# Common button patterns
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="px-6 py-3 bg-purple-600 text-white rounded-lg"/className={styles.button}/g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="px-4 py-2 bg-purple-600 text-white rounded"/className={styles.button}/g' {} \;

echo "✅ Bulk replacement complete"
echo "Run: npm run lint:tokens to check remaining violations"
