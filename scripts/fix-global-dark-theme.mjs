#!/usr/bin/env node

/**
 * Fix :global([data-theme="dark"]) * selectors
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
  
  // Pattern to match :global([data-theme="dark"]) * with empty content
  const pattern = /:global\(\[data-theme="dark"\]\) \* \{\s*\/\*[^*]*\*\/\s*\/\*[^*]*\*\/\s*\}/g;
  
  if (!pattern.test(content)) {
    return { path: relativePath, changed: false };
  }
  
  // Remove these empty sections entirely
  const updated = content.replace(pattern, '').replace(/\/\* ={40,}\s+DARK THEME\s+={40,} \*\/\s*\n\s*\n/g, '');
  
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

console.log(`\n${GREEN}✓ Fixed ${fixed} CSS modules${RESET}\n`);
