#!/bin/bash

# Audit Inline Styles Script
# Finds all instances of inline styles in TSX files

echo "🔍 Auditing inline styles in codebase..."
echo "=========================================="
echo ""

# Find all style={{ usage
echo "📊 Files with inline styles:"
grep -r "style={{" src --include="*.tsx" --include="*.ts" -l | sort

echo ""
echo "📈 Total files with inline styles:"
grep -r "style={{" src --include="*.tsx" --include="*.ts" -l | wc -l

echo ""
echo "📊 Total inline style occurrences:"
grep -r "style={{" src --include="*.tsx" --include="*.ts" | wc -l

echo ""
echo "=========================================="
echo "✅ Audit complete"
