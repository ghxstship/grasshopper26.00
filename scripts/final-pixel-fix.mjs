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
  
  // Fix all remaining pixel patterns
  content = content.replace(/:\s*(\d+)px(?![^;]*var\()/g, (match, num) => {
    const val = parseInt(num);
    // Skip 0px, 1px, 2px (borders)
    if (val === 0 || val === 1 || val === 2) return match;
    
    // Map to tokens
    if (val === 3) return ': var(--space-0-5)';
    if (val === 4) return ': var(--space-1)';
    if (val === 5) return ': var(--space-1)';
    if (val === 6) return ': var(--space-1-5)';
    if (val === 7) return ': var(--space-2)';
    if (val === 8) return ': var(--space-2)';
    if (val === 10) return ': var(--space-2-5)';
    if (val === 12) return ': var(--space-3)';
    if (val === 14) return ': var(--space-3-5)';
    if (val === 16) return ': var(--space-4)';
    if (val === 18) return ': var(--space-4)';
    if (val === 20) return ': var(--space-5)';
    if (val === 22) return ': var(--space-5)';
    if (val === 24) return ': var(--space-6)';
    if (val === 28) return ': var(--space-7)';
    if (val === 30) return ': var(--space-8)';
    if (val === 32) return ': var(--space-8)';
    if (val === 36) return ': var(--space-9)';
    if (val === 40) return ': var(--space-10)';
    if (val === 44) return ': var(--space-11)';
    if (val === 48) return ': var(--space-12)';
    if (val === 56) return ': var(--space-14)';
    if (val === 60) return ': var(--space-15)';
    if (val === 64) return ': var(--space-16)';
    if (val === 72) return ': var(--space-18)';
    if (val === 80) return ': var(--space-20)';
    if (val === 96) return ': var(--space-24)';
    if (val === 100) return ': var(--space-25)';
    if (val === 112) return ': var(--space-28)';
    if (val === 120) return ': var(--space-30)';
    if (val === 128) return ': var(--space-32)';
    if (val === 144) return ': var(--space-36)';
    if (val === 160) return ': var(--space-40)';
    if (val === 176) return ': var(--space-44)';
    if (val === 192) return ': var(--space-48)';
    if (val === 200) return ': var(--space-50)';
    if (val === 224) return ': var(--space-56)';
    if (val === 240) return ': var(--space-60)';
    if (val === 256) return ': var(--space-64)';
    if (val === 288) return ': var(--space-72)';
    if (val === 300) return ': var(--space-75)';
    if (val === 320) return ': var(--space-80)';
    if (val === 350) return ': var(--space-87)';
    if (val === 384) return ': var(--space-96)';
    if (val === 400) return ': var(--space-100)';
    if (val === 450) return ': var(--space-112)';
    if (val === 500) return ': var(--space-125)';
    if (val === 600) return ': var(--space-150)';
    if (val === 700) return ': var(--space-175)';
    if (val === 800) return ': var(--space-200)';
    
    return match;
  });
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`✅ ${file}`);
    fixed++;
  }
});

console.log(`\n🎉 Fixed ${fixed} files`);
