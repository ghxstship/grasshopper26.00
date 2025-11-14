#!/usr/bin/env node
import fs from 'fs';
import glob from 'glob';

const files = glob.sync('src/**/*.{css,module.css}', {
  cwd: process.cwd(),
  absolute: true,
  ignore: ['**/node_modules/**', '**/design-system/tokens/**'],
});

let fixed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  const original = content;
  
  // Fix min-height, max-height, min-width, max-width with common values
  content = content.replace(/min-height:\s*100vh/g, 'min-block-size: 100vh');
  content = content.replace(/min-height:\s*(\d+)px/g, (match, num) => {
    const val = parseInt(num);
    if (val === 44) return 'min-block-size: var(--space-11)';
    if (val === 48) return 'min-block-size: var(--space-12)';
    if (val === 64) return 'min-block-size: var(--space-16)';
    if (val === 80) return 'min-block-size: var(--space-20)';
    if (val === 100) return 'min-block-size: var(--space-25)';
    if (val === 120) return 'min-block-size: var(--space-30)';
    if (val === 200) return 'min-block-size: var(--space-50)';
    if (val === 300) return 'min-block-size: var(--space-75)';
    if (val === 400) return 'min-block-size: var(--space-100)';
    if (val === 500) return 'min-block-size: var(--space-125)';
    if (val === 600) return 'min-block-size: var(--space-150)';
    return match;
  });
  
  // Fix max-width with common container values
  content = content.replace(/max-width:\s*(\d+)px/g, (match, num) => {
    const val = parseInt(num);
    if (val === 1200) return 'max-inline-size: 75rem';
    if (val === 1280) return 'max-inline-size: 80rem';
    if (val === 1440) return 'max-inline-size: 90rem';
    if (val === 1536) return 'max-inline-size: 96rem';
    if (val === 1920) return 'max-inline-size: 120rem';
    if (val <= 800) {
      const token = Math.round(val / 4);
      return `max-inline-size: var(--space-${token})`;
    }
    return match;
  });
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`✅ ${file}`);
    fixed++;
  }
});

console.log(`\n🎉 Fixed ${fixed} files`);
