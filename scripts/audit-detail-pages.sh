#!/bin/bash

# Detail Pages Design Token Audit Script
# Checks all detail/dynamic pages in src/app for proper token usage

echo "🔍 DETAIL PAGES TOKEN COMPLIANCE AUDIT"
echo "========================================"
echo ""

APP_DIR="/Users/julianclarkson/Documents/Grasshopper26.00/src/app"
VIOLATIONS=0

# Check for hardcoded font sizes in app pages
echo "📏 Checking app pages for hardcoded font sizes..."
HARDCODED_SIZES=$(grep -r "font-size: [0-9]" "$APP_DIR" --include="*.css" --include="*.module.css" | grep -v "var(--" | grep -v "clamp(" | grep -v "em;" || true)
if [ -n "$HARDCODED_SIZES" ]; then
  echo "❌ Found hardcoded font-size values:"
  echo "$HARDCODED_SIZES"
  VIOLATIONS=$((VIOLATIONS + $(echo "$HARDCODED_SIZES" | wc -l)))
else
  echo "✅ No hardcoded font-size values"
fi
echo ""

# Check for hardcoded font families in app pages
echo "🔤 Checking app pages for hardcoded font families..."
HARDCODED_FONTS=$(grep -r "font-family:" "$APP_DIR" --include="*.css" --include="*.module.css" | grep -v "var(--" || true)
if [ -n "$HARDCODED_FONTS" ]; then
  echo "❌ Found hardcoded font-family values:"
  echo "$HARDCODED_FONTS"
  VIOLATIONS=$((VIOLATIONS + $(echo "$HARDCODED_FONTS" | wc -l)))
else
  echo "✅ No hardcoded font-family values"
fi
echo ""

# Check for hardcoded colors in app pages
echo "🎨 Checking app pages for hardcoded colors..."
HARDCODED_COLORS=$(grep -rE "#[0-9A-Fa-f]{3,6}" "$APP_DIR" --include="*.css" --include="*.module.css" || true)
if [ -n "$HARDCODED_COLORS" ]; then
  echo "❌ Found hardcoded hex colors:"
  echo "$HARDCODED_COLORS"
  VIOLATIONS=$((VIOLATIONS + $(echo "$HARDCODED_COLORS" | wc -l)))
else
  echo "✅ No hardcoded hex colors"
fi
echo ""

# Check for hardcoded spacing in app pages
echo "📐 Checking app pages for hardcoded spacing..."
HARDCODED_SPACING=$(grep -rE "(padding|margin|gap): [0-9]" "$APP_DIR" --include="*.css" --include="*.module.css" | grep -v "var(--" | grep -v "calc(" | grep -v "0;" || true)
if [ -n "$HARDCODED_SPACING" ]; then
  echo "⚠️  Found hardcoded spacing values:"
  echo "$HARDCODED_SPACING"
  VIOLATIONS=$((VIOLATIONS + $(echo "$HARDCODED_SPACING" | wc -l)))
else
  echo "✅ No hardcoded spacing values"
fi
echo ""

# Check for rounded corners in app pages
echo "🔲 Checking app pages for rounded corners..."
ROUNDED_CORNERS=$(grep -rE "border-radius: [^0]" "$APP_DIR" --include="*.css" --include="*.module.css" | grep -v "var(--" || true)
if [ -n "$ROUNDED_CORNERS" ]; then
  echo "❌ Found rounded corners (GHXSTSHIP requires hard edges):"
  echo "$ROUNDED_CORNERS"
  VIOLATIONS=$((VIOLATIONS + $(echo "$ROUNDED_CORNERS" | wc -l)))
else
  echo "✅ No rounded corners (hard edges only)"
fi
echo ""

# Check for soft shadows in app pages
echo "🌑 Checking app pages for soft shadows..."
SOFT_SHADOWS=$(grep -rE "box-shadow:.*blur" "$APP_DIR" --include="*.css" --include="*.module.css" || true)
if [ -n "$SOFT_SHADOWS" ]; then
  echo "❌ Found soft shadows (GHXSTSHIP requires hard geometric shadows):"
  echo "$SOFT_SHADOWS"
  VIOLATIONS=$((VIOLATIONS + $(echo "$SOFT_SHADOWS" | wc -l)))
else
  echo "✅ No soft shadows (hard geometric only)"
fi
echo ""

# Summary
echo "========================================"
echo "📊 AUDIT SUMMARY"
echo "========================================"
echo "Total violations found: $VIOLATIONS"
echo ""

if [ $VIOLATIONS -eq 0 ]; then
  echo "✅ All detail pages are compliant!"
  exit 0
else
  echo "❌ Detail pages have $VIOLATIONS token violations"
  exit 1
fi
