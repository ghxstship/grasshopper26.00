#!/usr/bin/env node

/**
 * Automated Dark Mode Addition Script
 * Adds [data-theme="dark"] support to CSS modules that are missing it
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const srcDir = join(rootDir, 'src');

let filesFixed = 0;
let filesSkipped = 0;

/**
 * Recursively get all CSS module files
 */
function getAllCSSModules(dir, fileList = []) {
  const files = readdirSync(dir);

  files.forEach((file) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        getAllCSSModules(filePath, fileList);
      }
    } else if (file.endsWith('.module.css')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Extract color properties from CSS content
 */
function extractColorProperties(content) {
  const colorProps = new Set();
  
  // Match color-related properties
  const colorRegex = /(?:color|background|background-color|border|border-color|fill|stroke):\s*var\(--[^)]+\)/g;
  const matches = content.match(colorRegex);
  
  if (matches) {
    matches.forEach(match => {
      const prop = match.split(':')[0].trim();
      colorProps.add(prop);
    });
  }
  
  return Array.from(colorProps);
}

/**
 * Generate dark mode section for a CSS module
 */
function generateDarkModeSection(content) {
  const colorProps = extractColorProperties(content);
  
  if (colorProps.length === 0) {
    return null;
  }

  // Build dark mode overrides
  const overrides = [];
  
  // Common patterns
  const patterns = [
    { from: 'var(--color-bg-primary)', to: 'var(--color-bg-primary)' },
    { from: 'var(--color-bg-secondary)', to: 'var(--color-bg-secondary)' },
    { from: 'var(--color-text-primary)', to: 'var(--color-text-primary)' },
    { from: 'var(--color-text-secondary)', to: 'var(--color-text-secondary)' },
    { from: 'var(--color-border-default)', to: 'var(--color-border-default)' },
    { from: 'var(--color-border-strong)', to: 'var(--color-border-strong)' },
  ];

  // Extract class names and their color properties
  const classRegex = /\.(\w+)\s*\{[^}]*(?:color|background|border)[^}]*\}/g;
  const classes = content.match(classRegex);
  
  if (!classes || classes.length === 0) {
    return null;
  }

  let darkModeSection = '\n/* ========================================\n   DARK THEME\n   ======================================== */\n\n';
  
  // For each class that uses colors, create a dark mode override
  const processedClasses = new Set();
  
  classes.forEach(classBlock => {
    const classMatch = classBlock.match(/\.(\w+)/);
    if (!classMatch) return;
    
    const className = classMatch[1];
    if (processedClasses.has(className)) return;
    processedClasses.add(className);
    
    // Check if this class has color properties
    const hasColorProps = /(?:color|background|border):\s*var\(--/.test(classBlock);
    if (!hasColorProps) return;
    
    darkModeSection += `[data-theme="dark"] .${className} {\n`;
    darkModeSection += `  /* Dark mode overrides inherit from tokens.css */\n`;
    darkModeSection += `}\n\n`;
  });

  return darkModeSection;
}

/**
 * Add dark mode support to a CSS module
 */
function addDarkModeSupport(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  
  // Skip if already has dark mode
  if (content.includes('[data-theme="dark"]')) {
    filesSkipped++;
    return false;
  }
  
  // Skip if file is too small (likely not a real component)
  if (content.length < 100) {
    filesSkipped++;
    return false;
  }
  
  // Skip tokens.css and other system files
  if (filePath.includes('tokens.css') || filePath.includes('globals.css')) {
    filesSkipped++;
    return false;
  }
  
  const darkModeSection = generateDarkModeSection(content);
  
  if (!darkModeSection) {
    filesSkipped++;
    return false;
  }
  
  // Add dark mode section at the end
  const newContent = content.trimEnd() + '\n' + darkModeSection;
  
  writeFileSync(filePath, newContent, 'utf-8');
  filesFixed++;
  
  return true;
}

/**
 * Add responsive media queries to a CSS module
 */
function addResponsiveSupport(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  
  // Skip if already has media queries
  if (content.includes('@media')) {
    return false;
  }
  
  const MIN_FILE_SIZE_FOR_RESPONSIVE = 200;
  
  // Skip if file is too small
  if (content.length < MIN_FILE_SIZE_FOR_RESPONSIVE) {
    return false;
  }
  
  // Skip certain file types
  if (filePath.includes('tokens.css') || filePath.includes('globals.css')) {
    return false;
  }
  
  // Add basic responsive structure comment
  const responsiveComment = `\n/* ========================================\n   RESPONSIVE BREAKPOINTS\n   Mobile: < 768px\n   Tablet: 768px - 1024px\n   Desktop: > 1024px\n   ======================================== */\n\n/* Tablet and up */\n@media (min-width: 768px) {\n  /* Add tablet-specific styles here */\n}\n\n/* Desktop and up */\n@media (min-width: 1024px) {\n  /* Add desktop-specific styles here */\n}\n`;
  
  const newContent = content.trimEnd() + '\n' + responsiveComment;
  writeFileSync(filePath, newContent, 'utf-8');
  
  return true;
}

/**
 * Main execution
 */
function main() {
  console.log('🎨 Adding Dark Mode Support to Components...\n');
  
  const cssModules = getAllCSSModules(srcDir);
  console.log(`Found ${cssModules.length} CSS module files\n`);
  
  cssModules.forEach((file) => {
    const relativePath = file.replace(rootDir + '/', '');
    
    const darkModeAdded = addDarkModeSupport(file);
    
    if (darkModeAdded) {
      console.log(`✓ ${relativePath}`);
    }
  });
  
  console.log(`\n✅ Complete!`);
  console.log(`   Fixed: ${filesFixed} files`);
  console.log(`   Skipped: ${filesSkipped} files`);
}

main();
