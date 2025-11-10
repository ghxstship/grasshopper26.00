#!/bin/bash

# Design Token Validation Script
# Zero tolerance enforcement for GHXSTSHIP design system

set -e

REPO_ROOT="/Users/julianclarkson/Documents/Grasshopper26.00"
COMPONENTS_DIR="$REPO_ROOT/src/design-system/components"
VIOLATIONS=0

echo "🔍 Validating design token usage..."
echo ""

# Check for hardcoded colors (excluding QR/Barcode - scanning exemption)
echo "Checking for hardcoded colors..."
if grep -r --include="*.css" --include="*.tsx" -E '#[0-9A-Fa-f]{3,6}' "$COMPONENTS_DIR" | grep -v "codeiumignore" | grep -v "var(--color" | grep -v "QRCode" | grep -v "Barcode"; then
    echo "❌ VIOLATION: Hardcoded hex colors found"
    VIOLATIONS=$((VIOLATIONS + 1))
else
    echo "✅ No hardcoded colors (QR/Barcode exempted)"
fi
echo ""

# Check for rounded corners
echo "Checking for rounded corners..."
if grep -r --include="*.css" 'border-radius: [^0v]' "$COMPONENTS_DIR" | grep -v "codeiumignore" | grep -v "var(--radius"; then
    echo "❌ VIOLATION: Non-zero border-radius found"
    VIOLATIONS=$((VIOLATIONS + 1))
else
    echo "✅ All borders are hard geometric edges"
fi
echo ""

# Check for soft shadows
echo "Checking for soft shadows..."
if grep -r --include="*.css" -E 'box-shadow:.*blur|box-shadow:.*rgba' "$COMPONENTS_DIR" | grep -v "codeiumignore"; then
    echo "❌ VIOLATION: Soft shadows found"
    VIOLATIONS=$((VIOLATIONS + 1))
else
    echo "✅ All shadows are hard geometric"
fi
echo ""

# Check for directional properties
echo "Checking for directional properties..."
if grep -r --include="*.css" -E '  (margin-left|margin-right|padding-left|padding-right|left|right):' "$COMPONENTS_DIR" | grep -v "codeiumignore" | grep -v "inset-"; then
    echo "❌ VIOLATION: Directional properties found (use logical properties)"
    VIOLATIONS=$((VIOLATIONS + 1))
else
    echo "✅ All properties use logical directions"
fi
echo ""

# Check for Tailwind utility classes in TSX
echo "Checking for Tailwind utility classes..."
if grep -r --include="*.tsx" 'className="[^"]*\(bg-\|text-\|border-\|rounded-\|shadow-\|p-\|m-\|w-\|h-\|flex\|grid\)' "$COMPONENTS_DIR" | grep -v "codeiumignore"; then
    echo "❌ VIOLATION: Tailwind utility classes found"
    VIOLATIONS=$((VIOLATIONS + 1))
else
    echo "✅ No Tailwind utilities in components"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $VIOLATIONS -eq 0 ]; then
    echo "✅ ALL CHECKS PASSED - Zero violations"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit 0
else
    echo "❌ FAILED - $VIOLATIONS violation(s) found"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit 1
fi
