#!/usr/bin/env node

/**
 * Check for missing imports and dependencies in member routes
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const MEMBER_DIR = './src/app/member';
const HOOKS_DIR = './src/hooks';
const COMPONENTS_DIR = './src/design-system/components';

const issues = [];

function findTsxFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      findTsxFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function checkImports(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const imports = [];
  const localIssues = [];
  
  // Extract import statements
  lines.forEach((line, index) => {
    const importMatch = line.match(/import\s+.*\s+from\s+['"](.+)['"]/);
    if (importMatch) {
      imports.push({
        line: index + 1,
        path: importMatch[1],
        statement: line.trim()
      });
    }
  });
  
  // Check for common issues
  imports.forEach(imp => {
    // Check for missing hooks
    if (imp.path.startsWith('@/hooks/')) {
      const hookName = imp.path.replace('@/hooks/', '');
      const hookPath = join(HOOKS_DIR, hookName + '.ts');
      try {
        statSync(hookPath);
      } catch (e) {
        localIssues.push({
          type: 'missing-hook',
          line: imp.line,
          message: `Hook not found: ${hookName}`,
          import: imp.statement
        });
      }
    }
    
    // Check for missing components
    if (imp.path.startsWith('@/design-system/components/')) {
      const componentPath = imp.path.replace('@/design-system/components/', '');
      const fullPath = join(COMPONENTS_DIR, componentPath);
      
      // Check both .tsx and directory with index.tsx
      const possiblePaths = [
        fullPath + '.tsx',
        join(fullPath, 'index.tsx'),
        join(fullPath, componentPath.split('/').pop() + '.tsx')
      ];
      
      let found = false;
      for (const path of possiblePaths) {
        try {
          statSync(path);
          found = true;
          break;
        } catch (e) {
          // Continue checking
        }
      }
      
      if (!found) {
        localIssues.push({
          type: 'missing-component',
          line: imp.line,
          message: `Component not found: ${componentPath}`,
          import: imp.statement
        });
      }
    }
    
    // Check for missing CSS modules
    if (imp.path.endsWith('.module.css')) {
      const cssPath = imp.path.replace('@/', 'src/');
      try {
        statSync(cssPath);
      } catch (e) {
        localIssues.push({
          type: 'missing-css',
          line: imp.line,
          message: `CSS module not found: ${imp.path}`,
          import: imp.statement
        });
      }
    }
  });
  
  // Check for undefined variables/functions
  const useMatches = content.match(/\buse[A-Z]\w+/g);
  if (useMatches) {
    const uniqueHooks = [...new Set(useMatches)];
    uniqueHooks.forEach(hook => {
      const hookImported = imports.some(imp => imp.statement.includes(hook));
      if (!hookImported && !hook.startsWith('useState') && !hook.startsWith('useEffect') && !hook.startsWith('useCallback') && !hook.startsWith('useMemo') && !hook.startsWith('useRef') && !hook.startsWith('useContext') && !hook.startsWith('useReducer') && !hook.startsWith('useLayoutEffect') && !hook.startsWith('useDebugValue') && !hook.startsWith('useImperativeHandle') && !hook.startsWith('useId') && !hook.startsWith('useTransition') && !hook.startsWith('useDeferredValue') && !hook.startsWith('useSyncExternalStore') && !hook.startsWith('useInsertionEffect')) {
        localIssues.push({
          type: 'missing-import',
          line: 0,
          message: `Hook used but not imported: ${hook}`,
          import: null
        });
      }
    });
  }
  
  return localIssues;
}

console.log('🔍 Checking member routes for import issues...\n');

const files = findTsxFiles(MEMBER_DIR);
console.log(`Found ${files.length} files to check\n`);

files.forEach(file => {
  const fileIssues = checkImports(file);
  if (fileIssues.length > 0) {
    issues.push({
      file: relative(process.cwd(), file),
      issues: fileIssues
    });
  }
});

if (issues.length === 0) {
  console.log('✅ No import issues found!\n');
} else {
  console.log(`❌ Found issues in ${issues.length} files:\n`);
  
  issues.forEach(({ file, issues: fileIssues }) => {
    console.log(`📄 ${file}`);
    fileIssues.forEach(issue => {
      console.log(`   ${issue.type === 'missing-hook' ? '🪝' : issue.type === 'missing-component' ? '🧩' : issue.type === 'missing-css' ? '🎨' : '⚠️'} Line ${issue.line}: ${issue.message}`);
      if (issue.import) {
        console.log(`      ${issue.import}`);
      }
    });
    console.log('');
  });
  
  // Summary
  const byType = {};
  issues.forEach(({ issues: fileIssues }) => {
    fileIssues.forEach(issue => {
      byType[issue.type] = (byType[issue.type] || 0) + 1;
    });
  });
  
  console.log('📊 Summary:');
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });
}
