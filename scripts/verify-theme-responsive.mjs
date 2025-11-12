#!/usr/bin/env node

/**
 * Theme & Responsive Verification Script
 * Validates design system implementation across the codebase
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const srcDir = join(rootDir, 'src');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const results = {
  totalFiles: 0,
  cssFiles: 0,
  tsxFiles: 0,
  issues: [],
  passed: [],
};

/**
 * Recursively get all files in directory
 */
function getAllFiles(dir, fileList = []) {
  const files = readdirSync(dir);

  files.forEach((file) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        getAllFiles(filePath, fileList);
      }
    } else {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Check CSS file for theme and responsive implementation
 */
function checkCSSFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const relativePath = filePath.replace(rootDir + '/', '');
  const checks = {
    hasDarkTheme: content.includes('[data-theme="dark"]') || content.includes(':global([data-theme="dark"])'),
    hasMediaQueries: content.includes('@media'),
    usesTokens: content.includes('var(--'),
    hasHardcodedColors: /(?:color|background|border):\s*#[0-9a-fA-F]{3,8}(?!\s*var)/.test(content),
    // Only flag hardcoded sizes if they're NOT in comments and NOT 1px/2px/3px borders
    hasHardcodedSizes: (() => {
      const lines = content.split('\n');
      return lines.some(line => {
        // Skip comments
        if (line.trim().startsWith('/*') || line.trim().startsWith('*') || line.trim().startsWith('//')) {
          return false;
        }
        // Skip lines with var(--
        if (line.includes('var(--')) {
          return false;
        }
        // Skip @media queries (breakpoints should use rem)
        if (line.includes('@media')) {
          return false;
        }
        // Check for hardcoded sizes (excluding 1px, 2px, 3px)
        const match = line.match(/(padding|margin|gap)(?:-(?:block|inline|start|end))?:\s*(\d+\.?\d*)(px|rem)/);
        if (match) {
          const property = match[1];
          const value = parseFloat(match[2]);
          const unit = match[3];
          
          // Allow 1px, 2px, 3px for borders
          if (value <= 3 && unit === 'px') {
            return false;
          }
          // Allow very specific decimal rem values (likely intentional)
          if (unit === 'rem' && value < 1 && value.toString().includes('.')) {
            return false;
          }
          // Only flag padding, margin, gap - not width/height (layout-specific)
          return true;
        }
        return false;
      });
    })(),
  };

  const issues = [];
  
  const MIN_FILE_SIZE_FOR_DARK_MODE = 100;
  const MIN_FILE_SIZE_FOR_RESPONSIVE = 200;
  const MIN_FILE_SIZE_FOR_TOKENS = 50;

  // Only check for dark theme in module.css files (not tokens.css)
  if (filePath.includes('.module.css') && !checks.hasDarkTheme && content.length > MIN_FILE_SIZE_FOR_DARK_MODE) {
    issues.push(`Missing [data-theme="dark"] support`);
  }

  if (!checks.hasMediaQueries && content.length > MIN_FILE_SIZE_FOR_RESPONSIVE && 
      !filePath.includes('tokens.css') && 
      !filePath.includes('globals.css') && 
      !filePath.includes('geometric-patterns.css')) {
    issues.push(`No responsive @media queries found`);
  }

  if (!checks.usesTokens && content.length > MIN_FILE_SIZE_FOR_TOKENS) {
    issues.push(`Not using CSS custom properties (var(--*))`);
  }

  if (checks.hasHardcodedColors && !filePath.includes('tokens.css')) {
    issues.push(`Contains hardcoded color values`);
  }

  if (checks.hasHardcodedSizes && !filePath.includes('tokens.css')) {
    issues.push(`Contains hardcoded size values (should use tokens)`);
  }

  return { relativePath, issues, checks };
}

/**
 * Check TSX file for theme usage
 */
function checkTSXFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const relativePath = filePath.replace(rootDir + '/', '');
  const checks = {
    usesThemeHook: content.includes('useTheme'),
    hasThemeProvider: content.includes('ThemeProvider'),
    hasInlineStyles: /style=\{\{/.test(content),
    hasTailwindClasses: /className=["'][^"']*(?:bg-|text-|border-|p-|m-|w-|h-)[^"']*["']/.test(content),
  };

  const issues = [];

  const MAX_TAILWIND_CLASSES = 5;
  const MAX_INLINE_STYLES = 2;

  // Check for Tailwind violations (should use CSS modules)
  if (checks.hasTailwindClasses && !filePath.includes('node_modules')) {
    const matches = content.match(/className=["'][^"']*(?:bg-|text-|border-|p-|m-|w-|h-)[^"']*["']/g);
    if (matches && matches.length > MAX_TAILWIND_CLASSES) {
      issues.push(`Excessive Tailwind utility classes (${matches.length} found) - should use CSS modules`);
    }
  }

  // Check for inline styles (should use CSS modules)
  // Exclude icon sizing (width/height for Lucide icons)
  if (checks.hasInlineStyles) {
    const matches = content.match(/style=\{\{[^}]+\}\}/g);
    if (matches && matches.length > MAX_INLINE_STYLES) {
      // Check if these are just icon sizing
      const iconSizing = matches.every(m => m.includes('width') && m.includes('height'));
      if (!iconSizing) {
        issues.push(`Inline styles found (${matches.length}) - should use CSS modules`);
      }
    }
  }

  return { relativePath, issues, checks };
}

/**
 * Main verification
 */
function main() {
  console.log(`${colors.bold}${colors.cyan}GVTEWAY Theme & Responsive Verification${colors.reset}\n`);
  console.log(`Scanning: ${srcDir}\n`);

  const allFiles = getAllFiles(srcDir);
  results.totalFiles = allFiles.length;

  // Check CSS files
  const cssFiles = allFiles.filter((f) => f.endsWith('.css'));
  results.cssFiles = cssFiles.length;

  console.log(`${colors.blue}Checking ${cssFiles.length} CSS files...${colors.reset}`);
  cssFiles.forEach((file) => {
    const result = checkCSSFile(file);
    if (result.issues.length > 0) {
      results.issues.push(result);
    } else {
      results.passed.push(result.relativePath);
    }
  });

  // Check TSX files
  const tsxFiles = allFiles.filter((f) => f.endsWith('.tsx'));
  results.tsxFiles = tsxFiles.length;

  console.log(`${colors.blue}Checking ${tsxFiles.length} TSX files...${colors.reset}\n`);
  tsxFiles.forEach((file) => {
    const result = checkTSXFile(file);
    if (result.issues.length > 0) {
      results.issues.push(result);
    } else {
      results.passed.push(result.relativePath);
    }
  });

  // Print results
  console.log(`${colors.bold}Results:${colors.reset}\n`);
  console.log(`Total files scanned: ${results.totalFiles}`);
  console.log(`CSS files: ${results.cssFiles}`);
  console.log(`TSX files: ${results.tsxFiles}`);
  console.log(`${colors.green}Passed: ${results.passed.length}${colors.reset}`);
  console.log(`${colors.red}Issues: ${results.issues.length}${colors.reset}\n`);

  if (results.issues.length > 0) {
    console.log(`${colors.bold}${colors.red}Files with Issues:${colors.reset}\n`);
    results.issues.forEach(({ relativePath, issues }) => {
      console.log(`${colors.yellow}${relativePath}${colors.reset}`);
      issues.forEach((issue) => {
        console.log(`  ${colors.red}✗${colors.reset} ${issue}`);
      });
      console.log('');
    });
  }

  // Summary
  console.log(`${colors.bold}Summary:${colors.reset}`);
  const passRate = ((results.passed.length / (results.passed.length + results.issues.length)) * 100).toFixed(1);
  console.log(`Pass rate: ${passRate}%`);

  if (results.issues.length === 0) {
    console.log(`${colors.green}${colors.bold}✓ All checks passed!${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.yellow}⚠ ${results.issues.length} files need attention${colors.reset}`);
    process.exit(0); // Don't fail, just report
  }
}

main();
