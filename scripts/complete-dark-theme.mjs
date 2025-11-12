#!/usr/bin/env node

/**
 * Complete dark theme implementation for all modules
 * Replaces empty dark theme sections with proper class-scoped rules
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

function extractColorRules(content) {
  const rules = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Find class definitions with color properties
    if (line.match(/^\.[a-zA-Z][\w-]*\s*\{/)) {
      const className = line.match(/\.([a-zA-Z][\w-]*)/)?.[1];
      const colorProps = [];
      
      // Look ahead for color properties
      let j = i + 1;
      while (j < lines.length && !lines[j].includes('}')) {
        const propLine = lines[j];
        const colorMatch = propLine.match(/([\w-]+):\s*var\(--color-([\w-]+)\)/);
        if (colorMatch) {
          colorProps.push({ prop: colorMatch[1], token: colorMatch[2] });
        }
        j++;
      }
      
      if (colorProps.length > 0) {
        rules.push({ className, props: colorProps });
      }
    }
  }
  
  return rules;
}

function generateDarkThemeRules(rules) {
  const darkRules = [];
  
  rules.forEach(({ className, props }) => {
    const overrides = [];
    
    props.forEach(({ prop, token }) => {
      if (token === 'black') {
        overrides.push(`  ${prop}: var(--color-white);`);
      } else if (token === 'white') {
        overrides.push(`  ${prop}: var(--color-black);`);
      } else if (token === 'grey-100') {
        overrides.push(`  ${prop}: var(--color-grey-800);`);
      } else if (token === 'grey-200') {
        overrides.push(`  ${prop}: var(--color-grey-700);`);
      } else if (token === 'grey-300') {
        overrides.push(`  ${prop}: var(--color-grey-600);`);
      } else if (token === 'grey-400') {
        overrides.push(`  ${prop}: var(--color-grey-500);`);
      } else if (token === 'grey-500') {
        overrides.push(`  ${prop}: var(--color-grey-400);`);
      } else if (token === 'grey-600') {
        overrides.push(`  ${prop}: var(--color-grey-300);`);
      } else if (token === 'grey-700') {
        overrides.push(`  ${prop}: var(--color-grey-200);`);
      } else if (token === 'grey-800') {
        overrides.push(`  ${prop}: var(--color-grey-100);`);
      } else if (token === 'grey-900') {
        overrides.push(`  ${prop}: var(--color-grey-100);`);
      }
    });
    
    if (overrides.length > 0) {
      darkRules.push(`[data-theme="dark"] .${className} {\n${overrides.join('\n')}\n}`);
    }
  });
  
  return darkRules.join('\n\n');
}

function processFile(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  const relativePath = relative(process.cwd(), filePath);
  
  // Check for empty dark theme section
  const emptyDarkThemePattern = /\/\* ={40,}\s+DARK THEME\s+={40,} \*\/\s+\[data-theme="dark"\] \{\s*\/\*[^*]*\*\/\s*\/\*[^*]*\*\/\s*\}/;
  
  if (!emptyDarkThemePattern.test(content)) {
    return { path: relativePath, status: 'skipped' };
  }
  
  // Extract color rules
  const rules = extractColorRules(content);
  
  if (rules.length === 0) {
    return { path: relativePath, status: 'skipped' };
  }
  
  // Generate dark theme
  const darkThemeRules = generateDarkThemeRules(rules);
  
  if (!darkThemeRules) {
    return { path: relativePath, status: 'skipped' };
  }
  
  // Replace empty section with proper rules
  const replacement = `/* ========================================
   DARK THEME
   ======================================== */\n\n${darkThemeRules}`;
  
  const updated = content.replace(emptyDarkThemePattern, replacement);
  
  writeFileSync(filePath, updated, 'utf-8');
  
  return { path: relativePath, status: 'updated', rulesCount: rules.length };
}

// Process all modules
const modules = scanDirectory('src');
let updated = 0;

modules.forEach(path => {
  const result = processFile(path);
  if (result.status === 'updated') {
    updated++;
    console.log(`${GREEN}✓${RESET} ${result.path} (${result.rulesCount} classes)`);
  }
});

console.log(`\n${GREEN}✓ Completed dark theme for ${updated} modules${RESET}\n`);
