#!/bin/bash

# Design Token Compliance Audit Script
# Checks all design system components for proper token usage

echo "🔍 DESIGN TOKEN COMPLIANCE AUDIT"
echo "=================================="
echo ""

DESIGN_SYSTEM_DIR="/Users/julianclarkson/Documents/Grasshopper26.00/src/design-system/components"
VIOLATIONS=0

# Check for hardcoded font sizes (not using tokens)
echo "📏 Checking for hardcoded font sizes..."
HARDCODED_SIZES=$(grep -r "font-size: [0-9]" "$DESIGN_SYSTEM_DIR" --include="*.css" --include="*.module.css" | grep -v "var(--" | grep -v "clamp(" | grep -v "em;" || true)
if [ -n "$HARDCODED_SIZES" ]; then
  echo "❌ Found hardcoded font-size values:"
  echo "$HARDCODED_SIZES" | head -20
  VIOLATIONS=$((VIOLATIONS + $(echo "$HARDCODED_SIZES" | wc -l)))
else
  echo "✅ No hardcoded font-size values"
fi
echo ""

# Check for hardcoded font families (not using tokens)
echo "🔤 Checking for hardcoded font families..."
HARDCODED_FONTS=$(grep -r "font-family:" "$DESIGN_SYSTEM_DIR" --include="*.css" --include="*.module.css" | grep -v "var(--" || true)
if [ -n "$HARDCODED_FONTS" ]; then
  echo "❌ Found hardcoded font-family values:"
  echo "$HARDCODED_FONTS" | head -20
  VIOLATIONS=$((VIOLATIONS + $(echo "$HARDCODED_FONTS" | wc -l)))
else
  echo "✅ No hardcoded font-family values"
fi
echo ""

# Check for hardcoded colors (hex values)
echo "🎨 Checking for hardcoded colors..."
HARDCODED_COLORS=$(grep -rE "#[0-9A-Fa-f]{3,6}" "$DESIGN_SYSTEM_DIR" --include="*.css" --include="*.module.css" || true)
if [ -n "$HARDCODED_COLORS" ]; then
  echo "❌ Found hardcoded hex colors:"
  echo "$HARDCODED_COLORS" | head -20
  VIOLATIONS=$((VIOLATIONS + $(echo "$HARDCODED_COLORS" | wc -l)))
else
  echo "✅ No hardcoded hex colors"
fi
echo ""

# Check for hardcoded spacing (not using tokens)
echo "📐 Checking for hardcoded spacing..."
HARDCODED_SPACING=$(grep -rE "(padding|margin|gap): [0-9]" "$DESIGN_SYSTEM_DIR" --include="*.css" --include="*.module.css" | grep -v "var(--" | grep -v "calc(" | grep -v "0;" || true)
if [ -n "$HARDCODED_SPACING" ]; then
  echo "⚠️  Found hardcoded spacing values:"
  echo "$HARDCODED_SPACING" | head -20
  VIOLATIONS=$((VIOLATIONS + $(echo "$HARDCODED_SPACING" | wc -l)))
else
  echo "✅ No hardcoded spacing values"
fi
echo ""

# Check for hardcoded border radius (should all be 0 for GHXSTSHIP)
echo "🔲 Checking for rounded corners..."
ROUNDED_CORNERS=$(grep -rE "border-radius: [^0]" "$DESIGN_SYSTEM_DIR" --include="*.css" --include="*.module.css" | grep -v "var(--" || true)
if [ -n "$ROUNDED_CORNERS" ]; then
  echo "❌ Found rounded corners (GHXSTSHIP requires hard edges):"
  echo "$ROUNDED_CORNERS" | head -20
  VIOLATIONS=$((VIOLATIONS + $(echo "$ROUNDED_CORNERS" | wc -l)))
else
  echo "✅ No rounded corners (hard edges only)"
fi
echo ""

# Check for soft shadows (should be hard geometric only)
echo "🌑 Checking for soft shadows..."
SOFT_SHADOWS=$(grep -rE "box-shadow:.*blur" "$DESIGN_SYSTEM_DIR" --include="*.css" --include="*.module.css" || true)
if [ -n "$SOFT_SHADOWS" ]; then
  echo "❌ Found soft shadows (GHXSTSHIP requires hard geometric shadows):"
  echo "$SOFT_SHADOWS" | head -20
  VIOLATIONS=$((VIOLATIONS + $(echo "$SOFT_SHADOWS" | wc -l)))
else
  echo "✅ No soft shadows (hard geometric only)"
fi
echo ""

# Summary
echo "=================================="
echo "📊 AUDIT SUMMARY"
echo "=================================="
echo "Total violations found: $VIOLATIONS"
echo ""

if [ $VIOLATIONS -eq 0 ]; then
  echo "✅ All design system components are compliant!"
  exit 0
else
  echo "❌ Design system has $VIOLATIONS token violations"
  echo "   Run with detailed output to see all violations"
  exit 1
fi
