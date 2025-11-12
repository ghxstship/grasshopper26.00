#!/usr/bin/env node

/**
 * Smart Dark Theme Addition
 * Analyzes CSS modules and adds intelligent dark theme overrides
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname, relative } from 'path';

const BLUE = '\x1b[34m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
console.log(`${BLUE}  SMART DARK THEME ADDITION${RESET}`);
console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`);

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

/**
 * Parse CSS to find selectors and their color properties
 */
function parseCSSRules(content) {
  const rules = [];
  
  // Match CSS rules with selectors and properties
  const rulePattern = /([.#\w\s:,\[\]="'-]+)\s*\{([^}]+)\}/g;
  let match;
  
  while ((match = rulePattern.exec(content)) !== null) {
    const selector = match[1].trim();
    const properties = match[2];
    
    // Skip if already a dark theme rule
    if (selector.includes('[data-theme="dark"]')) {
      continue;
    }
    
    // Find color-related properties
    const colorProps = {};
    const propPattern = /([\w-]+):\s*var\(--color-([^)]+)\)/g;
    let propMatch;
    
    while ((propMatch = propPattern.exec(properties)) !== null) {
      const propName = propMatch[1];
      const colorToken = propMatch[2];
      colorProps[propName] = colorToken;
    }
    
    // Also check for hardcoded black/white
    const hardcodedPattern = /([\w-]+):\s*var\(--color-(black|white)\)/g;
    let hardcodedMatch;
    
    while ((hardcodedMatch = hardcodedPattern.exec(properties)) !== null) {
      const propName = hardcodedMatch[1];
      const colorToken = hardcodedMatch[2];
      colorProps[propName] = colorToken;
    }
    
    if (Object.keys(colorProps).length > 0) {
      rules.push({ selector, colorProps });
    }
  }
  
  return rules;
}

/**
 * Generate dark theme overrides
 */
function generateDarkThemeOverrides(rules) {
  if (rules.length === 0) return '';
  
  const darkRules = [];
  
  rules.forEach(rule => {
    const overrides = [];
    
    Object.entries(rule.colorProps).forEach(([prop, token]) => {
      // Invert black/white
      if (token === 'black') {
        overrides.push(`  ${prop}: var(--color-white);`);
      } else if (token === 'white') {
        overrides.push(`  ${prop}: var(--color-black);`);
      } else if (token.includes('grey-100') || token.includes('grey-200')) {
        // Light greys become dark greys
        overrides.push(`  ${prop}: var(--color-grey-800);`);
      } else if (token.includes('grey-900') || token.includes('grey-800')) {
        // Dark greys become light greys
        overrides.push(`  ${prop}: var(--color-grey-100);`);
      } else if (token.includes('text-primary')) {
        // Already semantic, but ensure it's set
        overrides.push(`  ${prop}: var(--color-text-primary);`);
      } else if (token.includes('bg-primary')) {
        overrides.push(`  ${prop}: var(--color-bg-primary);`);
      } else if (token.includes('border')) {
        overrides.push(`  ${prop}: var(--color-border-default);`);
      }
    });
    
    if (overrides.length > 0) {
      darkRules.push(`[data-theme="dark"] ${rule.selector} {\n${overrides.join('\n')}\n}`);
    }
  });
  
  if (darkRules.length === 0) return '';
  
  return `\n/* ========================================
   DARK THEME
   ======================================== */\n\n${darkRules.join('\n\n')}\n`;
}

/**
 * Add dark theme support to a CSS module
 */
function addDarkThemeSupport(filePath, dryRun = false) {
  let content = readFileSync(filePath, 'utf-8');
  const relativePath = relative(process.cwd(), filePath);
  
  // Skip if already has dark theme
  if (content.includes('[data-theme="dark"]')) {
    return { path: relativePath, status: 'skipped', reason: 'already has dark theme' };
  }
  
  // Skip if doesn't use color tokens
  if (!content.includes('var(--color-')) {
    return { path: relativePath, status: 'skipped', reason: 'no color tokens used' };
  }
  
  // Parse CSS rules
  const rules = parseCSSRules(content);
  
  if (rules.length === 0) {
    return { path: relativePath, status: 'skipped', reason: 'no invertible color rules found' };
  }
  
  // Generate dark theme section
  const darkThemeSection = generateDarkThemeOverrides(rules);
  
  if (!darkThemeSection) {
    return { path: relativePath, status: 'skipped', reason: 'no dark theme overrides needed' };
  }
  
  // Add dark theme section at the end
  const updatedContent = content.trimEnd() + '\n' + darkThemeSection;
  
  // Write back (unless dry run)
  if (!dryRun) {
    writeFileSync(filePath, updatedContent, 'utf-8');
  }
  
  return { 
    path: relativePath, 
    status: 'updated', 
    rulesCount: rules.length,
    preview: darkThemeSection.split('\n').slice(0, 10).join('\n') + '\n...'
  };
}

// Parse command line args
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const showPreviews = args.includes('--preview');

if (dryRun) {
  console.log(`${YELLOW}DRY RUN MODE - No files will be modified${RESET}\n`);
}

// Main execution
const cssModules = scanDirectory('src/design-system/components');
const results = {
  updated: [],
  skipped: [],
  errors: [],
};

console.log(`Found ${cssModules.length} CSS modules in design system components\n`);
console.log('Processing...\n');

cssModules.forEach(modulePath => {
  try {
    const result = addDarkThemeSupport(modulePath, dryRun);
    
    if (result.status === 'updated') {
      results.updated.push(result);
      console.log(`${GREEN}✓${RESET} ${result.path} (${result.rulesCount} rules)`);
      
      if (showPreviews) {
        console.log(`${BLUE}Preview:${RESET}`);
        console.log(result.preview);
        console.log();
      }
    } else {
      results.skipped.push(result);
    }
  } catch (error) {
    results.errors.push({ path: relative(process.cwd(), modulePath), error: error.message });
    console.log(`${YELLOW}⚠${RESET} ${relative(process.cwd(), modulePath)}: ${error.message}`);
  }
});

// Report
console.log(`\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
console.log(`${BLUE}  SUMMARY${RESET}`);
console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`);

console.log(`${GREEN}✓ Updated: ${results.updated.length}${RESET}`);
console.log(`  Skipped: ${results.skipped.length}`);
if (results.errors.length > 0) {
  console.log(`${YELLOW}⚠ Errors: ${results.errors.length}${RESET}`);
}

if (results.skipped.length > 0) {
  console.log(`\nSkip reasons:`);
  const reasons = {};
  results.skipped.forEach(r => {
    reasons[r.reason] = (reasons[r.reason] || 0) + 1;
  });
  Object.entries(reasons).forEach(([reason, count]) => {
    console.log(`  - ${reason}: ${count}`);
  });
}

if (!dryRun && results.updated.length > 0) {
  console.log(`\n${GREEN}Dark theme support added to ${results.updated.length} components!${RESET}`);
} else if (dryRun && results.updated.length > 0) {
  console.log(`\n${YELLOW}Would update ${results.updated.length} components (dry run)${RESET}`);
  console.log(`Run without --dry-run to apply changes`);
}

if (results.errors.length > 0) {
  console.log(`\n${YELLOW}Errors encountered:${RESET}`);
  results.errors.forEach(err => {
    console.log(`  - ${err.path}: ${err.error}`);
  });
}

console.log(`\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`);
