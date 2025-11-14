#!/usr/bin/env node
/**
 * Script to replace console.log statements with proper logger calls
 * Run with: node scripts/replace-console-logs.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const filesToFix = [
  'src/app/api/webhooks/stripe/enhanced/route.ts',
  'src/design-system/utils/realtime-helpers.ts',
  'src/app/api/webhooks/resend/route.ts',
  'src/lib/offline/check-in-queue.ts',
  'src/lib/performance/optimization.ts',
  'src/lib/privacy/data-export.ts',
  'src/app/api/cron/allocate-credits/route.ts',
  'src/app/api/cron/churn-prevention/route.ts',
  'src/app/api/cron/expire-credits/route.ts',
  'src/app/api/cron/renewal-reminders/route.ts',
  'src/design-system/utils/analytics-helpers.ts',
  'src/design-system/utils/logger-helpers.ts',
  'src/hooks/use-realtime.ts',
  'src/app/api/webhooks/stripe/route.ts',
  'src/lib/analytics/events.ts',
  'src/lib/api/middleware.ts',
  'src/lib/email/client.ts',
  'src/lib/integrations/wallet.ts',
  'src/lib/webhooks/idempotency.ts',
];

let totalFixed = 0;
let filesModified = 0;

console.log('🔍 Scanning files for console.log statements...\n');

for (const file of filesToFix) {
  try {
    let content = readFileSync(file, 'utf8');
    const originalContent = content;
    let fileFixed = 0;

    // Check if logger is already imported
    const hasLoggerImport = content.includes("from '@/design-system/utils/logger-helpers'");
    
    // Count console statements
    const consoleMatches = content.match(/console\.(log|error|warn|info|debug)/g);
    if (!consoleMatches) {
      console.log(`✓ ${file} - No console statements found`);
      continue;
    }

    console.log(`📝 ${file} - Found ${consoleMatches.length} console statements`);

    // Add logger import if not present
    if (!hasLoggerImport) {
      // Find the last import statement
      const importRegex = /import .+ from .+;/g;
      const imports = content.match(importRegex);
      if (imports && imports.length > 0) {
        const lastImport = imports[imports.length - 1];
        const lastImportIndex = content.lastIndexOf(lastImport);
        const insertPosition = lastImportIndex + lastImport.length;
        content = content.slice(0, insertPosition) + 
                  "\nimport { logger } from '@/design-system/utils/logger-helpers';" +
                  content.slice(insertPosition);
        fileFixed++;
      }
    }

    // Replace console.log patterns
    // Pattern 1: console.log with template literals
    content = content.replace(
      /console\.log\(`([^`]+)`\)/g,
      (match, message) => {
        fileFixed++;
        // Extract variables from template literal
        const vars = message.match(/\$\{([^}]+)\}/g);
        if (vars) {
          const cleanMessage = message.replace(/\$\{[^}]+\}/g, '').trim();
          const varNames = vars.map(v => v.replace(/\$\{|\}/g, '').trim());
          const contextObj = varNames.map(v => `${v.replace(/\./g, '_')}: ${v}`).join(', ');
          return `logger.info('${cleanMessage}', { ${contextObj}, context: 'system' })`;
        }
        return `logger.info('${message}', { context: 'system' })`;
      }
    );

    // Pattern 2: console.log with string literals
    content = content.replace(
      /console\.log\('([^']+)'\)/g,
      (match, message) => {
        fileFixed++;
        return `logger.info('${message}', { context: 'system' })`;
      }
    );

    // Pattern 3: console.error with template literals
    content = content.replace(
      /console\.error\(`([^`]+)`\)/g,
      (match, message) => {
        fileFixed++;
        return `logger.error('${message}', new Error('${message}'), { context: 'system' })`;
      }
    );

    // Pattern 4: console.error with string literals and error object
    content = content.replace(
      /console\.error\('([^']+)'[,\s]+([^)]+)\)/g,
      (match, message, errorVar) => {
        fileFixed++;
        return `logger.error('${message}', ${errorVar} as Error, { context: 'system' })`;
      }
    );

    // Pattern 5: console.error with just string
    content = content.replace(
      /console\.error\('([^']+)'\)/g,
      (match, message) => {
        fileFixed++;
        return `logger.error('${message}', new Error('${message}'), { context: 'system' })`;
      }
    );

    // Pattern 6: console.warn
    content = content.replace(
      /console\.warn\('([^']+)'\)/g,
      (match, message) => {
        fileFixed++;
        return `logger.warn('${message}', { context: 'system' })`;
      }
    );

    // Only write if content changed
    if (content !== originalContent) {
      writeFileSync(file, content, 'utf8');
      filesModified++;
      totalFixed += fileFixed;
      console.log(`  ✅ Fixed ${fileFixed} statements in ${file}`);
    } else {
      console.log(`  ⚠️  No changes made to ${file}`);
    }

  } catch (error) {
    console.error(`  ❌ Error processing ${file}:`, error.message);
  }
}

console.log(`\n✨ Complete!`);
console.log(`📊 Summary:`);
console.log(`   - Files modified: ${filesModified}`);
console.log(`   - Total statements fixed: ${totalFixed}`);
console.log(`\n⚠️  Note: Some console statements in logger-helpers.ts are intentional and should remain.`);
console.log(`   Please review changes and run: npm run build && npm test`);
