#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Fix CSS Modules dark theme syntax errors
 * CSS Modules require at least one local class when using global selectors
 */

function getAllCssModuleFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllCssModuleFiles(filePath, fileList);
    } else if (file.endsWith('.module.css')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function getFirstClassName(content) {
  // Match class selectors like .className
  const match = content.match(/^\.([\w-]+)\s*\{/m);
  return match ? match[1] : null;
}

function fixFile(filePath) {
  let content = readFileSync(filePath, 'utf8');
  
  // Check if file has the problematic pattern
  if (!content.includes('[data-theme="dark"] {')) {
    return false;
  }
  
  const firstClass = getFirstClassName(content);
  
  if (firstClass) {
    // Replace with proper syntax using the first class
    content = content.replace(
      /^\[data-theme="dark"\] \{/gm,
      `:global([data-theme="dark"]) .${firstClass} {`
    );
  } else {
    // Fallback: use universal selector
    content = content.replace(
      /^\[data-theme="dark"\] \{/gm,
      ':global([data-theme="dark"]) * {'
    );
  }
  
  writeFileSync(filePath, content, 'utf8');
  return true;
}

console.log('🔧 Fixing CSS Modules dark theme syntax...\n');

const srcDir = join(process.cwd(), 'src');
const cssModuleFiles = getAllCssModuleFiles(srcDir);

let fixedCount = 0;

cssModuleFiles.forEach(file => {
  if (fixFile(file)) {
    const relativePath = file.replace(process.cwd() + '/', '');
    console.log(`✅ Fixed: ${relativePath}`);
    fixedCount++;
  }
});

console.log(`\n✨ Done! Fixed ${fixedCount} file(s).`);
