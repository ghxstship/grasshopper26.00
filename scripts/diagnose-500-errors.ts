#!/usr/bin/env tsx

/**
 * Diagnose 500 errors on public routes
 */

const BASE_URL = 'http://localhost:3000';

async function diagnoseRoute(path: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${path}`);
  console.log('='.repeat(60));

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'GVTEWAY-Diagnostic/1.0',
      },
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}`);

    if (response.status === 500) {
      const text = await response.text();
      console.log('\n500 Error Response:');
      console.log(text.substring(0, 500));
      
      // Try to extract error details
      if (text.includes('Error:')) {
        const errorMatch = text.match(/Error: ([^\n<]+)/);
        if (errorMatch) {
          console.log('\nExtracted Error:', errorMatch[1]);
        }
      }
    } else if (response.ok) {
      console.log('✅ Route is working');
    }
  } catch (error) {
    console.error('❌ Fetch failed:', error instanceof Error ? error.message : error);
  }
}

async function main() {
  console.log('🔍 Diagnosing 500 Errors on Public Routes\n');
  
  const routes = [
    '/',
    '/events',
    '/music',
    '/shop',
    '/news',
  ];

  for (const route of routes) {
    await diagnoseRoute(route);
  }
}

main().catch(console.error);
