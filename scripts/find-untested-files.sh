#!/bin/bash

# Find all source files without corresponding test files
# This helps identify gaps in test coverage

echo "=== Files without test coverage ==="
echo ""

# Find all TypeScript/TSX files in src
find src -type f \( -name "*.ts" -o -name "*.tsx" \) \
  ! -name "*.test.*" \
  ! -name "*.spec.*" \
  ! -path "*/node_modules/*" \
  ! -path "*/__tests__/*" | while read -r file; do
  
  # Get the base name without extension
  basename=$(basename "$file" | sed 's/\.[^.]*$//')
  dirname=$(dirname "$file")
  
  # Check if a test file exists
  test_exists=false
  
  # Check in same directory
  if [ -f "${dirname}/__tests__/${basename}.test.ts" ] || \
     [ -f "${dirname}/__tests__/${basename}.test.tsx" ] || \
     [ -f "${dirname}/${basename}.test.ts" ] || \
     [ -f "${dirname}/${basename}.test.tsx" ]; then
    test_exists=true
  fi
  
  # Check in tests directory with similar path
  test_path=$(echo "$dirname" | sed 's|^src|tests|')
  if [ -f "${test_path}/${basename}.test.ts" ] || \
     [ -f "${test_path}/${basename}.test.tsx" ]; then
    test_exists=true
  fi
  
  if [ "$test_exists" = false ]; then
    echo "$file"
  fi
done

echo ""
echo "=== Summary ==="
total=$(find src -type f \( -name "*.ts" -o -name "*.tsx" \) ! -name "*.test.*" ! -name "*.spec.*" ! -path "*/node_modules/*" ! -path "*/__tests__/*" | wc -l)
untested=$(find src -type f \( -name "*.ts" -o -name "*.tsx" \) ! -name "*.test.*" ! -name "*.spec.*" ! -path "*/node_modules/*" ! -path "*/__tests__/*" | while read -r file; do
  basename=$(basename "$file" | sed 's/\.[^.]*$//')
  dirname=$(dirname "$file")
  test_exists=false
  if [ -f "${dirname}/__tests__/${basename}.test.ts" ] || \
     [ -f "${dirname}/__tests__/${basename}.test.tsx" ] || \
     [ -f "${dirname}/${basename}.test.ts" ] || \
     [ -f "${dirname}/${basename}.test.tsx" ]; then
    test_exists=true
  fi
  test_path=$(echo "$dirname" | sed 's|^src|tests|')
  if [ -f "${test_path}/${basename}.test.ts" ] || \
     [ -f "${test_path}/${basename}.test.tsx" ]; then
    test_exists=true
  fi
  if [ "$test_exists" = false ]; then
    echo "$file"
  fi
done | wc -l)

echo "Total source files: $total"
echo "Files without tests: $untested"
coverage_pct=$(echo "scale=1; (($total - $untested) * 100) / $total" | bc)
echo "File coverage: ${coverage_pct}%"
