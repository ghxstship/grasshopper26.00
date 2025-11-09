#!/usr/bin/env tsx
/**
 * Atomic Design System Audit Script
 * Comprehensive audit for design token compliance, accessibility, and best practices
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'fast-glob';

interface AuditViolation {
  file: string;
  line: number;
  column?: number;
  violation: string;
  code: string;
  suggestion: string;
  severity: 'error' | 'warning' | 'info';
  category: 'design-tokens' | 'accessibility' | 'responsive' | 'i18n' | 'privacy';
}

interface AuditReport {
  timestamp: string;
  totalFiles: number;
  violations: AuditViolation[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
    byCategory: Record<string, number>;
  };
}

// Forbidden patterns that violate design token principles
const FORBIDDEN_PATTERNS = [
  // Hardcoded hex colors
  {
    pattern: /#([0-9A-Fa-f]{3,8})\b/g,
    name: 'Hardcoded hex color',
    suggestion: 'Use CSS variables (var(--color-*)) or semantic color tokens',
    severity: 'error' as const,
    category: 'design-tokens' as const,
    exclude: ['/design-system/tokens/', '/lib/imageProcessing/', '/lib/ticketing/qr-codes', '/lib/tickets/qr-generator', '/lib/tickets/pdf-generator', 'manifest.ts'],
  },
  // Hardcoded RGB/RGBA colors
  {
    pattern: /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/g,
    name: 'Hardcoded RGB/RGBA color',
    suggestion: 'Use CSS variables (var(--color-*)) or semantic color tokens',
    severity: 'error' as const,
    category: 'design-tokens' as const,
    exclude: ['/design-system/tokens/', '/lib/imageProcessing/'],
  },
  // Hardcoded pixel values (except in design tokens)
  {
    pattern: /:\s*(\d+)px(?!\s*\/)/g,
    name: 'Hardcoded pixel value',
    suggestion: 'Use spacing tokens (var(--space-*)) or rem units',
    severity: 'warning' as const,
    category: 'design-tokens' as const,
    exclude: ['/design-system/tokens/', '/hooks/use-media-query', '/lib/email/', '/lib/accessibility/'],
  },
  // Directional properties (not RTL-friendly)
  {
    pattern: /(margin|padding)-(left|right):/g,
    name: 'Directional property (not RTL-friendly)',
    suggestion: 'Use logical properties: margin-inline-start, margin-inline-end',
    severity: 'error' as const,
    category: 'i18n' as const,
    exclude: ['/design-system/tokens/'],
  },
  {
    pattern: /text-align:\s*(left|right)/g,
    name: 'Directional text-align (not RTL-friendly)',
    suggestion: 'Use text-align: start or text-align: end',
    severity: 'error' as const,
    category: 'i18n' as const,
    exclude: ['/design-system/tokens/'],
  },
  // Missing ARIA labels on interactive elements
  {
    pattern: /<button[^>]*>(?!.*aria-label)(?!.*aria-labelledby)/g,
    name: 'Button without aria-label',
    suggestion: 'Add aria-label or aria-labelledby for screen readers',
    severity: 'warning' as const,
    category: 'accessibility' as const,
  },
  // Images without alt text
  {
    pattern: /<img[^>]*(?!alt=)/g,
    name: 'Image without alt attribute',
    suggestion: 'Add alt="" for decorative images or descriptive alt text',
    severity: 'error' as const,
    category: 'accessibility' as const,
  },
  // Hardcoded strings (should be i18n)
  {
    pattern: />\s*["']([A-Z][a-z]+\s+[a-z]+)["']\s*</g,
    name: 'Hardcoded UI string',
    suggestion: 'Use translation keys with i18n system',
    severity: 'info' as const,
    category: 'i18n' as const,
    exclude: ['/design-system/', '/lib/', '/types/'],
  },
];

// Tailwind utility classes that should be replaced with design tokens
const TAILWIND_VIOLATIONS = [
  {
    pattern: /className=["'][^"']*\b(bg|text|border)-(red|blue|green|yellow|purple|pink|indigo|gray)-\d{3}\b/g,
    name: 'Tailwind color utility class',
    suggestion: 'Use semantic CSS classes or CSS variables',
    severity: 'warning' as const,
    category: 'design-tokens' as const,
  },
  {
    pattern: /className=["'][^"']*\b(p|m|w|h)-\d+\b/g,
    name: 'Tailwind spacing utility class',
    suggestion: 'Use semantic CSS classes with design tokens',
    severity: 'info' as const,
    category: 'design-tokens' as const,
  },
];

function shouldExcludeFile(filePath: string, excludePatterns: string[]): boolean {
  return excludePatterns.some(pattern => filePath.includes(pattern));
}

function scanFile(filePath: string): AuditViolation[] {
  const violations: AuditViolation[] = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Check forbidden patterns
    [...FORBIDDEN_PATTERNS, ...TAILWIND_VIOLATIONS].forEach((rule) => {
      const { pattern, name, suggestion, severity, category } = rule;
      const exclude = 'exclude' in rule ? rule.exclude || [] : [];
      
      if (shouldExcludeFile(filePath, exclude)) {
        return;
      }
      
      lines.forEach((line, index) => {
        const matches = line.matchAll(pattern);
        for (const match of matches) {
          violations.push({
            file: filePath,
            line: index + 1,
            column: match.index,
            violation: name,
            code: line.trim(),
            suggestion,
            severity,
            category,
          });
        }
      });
    });
  } catch (error) {
    console.error(`Error scanning ${filePath}:`, error);
  }
  
  return violations;
}

async function runAudit(): Promise<AuditReport> {
  const srcPath = path.join(process.cwd(), 'src');
  
  // Find all relevant files
  const files = await glob('**/*.{tsx,ts,css,scss}', {
    cwd: srcPath,
    absolute: true,
    ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**'],
  });
  
  console.log(`\n🔍 Scanning ${files.length} files for violations...\n`);
  
  let allViolations: AuditViolation[] = [];
  
  files.forEach((file: string, index: number) => {
    if (index % 10 === 0) {
      process.stdout.write(`\rProgress: ${index}/${files.length} files`);
    }
    const violations = scanFile(file);
    allViolations = allViolations.concat(violations);
  });
  
  process.stdout.write(`\rProgress: ${files.length}/${files.length} files ✓\n\n`);
  
  // Generate summary
  const summary = {
    errors: allViolations.filter(v => v.severity === 'error').length,
    warnings: allViolations.filter(v => v.severity === 'warning').length,
    info: allViolations.filter(v => v.severity === 'info').length,
    byCategory: {} as Record<string, number>,
  };
  
  allViolations.forEach(v => {
    summary.byCategory[v.category] = (summary.byCategory[v.category] || 0) + 1;
  });
  
  return {
    timestamp: new Date().toISOString(),
    totalFiles: files.length,
    violations: allViolations,
    summary,
  };
}

function generateReport(report: AuditReport): string {
  const { violations, summary } = report;
  
  let output = `
# ATOMIC DESIGN SYSTEM AUDIT REPORT
Generated: ${new Date(report.timestamp).toLocaleString()}
Total Files Scanned: ${report.totalFiles}

## EXECUTIVE SUMMARY

- 🔴 **Errors**: ${summary.errors}
- 🟡 **Warnings**: ${summary.warnings}
- 🔵 **Info**: ${summary.info}
- **Total Violations**: ${violations.length}

### Violations by Category
${Object.entries(summary.byCategory)
  .map(([cat, count]) => `- **${cat}**: ${count}`)
  .join('\n')}

---

## DETAILED VIOLATIONS

`;
  
  // Group violations by category
  const byCategory = violations.reduce((acc, v) => {
    if (!acc[v.category]) acc[v.category] = [];
    acc[v.category].push(v);
    return acc;
  }, {} as Record<string, AuditViolation[]>);
  
  Object.entries(byCategory).forEach(([category, viols]) => {
    output += `\n### ${category.toUpperCase()} (${viols.length} violations)\n\n`;
    
    // Group by violation type
    const byType = viols.reduce((acc, v) => {
      if (!acc[v.violation]) acc[v.violation] = [];
      acc[v.violation].push(v);
      return acc;
    }, {} as Record<string, AuditViolation[]>);
    
    Object.entries(byType).forEach(([type, typeViols]) => {
      output += `\n#### ${type} (${typeViols.length} occurrences)\n\n`;
      output += `**Suggestion**: ${typeViols[0].suggestion}\n\n`;
      
      // Show first 10 examples
      const examples = typeViols.slice(0, 10);
      examples.forEach(v => {
        const severity = v.severity === 'error' ? '🔴' : v.severity === 'warning' ? '🟡' : '🔵';
        output += `${severity} \`${v.file.replace(process.cwd(), '')}:${v.line}\`\n`;
        output += `\`\`\`\n${v.code}\n\`\`\`\n\n`;
      });
      
      if (typeViols.length > 10) {
        output += `_...and ${typeViols.length - 10} more occurrences_\n\n`;
      }
    });
  });
  
  output += `\n---\n\n## RECOMMENDATIONS\n\n`;
  
  if (summary.errors > 0) {
    output += `### 🔴 Critical Issues (${summary.errors} errors)\n\n`;
    output += `These violations MUST be fixed before deployment:\n\n`;
    output += `1. Replace all hardcoded colors with CSS variables or semantic tokens\n`;
    output += `2. Use logical properties for RTL support\n`;
    output += `3. Add alt attributes to all images\n\n`;
  }
  
  if (summary.warnings > 0) {
    output += `### 🟡 Warnings (${summary.warnings} warnings)\n\n`;
    output += `These should be addressed to improve code quality:\n\n`;
    output += `1. Replace hardcoded pixel values with spacing tokens\n`;
    output += `2. Add ARIA labels to interactive elements\n`;
    output += `3. Replace Tailwind utility classes with semantic CSS\n\n`;
  }
  
  output += `\n## NEXT STEPS\n\n`;
  output += `1. Review this report and prioritize fixes\n`;
  output += `2. Implement design token system comprehensively\n`;
  output += `3. Add ESLint rules to prevent future violations\n`;
  output += `4. Set up automated accessibility testing\n`;
  output += `5. Create component library documentation\n\n`;
  
  return output;
}

// Run the audit
runAudit()
  .then(report => {
    const reportText = generateReport(report);
    
    // Save report to file
    const reportPath = path.join(process.cwd(), 'docs', 'audits', 'ATOMIC_DESIGN_AUDIT_REPORT.md');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, reportText);
    
    console.log(reportText);
    console.log(`\n📄 Full report saved to: ${reportPath}\n`);
    
    // Exit with error code if there are critical violations
    if (report.summary.errors > 0) {
      console.error(`\n❌ Audit failed with ${report.summary.errors} critical errors\n`);
      process.exit(1);
    } else {
      console.log(`\n✅ Audit completed successfully\n`);
      process.exit(0);
    }
  })
  .catch(error => {
    console.error('Audit failed:', error);
    process.exit(1);
  });
