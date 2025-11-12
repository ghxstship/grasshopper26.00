#!/usr/bin/env node

/**
 * Test all /member routes for 404 and 500 errors
 * Assumes dev server is already running on localhost:3000
 */

const BASE_URL = 'http://localhost:3000';
const TEST_TIMEOUT = 5000;

// All member routes to test
const ROUTES = [
  // Main member routes
  { path: '/member', name: 'Member Root (should redirect to /member/portal)', expectRedirect: true },
  { path: '/member/portal', name: 'Member Portal Dashboard' },
  
  // Membership routes
  { path: '/member/membership/checkout', name: 'Membership Checkout', requiresQuery: '?tier=test' },
  
  // Portal routes
  { path: '/member/portal/advances', name: 'Advances List' },
  { path: '/member/portal/advances/catalog', name: 'Advances Catalog' },
  { path: '/member/portal/advances/catalog/123', name: 'Advance Catalog Detail', expect404: true },
  { path: '/member/portal/advances/checkout', name: 'Advance Checkout' },
  { path: '/member/portal/advances/123', name: 'Advance Detail', expect404: true },
  { path: '/member/portal/advances/123/confirmation', name: 'Advance Confirmation', expect404: true },
  
  { path: '/member/portal/cart', name: 'Shopping Cart' },
  { path: '/member/portal/checkout', name: 'Checkout' },
  { path: '/member/portal/checkout/success', name: 'Checkout Success' },
  
  { path: '/member/portal/credits', name: 'Credits' },
  { path: '/member/portal/favorites', name: 'Favorites' },
  
  { path: '/member/portal/orders', name: 'Orders List' },
  { path: '/member/portal/orders/123', name: 'Order Detail', expect404: true },
  { path: '/member/portal/orders/123/tickets', name: 'Order Tickets', expect404: true },
  { path: '/member/portal/orders/123/transfer', name: 'Ticket Transfer', expect404: true },
  
  { path: '/member/portal/referrals', name: 'Referrals' },
  { path: '/member/portal/schedule', name: 'Schedule' },
  { path: '/member/portal/vouchers', name: 'Vouchers' },
  
  // Profile routes
  { path: '/member/profile/orders', name: 'Profile Orders' },
];

let testResults = [];

async function testRoute(route) {
  const url = `${BASE_URL}${route.path}${route.requiresQuery || ''}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'manual', // Don't follow redirects automatically
      headers: {
        'User-Agent': 'Route-Tester/1.0'
      }
    });

    clearTimeout(timeoutId);

    const result = {
      name: route.name,
      path: route.path,
      status: response.status,
      statusText: response.statusText,
      success: false,
      error: null,
      redirected: [301, 302, 303, 307, 308].includes(response.status),
      redirectLocation: response.headers.get('location')
    };

    // Determine success based on expectations
    if (route.expect404) {
      // For dynamic routes with fake IDs, 404 is expected and OK
      result.success = response.status === 404;
      if (!result.success) {
        result.error = `Expected 404 but got ${response.status}`;
      }
    } else if (route.expectRedirect) {
      // For routes that should redirect
      result.success = result.redirected;
      if (!result.success) {
        result.error = `Expected redirect but got ${response.status}`;
      }
    } else {
      // For normal routes, check for success or auth redirect
      result.success = response.status === 200 || 
                      response.status === 307 || // Next.js redirect
                      (result.redirected && result.redirectLocation?.includes('/login'));
      
      if (!result.success) {
        if (response.status === 500) {
          result.error = 'Server error (500)';
          try {
            const text = await response.text();
            if (text.includes('Error:')) {
              const match = text.match(/Error: ([^\n<]+)/);
              if (match) result.error += `: ${match[1]}`;
            }
          } catch (e) {
            // Ignore text parsing errors
          }
        } else if (response.status === 404) {
          result.error = 'Not found (404)';
        } else {
          result.error = `Unexpected status: ${response.status}`;
        }
      }
    }

    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    return {
      name: route.name,
      path: route.path,
      status: 0,
      statusText: 'Error',
      success: false,
      error: error.name === 'AbortError' ? 'Timeout' : error.message,
      redirected: false
    };
  }
}

async function runTests() {
  console.log('🧪 Testing member routes...\n');
  console.log('=' .repeat(80));
  
  for (const route of ROUTES) {
    process.stdout.write(`Testing: ${route.name.padEnd(50)} `);
    
    const result = await testRoute(route);
    testResults.push(result);

    if (result.success) {
      console.log(`✅ ${result.status} ${result.redirected ? '(redirect)' : ''}`);
    } else {
      console.log(`❌ ${result.status} - ${result.error}`);
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY\n');

  const passed = testResults.filter(r => r.success).length;
  const failed = testResults.filter(r => !r.success).length;
  const total = testResults.length;

  console.log(`Total Routes: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.log('FAILED ROUTES:\n');
    testResults
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`❌ ${r.path}`);
        console.log(`   ${r.name}`);
        console.log(`   Status: ${r.status} - ${r.error}`);
        if (r.redirectLocation) {
          console.log(`   Redirect: ${r.redirectLocation}`);
        }
        console.log('');
      });
  }

  console.log('='.repeat(80));
  
  // Exit with error code if tests failed
  if (failed > 0) {
    process.exit(1);
  }
}

async function main() {
  console.log('🚀 Testing member routes on http://localhost:3000\n');
  console.log('⚠️  Make sure dev server is running first!\n');
  
  try {
    await runTests();
    printSummary();
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

main();
