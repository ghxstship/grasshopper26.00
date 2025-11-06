#!/usr/bin/env node

/**
 * Design Token Validator
 * Validates that all components use design tokens
 * Run in CI/CD pipeline to enforce zero-tolerance policy
 */

import fs from 'fs';
import path from 'path';

interface ValidationError {
  file: string;
  line: number;
  column: number;
  violation: string;
  suggestion: string;
  severity: 'error' | 'warning';
}

const FORBIDDEN_PATTERNS = [
  // Hardcoded colors (hex)
  { 
    pattern: /#[0-9A-Fa-f]{3,8}(?![0-9A-Fa-f])/g,
    name: 'hardcoded hex color',
    suggestion: 'Use var(--color-*) or semantic color token',
    severity: 'error' as const,
    exceptions: ['#root', '#__next'], // Allow HTML IDs
  },
  
  // Hardcoded RGB/RGBA colors
  { 
    pattern: /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/g, 
    name: 'hardcoded RGB color',
    suggestion: 'Use var(--color-*) or semantic color token',
    severity: 'error' as const,
  },
  
  // Hardcoded spacing (px values in CSS)
  { 
    pattern: /:\s*\d+px(?!\s*\/)/g, 
    name: 'hardcoded pixel spacing',
    suggestion: 'Use var(--space-*) token or rem units',
    severity: 'warning' as const,
  },
  
  // Hardcoded font sizes
  { 
    pattern: /font-size:\s*\d+px/g, 
    name: 'hardcoded font size',
    suggestion: 'Use var(--font-size-*) token',
    severity: 'error' as const,
  },
  
  // Directional properties (should use logical)
  { 
    pattern: /(margin|padding)-(left|right):/g, 
    name: 'directional property (not RTL-friendly)',
    suggestion: 'Use margin-inline-start or margin-inline-end',
    severity: 'warning' as const,
  },
  
  // Text-align left/right
  { 
    pattern: /text-align:\s*(left|right)/g, 
    name: 'directional text-align (not RTL-friendly)',
    suggestion: 'Use text-align: start or text-align: end',
    severity: 'warning' as const,
  },
];

const EXCLUDED_DIRS = [
  'node_modules',
  '.next',
  'dist',
  'build',
  '.git',
  'coverage',
];

const EXCLUDED_FILES = [
  'tokens.css', // Design token definitions are allowed to have hardcoded values
  'tailwind.config.ts', // Tailwind config is allowed
  'globals.css', // Global styles with Tailwind
];

function shouldExcludeFile(filePath: string): boolean {
  return EXCLUDED_FILES.some(excluded => filePath.endsWith(excluded));
}

function validateFile(filePath: string): ValidationError[] {
  if (shouldExcludeFile(filePath)) {
    return [];
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const errors: ValidationError[] = [];
  
  lines.forEach((line, lineIndex) => {
    FORBIDDEN_PATTERNS.forEach(({ pattern, name, suggestion, severity, exceptions }) => {
      const matches = line.matchAll(pattern);
      
      for (const match of matches) {
        // Check exceptions
        if (exceptions && exceptions.some(exc => match[0].includes(exc))) {
          continue;
        }
        
        errors.push({
          file: filePath,
          line: lineIndex + 1,
          column: match.index || 0,
          violation: name,
          suggestion,
          severity,
        });
      }
    });
  });
  
  return errors;
}

function validateDirectory(dirPath: string): ValidationError[] {
  let allErrors: ValidationError[] = [];
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRS.includes(entry.name) && !entry.name.startsWith('.')) {
          allErrors = allErrors.concat(validateDirectory(fullPath));
        }
      } else if (entry.name.match(/\.(css|scss|tsx|jsx|ts|js)$/)) {
        allErrors = allErrors.concat(validateFile(fullPath));
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
  }
  
  return allErrors;
}

function groupErrorsByFile(errors: ValidationError[]): Map<string, ValidationError[]> {
  const grouped = new Map<string, ValidationError[]>();
  
  errors.forEach(error => {
    const existing = grouped.get(error.file) || [];
    existing.push(error);
    grouped.set(error.file, existing);
  });
  
  return grouped;
}

// Run validation
const srcPath = path.join(process.cwd(), 'src');
console.log('🔍 Validating design token usage...\n');

const errors = validateDirectory(srcPath);
const errorCount = errors.filter(e => e.severity === 'error').length;
const warningCount = errors.filter(e => e.severity === 'warning').length;

if (errors.length > 0) {
  const grouped = groupErrorsByFile(errors);
  
  console.error(`❌ Found ${errorCount} errors and ${warningCount} warnings:\n`);
  
  grouped.forEach((fileErrors, file) => {
    console.error(`\n📄 ${file}`);
    fileErrors.forEach(error => {
      const icon = error.severity === 'error' ? '  ❌' : '  ⚠️';
      console.error(`${icon} Line ${error.line}:${error.column}`);
      console.error(`     ${error.violation}`);
      console.error(`     💡 ${error.suggestion}`);
    });
  });
  
  console.error(`\n\n📊 Summary:`);
  console.error(`   Errors: ${errorCount}`);
  console.error(`   Warnings: ${warningCount}`);
  console.error(`   Total files with issues: ${grouped.size}`);
  
  if (errorCount > 0) {
    console.error('\n❌ Validation failed. Please fix all errors before committing.');
    process.exit(1);
  } else {
    console.warn('\n⚠️  Validation passed with warnings. Consider fixing warnings for better maintainability.');
    process.exit(0);
  }
} else {
  console.log('✅ All files comply with design token requirements!');
  console.log('   No hardcoded values found.');
  process.exit(0);
}
