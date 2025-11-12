#!/usr/bin/env node

/**
 * Fix bare [data-theme="dark"] selectors in CSS modules
 * CSS Modules require local selectors, so we need to scope to :global()
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
  
  // Replace bare [data-theme="dark"] with :global([data-theme="dark"])
  const pattern = /^\[data-theme="dark"\] \{$/gm;
  
  if (!pattern.test(content)) {
    return { path: relativePath, changed: false };
  }
  
  // Reset regex
  pattern.lastIndex = 0;
  
  const updated = content.replace(pattern, ':global([data-theme="dark"]) {');
  
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
