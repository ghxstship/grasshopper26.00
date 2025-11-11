#!/bin/bash

# Final Comprehensive Audit - Excludes token definitions
echo "🔍 COMPREHENSIVE TOKEN COMPLIANCE AUDIT"
echo "========================================"
echo ""

SRC_DIR="/Users/julianclarkson/Documents/Grasshopper26.00/src"
VIOLATIONS=0

# Hardcoded font sizes
HARDCODED_SIZES=$(grep -r "font-size: [0-9]" "$SRC_DIR" --include="*.css" --include="*.module.css" | grep -v "var(--" | grep -v "clamp(" | grep -v "em;" | grep -v ".next" | grep -v "tokens.css" || true)
if [ -n "$HARDCODED_SIZES" ]; then
  echo "❌ Hardcoded font-size: $(echo "$HARDCODED_SIZES" | wc -l) violations"
  VIOLATIONS=$((VIOLATIONS + $(echo "$HARDCODED_SIZES" | wc -l)))
else
  echo "✅ No hardcoded font-size values"
fi

# Hardcoded font families
HARDCODED_FONTS=$(grep -r "font-family:" "$SRC_DIR" --include="*.css" --include="*.module.css" | grep -v "var(--" | grep -v ".next" | grep -v "tokens.css" || true)
if [ -n "$HARDCODED_FONTS" ]; then
  echo "❌ Hardcoded font-family: $(echo "$HARDCODED_FONTS" | wc -l) violations"
  VIOLATIONS=$((VIOLATIONS + $(echo "$HARDCODED_FONTS" | wc -l)))
else
  echo "✅ No hardcoded font-family values"
fi

# Hardcoded hex colors
HARDCODED_COLORS=$(grep -rE "#[0-9A-Fa-f]{3,6}" "$SRC_DIR" --include="*.css" --include="*.module.css" | grep -v ".next" | grep -v "tokens.css" || true)
if [ -n "$HARDCODED_COLORS" ]; then
  echo "❌ Hardcoded hex colors: $(echo "$HARDCODED_COLORS" | wc -l) violations"
  VIOLATIONS=$((VIOLATIONS + $(echo "$HARDCODED_COLORS" | wc -l)))
else
  echo "✅ No hardcoded hex colors"
fi

# Hardcoded spacing
HARDCODED_SPACING=$(grep -rE "(padding|margin|gap): [0-9]" "$SRC_DIR" --include="*.css" --include="*.module.css" | grep -v "var(--" | grep -v "calc(" | grep -v "0;" | grep -v ".next" | grep -v "tokens.css" || true)
if [ -n "$HARDCODED_SPACING" ]; then
  echo "❌ Hardcoded spacing: $(echo "$HARDCODED_SPACING" | wc -l) violations"
  VIOLATIONS=$((VIOLATIONS + $(echo "$HARDCODED_SPACING" | wc -l)))
else
  echo "✅ No hardcoded spacing values"
fi

# Rounded corners
ROUNDED_CORNERS=$(grep -rE "border-radius: [^0v]" "$SRC_DIR" --include="*.css" --include="*.module.css" | grep -v ".next" | grep -v "tokens.css" || true)
if [ -n "$ROUNDED_CORNERS" ]; then
  echo "❌ Rounded corners: $(echo "$ROUNDED_CORNERS" | wc -l) violations"
  VIOLATIONS=$((VIOLATIONS + $(echo "$ROUNDED_CORNERS" | wc -l)))
else
  echo "✅ No rounded corners (GHXSTSHIP hard edges)"
fi

# Soft shadows
SOFT_SHADOWS=$(grep -rE "box-shadow:.*blur" "$SRC_DIR" --include="*.css" --include="*.module.css" | grep -v ".next" | grep -v "tokens.css" || true)
if [ -n "$SOFT_SHADOWS" ]; then
  echo "❌ Soft shadows: $(echo "$SOFT_SHADOWS" | wc -l) violations"
  VIOLATIONS=$((VIOLATIONS + $(echo "$SOFT_SHADOWS" | wc -l)))
else
  echo "✅ No soft shadows (hard geometric only)"
fi

# RGB/RGBA colors (excluding tokens)
RGB_COLORS=$(grep -r "rgba\?" "$SRC_DIR" --include="*.css" --include="*.module.css" | grep -v "var(--" | grep -v ".next" | grep -v "tokens.css" || true)
if [ -n "$RGB_COLORS" ]; then
  echo "❌ RGB/RGBA colors: $(echo "$RGB_COLORS" | wc -l) violations"
  VIOLATIONS=$((VIOLATIONS + $(echo "$RGB_COLORS" | wc -l)))
else
  echo "✅ No rgb/rgba colors"
fi

echo ""
echo "========================================"
echo "📊 FINAL AUDIT SUMMARY"
echo "========================================"
echo "Total violations: $VIOLATIONS"
echo ""

if [ $VIOLATIONS -eq 0 ]; then
  echo "✅ ENTIRE CODEBASE IS 100% COMPLIANT!"
  echo "   - All design system components ✓"
  echo "   - All app pages ✓"
  echo "   - All detail pages ✓"
  exit 0
else
  echo "❌ Found $VIOLATIONS violations"
  exit 1
fi
