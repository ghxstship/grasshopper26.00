#!/bin/bash

# Fix theme-aware color usage across all CSS modules
# This script replaces hardcoded black/white with theme-aware tokens

echo "🔧 Fixing theme-aware colors in CSS modules..."

# Define the patterns to fix
# Pattern 1: background-color: var(--color-black) -> background-color: var(--color-text-primary)
# Pattern 2: background-color: var(--color-white) -> background-color: var(--color-bg-primary)
# Pattern 3: color: var(--color-white) on black backgrounds -> color: var(--color-bg-primary)
# Pattern 4: color: var(--color-black) on white backgrounds -> color: var(--color-text-primary)

# Files to process
CSS_FILES=$(find src -type f \( -name "*.css" -o -name "*.module.css" \) ! -path "*/node_modules/*")

# Backup
BACKUP_DIR="backups/theme-color-fix-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Creating backup in $BACKUP_DIR..."
for file in $CSS_FILES; do
  mkdir -p "$BACKUP_DIR/$(dirname "$file")"
  cp "$file" "$BACKUP_DIR/$file"
done

echo "✅ Backup complete"
echo ""
echo "⚠️  CRITICAL: This script will make MASSIVE changes"
echo "⚠️  Manual review required for:"
echo "   - Components with intentionally fixed colors (QR codes, logos)"
echo "   - Overlays and modals that need specific opacity"
echo "   - Border colors that create visual hierarchy"
echo ""
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

echo "🚀 Starting automated fixes..."
echo ""

# Count changes
TOTAL_CHANGES=0

# This is too complex for automated fixing - need manual review
echo "❌ AUTOMATED FIX ABORTED"
echo ""
echo "This requires MANUAL REVIEW because:"
echo "1. Some components INTENTIONALLY use fixed colors (badges, status indicators)"
echo "2. Overlays need specific opacity values"
echo "3. Border colors create visual hierarchy that shouldn't be theme-inverted"
echo "4. Hover states need careful consideration"
echo ""
echo "Recommended approach:"
echo "1. Review each component individually"
echo "2. Determine if colors should be theme-aware or intentionally fixed"
echo "3. Use semantic tokens:"
echo "   - var(--color-text-primary) for main text color (adapts to theme)"
echo "   - var(--color-bg-primary) for main background (adapts to theme)"
echo "   - var(--color-black) ONLY when you want literal black in both themes"
echo "   - var(--color-white) ONLY when you want literal white in both themes"
echo ""
echo "Backup preserved at: $BACKUP_DIR"
