#!/usr/bin/env ts-node
/**
 * Batch Tailwind Remediation Script
 * Automatically converts common Tailwind patterns to CSS modules
 */

import * as fs from 'fs';
import * as path from 'path';

interface TailwindPattern {
  pattern: RegExp;
  cssClass: string;
  cssRule: string;
}

// Common Tailwind to CSS Module mappings
const commonPatterns: TailwindPattern[] = [
  // Flexbox
  { pattern: /flex/g, cssClass: 'flex', cssRule: 'display: flex;' },
  { pattern: /flex-col/g, cssClass: 'flexCol', cssRule: 'display: flex; flex-direction: column;' },
  { pattern: /flex-row/g, cssClass: 'flexRow', cssRule: 'display: flex; flex-direction: row;' },
  { pattern: /items-center/g, cssClass: 'itemsCenter', cssRule: 'align-items: center;' },
  { pattern: /items-start/g, cssClass: 'itemsStart', cssRule: 'align-items: flex-start;' },
  { pattern: /items-end/g, cssClass: 'itemsEnd', cssRule: 'align-items: flex-end;' },
  { pattern: /justify-center/g, cssClass: 'justifyCenter', cssRule: 'justify-content: center;' },
  { pattern: /justify-between/g, cssClass: 'justifyBetween', cssRule: 'justify-content: space-between;' },
  { pattern: /justify-start/g, cssClass: 'justifyStart', cssRule: 'justify-content: flex-start;' },
  { pattern: /justify-end/g, cssClass: 'justifyEnd', cssRule: 'justify-content: flex-end;' },
  
  // Grid
  { pattern: /grid/g, cssClass: 'grid', cssRule: 'display: grid;' },
  { pattern: /grid-cols-2/g, cssClass: 'gridCols2', cssRule: 'display: grid; grid-template-columns: repeat(2, 1fr);' },
  { pattern: /grid-cols-3/g, cssClass: 'gridCols3', cssRule: 'display: grid; grid-template-columns: repeat(3, 1fr);' },
  { pattern: /grid-cols-4/g, cssClass: 'gridCols4', cssRule: 'display: grid; grid-template-columns: repeat(4, 1fr);' },
  
  // Spacing
  { pattern: /gap-2/g, cssClass: 'gap2', cssRule: 'gap: var(--space-2);' },
  { pattern: /gap-4/g, cssClass: 'gap4', cssRule: 'gap: var(--space-4);' },
  { pattern: /gap-6/g, cssClass: 'gap6', cssRule: 'gap: var(--space-6);' },
  { pattern: /gap-8/g, cssClass: 'gap8', cssRule: 'gap: var(--space-8);' },
  
  // Padding
  { pattern: /p-4/g, cssClass: 'p4', cssRule: 'padding: var(--space-4);' },
  { pattern: /p-6/g, cssClass: 'p6', cssRule: 'padding: var(--space-6);' },
  { pattern: /p-8/g, cssClass: 'p8', cssRule: 'padding: var(--space-8);' },
  
  // Margin
  { pattern: /mb-2/g, cssClass: 'mb2', cssRule: 'margin-block-end: var(--space-2);' },
  { pattern: /mb-4/g, cssClass: 'mb4', cssRule: 'margin-block-end: var(--space-4);' },
  { pattern: /mb-6/g, cssClass: 'mb6', cssRule: 'margin-block-end: var(--space-6);' },
  { pattern: /mb-8/g, cssClass: 'mb8', cssRule: 'margin-block-end: var(--space-8);' },
  { pattern: /mt-2/g, cssClass: 'mt2', cssRule: 'margin-block-start: var(--space-2);' },
  { pattern: /mt-4/g, cssClass: 'mt4', cssRule: 'margin-block-start: var(--space-4);' },
  
  // Text
  { pattern: /text-sm/g, cssClass: 'textSm', cssRule: 'font-size: var(--font-size-sm);' },
  { pattern: /text-base/g, cssClass: 'textBase', cssRule: 'font-size: var(--font-size-base);' },
  { pattern: /text-lg/g, cssClass: 'textLg', cssRule: 'font-size: var(--font-size-lg);' },
  { pattern: /text-xl/g, cssClass: 'textXl', cssRule: 'font-size: var(--font-size-xl);' },
  { pattern: /text-2xl/g, cssClass: 'text2xl', cssRule: 'font-size: var(--font-size-2xl);' },
  { pattern: /text-3xl/g, cssClass: 'text3xl', cssRule: 'font-size: var(--font-size-3xl);' },
  
  // Colors
  { pattern: /text-black/g, cssClass: 'textBlack', cssRule: 'color: var(--color-black);' },
  { pattern: /text-white/g, cssClass: 'textWhite', cssRule: 'color: var(--color-white);' },
  { pattern: /text-grey-600/g, cssClass: 'textGrey600', cssRule: 'color: var(--color-grey-600);' },
  { pattern: /bg-white/g, cssClass: 'bgWhite', cssRule: 'background-color: var(--color-white);' },
  { pattern: /bg-black/g, cssClass: 'bgBlack', cssRule: 'background-color: var(--color-black);' },
  { pattern: /bg-grey-100/g, cssClass: 'bgGrey100', cssRule: 'background-color: var(--color-grey-100);' },
  
  // Borders
  { pattern: /border-3/g, cssClass: 'border3', cssRule: 'border: 3px solid var(--color-black);' },
  { pattern: /border-black/g, cssClass: 'borderBlack', cssRule: 'border-color: var(--color-black);' },
  { pattern: /rounded/g, cssClass: 'rounded', cssRule: 'border-radius: var(--radius-md);' },
  
  // Width/Height
  { pattern: /w-full/g, cssClass: 'wFull', cssRule: 'inline-size: 100%;' },
  { pattern: /h-full/g, cssClass: 'hFull', cssRule: 'block-size: 100%;' },
];

function processFile(filePath: string): void {
  console.log(`Processing: ${filePath}`);
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const cssModulePath = filePath.replace(/\.tsx$/, '.module.css');
  
  let newContent = content;
  const cssRules = new Set<string>();
  
  // Extract existing CSS module classes if file exists
  let existingCss = '';
  if (fs.existsSync(cssModulePath)) {
    existingCss = fs.readFileSync(cssModulePath, 'utf-8');
  }
  
  // Add import if not present
  if (!content.includes('import styles from')) {
    const importStatement = `import styles from './${path.basename(cssModulePath)}';\n`;
    newContent = newContent.replace(/^('use client';?\n)/m, `$1\n${importStatement}`);
  }
  
  // Replace Tailwind classes with CSS module classes
  const classNameRegex = /className="([^"]*)"/g;
  newContent = newContent.replace(classNameRegex, (match, classes) => {
    const classList = classes.split(' ').filter(Boolean);
    const newClasses: string[] = [];
    
    classList.forEach((cls: string) => {
      const pattern = commonPatterns.find(p => p.pattern.test(cls));
      if (pattern) {
        newClasses.push(`styles.${pattern.cssClass}`);
        cssRules.add(`.${pattern.cssClass} { ${pattern.cssRule} }`);
      } else {
        // Keep non-Tailwind classes as-is
        if (!cls.match(/^(bg-|text-|p-|m-|flex|grid|border-|rounded|shadow|w-|h-)/)) {
          newClasses.push(cls);
        }
      }
    });
    
    if (newClasses.length === 0) return '';
    if (newClasses.length === 1 && newClasses[0].startsWith('styles.')) {
      return `className={${newClasses[0]}}`;
    }
    return `className={${newClasses.map(c => c.startsWith('styles.') ? c : `"${c}"`).join(' + " " + ')}}`;
  });
  
  // Write updated TSX file
  fs.writeFileSync(filePath, newContent);
  
  // Write or update CSS module
  if (cssRules.size > 0) {
    const cssContent = `/* Auto-generated CSS Module - Design System Compliant */\n\n${Array.from(cssRules).join('\n\n')}\n`;
    if (!fs.existsSync(cssModulePath)) {
      fs.writeFileSync(cssModulePath, cssContent);
    } else {
      // Append new rules to existing CSS
      fs.appendFileSync(cssModulePath, `\n${cssContent}`);
    }
  }
  
  console.log(`✓ Processed: ${filePath}`);
}

// Main execution
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: ts-node batch-remediate-tailwind.ts <file1.tsx> [file2.tsx] ...');
  process.exit(1);
}

args.forEach(processFile);
console.log(`\n✅ Batch remediation complete! Processed ${args.length} files.`);
