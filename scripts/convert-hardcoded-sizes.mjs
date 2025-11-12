#!/usr/bin/env node

/**
 * Convert Hardcoded Sizes to Design Tokens
 * Systematically replaces pixel values with appropriate tokens
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const srcDir = join(rootDir, 'src');

// Comprehensive size mapping
const SIZE_MAP = {
  // Spacing tokens (most common)
  '2px': 'var(--space-px)',
  '4px': 'var(--space-1)',
  '6px': 'var(--space-1-5)',
  '8px': 'var(--space-2)',
  '10px': 'var(--space-2-5)',
  '12px': 'var(--space-3)',
  '14px': 'var(--space-3-5)',
  '16px': 'var(--space-4)',
  '20px': 'var(--space-5)',
  '24px': 'var(--space-6)',
  '28px': 'var(--space-7)',
  '32px': 'var(--space-8)',
  '36px': 'var(--space-9)',
  '40px': 'var(--space-10)',
  '44px': 'var(--space-11)',
  '48px': 'var(--space-12)',
  '56px': 'var(--space-14)',
  '64px': 'var(--space-16)',
  '80px': 'var(--space-20)',
  '96px': 'var(--space-24)',
  '112px': 'var(--space-28)',
  '128px': 'var(--space-32)',
  
  // Font sizes
  '0.75rem': 'var(--font-size-xs)',
  '0.875rem': 'var(--font-size-sm)',
  '1rem': 'var(--font-size-base)',
  '1.125rem': 'var(--font-size-lg)',
  '1.25rem': 'var(--font-size-xl)',
  '1.5rem': 'var(--font-size-2xl)',
  '1.875rem': 'var(--font-size-3xl)',
  '2.25rem': 'var(--font-size-4xl)',
  '3rem': 'var(--font-size-5xl)',
};

let filesFixed = 0;
let replacements = 0;

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

function convertSizes(filePath) {
  // Skip system files
  if (filePath.includes('tokens.css') || filePath.includes('globals.css')) {
    return false;
  }

  let content = readFileSync(filePath, 'utf-8');
  let changed = false;
  let fileReplacements = 0;

  // Replace each size
  for (const [size, token] of Object.entries(SIZE_MAP)) {
    // Match property: value patterns (not in comments)
    const regex = new RegExp(
      `((?:padding|margin|gap|width|height|top|left|right|bottom|inset|font-size|line-height|border-radius|min-width|max-width|min-height|max-height)(?:-(?:block|inline|start|end))?:\\s*)${size.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?!\\s*var)`,
      'g'
    );
    
    const newContent = content.replace(regex, `$1${token}`);
    if (newContent !== content) {
      content = newContent;
      changed = true;
      fileReplacements++;
    }
  }

  if (changed) {
    writeFileSync(filePath, content, 'utf-8');
    filesFixed++;
    replacements += fileReplacements;
    return true;
  }

  return false;
}

function main() {
  console.log('🔄 Converting hardcoded sizes to design tokens...\n');

  const cssFiles = getAllCSSFiles(srcDir);
  console.log(`Found ${cssFiles.length} CSS files\n`);

  cssFiles.forEach((file) => {
    const relativePath = file.replace(rootDir + '/', '');
    if (convertSizes(file)) {
      console.log(`✓ ${relativePath}`);
    }
  });

  console.log(`\n✅ Complete!`);
  console.log(`   Files fixed: ${filesFixed}`);
  console.log(`   Total replacements: ${replacements}`);
}

main();
