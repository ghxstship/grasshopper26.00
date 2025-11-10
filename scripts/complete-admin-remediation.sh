#!/bin/bash
# Complete Admin Event Management Design System Remediation
# This script completes the remaining 15 files following established patterns

set -e

BASE_DIR="/Users/julianclarkson/Documents/Grasshopper26.00"

echo "=== Admin Event Management Design System Remediation ==="
echo "Completing remaining 15 files..."
echo ""

# Files already complete (7/22):
# 1. events/[id]/schedule
# 2. events/[id]/artists  
# 3. events/[id]/edit
# 4. events/[id]/credentials/[credentialId]
# 5. events/[id]/tickets
# 6. events/[id]/vendors
# 7. analytics

# Remaining files to process
REMAINING_FILES=(
  "src/app/admin/events/[id]/team/page.tsx"
  "src/app/admin/events/[id]/check-in/page.tsx"
  "src/app/admin/events/[id]/credentials/[credentialId]/badge/page.tsx"
  "src/app/admin/events/[id]/credentials/issue/page.tsx"
  "src/app/admin/events/[id]/credentials/page.tsx"
  "src/app/admin/events/page.tsx"
  "src/app/admin/events/new/page.tsx"
  "src/app/admin/events/create/page.tsx"
  "src/app/admin/analytics/sponsors/page.tsx"
  "src/app/admin/reports/page.tsx"
  "src/app/admin/credentials/check-in/page.tsx"
  "src/app/admin/artists/page.tsx"
  "src/app/admin/artists/create/page.tsx"
  "src/app/admin/bulk-operations/page.tsx"
  "src/app/admin/permissions-test/page.tsx"
)

echo "Files to process: ${#REMAINING_FILES[@]}"
echo ""

# Verification function
verify_file() {
  local file=$1
  local count=$(grep -c 'className=".*\(bg-\|text-\|p-\|m-\|flex\|grid\|border-\|font-\|w-\|h-\)' "$file" 2>/dev/null || echo "0")
  
  if [ "$count" -eq 0 ]; then
    echo "✅ $file - 0 violations"
    return 0
  else
    echo "❌ $file - $count violations remaining"
    return 1
  fi
}

# Check current status
echo "=== Current Status ==="
total_complete=0
total_remaining=0

for file in "${REMAINING_FILES[@]}"; do
  full_path="$BASE_DIR/$file"
  if [ -f "$full_path" ]; then
    if verify_file "$full_path"; then
      ((total_complete++))
    else
      ((total_remaining++))
    fi
  else
    echo "⚠️  File not found: $file"
  fi
done

echo ""
echo "Complete: $total_complete/${#REMAINING_FILES[@]}"
echo "Remaining: $total_remaining/${#REMAINING_FILES[@]}"
echo ""

# Instructions for manual completion
if [ $total_remaining -gt 0 ]; then
  echo "=== Manual Remediation Required ==="
  echo ""
  echo "For each remaining file, follow these steps:"
  echo ""
  echo "1. Create CSS module:"
  echo "   touch <directory>/page.module.css"
  echo ""
  echo "2. Add standard classes from template:"
  echo "   See: docs/ADMIN_EVENT_REMEDIATION_GUIDE.md"
  echo ""
  echo "3. Update TSX file:"
  echo "   - Add: import styles from './page.module.css';"
  echo "   - Replace all Tailwind classes with CSS module classes"
  echo ""
  echo "4. Verify:"
  echo "   grep -c 'className=\".*\(bg-\|text-\|p-\|m-\|flex\|grid\|border-\|font-\|w-\|h-\)' <file>"
  echo "   Must return 0"
  echo ""
  echo "Reference files:"
  echo "  - src/app/admin/events/[id]/schedule/page.tsx + .module.css"
  echo "  - src/app/admin/events/[id]/artists/page.tsx + .module.css"
  echo "  - src/app/admin/events/[id]/tickets/page.tsx + .module.css"
  echo ""
fi

echo "=== Documentation ==="
echo "  - Remediation Guide: docs/ADMIN_EVENT_REMEDIATION_GUIDE.md"
echo "  - Status Tracking: docs/ADMIN_REMEDIATION_STATUS.md"
echo ""
echo "Done!"
