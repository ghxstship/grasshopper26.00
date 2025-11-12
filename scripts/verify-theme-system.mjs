#!/usr/bin/env node

/**
 * Comprehensive Theme System Verification
 * Tests light/dark/system theme functionality and responsive breakpoints
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const ERRORS = [];
const WARNINGS = [];
const SUCCESS = [];

// ANSI colors
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
console.log(`${BLUE}  GVTEWAY THEME SYSTEM VERIFICATION${RESET}`);
console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`);

// ============================================================================
// 1. VERIFY THEME TOKENS
// ============================================================================

console.log(`${BLUE}[1/6]${RESET} Verifying theme tokens...`);

const tokensPath = 'src/design-system/tokens/tokens.css';
let tokensContent;

try {
  tokensContent = readFileSync(tokensPath, 'utf-8');
  SUCCESS.push('✓ tokens.css found');
} catch (error) {
  ERRORS.push(`✗ tokens.css not found at ${tokensPath}`);
}

if (tokensContent) {
  // Check for :root declaration
  if (tokensContent.includes(':root {')) {
    SUCCESS.push('✓ :root theme variables defined');
  } else {
    ERRORS.push('✗ Missing :root theme variables');
  }

  // Check for [data-theme="dark"] declaration
  if (tokensContent.includes('[data-theme="dark"]')) {
    SUCCESS.push('✓ Dark theme variables defined');
  } else {
    ERRORS.push('✗ Missing [data-theme="dark"] theme variables');
  }

  // Verify semantic color tokens exist
  const requiredTokens = [
    '--color-text-primary',
    '--color-text-secondary',
    '--color-bg-primary',
    '--color-bg-secondary',
    '--color-border-default',
    '--color-primary',
    '--color-accent',
  ];

  requiredTokens.forEach(token => {
    const lightCount = (tokensContent.match(new RegExp(`${token}:`, 'g')) || []).length;
    if (lightCount >= 2) { // Should appear in both :root and [data-theme="dark"]
      SUCCESS.push(`✓ ${token} defined for both themes`);
    } else if (lightCount === 1) {
      WARNINGS.push(`⚠ ${token} only defined for one theme`);
    } else {
      ERRORS.push(`✗ ${token} not defined`);
    }
  });

  // Check for monochromatic palette (no purple/pink)
  const coloredPatterns = [
    /#[0-9A-Fa-f]{6}(?!.*(?:000000|FFFFFF|F5F5F5|E5E5E5|D4D4D4|A3A3A3|737373|525252|404040|262626|171717))/,
  ];

  const purpleMatches = tokensContent.match(/#9333EA|#A855F7|purple/gi);
  const pinkMatches = tokensContent.match(/#EC4899|#F472B6|pink/gi);

  if (purpleMatches || pinkMatches) {
    ERRORS.push(`✗ Non-monochromatic colors found (purple/pink)`);
  } else {
    SUCCESS.push('✓ Monochromatic palette maintained (no purple/pink)');
  }

  // Check for hard geometric shadows (no blur)
  const softShadowPattern = /box-shadow:.*\d+px\s+\d+px\s+\d+px/;
  if (softShadowPattern.test(tokensContent)) {
    WARNINGS.push('⚠ Soft shadows detected (should be hard geometric)');
  } else {
    SUCCESS.push('✓ Hard geometric shadows only');
  }

  // Check for rounded corners (should be 0)
  const radiusPattern = /--radius-[^:]+:\s*(\d+)/g;
  const radiusMatches = [...tokensContent.matchAll(radiusPattern)];
  const nonZeroRadius = radiusMatches.filter(match => match[1] !== '0');
  
  if (nonZeroRadius.length > 0) {
    ERRORS.push(`✗ Non-zero border radius found (GHXSTSHIP requires hard edges)`);
  } else {
    SUCCESS.push('✓ All border radius values are 0 (hard edges)');
  }

  // Check for media queries
  const mediaQueries = [
    '@media (prefers-contrast: high)',
    '@media (prefers-reduced-motion: reduce)',
    '@media print',
  ];

  mediaQueries.forEach(query => {
    if (tokensContent.includes(query)) {
      SUCCESS.push(`✓ ${query} support implemented`);
    } else {
      WARNINGS.push(`⚠ Missing ${query} support`);
    }
  });
}

// ============================================================================
// 2. VERIFY THEME PROVIDER
// ============================================================================

console.log(`${BLUE}[2/6]${RESET} Verifying theme provider...`);

const providerPath = 'src/lib/theme-provider.tsx';
let providerContent;

try {
  providerContent = readFileSync(providerPath, 'utf-8');
  SUCCESS.push('✓ theme-provider.tsx found');
} catch (error) {
  ERRORS.push(`✗ theme-provider.tsx not found at ${providerPath}`);
}

if (providerContent) {
  // Check for next-themes import
  if (providerContent.includes('next-themes')) {
    SUCCESS.push('✓ next-themes integration present');
  } else {
    ERRORS.push('✗ Missing next-themes integration');
  }

  // Check for data-theme attribute
  if (providerContent.includes('attribute="data-theme"')) {
    SUCCESS.push('✓ data-theme attribute configured');
  } else {
    ERRORS.push('✗ Missing data-theme attribute configuration');
  }

  // Check for enableSystem
  if (providerContent.includes('enableSystem')) {
    SUCCESS.push('✓ System theme preference enabled');
  } else {
    WARNINGS.push('⚠ System theme preference not enabled');
  }

  // Check for themes array
  if (providerContent.includes("themes={['light', 'dark']}")) {
    SUCCESS.push('✓ Light and dark themes configured');
  } else {
    WARNINGS.push('⚠ Theme configuration may be incomplete');
  }
}

// ============================================================================
// 3. VERIFY THEME HOOK
// ============================================================================

console.log(`${BLUE}[3/6]${RESET} Verifying theme hook...`);

const hookPath = 'src/hooks/use-theme.ts';
let hookContent;

try {
  hookContent = readFileSync(hookPath, 'utf-8');
  SUCCESS.push('✓ use-theme.ts found');
} catch (error) {
  ERRORS.push(`✗ use-theme.ts not found at ${hookPath}`);
}

if (hookContent) {
  // Check for useTheme export
  if (hookContent.includes('export function useTheme()')) {
    SUCCESS.push('✓ useTheme hook exported');
  } else {
    ERRORS.push('✗ useTheme hook not properly exported');
  }

  // Check for helper functions
  const helpers = ['isDark', 'isLight', 'isSystem', 'effectiveTheme'];
  helpers.forEach(helper => {
    if (hookContent.includes(helper)) {
      SUCCESS.push(`✓ ${helper} helper available`);
    } else {
      WARNINGS.push(`⚠ ${helper} helper not found`);
    }
  });

  // Check for mounted state (hydration safety)
  if (hookContent.includes('mounted')) {
    SUCCESS.push('✓ Hydration safety implemented');
  } else {
    WARNINGS.push('⚠ Missing hydration safety check');
  }
}

// ============================================================================
// 4. VERIFY RESPONSIVE BREAKPOINTS
// ============================================================================

console.log(`${BLUE}[4/6]${RESET} Verifying responsive breakpoints...`);

const breakpointsPath = 'src/design-system/tokens/primitives/breakpoints.ts';
let breakpointsContent;

try {
  breakpointsContent = readFileSync(breakpointsPath, 'utf-8');
  SUCCESS.push('✓ breakpoints.ts found');
} catch (error) {
  ERRORS.push(`✗ breakpoints.ts not found at ${breakpointsPath}`);
}

if (breakpointsContent) {
  // Check for standard breakpoints
  const requiredBreakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  requiredBreakpoints.forEach(bp => {
    // Handle quoted keys like '2xl'
    const pattern = bp.includes('xl') && bp !== 'xl' 
      ? `'${bp}':`
      : `${bp}:`;
    if (breakpointsContent.includes(pattern)) {
      SUCCESS.push(`✓ ${bp} breakpoint defined`);
    } else {
      ERRORS.push(`✗ ${bp} breakpoint missing`);
    }
  });

  // Check for media query helpers
  if (breakpointsContent.includes('export const media')) {
    SUCCESS.push('✓ Media query helpers exported');
  } else {
    WARNINGS.push('⚠ Media query helpers not found');
  }
}

// Check responsive utilities
const responsivePath = 'src/design-system/utils/responsive.ts';
let responsiveContent;

try {
  responsiveContent = readFileSync(responsivePath, 'utf-8');
  SUCCESS.push('✓ responsive.ts found');
} catch (error) {
  WARNINGS.push(`⚠ responsive.ts not found at ${responsivePath}`);
}

if (responsiveContent) {
  const responsiveHelpers = [
    'getCurrentBreakpoint',
    'isBreakpointUp',
    'isBreakpointDown',
    'isMobile',
    'isTablet',
    'isDesktop',
  ];

  responsiveHelpers.forEach(helper => {
    if (responsiveContent.includes(helper)) {
      SUCCESS.push(`✓ ${helper} utility available`);
    } else {
      WARNINGS.push(`⚠ ${helper} utility not found`);
    }
  });
}

// ============================================================================
// 5. VERIFY TAILWIND CONFIGURATION
// ============================================================================

console.log(`${BLUE}[5/6]${RESET} Verifying Tailwind configuration...`);

const tailwindPath = 'tailwind.config.ts';
let tailwindContent;

try {
  tailwindContent = readFileSync(tailwindPath, 'utf-8');
  SUCCESS.push('✓ tailwind.config.ts found');
} catch (error) {
  ERRORS.push(`✗ tailwind.config.ts not found`);
}

if (tailwindContent) {
  // Check for darkMode configuration
  if (tailwindContent.includes('darkMode')) {
    SUCCESS.push('✓ Dark mode configured in Tailwind');
  } else {
    WARNINGS.push('⚠ Dark mode not configured in Tailwind');
  }

  // Check for monochromatic colors
  if (tailwindContent.includes('grey:') && !tailwindContent.includes('purple:') && !tailwindContent.includes('pink:')) {
    SUCCESS.push('✓ Monochromatic color palette in Tailwind');
  } else {
    WARNINGS.push('⚠ Non-monochromatic colors may be present in Tailwind config');
  }

  // Check for responsive font sizes
  if (tailwindContent.includes('clamp(')) {
    SUCCESS.push('✓ Responsive font sizes configured');
  } else {
    WARNINGS.push('⚠ Responsive font sizes may not be configured');
  }
}

// ============================================================================
// 6. SCAN CSS MODULES FOR THEME COMPLIANCE
// ============================================================================

console.log(`${BLUE}[6/6]${RESET} Scanning CSS modules for theme compliance...`);

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

const cssModules = scanDirectory('src');
let modulesWithDarkTheme = 0;
let modulesWithoutDarkTheme = 0;
let modulesWithHardcodedColors = 0;

cssModules.forEach(modulePath => {
  const content = readFileSync(modulePath, 'utf-8');
  
  // Check for dark theme support
  if (content.includes('[data-theme="dark"]')) {
    modulesWithDarkTheme++;
  } else {
    modulesWithoutDarkTheme++;
  }

  // Check for hardcoded colors (excluding var() and specific exemptions)
  const hardcodedColorPattern = /#[0-9A-Fa-f]{6}(?!.*var\()/;
  const hasVarColors = content.includes('var(--color-');
  const hasHardcodedColors = hardcodedColorPattern.test(content) && !hasVarColors;
  
  if (hasHardcodedColors) {
    modulesWithHardcodedColors++;
  }
});

SUCCESS.push(`✓ ${modulesWithDarkTheme} CSS modules with dark theme support`);
if (modulesWithoutDarkTheme > 0) {
  WARNINGS.push(`⚠ ${modulesWithoutDarkTheme} CSS modules without dark theme support`);
}
if (modulesWithHardcodedColors > 0) {
  WARNINGS.push(`⚠ ${modulesWithHardcodedColors} CSS modules with hardcoded colors`);
}

// ============================================================================
// REPORT
// ============================================================================

console.log(`\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
console.log(`${BLUE}  VERIFICATION REPORT${RESET}`);
console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`);

if (SUCCESS.length > 0) {
  console.log(`${GREEN}SUCCESS (${SUCCESS.length}):${RESET}`);
  SUCCESS.forEach(msg => console.log(`  ${GREEN}${msg}${RESET}`));
  console.log();
}

if (WARNINGS.length > 0) {
  console.log(`${YELLOW}WARNINGS (${WARNINGS.length}):${RESET}`);
  WARNINGS.forEach(msg => console.log(`  ${YELLOW}${msg}${RESET}`));
  console.log();
}

if (ERRORS.length > 0) {
  console.log(`${RED}ERRORS (${ERRORS.length}):${RESET}`);
  ERRORS.forEach(msg => console.log(`  ${RED}${msg}${RESET}`));
  console.log();
}

// Summary
const total = SUCCESS.length + WARNINGS.length + ERRORS.length;
const successRate = ((SUCCESS.length / total) * 100).toFixed(1);

console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
console.log(`${BLUE}  SUMMARY${RESET}`);
console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`);

console.log(`  Total Checks: ${total}`);
console.log(`  ${GREEN}Success: ${SUCCESS.length}${RESET}`);
console.log(`  ${YELLOW}Warnings: ${WARNINGS.length}${RESET}`);
console.log(`  ${RED}Errors: ${ERRORS.length}${RESET}`);
console.log(`  Success Rate: ${successRate}%\n`);

if (ERRORS.length === 0) {
  console.log(`${GREEN}✓ Theme system verification PASSED${RESET}\n`);
  process.exit(0);
} else {
  console.log(`${RED}✗ Theme system verification FAILED${RESET}\n`);
  process.exit(1);
}
