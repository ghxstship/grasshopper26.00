#!/bin/bash

# Test Coverage Report Generator
# Generates comprehensive coverage report and identifies gaps

set -e

echo "🧪 Generating Test Coverage Report..."
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Run tests with coverage
echo "📊 Running tests with coverage..."
npm run test:coverage -- --reporter=verbose 2>&1 | tee coverage-output.log

# Check if coverage directory exists
if [ ! -d "coverage" ]; then
    echo -e "${RED}❌ Coverage directory not found${NC}"
    exit 1
fi

echo ""
echo "✅ Coverage report generated"
echo ""

# Display coverage summary
if [ -f "coverage/coverage-summary.json" ]; then
    echo "📈 Coverage Summary:"
    echo "==================="
    
    # Extract coverage percentages using node
    node -e "
    const fs = require('fs');
    const coverage = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));
    const total = coverage.total;
    
    console.log('Lines      :', total.lines.pct + '%');
    console.log('Statements :', total.statements.pct + '%');
    console.log('Functions  :', total.functions.pct + '%');
    console.log('Branches   :', total.branches.pct + '%');
    console.log('');
    
    // Check if thresholds are met
    const threshold = 80;
    const passed = total.lines.pct >= threshold && 
                   total.statements.pct >= threshold && 
                   total.functions.pct >= threshold;
    
    if (passed) {
        console.log('✅ Coverage thresholds met!');
    } else {
        console.log('⚠️  Coverage below 80% threshold');
        console.log('');
        console.log('Gaps:');
        if (total.lines.pct < threshold) {
            console.log('  - Lines: ' + (threshold - total.lines.pct).toFixed(2) + '% below threshold');
        }
        if (total.statements.pct < threshold) {
            console.log('  - Statements: ' + (threshold - total.statements.pct).toFixed(2) + '% below threshold');
        }
        if (total.functions.pct < threshold) {
            console.log('  - Functions: ' + (threshold - total.functions.pct).toFixed(2) + '% below threshold');
        }
    }
    "
fi

echo ""
echo "📁 Coverage reports available:"
echo "  - HTML: coverage/index.html"
echo "  - JSON: coverage/coverage-summary.json"
echo "  - LCOV: coverage/lcov.info"
echo ""

# Identify untested files
echo "🔍 Identifying untested files..."
echo "================================"

if [ -f "coverage/coverage-summary.json" ]; then
    node -e "
    const fs = require('fs');
    const coverage = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));
    
    const untested = [];
    const lowCoverage = [];
    
    for (const [file, data] of Object.entries(coverage)) {
        if (file === 'total') continue;
        
        if (data.lines.total === 0 || data.lines.pct === 0) {
            untested.push(file);
        } else if (data.lines.pct < 50) {
            lowCoverage.push({ file, pct: data.lines.pct });
        }
    }
    
    if (untested.length > 0) {
        console.log('');
        console.log('❌ Untested files (' + untested.length + '):');
        untested.slice(0, 10).forEach(file => {
            console.log('  - ' + file.replace(process.cwd() + '/src/', ''));
        });
        if (untested.length > 10) {
            console.log('  ... and ' + (untested.length - 10) + ' more');
        }
    }
    
    if (lowCoverage.length > 0) {
        console.log('');
        console.log('⚠️  Low coverage files (' + lowCoverage.length + '):');
        lowCoverage.slice(0, 10).forEach(item => {
            console.log('  - ' + item.file.replace(process.cwd() + '/src/', '') + ' (' + item.pct.toFixed(1) + '%)');
        });
        if (lowCoverage.length > 10) {
            console.log('  ... and ' + (lowCoverage.length - 10) + ' more');
        }
    }
    "
fi

echo ""
echo "🎯 Next Steps:"
echo "=============="
echo "1. Open coverage/index.html to view detailed report"
echo "2. Focus on untested and low-coverage files"
echo "3. Create tests using templates in docs/testing/TEST_COVERAGE_STRATEGY.md"
echo "4. Run 'npm run test:watch' for development"
echo ""

# Open coverage report in browser (optional)
if command -v open &> /dev/null; then
    read -p "Open coverage report in browser? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open coverage/index.html
    fi
fi

echo "✅ Coverage report generation complete!"
