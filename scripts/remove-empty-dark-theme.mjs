#!/usr/bin/env node

/**
 * Remove empty dark theme sections from CSS modules
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname, relative } from 'path';

const GREEN = '\x1b[32m';
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

function fixFile(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  const relativePath = relative(process.cwd(), filePath);
  
  // Pattern to match empty dark theme sections - both formats
  const pattern1 = /\/\* ={40,}\s+DARK THEME\s+={40,} \*\/\s+\[data-theme="dark"\] \{\s*\/\*[^*]*\*\/\s*\/\*[^*]*\*\/\s*\}\s*/g;
  const pattern2 = /\/\* ={40,}\s+DARK THEME\s+={40,} \*\/\s+:global\(\[data-theme="dark"\]\) \{\s*\/\*[^*]*\*\/\s*\/\*[^*]*\*\/\s*\}\s*/g;
  
  const hasPattern1 = pattern1.test(content);
  const hasPattern2 = pattern2.test(content);
  
  if (!hasPattern1 && !hasPattern2) {
    return { path: relativePath, changed: false };
  }
  
  // Reset regex
  pattern1.lastIndex = 0;
  pattern2.lastIndex = 0;
  
  let updated = content.replace(pattern1, '').replace(pattern2, '');
  
  writeFileSync(filePath, updated, 'utf-8');
  
  return { path: relativePath, changed: true };
}

const modules = scanDirectory('src');
let fixed = 0;

modules.forEach(path => {
  const result = fixFile(path);
  if (result.changed) {
    fixed++;
    console.log(`${GREEN}✓${RESET} ${result.path}`);
  }
});

console.log(`\n${GREEN}✓ Removed empty dark theme sections from ${fixed} CSS modules${RESET}\n`);
