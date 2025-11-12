#!/usr/bin/env node

/**
 * Test all organization routes for 404 and 500 errors
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3008';

const routes = [
  // Static routes
  '/organization',
  '/organization/advances',
  '/organization/artists',
  '/organization/artists/create',
  '/organization/brands',
  '/organization/budgets',
  '/organization/bulk-operations',
  '/organization/contracts',
  '/organization/credentials/check-in',
  '/organization/equipment',
  '/organization/events',
  '/organization/events/create',
  '/organization/events/new',
  '/organization/inventory',
  '/organization/marketing/campaigns',
  '/organization/orders',
  '/organization/permissions-test',
  '/organization/products',
  '/organization/products/new',
  '/organization/reports',
  '/organization/roles',
  '/organization/settings',
  '/organization/tasks',
  '/organization/tickets',
  '/organization/users',
  '/organization/venues',
];

const dynamicRoutes = [
  // Routes that need IDs - we'll test with placeholder IDs
  { path: '/organization/advances/[id]', testId: 'test-id' },
  { path: '/organization/brands/[id]', testId: 'test-id' },
  { path: '/organization/budgets/[id]', testId: 'test-id' },
  { path: '/organization/events/[id]/artists', testId: 'test-id' },
  { path: '/organization/events/[id]/check-in', testId: 'test-id' },
  { path: '/organization/events/[id]/credentials', testId: 'test-id' },
  { path: '/organization/events/[id]/credentials/issue', testId: 'test-id' },
  { path: '/organization/events/[id]/edit', testId: 'test-id' },
  { path: '/organization/events/[id]/schedule', testId: 'test-id' },
  { path: '/organization/events/[id]/team', testId: 'test-id' },
  { path: '/organization/events/[id]/tickets', testId: 'test-id' },
  { path: '/organization/events/[id]/vendors', testId: 'test-id' },
  { path: '/organization/orders/[id]', testId: 'test-id' },
  { path: '/organization/orders/[id]/refund', testId: 'test-id' },
  { path: '/organization/orders/[id]/resend-tickets', testId: 'test-id' },
  { path: '/organization/tasks/[id]', testId: 'test-id' },
];

const errors = [];
const warnings = [];

async function testRoute(path) {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      redirect: 'manual',
    });

    const status = response.status;

    if (status === 500) {
      errors.push({ path, status, type: 'SERVER_ERROR' });
      return { path, status, ok: false };
    }

    if (status === 404) {
      warnings.push({ path, status, type: 'NOT_FOUND' });
      return { path, status, ok: false };
    }

    // 401/403 are expected for protected routes without auth
    if (status === 401 || status === 403) {
      return { path, status, ok: true, note: 'AUTH_REQUIRED' };
    }

    // Redirects are OK (likely to login)
    if (status >= 300 && status < 400) {
      return { path, status, ok: true, note: 'REDIRECT' };
    }

    if (status === 200) {
      return { path, status, ok: true };
    }

    warnings.push({ path, status, type: 'UNEXPECTED_STATUS' });
    return { path, status, ok: false };
  } catch (error) {
    errors.push({ path, error: error.message, type: 'FETCH_ERROR' });
    return { path, error: error.message, ok: false };
  }
}

async function runTests() {
  console.log('🧪 Testing Organization Routes\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  console.log('📋 Testing static routes...\n');
  const staticResults = [];
  for (const route of routes) {
    const result = await testRoute(route);
    staticResults.push(result);
    
    const icon = result.ok ? '✅' : result.status === 404 ? '⚠️' : '❌';
    const note = result.note ? ` (${result.note})` : '';
    console.log(`${icon} ${result.path} - ${result.status}${note}`);
  }

  console.log('\n📋 Testing dynamic routes...\n');
  const dynamicResults = [];
  for (const { path, testId } of dynamicRoutes) {
    const testPath = path.replace('[id]', testId).replace('[credentialId]', testId);
    const result = await testRoute(testPath);
    dynamicResults.push(result);
    
    const icon = result.ok ? '✅' : result.status === 404 ? '⚠️' : '❌';
    const note = result.note ? ` (${result.note})` : '';
    console.log(`${icon} ${testPath} - ${result.status}${note}`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY\n');

  const totalTests = staticResults.length + dynamicResults.length;
  const passed = [...staticResults, ...dynamicResults].filter(r => r.ok).length;
  const failed = totalTests - passed;

  console.log(`Total Routes Tested: ${totalTests}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);

  if (errors.length > 0) {
    console.log('\n🚨 CRITICAL ERRORS (500s and fetch errors):\n');
    errors.forEach(err => {
      console.log(`  ❌ ${err.path || 'Unknown'}`);
      console.log(`     Status: ${err.status || 'N/A'}`);
      console.log(`     Type: ${err.type}`);
      if (err.error) console.log(`     Error: ${err.error}`);
      console.log('');
    });
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS (404s and unexpected statuses):\n');
    warnings.forEach(warn => {
      console.log(`  ⚠️  ${warn.path}`);
      console.log(`     Status: ${warn.status}`);
      console.log(`     Type: ${warn.type}`);
      console.log('');
    });
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('\n🎉 All routes are working correctly!');
  }

  console.log('='.repeat(80));

  // Exit with error code if there are critical errors
  if (errors.length > 0) {
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
