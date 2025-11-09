#!/usr/bin/env tsx

/**
 * API Documentation Generator
 * 
 * Scans the API routes directory and generates comprehensive documentation
 * including endpoint inventory, statistics, and validation against OpenAPI spec.
 * 
 * Usage:
 *   npm run generate-api-docs
 *   or
 *   tsx scripts/generate-api-docs.ts
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

interface APIEndpoint {
  path: string;
  method: string;
  file: string;
  category: string;
}

interface APIStats {
  totalEndpoints: number;
  byCategory: Record<string, number>;
  byMethod: Record<string, number>;
  documented: number;
  undocumented: number;
}

const API_DIR = path.join(process.cwd(), 'src/app/api');
const OPENAPI_FILE = path.join(process.cwd(), 'public/api-docs/openapi.yaml');
const OUTPUT_FILE = path.join(process.cwd(), 'docs/api/API_INVENTORY.md');

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * Recursively scan directory for route.ts files
 */
function scanAPIRoutes(dir: string, basePath: string = ''): APIEndpoint[] {
  const endpoints: APIEndpoint[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip certain directories
      if (entry.name.startsWith('_') || entry.name === 'node_modules') {
        continue;
      }

      // Build API path from directory structure
      const isDynamicRoute = entry.name.startsWith('[') && entry.name.endsWith(']');
      const pathSegment = isDynamicRoute 
        ? entry.name.slice(1, -1) // Remove brackets
        : entry.name;
      
      const newBasePath = basePath + '/' + (isDynamicRoute ? `{${pathSegment}}` : pathSegment);
      endpoints.push(...scanAPIRoutes(fullPath, newBasePath));
    } else if (entry.name === 'route.ts') {
      // Read file to detect HTTP methods
      const content = fs.readFileSync(fullPath, 'utf-8');
      const detectedMethods: string[] = [];

      for (const method of HTTP_METHODS) {
        // Look for export const GET/POST/etc patterns
        const regex = new RegExp(`export\\s+(const|async\\s+function)\\s+${method}`, 'g');
        if (regex.test(content)) {
          detectedMethods.push(method);
        }
      }

      // Determine category from path
      const category = basePath.split('/')[1] || 'root';

      // Add endpoint for each detected method
      for (const method of detectedMethods) {
        endpoints.push({
          path: basePath || '/',
          method,
          file: fullPath.replace(process.cwd(), ''),
          category,
        });
      }
    }
  }

  return endpoints;
}

/**
 * Load and parse OpenAPI specification
 */
function loadOpenAPISpec(): any {
  try {
    const content = fs.readFileSync(OPENAPI_FILE, 'utf-8');
    return yaml.load(content);
  } catch (error) {
    console.warn('Could not load OpenAPI spec:', error);
    return null;
  }
}

/**
 * Check if endpoint is documented in OpenAPI spec
 */
function isDocumented(endpoint: APIEndpoint, openapi: any): boolean {
  if (!openapi || !openapi.paths) return false;
  
  const path = endpoint.path;
  const method = endpoint.method.toLowerCase();
  
  return !!(openapi.paths[path]?.[method]);
}

/**
 * Generate statistics
 */
function generateStats(endpoints: APIEndpoint[], openapi: any): APIStats {
  const stats: APIStats = {
    totalEndpoints: endpoints.length,
    byCategory: {},
    byMethod: {},
    documented: 0,
    undocumented: 0,
  };

  for (const endpoint of endpoints) {
    // Count by category
    stats.byCategory[endpoint.category] = (stats.byCategory[endpoint.category] || 0) + 1;
    
    // Count by method
    stats.byMethod[endpoint.method] = (stats.byMethod[endpoint.method] || 0) + 1;
    
    // Count documented vs undocumented
    if (isDocumented(endpoint, openapi)) {
      stats.documented++;
    } else {
      stats.undocumented++;
    }
  }

  return stats;
}

/**
 * Generate markdown documentation
 */
function generateMarkdown(endpoints: APIEndpoint[], stats: APIStats, openapi: any): string {
  const timestamp = new Date().toISOString();
  
  let md = `# API Endpoint Inventory\n\n`;
  md += `**Generated:** ${timestamp}\n\n`;
  md += `**Total Endpoints:** ${stats.totalEndpoints}\n\n`;
  
  // Statistics section
  md += `## Statistics\n\n`;
  md += `### Documentation Coverage\n`;
  md += `- ✅ Documented: ${stats.documented} (${Math.round(stats.documented / stats.totalEndpoints * 100)}%)\n`;
  md += `- ⚠️ Undocumented: ${stats.undocumented} (${Math.round(stats.undocumented / stats.totalEndpoints * 100)}%)\n\n`;
  
  md += `### By HTTP Method\n`;
  for (const [method, count] of Object.entries(stats.byMethod).sort()) {
    md += `- ${method}: ${count}\n`;
  }
  md += `\n`;
  
  md += `### By Category\n`;
  for (const [category, count] of Object.entries(stats.byCategory).sort()) {
    md += `- ${category}: ${count}\n`;
  }
  md += `\n`;
  
  // Endpoints by category
  md += `## Endpoints by Category\n\n`;
  
  const byCategory = endpoints.reduce((acc, endpoint) => {
    if (!acc[endpoint.category]) {
      acc[endpoint.category] = [];
    }
    acc[endpoint.category].push(endpoint);
    return acc;
  }, {} as Record<string, APIEndpoint[]>);
  
  for (const [category, categoryEndpoints] of Object.entries(byCategory).sort()) {
    md += `### ${category.toUpperCase()}\n\n`;
    md += `| Method | Path | Documented | File |\n`;
    md += `|--------|------|------------|------|\n`;
    
    for (const endpoint of categoryEndpoints.sort((a, b) => a.path.localeCompare(b.path))) {
      const documented = isDocumented(endpoint, openapi) ? '✅' : '❌';
      md += `| ${endpoint.method} | \`${endpoint.path}\` | ${documented} | \`${endpoint.file}\` |\n`;
    }
    md += `\n`;
  }
  
  // Undocumented endpoints section
  if (stats.undocumented > 0) {
    md += `## ⚠️ Undocumented Endpoints\n\n`;
    md += `The following endpoints need to be added to the OpenAPI specification:\n\n`;
    
    for (const endpoint of endpoints) {
      if (!isDocumented(endpoint, openapi)) {
        md += `- \`${endpoint.method} ${endpoint.path}\` - ${endpoint.file}\n`;
      }
    }
    md += `\n`;
  }
  
  return md;
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Scanning API routes...');
  const endpoints = scanAPIRoutes(API_DIR);
  console.log(`✅ Found ${endpoints.length} endpoints`);
  
  console.log('📖 Loading OpenAPI specification...');
  const openapi = loadOpenAPISpec();
  
  console.log('📊 Generating statistics...');
  const stats = generateStats(endpoints, openapi);
  
  console.log('📝 Generating documentation...');
  const markdown = generateMarkdown(endpoints, stats, openapi);
  
  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write output
  fs.writeFileSync(OUTPUT_FILE, markdown);
  console.log(`✅ Documentation written to ${OUTPUT_FILE}`);
  
  // Print summary
  console.log('\n📊 Summary:');
  console.log(`   Total Endpoints: ${stats.totalEndpoints}`);
  console.log(`   Documented: ${stats.documented} (${Math.round(stats.documented / stats.totalEndpoints * 100)}%)`);
  console.log(`   Undocumented: ${stats.undocumented} (${Math.round(stats.undocumented / stats.totalEndpoints * 100)}%)`);
  
  if (stats.undocumented > 0) {
    console.log('\n⚠️  Warning: Some endpoints are not documented in OpenAPI spec');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { scanAPIRoutes, generateStats, generateMarkdown };
