#!/bin/bash

# Design System Compliance Enforcement Script
# Zero tolerance for design system violations

set -e

echo "🎨 GVTEWAY Design System Compliance Check"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track violations
TOTAL_VIOLATIONS=0

echo "📋 Running ESLint with design token rules..."
if npm run lint:tokens > /tmp/lint-output.txt 2>&1; then
    echo -e "${GREEN}✓ No ESLint violations found${NC}"
else
    ESLINT_VIOLATIONS=$(grep -c "error" /tmp/lint-output.txt || true)
    TOTAL_VIOLATIONS=$((TOTAL_VIOLATIONS + ESLINT_VIOLATIONS))
    echo -e "${RED}✗ Found $ESLINT_VIOLATIONS ESLint violations${NC}"
    echo ""
    echo "Top violations:"
    grep "error" /tmp/lint-output.txt | head -10
fi

echo ""
echo "🔍 Checking for Tailwind utility classes..."
TAILWIND_COUNT=$(grep -r "className=\"[^\"]*\(px-\|py-\|p-\|m-\|mx-\|my-\|ml-\|mr-\|mt-\|mb-\|text-\|bg-\|border-\|rounded-\|w-\|h-\)" src --include="*.tsx" --include="*.ts" | wc -l | tr -d ' ')
if [ "$TAILWIND_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠ Found $TAILWIND_COUNT files with Tailwind utility classes${NC}"
    TOTAL_VIOLATIONS=$((TOTAL_VIOLATIONS + TAILWIND_COUNT))
else
    echo -e "${GREEN}✓ No Tailwind utility classes found${NC}"
fi

echo ""
echo "🔍 Checking for inline styles..."
INLINE_STYLES=$(grep -r "style=\{" src --include="*.tsx" | wc -l | tr -d ' ')
if [ "$INLINE_STYLES" -gt 0 ]; then
    echo -e "${YELLOW}⚠ Found $INLINE_STYLES inline style usages${NC}"
    TOTAL_VIOLATIONS=$((TOTAL_VIOLATIONS + INLINE_STYLES))
else
    echo -e "${GREEN}✓ No inline styles found${NC}"
fi

echo ""
echo "🔍 Checking for directional properties..."
DIRECTIONAL=$(grep -r "\(margin-left\|margin-right\|padding-left\|padding-right\|text-align: left\|text-align: right\)" src --include="*.css" --include="*.module.css" | wc -l | tr -d ' ')
if [ "$DIRECTIONAL" -gt 0 ]; then
    echo -e "${YELLOW}⚠ Found $DIRECTIONAL directional property violations${NC}"
    TOTAL_VIOLATIONS=$((TOTAL_VIOLATIONS + DIRECTIONAL))
else
    echo -e "${GREEN}✓ No directional properties found${NC}"
fi

echo ""
echo "=========================================="
if [ "$TOTAL_VIOLATIONS" -eq 0 ]; then
    echo -e "${GREEN}✓ 100% DESIGN SYSTEM COMPLIANCE ACHIEVED!${NC}"
    exit 0
else
    echo -e "${RED}✗ Total violations: $TOTAL_VIOLATIONS${NC}"
    echo ""
    echo "📖 See docs/DESIGN_SYSTEM_COMPLIANCE_REMEDIATION.md for remediation plan"
    exit 1
fi
