#!/bin/bash

# Comprehensive Design System Violation Audit
# GHXSTSHIP Zero Tolerance Enforcement

echo "🔍 GHXSTSHIP DESIGN SYSTEM VIOLATION AUDIT"
echo "=========================================="
echo ""

# 1. ROUNDED CORNERS VIOLATIONS
echo "❌ ROUNDED CORNERS (rounded-*)"
echo "Files with rounded corners:"
grep -r "rounded-" src --include="*.tsx" --include="*.ts" -l | wc -l
echo ""

# 2. PURPLE/PINK COLOR VIOLATIONS
echo "❌ COLORED ELEMENTS (bg-purple, bg-pink, text-purple, text-pink)"
echo "Purple violations:"
grep -r "purple" src --include="*.tsx" --include="*.ts" | wc -l
echo "Pink violations:"
grep -r "pink" src --include="*.tsx" --include="*.ts" | wc -l
echo ""

# 3. INLINE STYLE VIOLATIONS
echo "❌ INLINE STYLES (style={{)"
echo "Files with inline styles:"
grep -r "style={{" src --include="*.tsx" --include="*.ts" -l | wc -l
echo ""

# 4. OLD CSS VARIABLE VIOLATIONS
echo "❌ OLD CSS VARIABLES (var(--color-, var(--gradient-)"
echo "CSS variable violations:"
grep -r "var(--color-" src --include="*.tsx" --include="*.ts" | wc -l
grep -r "var(--gradient-" src --include="*.tsx" --include="*.ts" | wc -l
echo ""

# 5. GENERIC FONT VIOLATIONS
echo "❌ GENERIC FONTS (font-bold, font-semibold, font-medium)"
echo "font-bold violations:"
grep -r "font-bold" src --include="*.tsx" --include="*.ts" | wc -l
echo "font-semibold violations:"
grep -r "font-semibold" src --include="*.tsx" --include="*.ts" | wc -l
echo "font-medium violations:"
grep -r "font-medium" src --include="*.tsx" --include="*.ts" | wc -l
echo ""

# 6. MISSING GHXSTSHIP FONTS
echo "✅ GHXSTSHIP FONT USAGE"
echo "font-anton usage:"
grep -r "font-anton" src --include="*.tsx" | wc -l
echo "font-bebas usage:"
grep -r "font-bebas" src --include="*.tsx" | wc -l
echo "font-share usage:"
grep -r "font-share" src --include="*.tsx" | wc -l
echo ""

# 7. PRIORITY FILES (Public-facing)
echo "🔴 CRITICAL PUBLIC FILES TO FIX:"
echo "================================"
for file in \
  "src/app/(public)/page.tsx" \
  "src/app/(public)/events/page.tsx" \
  "src/app/events/[id]/page.tsx" \
  "src/app/cart/page.tsx" \
  "src/app/checkout/page.tsx" \
  "src/components/privacy/cookie-consent.tsx" \
  "src/components/layout/site-header.tsx" \
  "src/components/layout/site-footer.tsx"
do
  if [ -f "$file" ]; then
    violations=$(grep -E "rounded-|style={{|var\(--color-|var\(--gradient-|font-bold|font-semibold|bg-purple|bg-pink" "$file" | wc -l)
    if [ "$violations" -gt 0 ]; then
      echo "  ❌ $file: $violations violations"
    else
      echo "  ✅ $file: COMPLIANT"
    fi
  fi
done

echo ""
echo "=========================================="
echo "✅ Audit complete"
