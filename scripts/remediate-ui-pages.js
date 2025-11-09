#!/usr/bin/env node

/**
 * UI Pages Design Token Remediation Script
 * 
 * This script systematically replaces hardcoded gradients, colors, and styles
 * with design token CSS variables across all UI pages.
 * 
 * Usage: node scripts/remediate-ui-pages.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define all replacement patterns
const replacements = [
  // Background gradients
  {
    pattern: /className="([^"]*?)bg-gradient-to-br from-black via-purple-950 to-black([^"]*)"/g,
    replacement: 'className="$1$2" style={{ background: \'var(--gradient-hero)\' }}',
    description: 'Hero gradient background'
  },
  {
    pattern: /className="([^"]*?)bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700([^"]*)"/g,
    replacement: 'className="$1$2" style={{ background: \'var(--gradient-brand-primary)\' }}',
    description: 'Primary button gradient with hover'
  },
  {
    pattern: /className="([^"]*?)bg-gradient-to-r from-purple-600 to-pink-600([^"]*)"/g,
    replacement: 'className="$1$2" style={{ background: \'var(--gradient-brand-primary)\' }}',
    description: 'Primary gradient'
  },
  {
    pattern: /className="([^"]*?)bg-gradient-to-r from-purple-900 to-pink-900([^"]*)"/g,
    replacement: 'className="$1$2" style={{ background: \'var(--gradient-brand-dark)\' }}',
    description: 'Dark gradient'
  },
  {
    pattern: /className="([^"]*?)bg-gradient-to-r from-purple-400 to-pink-400([^"]*?)bg-clip-text text-transparent([^"]*)"/g,
    replacement: 'className="$1$3 bg-clip-text text-transparent" style={{ backgroundImage: \'var(--gradient-brand-primary)\' }}',
    description: 'Text gradient'
  },
];

function remediateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;
  let changes = 0;
  
  for (const { pattern, replacement, description } of replacements) {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      content = content.replace(pattern, replacement);
      changed = true;
      changes += matches.length;
      console.log(`  ✓ ${description}: ${matches.length} replacement(s)`);
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }
  
  return { changed, changes };
}

function findPageFiles(dir) {
  const files = [];
  
  function walk(directory) {
    const items = fs.readdirSync(directory);
    
    for (const item of items) {
      const fullPath = path.join(directory, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (item === 'page.tsx') {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

function main() {
  console.log('🎨 UI Pages Design Token Remediation');
  console.log('=====================================\n');
  
  const appDir = path.join(process.cwd(), 'src', 'app');
  const pageFiles = findPageFiles(appDir);
  
  console.log(`📁 Found ${pageFiles.length} page files\n`);
  
  let totalFilesChanged = 0;
  let totalChanges = 0;
  
  for (const filePath of pageFiles) {
    const relativePath = path.relative(process.cwd(), filePath);
    console.log(`Processing: ${relativePath}`);
    
    const { changed, changes } = remediateFile(filePath);
    
    if (changed) {
      totalFilesChanged++;
      totalChanges += changes;
    } else {
      console.log('  ✓ Already compliant');
    }
    console.log('');
  }
  
  console.log('=====================================');
  console.log('✅ Remediation Complete!\n');
  console.log(`Files changed: ${totalFilesChanged}/${pageFiles.length}`);
  console.log(`Total changes: ${totalChanges}\n`);
  console.log('Next steps:');
  console.log('1. Review changes: git diff');
  console.log('2. Run tests: npm test');
  console.log('3. Run linter: npm run lint');
  console.log('4. Update audit document');
}

main();
