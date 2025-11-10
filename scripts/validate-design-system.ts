#!/usr/bin/env ts-node
/**
 * Design System Validation Script
 * GHXSTSHIP Monochromatic Design System
 * Validates compliance with atomic design principles and GHXSTSHIP aesthetic
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  category: string;
  passed: boolean;
  message: string;
  details?: string[];
}

const results: ValidationResult[] = [];

// Colors to check for violations
const FORBIDDEN_COLORS = [
  /#[0-9A-Fa-f]{3,8}(?![0-9A-Fa-f])/g, // Hex colors
  /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g, // RGB
  /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/g, // RGBA
];

// Hardcoded spacing patterns
const FORBIDDEN_SPACING = /:\s*\d+px(?!\s*\/)/g;

// Directional properties (not RTL-friendly)
const FORBIDDEN_DIRECTIONAL = /(margin|padding|border|inset)-(left|right):/g;

function validateFile(filePath: string): ValidationResult[] {
  const fileResults: ValidationResult[] = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  // Skip token files and certain exempted files
  if (filePath.includes('/tokens/') || filePath.includes('.test.')) {
    return fileResults;
  }
  
  lines.forEach((line, index) => {
    // Check for hardcoded colors
    FORBIDDEN_COLORS.forEach((pattern) => {
      if (pattern.test(line) && !line.includes('var(--')) {
        fileResults.push({
          category: 'Hardcoded Colors',
          passed: false,
          message: `${filePath}:${index + 1}`,
          details: [`Found hardcoded color: ${line.trim()}`],
        });
      }
    });
    
    // Check for hardcoded spacing
    if (FORBIDDEN_SPACING.test(line) && !line.includes('var(--')) {
      fileResults.push({
        category: 'Hardcoded Spacing',
        passed: false,
        message: `${filePath}:${index + 1}`,
        details: [`Found hardcoded spacing: ${line.trim()}`],
      });
    }
    
    // Check for directional properties
    if (FORBIDDEN_DIRECTIONAL.test(line)) {
      fileResults.push({
        category: 'Directional Properties',
        passed: false,
        message: `${filePath}:${index + 1}`,
        details: [`Use logical properties (inline-start/end): ${line.trim()}`],
      });
    }
  });
  
  return fileResults;
}

function validateDirectory(dirPath: string): void {
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file.name);
    
    if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
      validateDirectory(fullPath);
    } else if (file.name.match(/\.(css|scss|tsx|jsx|ts|js)$/)) {
      const fileResults = validateFile(fullPath);
      results.push(...fileResults);
    }
  });
}

function checkAtomicStructure(): ValidationResult {
  const designSystemPath = path.join(process.cwd(), 'src/design-system');
  const requiredDirs = ['components/atoms', 'components/molecules', 'components/organisms', 'components/templates', 'tokens'];
  
  const missingDirs = requiredDirs.filter(dir => {
    return !fs.existsSync(path.join(designSystemPath, dir));
  });
  
  return {
    category: 'Atomic Design Structure',
    passed: missingDirs.length === 0,
    message: missingDirs.length === 0 
      ? 'All required directories exist' 
      : 'Missing required directories',
    details: missingDirs.length > 0 ? missingDirs : undefined,
  };
}

function checkTokenSystem(): ValidationResult {
  const tokensPath = path.join(process.cwd(), 'src/design-system/tokens');
  const requiredFiles = ['tokens.css', 'primitives/colors.ts', 'semantic/colors.ts'];
  
  const missingFiles = requiredFiles.filter(file => {
    return !fs.existsSync(path.join(tokensPath, file));
  });
  
  return {
    category: 'Token System',
    passed: missingFiles.length === 0,
    message: missingFiles.length === 0 
      ? 'All required token files exist' 
      : 'Missing required token files',
    details: missingFiles.length > 0 ? missingFiles : undefined,
  };
}

function checkGHXSTSHIPCompliance(): ValidationResult[] {
  const results: ValidationResult[] = [];
  const tokensPath = path.join(process.cwd(), 'src/design-system/tokens/tokens.css');
  
  if (!fs.existsSync(tokensPath)) {
    return [{
      category: 'GHXSTSHIP Compliance',
      passed: false,
      message: 'tokens.css not found',
    }];
  }
  
  const content = fs.readFileSync(tokensPath, 'utf-8');
  
  // Check for monochromatic palette
  const hasColorViolations = content.match(/#[0-9A-Fa-f]{6}(?!00|FF|[0-9A-F]{2})/gi)?.some(color => {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return r !== g || g !== b; // Not grayscale
  });
  
  results.push({
    category: 'GHXSTSHIP - Monochromatic',
    passed: !hasColorViolations,
    message: hasColorViolations 
      ? 'Found non-grayscale colors in tokens' 
      : 'All colors are monochromatic',
  });
  
  // Check for hard edges (no border-radius)
  const hasRoundedCorners = content.includes('border-radius') && 
    !content.match(/--radius-[^:]+:\s*0/g);
  
  results.push({
    category: 'GHXSTSHIP - Hard Edges',
    passed: !hasRoundedCorners,
    message: hasRoundedCorners 
      ? 'Found rounded corners (should be 0)' 
      : 'All borders are hard-edged',
  });
  
  // Check for 3px borders
  const has3pxBorder = content.includes('--border-width-3') || content.includes('--border-width-default: 3px');
  
  results.push({
    category: 'GHXSTSHIP - 3px Borders',
    passed: has3pxBorder,
    message: has3pxBorder 
      ? '3px border standard defined' 
      : 'Missing 3px border standard',
  });
  
  // Check for geometric shadows
  const hasGeometricShadows = content.match(/--shadow-[^:]+:\s*\d+px\s+\d+px\s+0\s+#/g);
  
  results.push({
    category: 'GHXSTSHIP - Geometric Shadows',
    passed: !!hasGeometricShadows && hasGeometricShadows.length > 0,
    message: hasGeometricShadows 
      ? 'Geometric shadows defined' 
      : 'Missing geometric shadow definitions',
  });
  
  return results;
}

// Run validation
console.log('\n🔍 GHXSTSHIP Design System Validation\n');
console.log('=====================================\n');

// Check atomic structure
results.push(checkAtomicStructure());

// Check token system
results.push(checkTokenSystem());

// Check GHXSTSHIP compliance
results.push(...checkGHXSTSHIPCompliance());

// Validate files
const designSystemPath = path.join(process.cwd(), 'src/design-system');
if (fs.existsSync(designSystemPath)) {
  validateDirectory(designSystemPath);
}

// Group results by category
const grouped = results.reduce((acc, result) => {
  if (!acc[result.category]) {
    acc[result.category] = [];
  }
  acc[result.category].push(result);
  return acc;
}, {} as Record<string, ValidationResult[]>);

// Print results
let totalPassed = 0;
let totalFailed = 0;

Object.entries(grouped).forEach(([category, categoryResults]) => {
  const passed = categoryResults.filter(r => r.passed).length;
  const failed = categoryResults.filter(r => !r.passed).length;
  
  totalPassed += passed;
  totalFailed += failed;
  
  console.log(`\n${category}:`);
  console.log(`  ✅ Passed: ${passed}`);
  if (failed > 0) {
    console.log(`  ❌ Failed: ${failed}`);
    categoryResults.filter(r => !r.passed).slice(0, 5).forEach(result => {
      console.log(`     - ${result.message}`);
      if (result.details) {
        result.details.slice(0, 2).forEach(detail => {
          console.log(`       ${detail}`);
        });
      }
    });
    if (failed > 5) {
      console.log(`     ... and ${failed - 5} more`);
    }
  }
});

console.log('\n=====================================');
console.log(`\nTotal: ${totalPassed} passed, ${totalFailed} failed\n`);

if (totalFailed > 0) {
  console.log('❌ Validation failed. Please fix the issues above.\n');
  process.exit(1);
} else {
  console.log('✅ All validations passed!\n');
  process.exit(0);
}
