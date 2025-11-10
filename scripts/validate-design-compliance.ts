#!/usr/bin/env tsx

/**
 * Comprehensive Design System Compliance Validation
 * Zero tolerance enforcement for GVTEWAY Design System
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface Violation {
  file: string;
  line: number;
  type: string;
  message: string;
  severity: 'error' | 'warning';
}

const violations: Violation[] = [];
const exemptPaths = [
  'node_modules',
  '.next',
  'design-system/tokens',
  'lib/imageProcessing',
  'lib/ticketing/qr-codes.ts',
  'lib/tickets/qr-generator.ts',
  'lib/tickets/pdf-generator.ts',
  'lib/email',
  'app/manifest.ts',
];

// Violation patterns
const HARDCODED_COLOR_REGEX = /#[0-9A-Fa-f]{3,6}/g;
const TAILWIND_UTILITY_REGEX = /className=["'][^"']*(?:bg-|text-|border-|p-|m-|px-|py-|mx-|my-|ml-|mr-|mt-|mb-|w-|h-|flex|grid|gap-|rounded-)/;
const DIRECTIONAL_PROPS_REGEX = /(?:margin-left|margin-right|padding-left|padding-right|text-align:\s*(?:left|right)|float:\s*(?:left|right))/;
const INLINE_STYLE_REGEX = /style=\{/;

function isExempt(filePath: string): boolean {
  return exemptPaths.some(exempt => filePath.includes(exempt));
}

function checkFile(filePath: string) {
  if (isExempt(filePath)) return;

  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Check for hardcoded colors (excluding comments with eslint-disable)
    if (!line.includes('eslint-disable-line no-restricted-syntax')) {
      const colorMatches = line.match(HARDCODED_COLOR_REGEX);
      if (colorMatches && (filePath.endsWith('.tsx') || filePath.endsWith('.ts'))) {
        violations.push({
          file: filePath,
          line: lineNum,
          type: 'hardcoded-color',
          message: `Hardcoded color found: ${colorMatches.join(', ')}. Use CSS variables (var(--color-*))`,
          severity: 'error',
        });
      }
    }

    // Check for Tailwind utility classes in TSX files
    if (filePath.endsWith('.tsx') && TAILWIND_UTILITY_REGEX.test(line)) {
      violations.push({
        file: filePath,
        line: lineNum,
        type: 'tailwind-utility',
        message: 'Tailwind utility classes forbidden. Use CSS Modules with design tokens',
        severity: 'error',
      });
    }

    // Check for directional properties in CSS
    if ((filePath.endsWith('.css') || filePath.endsWith('.module.css')) && DIRECTIONAL_PROPS_REGEX.test(line)) {
      violations.push({
        file: filePath,
        line: lineNum,
        type: 'directional-property',
        message: 'Directional property found. Use logical properties (margin-inline-start, etc.)',
        severity: 'error',
      });
    }

    // Check for inline styles
    if (filePath.endsWith('.tsx') && INLINE_STYLE_REGEX.test(line)) {
      violations.push({
        file: filePath,
        line: lineNum,
        type: 'inline-style',
        message: 'Inline styles forbidden. Use CSS Modules',
        severity: 'warning',
      });
    }
  });
}

function walkDirectory(dir: string) {
  const files = readdirSync(dir);

  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      if (!isExempt(filePath)) {
        walkDirectory(filePath);
      }
    } else if (
      filePath.endsWith('.tsx') ||
      filePath.endsWith('.ts') ||
      filePath.endsWith('.css') ||
      filePath.endsWith('.module.css')
    ) {
      checkFile(filePath);
    }
  });
}

// Run validation
const SEPARATOR_LENGTH = 60;
const TOP_FILES_COUNT = 20;
const DETAILED_FILES_COUNT = 5;

console.log('🎨 GVTEWAY Design System Compliance Validation');
console.log('='.repeat(SEPARATOR_LENGTH));
console.log('');

const srcDir = join(process.cwd(), 'src');
walkDirectory(srcDir);

// Group violations by type
const violationsByType = violations.reduce((acc, v) => {
  if (!acc[v.type]) acc[v.type] = [];
  acc[v.type].push(v);
  return acc;
}, {} as Record<string, Violation[]>);

// Group violations by file
const violationsByFile = violations.reduce((acc, v) => {
  if (!acc[v.file]) acc[v.file] = [];
  acc[v.file].push(v);
  return acc;
}, {} as Record<string, Violation[]>);

// Print summary
console.log('📊 SUMMARY');
console.log('-'.repeat(SEPARATOR_LENGTH));
console.log(`Total violations: ${violations.length}`);
console.log(`Files affected: ${Object.keys(violationsByFile).length}`);
console.log('');

// Print violations by type
console.log('📋 VIOLATIONS BY TYPE');
console.log('-'.repeat(SEPARATOR_LENGTH));
Object.entries(violationsByType).forEach(([type, viols]) => {
  console.log(`${type}: ${viols.length}`);
});
console.log('');

// Print top violators
console.log(`🔥 TOP ${TOP_FILES_COUNT} FILES WITH MOST VIOLATIONS`);
console.log('-'.repeat(SEPARATOR_LENGTH));
const sortedFiles = Object.entries(violationsByFile)
  .sort(([, a], [, b]) => b.length - a.length)
  .slice(0, TOP_FILES_COUNT);

sortedFiles.forEach(([file, viols], index) => {
  const relPath = file.replace(process.cwd(), '');
  console.log(`${index + 1}. ${relPath} (${viols.length} violations)`);
});
console.log('');

// Print detailed violations for worst offenders
if (sortedFiles.length > 0) {
  console.log(`🔍 DETAILED VIOLATIONS (Top ${DETAILED_FILES_COUNT} Files)`);
  console.log('-'.repeat(SEPARATOR_LENGTH));
  
  sortedFiles.slice(0, DETAILED_FILES_COUNT).forEach(([file, viols]) => {
    const relPath = file.replace(process.cwd(), '');
    console.log(`\n${relPath}:`);
    
    const violsByType = viols.reduce((acc, v) => {
      if (!acc[v.type]) acc[v.type] = 0;
      acc[v.type]++;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(violsByType).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}`);
    });
  });
  console.log('');
}

// Print compliance status
console.log('='.repeat(SEPARATOR_LENGTH));
if (violations.length === 0) {
  console.log('✅ 100% DESIGN SYSTEM COMPLIANCE ACHIEVED!');
  console.log('');
  process.exit(0);
} else {
  console.log('❌ DESIGN SYSTEM VIOLATIONS DETECTED');
  console.log('');
  console.log('📖 Remediation required:');
  console.log('   1. Replace Tailwind utilities with CSS Modules');
  console.log('   2. Replace hardcoded colors with CSS variables');
  console.log('   3. Replace directional properties with logical properties');
  console.log('   4. Replace inline styles with CSS Modules');
  console.log('');
  console.log('📚 See: /src/design-system/README.md');
  console.log('');
  process.exit(1);
}
