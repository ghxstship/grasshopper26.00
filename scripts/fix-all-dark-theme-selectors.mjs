#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

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

const srcDir = join(process.cwd(), 'src');
const allFiles = getAllCssModuleFiles(srcDir);

let fixedCount = 0;

allFiles.forEach(file => {
  let content = readFileSync(file, 'utf8');
  
  // Check if file has the problematic pattern (with or without trailing space)
  if (!content.match(/^\[data-theme="dark"\]\s*\{/m)) {
    return;
  }
  
  // Get the first class name
  const classMatch = content.match(/^\.([\w-]+)\s*\{/m);
  const firstClass = classMatch ? classMatch[1] : null;
  
  if (firstClass) {
    // Replace the problematic pattern (handles both with and without space before {)
    content = content.replace(
      /^\[data-theme="dark"\]\s*\{/gm,
      `:global([data-theme="dark"]) .${firstClass} {`
    );
    
    writeFileSync(file, content, 'utf8');
    const relativePath = file.replace(process.cwd() + '/', '');
    console.log(`✅ ${relativePath}`);
    fixedCount++;
  }
});

console.log(`\n✨ Fixed ${fixedCount} file(s)`);
