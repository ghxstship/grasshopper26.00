#!/usr/bin/env node

/**
 * Test all (legend) routes for 404 and 500 errors
 */

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
config({ path: join(rootDir, '.env.local') });

const BASE_URL = 'http://localhost:3000';
const ROUTES = [
  '/organizations',
  '/organizations/new',
  '/venues',
  '/staff',
  '/vendors',
  '/membership/companion-passes',
];

// Dynamic routes that need test IDs
const DYNAMIC_ROUTES = [
  { path: '/venues/:id', table: 'venues' },
  { path: '/vendors/:id', table: 'vendors' },
];

const API_ROUTES = [
  '/api/portal/companion-passes',
];

let devServer = null;
let testResults = {
  passed: [],
  failed: [],
  errors: [],
};

async function startDevServer() {
  console.log('🚀 Starting Next.js dev server...\n');
  
  return new Promise((resolve, reject) => {
    devServer = spawn('npm', ['run', 'dev'], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'development' }
    });

    let output = '';
    
    devServer.stdout.on('data', (data) => {
      output += data.toString();
      if (output.includes('Ready in') || output.includes('Local:')) {
        console.log('✅ Dev server started\n');
        resolve();
      }
    });

    devServer.stderr.on('data', (data) => {
      const msg = data.toString();
      if (msg.includes('Error') || msg.includes('error')) {
        console.error('Server error:', msg);
      }
    });

    devServer.on('error', reject);
    
    // Timeout after 60 seconds
    setTimeout(60000).then(() => {
      if (!output.includes('Ready in') && !output.includes('Local:')) {
        reject(new Error('Dev server failed to start within 60 seconds'));
      }
    });
  });
}

async function stopDevServer() {
  if (devServer) {
    console.log('\n🛑 Stopping dev server...');
    devServer.kill();
    await setTimeout(2000);
  }
}

async function testRoute(route, method = 'GET') {
  try {
    const url = `${BASE_URL}${route}`;
    console.log(`Testing ${method} ${route}...`);
    
    const response = await fetch(url, { 
      method,
      headers: {
        'Cookie': 'test-mode=true'
      }
    });
    
    const status = response.status;
    const statusText = response.statusText;
    
    if (status === 404) {
      testResults.failed.push({ route, status, error: '404 Not Found' });
      console.log(`  ❌ 404 Not Found`);
      return false;
    } else if (status >= 500) {
      const text = await response.text();
      testResults.failed.push({ route, status, error: `${status} ${statusText}`, details: text.substring(0, 200) });
      console.log(`  ❌ ${status} ${statusText}`);
      return false;
    } else if (status === 401 || status === 403) {
      // Auth errors are expected for protected routes
      testResults.passed.push({ route, status, note: 'Auth required (expected)' });
      console.log(`  ⚠️  ${status} ${statusText} (auth required - expected)`);
      return true;
    } else if (status >= 200 && status < 400) {
      testResults.passed.push({ route, status });
      console.log(`  ✅ ${status} ${statusText}`);
      return true;
    } else {
      testResults.failed.push({ route, status, error: `Unexpected status: ${status}` });
      console.log(`  ⚠️  ${status} ${statusText}`);
      return false;
    }
  } catch (error) {
    testResults.errors.push({ route, error: error.message });
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

async function getTestIds() {
  console.log('📋 Fetching test IDs from database...\n');
  
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const ids = {};
  
  for (const route of DYNAMIC_ROUTES) {
    const { data, error } = await supabase
      .from(route.table)
      .select('id')
      .limit(1)
      .single();
    
    if (data?.id) {
      ids[route.table] = data.id;
      console.log(`  Found ${route.table} ID: ${data.id}`);
    } else {
      console.log(`  ⚠️  No ${route.table} records found`);
    }
  }
  
  console.log('');
  return ids;
}

async function runTests() {
  console.log('🧪 LEGEND ROUTES TEST SUITE\n');
  console.log('=' .repeat(50) + '\n');

  try {
    // Start dev server
    await startDevServer();
    await setTimeout(3000); // Give it extra time to be ready

    // Get test IDs for dynamic routes
    const testIds = await getTestIds();

    // Test static routes
    console.log('📍 Testing static routes...\n');
    for (const route of ROUTES) {
      await testRoute(route);
      await setTimeout(500); // Rate limit
    }

    // Test dynamic routes
    if (Object.keys(testIds).length > 0) {
      console.log('\n📍 Testing dynamic routes...\n');
      for (const route of DYNAMIC_ROUTES) {
        const id = testIds[route.table];
        if (id) {
          const testPath = route.path.replace(':id', id);
          await testRoute(testPath);
          await setTimeout(500);
        }
      }
    }

    // Test API routes
    console.log('\n📍 Testing API routes...\n');
    for (const route of API_ROUTES) {
      await testRoute(route);
      await setTimeout(500);
    }

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY\n');
    console.log(`✅ Passed: ${testResults.passed.length}`);
    console.log(`❌ Failed: ${testResults.failed.length}`);
    console.log(`⚠️  Errors: ${testResults.errors.length}`);
    
    if (testResults.failed.length > 0) {
      console.log('\n❌ FAILED ROUTES:');
      testResults.failed.forEach(({ route, status, error, details }) => {
        console.log(`\n  ${route}`);
        console.log(`    Status: ${status}`);
        console.log(`    Error: ${error}`);
        if (details) {
          console.log(`    Details: ${details}`);
        }
      });
    }

    if (testResults.errors.length > 0) {
      console.log('\n⚠️  ERRORS:');
      testResults.errors.forEach(({ route, error }) => {
        console.log(`\n  ${route}`);
        console.log(`    ${error}`);
      });
    }

    console.log('\n' + '='.repeat(50));

    // Exit with error code if tests failed
    const exitCode = testResults.failed.length > 0 || testResults.errors.length > 0 ? 1 : 0;
    
    await stopDevServer();
    process.exit(exitCode);

  } catch (error) {
    console.error('\n❌ Test suite error:', error.message);
    await stopDevServer();
    process.exit(1);
  }
}

// Handle cleanup on exit
process.on('SIGINT', async () => {
  await stopDevServer();
  process.exit(1);
});

process.on('SIGTERM', async () => {
  await stopDevServer();
  process.exit(1);
});

runTests();
