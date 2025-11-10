#!/bin/bash
# Target specific common patterns from the analysis

set -e

echo "🔄 Replacing specific common patterns..."

# Icon patterns with mr-2
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="h-4 w-4 mr-2"/className={styles.icon}/g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="mr-2 h-4 w-4"/className={styles.icon}/g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="h-5 w-5"/className={styles.icon}/g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="h-3 w-3 mr-1"/className={styles.iconSmall}/g' {} \;

# Text patterns
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="text-sm font-medium"/className={styles.label}/g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="text-sm text-gray-400"/className={styles.subtitle}/g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="text-sm text-gray-600"/className={styles.subtitle}/g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="text-2xl font-semibold mb-4"/className={styles.sectionTitle}/g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="text-sm text-gray-600 mb-2"/className={styles.description}/g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="text-xs text-gray-500 mt-1"/className={styles.hint}/g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="text-sm font-medium mb-2 block"/className={styles.formLabel}/g' {} \;

# Card patterns
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="bg-white rounded-lg shadow-md p-6"/className={styles.card}/g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="border-3 border-black bg-white p-6"/className={styles.card}/g' {} \;

# Flex patterns
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="flex gap-2"/className={styles.row}/g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="flex justify-between"/className={styles.spaceBetween}/g' {} \;

# Container patterns
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="min-h-screen  py-12 px-4"/className={styles.container}/g' {} \;

# Font-specific patterns (custom fonts)
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="font-share-tech-mono text-xs uppercase text-grey-600"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="font-bebas text-h3 uppercase mb-4"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="font-share-tech text-grey-700"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="font-share-tech text-sm"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="mt-1 font-share-tech text-sm"//g' {} \;

# Form input patterns
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"/className={styles.input}/g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="block text-sm font-medium text-gray-700 mb-2"/className={styles.label}/g' {} \;

# Special effect patterns (remove these as they should be in CSS)
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="bg-black\/40 backdrop-blur-lg border-purple-500\/20"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="bg-black\/50 border-purple-500\/30"//g' {} \;

# Utility patterns
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="text-muted-foreground"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="text-xs text-muted-foreground"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="text-primary hover:underline"//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="text-red-600"//g' {} \;

# Clean up empty className
find src/app -name "*.tsx" -type f -exec sed -i '' 's/ className=""//g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className="" //g' {} \;
find src/app -name "*.tsx" -type f -exec sed -i '' 's/className=""//g' {} \;

echo "✅ Specific patterns replaced"
