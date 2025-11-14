#!/usr/bin/env node
/**
 * Batch fix hardcoded pixel values in CSS files
 * Replaces common hardcoded pixels with design tokens
 */

import fs from 'fs';
import path from 'path';
import glob from 'glob';

const PIXEL_TO_TOKEN_MAP = {
  '2px': 'var(--space-0-5)',
  '3px': 'var(--space-0-5)',
  '4px': 'var(--space-1)',
  '5px': 'var(--space-1)',
  '6px': 'var(--space-1-5)',
  '7px': 'var(--space-2)',
  '8px': 'var(--space-2)',
  '10px': 'var(--space-2-5)',
  '12px': 'var(--space-3)',
  '14px': 'var(--space-3-5)',
  '16px': 'var(--space-4)',
  '18px': 'var(--space-4)',
  '20px': 'var(--space-5)',
  '22px': 'var(--space-5)',
  '24px': 'var(--space-6)',
  '28px': 'var(--space-7)',
  '30px': 'var(--space-8)',
  '32px': 'var(--space-8)',
  '36px': 'var(--space-9)',
  '40px': 'var(--space-10)',
  '44px': 'var(--space-11)',
  '48px': 'var(--space-12)',
  '56px': 'var(--space-14)',
  '60px': 'var(--space-15)',
  '64px': 'var(--space-16)',
  '72px': 'var(--space-18)',
  '80px': 'var(--space-20)',
  '96px': 'var(--space-24)',
  '100px': 'var(--space-25)',
  '112px': 'var(--space-28)',
  '120px': 'var(--space-30)',
  '128px': 'var(--space-32)',
  '144px': 'var(--space-36)',
  '160px': 'var(--space-40)',
  '176px': 'var(--space-44)',
  '192px': 'var(--space-48)',
  '200px': 'var(--space-50)',
  '224px': 'var(--space-56)',
  '240px': 'var(--space-60)',
  '256px': 'var(--space-64)',
  '288px': 'var(--space-72)',
  '300px': 'var(--space-75)',
  '320px': 'var(--space-80)',
  '350px': 'var(--space-87)',
  '384px': 'var(--space-96)',
  '400px': 'var(--space-100)',
  '450px': 'var(--space-112)',
  '500px': 'var(--space-125)',
  '600px': 'var(--space-150)',
  '700px': 'var(--space-175)',
  '800px': 'var(--space-200)',
};

// Properties that should use pixel tokens
const SPACING_PROPERTIES = [
  'margin',
  'padding',
  'gap',
  'top',
  'bottom',
  'left',
  'right',
  'width',
  'height',
  'max-width',
  'max-height',
  'min-width',
  'min-height',
];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  // Replace hardcoded pixels with tokens
  Object.entries(PIXEL_TO_TOKEN_MAP).forEach(([pixel, token]) => {
    const regex = new RegExp(`:\\s*${pixel.replace('px', 'px')}(?![^;]*var\\()`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, `: ${token}`);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Fixed: ${filePath}`);
    return 1;
  }
  return 0;
}

function main() {
  const cssFiles = glob.sync('src/**/*.module.css', {
    cwd: process.cwd(),
    absolute: true,
    ignore: ['**/node_modules/**', '**/design-system/tokens/**'],
  });

  let fixedCount = 0;
  cssFiles.forEach(file => {
    fixedCount += fixFile(file);
  });

  console.log(`\n🎉 Fixed ${fixedCount} files`);
}

main();
