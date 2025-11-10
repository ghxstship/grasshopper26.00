#!/usr/bin/env node

/**
 * Design System Compliance Enforcement Script
 * Zero tolerance for design system violations
 * Node.js version (works without bash/grep)
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// ANSI colors
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

let totalViolations = 0;

// Exemptions
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

function isExempt(filePath) {
  return exemptPaths.some(exempt => filePath.includes(exempt));
}

function checkTailwindUtilities(dir) {
  const violations = [];
  
  function walk(directory) {
    const files = readdirSync(directory);
    
    files.forEach(file => {
      const filePath = join(directory, file);
      if (isExempt(filePath)) return;
      
      const stat = statSync(filePath);
      
      if (stat.isDirectory()) {
        walk(filePath);
      } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        const content = readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach((line, idx) => {
          // Check for Tailwind utility classes
          if (/className=["'][^"']*(?:bg-|text-|border-|p-|m-|px-|py-|mx-|my-|ml-|mr-|mt-|mb-|w-|h-|flex|grid|gap-|rounded-)/.test(line)) {
            violations.push({
              file: relative(rootDir, filePath),
              line: idx + 1,
              content: line.trim().substring(0, 80)
            });
          }
        });
      }
    });
  }
  
  walk(dir);
  return violations;
}

function checkInlineStyles(dir) {
  const violations = [];
  
  function walk(directory) {
    const files = readdirSync(directory);
    
    files.forEach(file => {
      const filePath = join(directory, file);
      if (isExempt(filePath)) return;
      
      const stat = statSync(filePath);
      
      if (stat.isDirectory()) {
        walk(filePath);
      } else if (filePath.endsWith('.tsx')) {
        const content = readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach((line, idx) => {
          if (/style=\{/.test(line)) {
            violations.push({
              file: relative(rootDir, filePath),
              line: idx + 1,
              content: line.trim().substring(0, 80)
            });
          }
        });
      }
    });
  }
  
  walk(dir);
  return violations;
}

function checkDirectionalProperties(dir) {
  const violations = [];
  
  function walk(directory) {
    const files = readdirSync(directory);
    
    files.forEach(file => {
      const filePath = join(directory, file);
      if (isExempt(filePath)) return;
      
      const stat = statSync(filePath);
      
      if (stat.isDirectory()) {
        walk(filePath);
      } else if (filePath.endsWith('.css') || filePath.endsWith('.module.css')) {
        const content = readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach((line, idx) => {
          if (/(?:margin-left|margin-right|padding-left|padding-right|text-align:\s*(?:left|right)|float:\s*(?:left|right))/.test(line)) {
            violations.push({
              file: relative(rootDir, filePath),
              line: idx + 1,
              content: line.trim().substring(0, 80)
            });
          }
        });
      }
    });
  }
  
  walk(dir);
  return violations;
}

function checkHardcodedColors(dir) {
  const violations = [];
  
  function walk(directory) {
    const files = readdirSync(directory);
    
    files.forEach(file => {
      const filePath = join(directory, file);
      if (isExempt(filePath)) return;
      
      const stat = statSync(filePath);
      
      if (stat.isDirectory()) {
        walk(filePath);
      } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        const content = readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach((line, idx) => {
          // Skip lines with eslint-disable comments
          if (line.includes('eslint-disable-line no-restricted-syntax')) return;
          
          if (/#[0-9A-Fa-f]{3,6}/.test(line)) {
            violations.push({
              file: relative(rootDir, filePath),
              line: idx + 1,
              content: line.trim().substring(0, 80)
            });
          }
        });
      }
    });
  }
  
  walk(dir);
  return violations;
}

// Run checks
console.log('🎨 GVTEWAY Design System Compliance Check');
console.log('==========================================');
console.log('');

const srcDir = join(rootDir, 'src');

// Check 1: Tailwind utilities
console.log('🔍 Checking for Tailwind utility classes...');
const tailwindViolations = checkTailwindUtilities(srcDir);
if (tailwindViolations.length > 0) {
  console.log(`${YELLOW}⚠ Found ${tailwindViolations.length} Tailwind utility class violations${RESET}`);
  totalViolations += tailwindViolations.length;
  
  // Show top 5
  console.log('   Top violations:');
  tailwindViolations.slice(0, 5).forEach(v => {
    console.log(`   - ${v.file}:${v.line}`);
  });
} else {
  console.log(`${GREEN}✓ No Tailwind utility classes found${RESET}`);
}

console.log('');

// Check 2: Inline styles
console.log('🔍 Checking for inline styles...');
const inlineViolations = checkInlineStyles(srcDir);
if (inlineViolations.length > 0) {
  console.log(`${YELLOW}⚠ Found ${inlineViolations.length} inline style usages${RESET}`);
  totalViolations += inlineViolations.length;
  
  // Show top 5
  console.log('   Top violations:');
  inlineViolations.slice(0, 5).forEach(v => {
    console.log(`   - ${v.file}:${v.line}`);
  });
} else {
  console.log(`${GREEN}✓ No inline styles found${RESET}`);
}

console.log('');

// Check 3: Directional properties
console.log('🔍 Checking for directional properties...');
const directionalViolations = checkDirectionalProperties(srcDir);
if (directionalViolations.length > 0) {
  console.log(`${YELLOW}⚠ Found ${directionalViolations.length} directional property violations${RESET}`);
  totalViolations += directionalViolations.length;
  
  // Show top 5
  console.log('   Top violations:');
  directionalViolations.slice(0, 5).forEach(v => {
    console.log(`   - ${v.file}:${v.line}`);
  });
} else {
  console.log(`${GREEN}✓ No directional properties found${RESET}`);
}

console.log('');

// Check 4: Hardcoded colors
console.log('🔍 Checking for hardcoded colors...');
const colorViolations = checkHardcodedColors(srcDir);
if (colorViolations.length > 0) {
  console.log(`${YELLOW}⚠ Found ${colorViolations.length} hardcoded color violations${RESET}`);
  totalViolations += colorViolations.length;
  
  // Show top 5
  console.log('   Top violations:');
  colorViolations.slice(0, 5).forEach(v => {
    console.log(`   - ${v.file}:${v.line}`);
  });
} else {
  console.log(`${GREEN}✓ No hardcoded colors found${RESET}`);
}

console.log('');
console.log('==========================================');

if (totalViolations === 0) {
  console.log(`${GREEN}✓ 100% DESIGN SYSTEM COMPLIANCE ACHIEVED!${RESET}`);
  console.log('');
  process.exit(0);
} else {
  console.log(`${RED}✗ Total violations: ${totalViolations}${RESET}`);
  console.log('');
  console.log('📖 See DESIGN_SYSTEM_COMPLIANCE_REPORT.md for detailed analysis');
  console.log('📖 See COMPLIANCE_QUICK_REFERENCE.md for remediation guide');
  console.log('');
  process.exit(1);
}
