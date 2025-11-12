#!/usr/bin/env node

/**
 * Add Dark Theme Support to Page CSS Modules
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname, relative } from 'path';

const BLUE = '\x1b[34m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
console.log(`${BLUE}  ADD DARK THEME TO PAGE MODULES${RESET}`);
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
 * Extract class selectors and their color properties
 */
function extractColorRules(content) {
  const rules = [];
  const lines = content.split('\n');
  let currentSelector = null;
  let currentProps = [];
  let inRule = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip dark theme rules
    if (line.includes('[data-theme="dark"]')) {
      while (i < lines.length && !lines[i].includes('}')) {
        i++;
      }
      continue;
    }
    
    // Start of rule
    if (line.includes('{') && !line.includes('@')) {
      currentSelector = line.substring(0, line.indexOf('{')).trim();
      inRule = true;
      currentProps = [];
      
      // Check if property on same line
      const propMatch = line.match(/\{\s*([\w-]+):\s*var\(--color-([^)]+)\)/);
      if (propMatch) {
        currentProps.push({ prop: propMatch[1], token: propMatch[2] });
      }
    }
    // Property line
    else if (inRule && line.includes('var(--color-')) {
      const propMatch = line.match(/([\w-]+):\s*var\(--color-([^)]+)\)/);
      if (propMatch) {
        currentProps.push({ prop: propMatch[1], token: propMatch[2] });
      }
    }
    // End of rule
    else if (line.includes('}') && inRule) {
      if (currentProps.length > 0 && currentSelector) {
        rules.push({ selector: currentSelector, props: currentProps });
      }
      inRule = false;
      currentSelector = null;
      currentProps = [];
    }
  }
  
  return rules;
}

/**
 * Generate dark theme overrides
 */
function generateDarkTheme(rules) {
  if (rules.length === 0) return '';
  
  const darkRules = [];
  
  rules.forEach(rule => {
    const overrides = [];
    
    rule.props.forEach(({ prop, token }) => {
      // Invert colors for dark theme
      if (token === 'black' || token === 'text-primary') {
        overrides.push(`  ${prop}: var(--color-text-primary);`);
      } else if (token === 'white' || token === 'bg-primary') {
        overrides.push(`  ${prop}: var(--color-bg-primary);`);
      } else if (token.includes('grey-100') || token.includes('grey-200')) {
        overrides.push(`  ${prop}: var(--color-bg-secondary);`);
      } else if (token.includes('grey-900') || token.includes('grey-800')) {
        overrides.push(`  ${prop}: var(--color-bg-secondary);`);
      } else if (token.includes('text-secondary')) {
        overrides.push(`  ${prop}: var(--color-text-secondary);`);
      } else if (token.includes('bg-secondary')) {
        overrides.push(`  ${prop}: var(--color-bg-secondary);`);
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
 * Process a CSS module
 */
function processModule(filePath, dryRun = false) {
  let content = readFileSync(filePath, 'utf-8');
  const relativePath = relative(process.cwd(), filePath);
  
  // Skip if already has dark theme
  if (content.includes('[data-theme="dark"]')) {
    return { path: relativePath, status: 'skipped', reason: 'has dark theme' };
  }
  
  // Skip if no color tokens
  if (!content.includes('var(--color-')) {
    return { path: relativePath, status: 'skipped', reason: 'no color tokens' };
  }
  
  // Extract rules
  const rules = extractColorRules(content);
  
  if (rules.length === 0) {
    return { path: relativePath, status: 'skipped', reason: 'no color rules' };
  }
  
  // Generate dark theme
  const darkTheme = generateDarkTheme(rules);
  
  if (!darkTheme) {
    return { path: relativePath, status: 'skipped', reason: 'no overrides needed' };
  }
  
  // Add to file
  const updated = content.trimEnd() + '\n' + darkTheme;
  
  if (!dryRun) {
    writeFileSync(filePath, updated, 'utf-8');
  }
  
  return { path: relativePath, status: 'updated', rulesCount: rules.length };
}

// Main
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

if (dryRun) {
  console.log(`${YELLOW}DRY RUN - No files will be modified${RESET}\n`);
}

const modules = scanDirectory('src/app');
const results = { updated: [], skipped: [], errors: [] };

console.log(`Found ${modules.length} CSS modules in app pages\n`);

modules.forEach(path => {
  try {
    const result = processModule(path, dryRun);
    if (result.status === 'updated') {
      results.updated.push(result);
      console.log(`${GREEN}✓${RESET} ${result.path} (${result.rulesCount} rules)`);
    } else {
      results.skipped.push(result);
    }
  } catch (error) {
    results.errors.push({ path: relative(process.cwd(), path), error: error.message });
    console.log(`${YELLOW}⚠${RESET} ${relative(process.cwd(), path)}: ${error.message}`);
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
  const reasons = {};
  results.skipped.forEach(r => {
    reasons[r.reason] = (reasons[r.reason] || 0) + 1;
  });
  console.log(`\nSkip reasons:`);
  Object.entries(reasons).forEach(([reason, count]) => {
    console.log(`  - ${reason}: ${count}`);
  });
}

if (!dryRun && results.updated.length > 0) {
  console.log(`\n${GREEN}✓ Dark theme added to ${results.updated.length} page modules${RESET}`);
} else if (dryRun && results.updated.length > 0) {
  console.log(`\n${YELLOW}Would update ${results.updated.length} modules${RESET}`);
  console.log(`Run without --dry-run to apply`);
}

console.log(`\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`);

process.exit(results.errors.length > 0 ? 1 : 0);
