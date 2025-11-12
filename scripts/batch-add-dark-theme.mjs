#!/usr/bin/env node

/**
 * Batch add dark theme support to all modules with hardcoded colors
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname, relative } from 'path';

const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';

function scanDirectory(dir, fileList = []) {
  const files = readdirSync(dir);
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next')) {
        scanDirectory(filePath, fileList);
      }
    } else if (extname(file) === '.css' && file.includes('.module.css')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function extractClassesWithColors(content) {
  const classes = new Map();
  const lines = content.split('\n');
  let currentClass = null;
  let currentProps = [];
  let braceDepth = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip dark theme sections
    if (line.includes('[data-theme="dark"]') || line.includes(':global([data-theme="dark"])')) {
      while (i < lines.length && braceDepth >= 0) {
        if (lines[i].includes('{')) braceDepth++;
        if (lines[i].includes('}')) braceDepth--;
        if (braceDepth === 0) break;
        i++;
      }
      continue;
    }
    
    // Class selector
    if (line.match(/^\.[a-zA-Z][\w-]*\s*\{/) || line.match(/^\.[a-zA-Z][\w-]*\s*,/)) {
      if (currentClass && currentProps.length > 0) {
        classes.set(currentClass, currentProps);
      }
      currentClass = line.match(/\.([a-zA-Z][\w-]*)/)?.[1];
      currentProps = [];
      braceDepth = line.includes('{') ? 1 : 0;
    }
    // Color property
    else if (braceDepth > 0 && line.includes('var(--color-')) {
      const match = line.match(/([\w-]+):\s*var\(--color-([\w-]+)\)/);
      if (match) {
        currentProps.push({ prop: match[1], token: match[2] });
      }
    }
    // Track braces
    if (line.includes('{')) braceDepth++;
    if (line.includes('}')) {
      braceDepth--;
      if (braceDepth === 0 && currentClass && currentProps.length > 0) {
        classes.set(currentClass, currentProps);
        currentClass = null;
        currentProps = [];
      }
    }
  }
  
  return classes;
}

function generateDarkTheme(classes) {
  if (classes.size === 0) return '';
  
  const rules = [];
  
  for (const [className, props] of classes.entries()) {
    const overrides = [];
    
    props.forEach(({ prop, token }) => {
      // Invert colors
      if (token === 'black') {
        overrides.push(`  ${prop}: var(--color-white);`);
      } else if (token === 'white') {
        overrides.push(`  ${prop}: var(--color-black);`);
      } else if (token.match(/grey-(100|200)/)) {
        overrides.push(`  ${prop}: var(--color-grey-800);`);
      } else if (token.match(/grey-(800|900)/)) {
        overrides.push(`  ${prop}: var(--color-grey-100);`);
      } else if (token.match(/grey-(300|400)/)) {
        overrides.push(`  ${prop}: var(--color-grey-700);`);
      } else if (token.match(/grey-(500|600|700)/)) {
        overrides.push(`  ${prop}: var(--color-grey-400);`);
      }
    });
    
    if (overrides.length > 0) {
      rules.push(`[data-theme="dark"] .${className} {\n${overrides.join('\n')}\n}`);
    }
  }
  
  if (rules.length === 0) return '';
  
  return `\n/* ========================================
   DARK THEME
   ======================================== */\n\n${rules.join('\n\n')}\n`;
}

function processFile(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  const relativePath = relative(process.cwd(), filePath);
  
  // Skip if has dark theme
  if (content.includes('[data-theme="dark"]') || content.includes(':global([data-theme="dark"])')) {
    return { path: relativePath, status: 'skipped' };
  }
  
  // Skip if no hardcoded colors
  const hasHardcoded = content.includes('var(--color-black)') || 
                       content.includes('var(--color-white)') ||
                       content.match(/var\(--color-grey-[0-9]+\)/);
  
  if (!hasHardcoded) {
    return { path: relativePath, status: 'skipped' };
  }
  
  // Extract classes
  const classes = extractClassesWithColors(content);
  
  if (classes.size === 0) {
    return { path: relativePath, status: 'skipped' };
  }
  
  // Generate dark theme
  const darkTheme = generateDarkTheme(classes);
  
  if (!darkTheme) {
    return { path: relativePath, status: 'skipped' };
  }
  
  // Add to file
  const updated = content.trimEnd() + '\n' + darkTheme;
  writeFileSync(filePath, updated, 'utf-8');
  
  return { path: relativePath, status: 'updated', classCount: classes.size };
}

// Process all modules
const modules = scanDirectory('src/design-system/components');
let updated = 0;

modules.forEach(path => {
  const result = processFile(path);
  if (result.status === 'updated') {
    updated++;
    console.log(`${GREEN}✓${RESET} ${result.path} (${result.classCount} classes)`);
  }
});

console.log(`\n${GREEN}✓ Added dark theme to ${updated} modules${RESET}\n`);
