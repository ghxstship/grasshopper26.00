#!/bin/bash

# Comprehensive Design Token Audit - ENTIRE CODEBASE
# Checks ALL CSS files for token violations

echo "🔍 FULL CODEBASE TOKEN COMPLIANCE AUDIT"
echo "========================================"
echo ""

SRC_DIR="/Users/julianclarkson/Documents/Grasshopper26.00/src"
VIOLATIONS=0

echo "Scanning: $SRC_DIR"
echo ""

# Check for hardcoded font sizes
echo "📏 Checking for hardcoded font sizes..."
HARDCODED_SIZES=$(grep -r "font-size: [0-9]" "$SRC_DIR" --include="*.css" --include="*.module.css" | grep -v "var(--" | grep -v "clamp(" | grep -v "em;" | grep -v ".next" || true)
if [ -n "$HARDCODED_SIZES" ]; then
  echo "❌ Found hardcoded font-size values:"
  echo "$HARDCODED_SIZES"
  VIOLATIONS=$((VIOLATIONS + $(echo "$HARDCODED_SIZES" | wc -l)))
else
  echo "✅ No hardcoded font-size values"
fi
echo ""

# Check for hardcoded font families
echo "🔤 Checking for hardcoded font families..."
HARDCODED_FONTS=$(grep -r "font-family:" "$SRC_DIR" --include="*.css" --include="*.module.css" | grep -v "var(--" | grep -v ".next" || true)
if [ -n "$HARDCODED_FONTS" ]; then
  echo "❌ Found hardcoded font-family values:"
  echo "$HARDCODED_FONTS"
  VIOLATIONS=$((VIOLATIONS + $(echo "$HARDCODED_FONTS" | wc -l)))
else
  echo "✅ No hardcoded font-family values"
fi
echo ""

# Check for hardcoded colors (hex values)
echo "🎨 Checking for hardcoded colors..."
HARDCODED_COLORS=$(grep -rE "#[0-9A-Fa-f]{3,6}" "$SRC_DIR" --include="*.css" --include="*.module.css" | grep -v ".next" || true)
if [ -n "$HARDCODED_COLORS" ]; then
  echo "❌ Found hardcoded hex colors:"
  echo "$HARDCODED_COLORS"
  VIOLATIONS=$((VIOLATIONS + $(echo "$HARDCODED_COLORS" | wc -l)))
else
  echo "✅ No hardcoded hex colors"
fi
echo ""

# Check for hardcoded spacing
echo "📐 Checking for hardcoded spacing..."
HARDCODED_SPACING=$(grep -rE "(padding|margin|gap): [0-9]" "$SRC_DIR" --include="*.css" --include="*.module.css" | grep -v "var(--" | grep -v "calc(" | grep -v "0;" | grep -v ".next" || true)
if [ -n "$HARDCODED_SPACING" ]; then
  echo "⚠️  Found hardcoded spacing values:"
  echo "$HARDCODED_SPACING"
  VIOLATIONS=$((VIOLATIONS + $(echo "$HARDCODED_SPACING" | wc -l)))
else
  echo "✅ No hardcoded spacing values"
fi
echo ""

# Check for rounded corners
echo "🔲 Checking for rounded corners..."
ROUNDED_CORNERS=$(grep -rE "border-radius: [^0v]" "$SRC_DIR" --include="*.css" --include="*.module.css" | grep -v ".next" || true)
if [ -n "$ROUNDED_CORNERS" ]; then
  echo "❌ Found rounded corners (GHXSTSHIP requires hard edges):"
  echo "$ROUNDED_CORNERS"
  VIOLATIONS=$((VIOLATIONS + $(echo "$ROUNDED_CORNERS" | wc -l)))
else
  echo "✅ No rounded corners (hard edges only)"
fi
echo ""

# Check for soft shadows
echo "🌑 Checking for soft shadows..."
SOFT_SHADOWS=$(grep -rE "box-shadow:.*blur" "$SRC_DIR" --include="*.css" --include="*.module.css" | grep -v ".next" || true)
if [ -n "$SOFT_SHADOWS" ]; then
  echo "❌ Found soft shadows (GHXSTSHIP requires hard geometric shadows):"
  echo "$SOFT_SHADOWS"
  VIOLATIONS=$((VIOLATIONS + $(echo "$SOFT_SHADOWS" | wc -l)))
else
  echo "✅ No soft shadows (hard geometric only)"
fi
echo ""

# Check for rgb/rgba colors
echo "🎨 Checking for rgb/rgba colors (should use tokens)..."
RGB_COLORS=$(grep -rE "rgba?\(" "$SRC_DIR" --include="*.css" --include="*.module.css" | grep -v "var(--" | grep -v ".next" || true)
if [ -n "$RGB_COLORS" ]; then
  echo "⚠️  Found rgb/rgba colors:"
  echo "$RGB_COLORS" | head -20
  VIOLATIONS=$((VIOLATIONS + $(echo "$RGB_COLORS" | wc -l)))
else
  echo "✅ No rgb/rgba colors"
fi
echo ""

# Summary
echo "========================================"
echo "📊 AUDIT SUMMARY"
echo "========================================"
echo "Total violations found: $VIOLATIONS"
echo ""

if [ $VIOLATIONS -eq 0 ]; then
  echo "✅ Entire codebase is compliant!"
  exit 0
else
  echo "❌ Codebase has $VIOLATIONS token violations"
  exit 1
fi
