#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

/**
 * Fix all CSS Modules with [data-theme="dark"] syntax errors
 */

// Find all files with the problematic pattern
const files = execSync(
  'grep -rl \'^\[data-theme="dark"\] {\' src --include="*.module.css"',
  { encoding: 'utf8' }
)
  .trim()
  .split('\n')
  .filter(Boolean);

console.log(`Found ${files.length} files to fix\n`);

files.forEach(file => {
  let content = readFileSync(file, 'utf8');
  
  // Get the first class name
  const classMatch = content.match(/^\.([\w-]+)\s*\{/m);
  const firstClass = classMatch ? classMatch[1] : null;
  
  if (firstClass) {
    // Replace the problematic pattern
    content = content.replace(
      /^\[data-theme="dark"\] \{$/gm,
      `:global([data-theme="dark"]) .${firstClass} {`
    );
    
    writeFileSync(file, content, 'utf8');
    console.log(`✅ Fixed: ${file}`);
  } else {
    console.log(`⚠️  Skipped (no class found): ${file}`);
  }
});

console.log(`\n✨ Done!`);
