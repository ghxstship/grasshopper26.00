#!/usr/bin/env node

/**
 * AGGRESSIVE Size Conversion
 * Converts ALL remaining hardcoded sizes to closest design tokens
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const srcDir = join(rootDir, 'src');

// Complete token map with closest matches
const SPACE_TOKENS = [
  { px: 0, token: 'var(--space-0)' },
  { px: 1, token: 'var(--space-px)' },
  { px: 2, token: 'var(--space-0-5)' },
  { px: 4, token: 'var(--space-1)' },
  { px: 6, token: 'var(--space-1-5)' },
  { px: 8, token: 'var(--space-2)' },
  { px: 10, token: 'var(--space-2-5)' },
  { px: 12, token: 'var(--space-3)' },
  { px: 14, token: 'var(--space-3-5)' },
  { px: 16, token: 'var(--space-4)' },
  { px: 20, token: 'var(--space-5)' },
  { px: 24, token: 'var(--space-6)' },
  { px: 28, token: 'var(--space-7)' },
  { px: 32, token: 'var(--space-8)' },
  { px: 36, token: 'var(--space-9)' },
  { px: 40, token: 'var(--space-10)' },
  { px: 44, token: 'var(--space-11)' },
  { px: 48, token: 'var(--space-12)' },
  { px: 56, token: 'var(--space-14)' },
  { px: 64, token: 'var(--space-16)' },
  { px: 80, token: 'var(--space-20)' },
  { px: 96, token: 'var(--space-24)' },
  { px: 112, token: 'var(--space-28)' },
  { px: 128, token: 'var(--space-32)' },
  { px: 144, token: 'var(--space-36)' },
  { px: 160, token: 'var(--space-40)' },
  { px: 192, token: 'var(--space-48)' },
  { px: 224, token: 'var(--space-56)' },
  { px: 256, token: 'var(--space-64)' },
  { px: 288, token: 'var(--space-72)' },
  { px: 320, token: 'var(--space-80)' },
  { px: 384, token: 'var(--space-96)' },
];

function findClosestToken(pxValue) {
  let closest = SPACE_TOKENS[0];
  let minDiff = Math.abs(pxValue - closest.px);
  
  for (const token of SPACE_TOKENS) {
    const diff = Math.abs(pxValue - token.px);
    if (diff < minDiff) {
      minDiff = diff;
      closest = token;
    }
  }
  
  return closest.token;
}

function getAllCSSFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  files.forEach((file) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        getAllCSSFiles(filePath, fileList);
      }
    } else if (file.endsWith('.css')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function convertAllSizes(filePath) {
  // Skip system files
  if (filePath.includes('tokens.css') || filePath.includes('globals.css')) {
    return 0;
  }

  let content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  let changed = false;
  let replacements = 0;

  const newLines = lines.map(line => {
    // Skip comments
    if (line.trim().startsWith('/*') || line.trim().startsWith('*') || line.trim().startsWith('//')) {
      return line;
    }

    // Skip lines that already use var(--
    if (line.includes('var(--')) {
      return line;
    }

    // Find hardcoded px values (excluding 1px, 2px, 3px for borders)
    const regex = /(padding|margin|gap|width|height|top|left|right|bottom|inset|min-width|max-width|min-height|max-height)(?:-(?:block|inline|start|end))?:\s*(\d+)px/g;
    
    let newLine = line;
    let match;
    
    while ((match = regex.exec(line)) !== null) {
      const property = match[1];
      const value = parseInt(match[2]);
      
      // Skip border widths (1px, 2px, 3px)
      if (value <= 3 && property.includes('border')) {
        continue;
      }
      
      // Skip very small values for borders
      if (value <= 3) {
        continue;
      }
      
      const token = findClosestToken(value);
      const oldPattern = `${property}: ${value}px`;
      const newPattern = `${property}: ${token}`;
      
      newLine = newLine.replace(oldPattern, newPattern);
      changed = true;
      replacements++;
    }
    
    return newLine;
  });

  if (changed) {
    writeFileSync(filePath, newLines.join('\n'), 'utf-8');
  }

  return replacements;
}

function main() {
  console.log('🔄 Converting ALL hardcoded sizes...\n');

  const cssFiles = getAllCSSFiles(srcDir);
  let totalFiles = 0;
  let totalReplacements = 0;

  cssFiles.forEach((file) => {
    const replacements = convertAllSizes(file);
    if (replacements > 0) {
      const relativePath = file.replace(rootDir + '/', '');
      console.log(`✓ ${relativePath} (${replacements} replacements)`);
      totalFiles++;
      totalReplacements += replacements;
    }
  });

  console.log(`\n✅ Complete!`);
  console.log(`   Files fixed: ${totalFiles}`);
  console.log(`   Total replacements: ${totalReplacements}`);
}

main();
