#!/usr/bin/env node
import fs from 'fs';
import glob from 'glob';

const replacements = [
  { from: /240px/g, to: 'var(--space-60)' },
  { from: /250px/g, to: 'var(--space-62)' },
  { from: /1120px/g, to: '70rem' },
  { from: /122px/g, to: 'var(--space-30)' },
  { from: /125px/g, to: 'var(--space-31)' },
  { from: /126px/g, to: 'var(--space-31)' },
];

const files = glob.sync('src/**/*.{css,module.css}', {
  cwd: process.cwd(),
  absolute: true,
  ignore: ['**/node_modules/**', '**/design-system/tokens/**'],
});

let fixed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  const original = content;
  
  replacements.forEach(({ from, to }) => {
    content = content.replace(from, to);
  });
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`✅ ${file}`);
    fixed++;
  }
});

console.log(`\n🎉 Fixed ${fixed} files`);
