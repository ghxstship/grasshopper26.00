#!/bin/bash

# Batch Design System Remediation Script
# Automatically identifies and reports all remaining Tailwind violations
# in design system components

set -e

echo "🔍 GVTEWAY Design System Compliance - Batch Remediation Report"
echo "=============================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
total_files=0
total_violations=0
compliant_files=0

# Output file
REPORT_FILE="docs/DESIGN_SYSTEM_BATCH_REMEDIATION_REPORT.md"

# Create report header
cat > "$REPORT_FILE" << 'EOF'
# Design System Batch Remediation Report

**Generated:** $(date)
**Project:** GVTEWAY (Grasshopper 26.00)

## Violation Summary

| Category | Files | Violations | Status |
|----------|-------|------------|--------|
EOF

echo "📊 Scanning design system components..."
echo ""

# Function to count violations in a file
count_violations() {
    local file=$1
    grep -o 'className="[^"]*"' "$file" 2>/dev/null | \
        grep -E '(text-|bg-|p-|m-|flex|grid|w-|h-|gap-|space-|border-|rounded)' | \
        wc -l | tr -d ' '
}

# Scan atoms
echo "🔬 Atoms Components:"
atoms_files=0
atoms_violations=0

for file in src/design-system/components/atoms/*.tsx; do
    if [ -f "$file" ]; then
        count=$(count_violations "$file")
        total_files=$((total_files + 1))
        atoms_files=$((atoms_files + 1))
        
        if [ "$count" -gt 0 ]; then
            total_violations=$((total_violations + count))
            atoms_violations=$((atoms_violations + count))
            echo -e "  ${RED}✗${NC} $(basename "$file"): $count violations"
        else
            compliant_files=$((compliant_files + 1))
            echo -e "  ${GREEN}✓${NC} $(basename "$file"): compliant"
        fi
    fi
done

echo ""

# Scan molecules
echo "🧬 Molecules Components:"
molecules_files=0
molecules_violations=0

for file in src/design-system/components/molecules/*.tsx; do
    if [ -f "$file" ]; then
        count=$(count_violations "$file")
        total_files=$((total_files + 1))
        molecules_files=$((molecules_files + 1))
        
        if [ "$count" -gt 0 ]; then
            total_violations=$((total_violations + count))
            molecules_violations=$((molecules_violations + count))
            echo -e "  ${RED}✗${NC} $(basename "$file"): $count violations"
        else
            compliant_files=$((compliant_files + 1))
            echo -e "  ${GREEN}✓${NC} $(basename "$file"): compliant"
        fi
    fi
done

echo ""

# Scan organisms
echo "🦠 Organisms Components:"
organisms_files=0
organisms_violations=0

find src/design-system/components/organisms -name "*.tsx" -type f | while read file; do
    count=$(count_violations "$file")
    total_files=$((total_files + 1))
    organisms_files=$((organisms_files + 1))
    
    if [ "$count" -gt 0 ]; then
        total_violations=$((total_violations + count))
        organisms_violations=$((organisms_violations + count))
        echo -e "  ${RED}✗${NC} $(basename "$file"): $count violations"
    else
        compliant_files=$((compliant_files + 1))
        echo -e "  ${GREEN}✓${NC} $(basename "$file"): compliant"
    fi
done

echo ""
echo "=============================================================="
echo "📈 Summary:"
echo "  Total Files Scanned: $total_files"
echo "  Compliant Files: $compliant_files"
echo "  Files with Violations: $((total_files - compliant_files))"
echo "  Total Violations: $total_violations"
echo ""

# Calculate compliance percentage
if [ $total_files -gt 0 ]; then
    compliance_pct=$((compliant_files * 100 / total_files))
    echo -e "  Compliance Rate: ${GREEN}${compliance_pct}%${NC}"
else
    echo "  Compliance Rate: N/A"
fi

echo ""
echo "📄 Detailed report saved to: $REPORT_FILE"
echo ""

# Generate priority list
echo "🎯 Top 20 Files by Violation Count:"
echo ""

find src/design-system/components -name "*.tsx" -type f | while read file; do
    count=$(count_violations "$file")
    if [ "$count" -gt 0 ]; then
        echo "$count violations: $file"
    fi
done | sort -rn | head -20

echo ""
echo "✅ Scan complete!"
