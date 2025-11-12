#!/usr/bin/env node

/**
 * Identify CSS Modules Missing Dark Theme Support
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, relative } from 'path';

const BLUE = '\x1b[34m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';

console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
console.log(`${BLUE}  CSS MODULES DARK THEME AUDIT${RESET}`);
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

const cssModules = scanDirectory('src');
const modulesWithDarkTheme = [];
const modulesWithoutDarkTheme = [];
const componentModules = [];
const pageModules = [];

cssModules.forEach(modulePath => {
  const content = readFileSync(modulePath, 'utf-8');
  const relativePath = relative(process.cwd(), modulePath);
  
  const hasDarkTheme = content.includes('[data-theme="dark"]');
  const isComponent = modulePath.includes('/design-system/components/');
  const isPage = modulePath.includes('/app/');
  
  if (hasDarkTheme) {
    modulesWithDarkTheme.push(relativePath);
  } else {
    modulesWithoutDarkTheme.push(relativePath);
    if (isComponent) {
      componentModules.push(relativePath);
    } else if (isPage) {
      pageModules.push(relativePath);
    }
  }
});

console.log(`${GREEN}✓ Total CSS Modules: ${cssModules.length}${RESET}`);
console.log(`${GREEN}✓ With Dark Theme: ${modulesWithDarkTheme.length} (${((modulesWithDarkTheme.length / cssModules.length) * 100).toFixed(1)}%)${RESET}`);
console.log(`${YELLOW}⚠ Without Dark Theme: ${modulesWithoutDarkTheme.length} (${((modulesWithoutDarkTheme.length / cssModules.length) * 100).toFixed(1)}%)${RESET}\n`);

if (componentModules.length > 0) {
  console.log(`${YELLOW}Component Modules Without Dark Theme (${componentModules.length}):${RESET}`);
  componentModules.slice(0, 20).forEach(path => console.log(`  - ${path}`));
  if (componentModules.length > 20) {
    console.log(`  ... and ${componentModules.length - 20} more`);
  }
  console.log();
}

if (pageModules.length > 0) {
  console.log(`${YELLOW}Page Modules Without Dark Theme (${pageModules.length}):${RESET}`);
  pageModules.slice(0, 20).forEach(path => console.log(`  - ${path}`));
  if (pageModules.length > 20) {
    console.log(`  ... and ${pageModules.length - 20} more`);
  }
  console.log();
}

// Analyze patterns
const needsDarkTheme = modulesWithoutDarkTheme.filter(path => {
  const content = readFileSync(path, 'utf-8');
  // Check if module uses color tokens
  return content.includes('var(--color-');
});

console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
console.log(`${BLUE}  ANALYSIS${RESET}`);
console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`);

console.log(`Modules using color tokens but missing dark theme: ${needsDarkTheme.length}`);
console.log(`Modules likely not needing dark theme: ${modulesWithoutDarkTheme.length - needsDarkTheme.length}`);
console.log(`(These may be utility classes, animations, or layout-only styles)\n`);

if (needsDarkTheme.length > 0) {
  console.log(`${YELLOW}Priority Modules to Fix (using color tokens):${RESET}`);
  needsDarkTheme.slice(0, 30).forEach(path => {
    console.log(`  - ${path}`);
  });
  if (needsDarkTheme.length > 30) {
    console.log(`  ... and ${needsDarkTheme.length - 30} more`);
  }
}

console.log(`\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`);
