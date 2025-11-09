#!/usr/bin/env tsx
/**
 * Design Token Validation Script
 * Validates that all components use design tokens exclusively
 * Run in CI/CD pipeline to prevent hardcoded values
 * 
 * Usage: npx tsx scripts/validate-design-tokens.ts
 */

import fs from 'fs';
import path from 'path';
import glob from 'glob';

interface ValidationError {
  file: string;
  line: number;
  column: number;
  violation: string;
  suggestion: string;
  severity: 'error' | 'warning';
}

const FORBIDDEN_PATTERNS = [
  // Hardcoded hex colors
  { 
    pattern: /#[0-9A-Fa-f]{3,8}(?![^<]*>)/g,
    name: 'hardcoded hex color',
    suggestion: 'Use var(--color-*) or semantic color token',
    severity: 'error' as const,
  },
  // Hardcoded RGB colors
  { 
    pattern: /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g,
    name: 'hardcoded RGB color',
    suggestion: 'Use var(--color-*) or semantic color token',
    severity: 'error' as const,
  },
  // Hardcoded RGBA colors
  { 
    pattern: /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/g,
    name: 'hardcoded RGBA color',
    suggestion: 'Use var(--color-*) with opacity or semantic color token',
    severity: 'error' as const,
  },
  // Hardcoded pixel spacing (but allow 0px, 1px, 2px for borders)
  { 
    pattern: /:\s*(?!0px|1px|2px)\d+px/g,
    name: 'hardcoded pixel spacing',
    suggestion: 'Use var(--space-*) token or rem units',
    severity: 'error' as const,
  },
  // Directional properties (should use logical)
  { 
    pattern: /(margin|padding)-(left|right):/g,
    name: 'directional property (not RTL-friendly)',
    suggestion: 'Use margin-inline-start/end or padding-inline-start/end',
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

// Files to exclude from validation
const EXCLUDED_PATTERNS = [
  '**/node_modules/**',
  '**/design-system/tokens/**',
  '**/lib/imageProcessing/**',
  '**/lib/ticketing/qr-codes.ts',
  '**/lib/tickets/qr-generator.ts',
  '**/lib/tickets/pdf-generator.ts',
  '**/lib/email/**',
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/*.spec.ts',
  '**/*.spec.tsx',
];

function validateFile(filePath: string): ValidationError[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const errors: ValidationError[] = [];
  
  lines.forEach((line, index) => {
    FORBIDDEN_PATTERNS.forEach(({ pattern, name, suggestion, severity }) => {
      const regex = new RegExp(pattern);
      let match;
      
      while ((match = regex.exec(line)) !== null) {
        errors.push({
          file: filePath,
          line: index + 1,
          column: match.index + 1,
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
  const patterns = [
    '**/*.css',
    '**/*.scss',
    '**/*.tsx',
    '**/*.ts',
    '**/*.jsx',
    '**/*.js',
  ];
  
  let allFiles: string[] = [];
  
  patterns.forEach(pattern => {
    const files = glob.sync(pattern, {
      cwd: dirPath,
      ignore: EXCLUDED_PATTERNS,
      absolute: true,
    });
    allFiles = allFiles.concat(files);
  });
  
  let allErrors: ValidationError[] = [];
  
  for (const file of allFiles) {
    const errors = validateFile(file);
    allErrors = allErrors.concat(errors);
  }
  
  return allErrors;
}

// Run validation
function main() {
  console.log('🔍 Validating design token usage...\n');
  
  const srcPath = path.join(process.cwd(), 'src');
  const errors = validateDirectory(srcPath);
  
  // Separate errors and warnings
  const criticalErrors = errors.filter(e => e.severity === 'error');
  const warnings = errors.filter(e => e.severity === 'warning');
  
  if (criticalErrors.length > 0) {
    console.error(`\n❌ ${criticalErrors.length} Design Token Violations Found:\n`);
    
    // Group by file
    const errorsByFile = criticalErrors.reduce((acc, error) => {
      if (!acc[error.file]) acc[error.file] = [];
      acc[error.file].push(error);
      return acc;
    }, {} as Record<string, ValidationError[]>);
    
    Object.entries(errorsByFile).forEach(([file, fileErrors]) => {
      console.error(`\n📄 ${file}`);
      fileErrors.forEach(error => {
        console.error(`  Line ${error.line}:${error.column} - ${error.violation}`);
        console.error(`  💡 ${error.suggestion}`);
      });
    });
  }
  
  if (warnings.length > 0) {
    console.warn(`\n⚠️  ${warnings.length} Warnings Found:\n`);
    
    const warningsByFile = warnings.reduce((acc, warning) => {
      if (!acc[warning.file]) acc[warning.file] = [];
      acc[warning.file].push(warning);
      return acc;
    }, {} as Record<string, ValidationError[]>);
    
    Object.entries(warningsByFile).forEach(([file, fileWarnings]) => {
      console.warn(`\n📄 ${file}`);
      fileWarnings.forEach(warning => {
        console.warn(`  Line ${warning.line}:${warning.column} - ${warning.violation}`);
        console.warn(`  💡 ${warning.suggestion}`);
      });
    });
  }
  
  if (criticalErrors.length === 0 && warnings.length === 0) {
    console.log('✅ All files comply with design token requirements!');
    console.log('🎉 Zero hardcoded values detected.');
    process.exit(0);
  } else {
    console.log(`\n📊 Summary:`);
    console.log(`   Errors: ${criticalErrors.length}`);
    console.log(`   Warnings: ${warnings.length}`);
    console.log(`   Total: ${errors.length}`);
    
    if (criticalErrors.length > 0) {
      console.error('\n❌ Validation failed. Please fix all errors before committing.');
      process.exit(1);
    } else {
      console.warn('\n⚠️  Warnings detected. Consider fixing them for better maintainability.');
      process.exit(0);
    }
  }
}

try {
  main();
} catch (error) {
  console.error('Fatal error during validation:', error);
  process.exit(1);
}
