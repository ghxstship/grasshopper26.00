#!/bin/bash
# Fix Supabase mock issues in all test files

echo "Fixing Supabase mocks in test files..."

# Find all test files with the broken pattern
find src -name "*.test.ts" -o -name "*.test.tsx" | while read file; do
  if grep -q "mockSupabase.from()" "$file"; then
    echo "Fixing: $file"
    
    # Backup
    cp "$file" "$file.bak"
    
    # Replace the pattern
    sed -i '' 's/mockSupabase\.from()\.single/mockQueryBuilder.single/g' "$file"
    sed -i '' 's/mockSupabase\.from()\.select/mockQueryBuilder.select/g' "$file"
    sed -i '' 's/mockSupabase\.from()\.insert/mockQueryBuilder.insert/g' "$file"
    sed -i '' 's/mockSupabase\.from()\.update/mockQueryBuilder.update/g' "$file"
    sed -i '' 's/mockSupabase\.from()\.delete/mockQueryBuilder.delete/g' "$file"
  fi
done

echo "Done!"
