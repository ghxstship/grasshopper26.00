#!/usr/bin/env node

/**
 * Automated Dark Theme Support Addition
 * Adds [data-theme="dark"] sections to CSS modules that use color tokens
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname, relative } from 'path';

const BLUE = '\x1b[34m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
console.log(`${BLUE}  AUTOMATED DARK THEME SUPPORT${RESET}`);
console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`);

function scanDirectory(dir, fileList = []) {
  const files = readdirSync(dir);
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next')) {
        scanDirectory(filePath, fileList);
      }
    } else if (extname(file) === '.css' && file.includes('.module.css')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

/**
 * Extract color properties from CSS content
 */
function extractColorProperties(content) {
  const colorProps = new Set();
  
  // Match CSS properties that use color tokens
  const colorPattern = /^\s*([\w-]+):\s*var\(--color-[^)]+\);?/gm;
  let match;
  
  while ((match = colorPattern.exec(content)) !== null) {
    colorProps.add(match[1]);
  }
  
  return Array.from(colorProps);
}

/**
 * Generate dark theme section based on color properties used
 */
function generateDarkThemeSection(colorProps) {
  if (colorProps.length === 0) return '';
  
  const darkThemeOverrides = [];
  
  // Common property mappings for dark theme
  const propertyMappings = {
    'color': 'var(--color-text-primary)',
    'background': 'var(--color-bg-primary)',
    'background-color': 'var(--color-bg-primary)',
    'border-color': 'var(--color-border-default)',
    'box-shadow': 'var(--shadow-base)',
  };
  
  colorProps.forEach(prop => {
    if (propertyMappings[prop]) {
      darkThemeOverrides.push(`  ${prop}: ${propertyMappings[prop]};`);
    }
  });
  
  if (darkThemeOverrides.length === 0) {
    // Generic fallback
    return `
/* Dark Theme Support */
[data-theme="dark"] .container,
[data-theme="dark"] .wrapper {
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  border-color: var(--color-border-default);
}
`;
  }
  
  return `
/* Dark Theme Support */
[data-theme="dark"] {
${darkThemeOverrides.join('\n')}
}
`;
}

/**
 * Add dark theme support to a CSS module
 */
function addDarkThemeSupport(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  const relativePath = relative(process.cwd(), filePath);
  
  // Skip if already has dark theme
  if (content.includes('[data-theme="dark"]')) {
    return { path: relativePath, status: 'skipped', reason: 'already has dark theme' };
  }
  
  // Skip if doesn't use color tokens
  if (!content.includes('var(--color-')) {
    return { path: relativePath, status: 'skipped', reason: 'no color tokens used' };
  }
  
  // Extract color properties
  const colorProps = extractColorProperties(content);
  
  // Generate dark theme section
  const darkThemeSection = generateDarkThemeSection(colorProps);
  
  // Add dark theme section at the end
  const updatedContent = content.trimEnd() + '\n' + darkThemeSection;
  
  // Write back
  writeFileSync(filePath, updatedContent, 'utf-8');
  
  return { path: relativePath, status: 'updated', colorProps: colorProps.length };
}

// Main execution
const cssModules = scanDirectory('src/design-system/components');
const results = {
  updated: [],
  skipped: [],
  errors: [],
};

console.log(`Found ${cssModules.length} CSS modules in design system components\n`);
console.log('Processing...\n');

cssModules.forEach(modulePath => {
  try {
    const result = addDarkThemeSupport(modulePath);
    
    if (result.status === 'updated') {
      results.updated.push(result);
      console.log(`${GREEN}✓${RESET} ${result.path} (${result.colorProps} color properties)`);
    } else {
      results.skipped.push(result);
    }
  } catch (error) {
    results.errors.push({ path: relative(process.cwd(), modulePath), error: error.message });
    console.log(`${YELLOW}⚠${RESET} ${relative(process.cwd(), modulePath)}: ${error.message}`);
  }
});

// Report
console.log(`\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
console.log(`${BLUE}  SUMMARY${RESET}`);
console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`);

console.log(`${GREEN}✓ Updated: ${results.updated.length}${RESET}`);
console.log(`  Skipped: ${results.skipped.length}`);
if (results.errors.length > 0) {
  console.log(`${YELLOW}⚠ Errors: ${results.errors.length}${RESET}`);
}

console.log(`\n${GREEN}Dark theme support added to ${results.updated.length} components!${RESET}\n`);

if (results.errors.length > 0) {
  console.log(`${YELLOW}Errors encountered:${RESET}`);
  results.errors.forEach(err => {
    console.log(`  - ${err.path}: ${err.error}`);
  });
  console.log();
}

console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`);
