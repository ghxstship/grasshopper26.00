#!/usr/bin/env node

/**
 * Analyze which CSS modules actually need dark theme support
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, relative } from 'path';

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

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
const needsDarkTheme = [];
const layoutOnly = [];

cssModules.forEach(modulePath => {
  const content = readFileSync(modulePath, 'utf-8');
  const relativePath = relative(process.cwd(), modulePath);
  
  const hasDarkTheme = content.includes('[data-theme="dark"]') || content.includes(':global([data-theme="dark"])');
  
  if (!hasDarkTheme) {
    // Check if it uses semantic color tokens (already theme-aware)
    const usesSemanticTokens = content.includes('var(--color-text-primary)') || 
                                content.includes('var(--color-bg-primary)') ||
                                content.includes('var(--color-border-default)');
    
    // Check if it uses hardcoded black/white
    const usesHardcodedColors = content.includes('var(--color-black)') || 
                                 content.includes('var(--color-white)') ||
                                 content.match(/var\(--color-grey-[0-9]+\)/);
    
    // Layout-only modules (no colors at all)
    const hasNoColors = !content.includes('var(--color-');
    
    if (hasNoColors) {
      layoutOnly.push(relativePath);
    } else if (usesSemanticTokens && !usesHardcodedColors) {
      // Already theme-aware via semantic tokens
      layoutOnly.push(relativePath);
    } else if (usesHardcodedColors) {
      needsDarkTheme.push({ path: relativePath, content });
    }
  }
});

console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
console.log(`${BLUE}  DARK THEME ANALYSIS${RESET}`);
console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`);

console.log(`${GREEN}✓ Modules with dark theme: ${cssModules.length - needsDarkTheme.length - layoutOnly.length}${RESET}`);
console.log(`${YELLOW}⚠ Modules needing dark theme: ${needsDarkTheme.length}${RESET}`);
console.log(`${BLUE}ℹ Layout-only modules (no dark theme needed): ${layoutOnly.length}${RESET}\n`);

if (needsDarkTheme.length > 0) {
  console.log(`${YELLOW}Modules requiring dark theme implementation:${RESET}\n`);
  needsDarkTheme.forEach(({ path }) => {
    console.log(`  - ${path}`);
  });
}

console.log(`\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`);

process.exit(needsDarkTheme.length > 0 ? 1 : 0);
