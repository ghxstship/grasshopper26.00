#!/usr/bin/env tsx

/**
 * Test all public routes for 404 and 500 errors
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

interface RouteTest {
  path: string;
  description: string;
  expectData?: boolean;
  expect404?: boolean;
}

const staticRoutes: RouteTest[] = [
  { path: '/', description: 'Homepage' },
  { path: '/adventures', description: 'Adventures page' },
  { path: '/cookies', description: 'Cookies page' },
  { path: '/events', description: 'Events listing', expectData: true },
  { path: '/legal/privacy', description: 'Legal privacy page' },
  { path: '/legal/terms', description: 'Legal terms page' },
  { path: '/membership', description: 'Membership page' },
  { path: '/music', description: 'Music/Artists listing', expectData: true },
  { path: '/news', description: 'News listing', expectData: true },
  { path: '/privacy', description: 'Privacy page (root)' },
  { path: '/shop', description: 'Shop listing', expectData: true },
  { path: '/terms', description: 'Terms page (root)' },
];

interface TestResult {
  path: string;
  status: number;
  success: boolean;
  error?: string;
  contentType?: string;
}

async function testRoute(route: RouteTest): Promise<TestResult> {
  const url = `${BASE_URL}${route.path}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'GVTEWAY-Route-Tester/1.0',
      },
    });

    const contentType = response.headers.get('content-type') || '';
    
    // If we expect 404, success is when we get 404
    // Otherwise, success is 2xx or 3xx status
    const success = route.expect404 
      ? response.status === 404
      : response.status >= 200 && response.status < 400;

    return {
      path: route.path,
      status: response.status,
      success,
      contentType,
      error: success ? undefined : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      path: route.path,
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function getDynamicRoutes(): Promise<RouteTest[]> {
  const dynamicRoutes: RouteTest[] = [];

  // Get event slugs
  try {
    const eventsResponse = await fetch(`${BASE_URL}/api/events?limit=3`);
    if (eventsResponse.ok) {
      const events = await eventsResponse.json();
      if (Array.isArray(events) && events.length > 0) {
        events.forEach((event: any) => {
          if (event.slug) {
            dynamicRoutes.push({
              path: `/events/${event.slug}`,
              description: `Event detail: ${event.title || event.slug}`,
            });
          }
        });
      }
    }
  } catch (error) {
    console.warn('Could not fetch events for testing:', error);
  }

  // Get artist slugs
  try {
    const artistsResponse = await fetch(`${BASE_URL}/api/artists?limit=3`);
    if (artistsResponse.ok) {
      const artists = await artistsResponse.json();
      if (Array.isArray(artists) && artists.length > 0) {
        artists.forEach((artist: any) => {
          if (artist.slug) {
            dynamicRoutes.push({
              path: `/music/${artist.slug}`,
              description: `Artist detail: ${artist.name || artist.slug}`,
            });
          }
        });
      }
    }
  } catch (error) {
    console.warn('Could not fetch artists for testing:', error);
  }

  // Get news slugs
  try {
    const newsResponse = await fetch(`${BASE_URL}/api/news?limit=3`);
    if (newsResponse.ok) {
      const news = await newsResponse.json();
      if (Array.isArray(news) && news.length > 0) {
        news.forEach((item: any) => {
          if (item.slug) {
            dynamicRoutes.push({
              path: `/news/${item.slug}`,
              description: `News detail: ${item.title || item.slug}`,
            });
          }
        });
      }
    }
  } catch (error) {
    console.warn('Could not fetch news for testing:', error);
  }

  // Get product slugs
  try {
    const productsResponse = await fetch(`${BASE_URL}/api/products?limit=3`);
    if (productsResponse.ok) {
      const products = await productsResponse.json();
      if (Array.isArray(products) && products.length > 0) {
        products.forEach((product: any) => {
          if (product.slug) {
            dynamicRoutes.push({
              path: `/shop/${product.slug}`,
              description: `Product detail: ${product.name || product.slug}`,
            });
          }
        });
      }
    }
  } catch (error) {
    console.warn('Could not fetch products for testing:', error);
  }

  // Test invalid slugs (should return 404)
  dynamicRoutes.push(
    { path: '/events/non-existent-event-12345', description: 'Invalid event (expect 404)', expect404: true },
    { path: '/music/non-existent-artist-12345', description: 'Invalid artist (expect 404)', expect404: true },
    { path: '/news/non-existent-news-12345', description: 'Invalid news (expect 404)', expect404: true },
    { path: '/shop/non-existent-product-12345', description: 'Invalid product (expect 404)', expect404: true }
  );

  return dynamicRoutes;
}

async function main() {
  console.log('🧪 Testing Public Routes\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  const allRoutes = [...staticRoutes];
  
  console.log('📡 Fetching dynamic routes...');
  const dynamicRoutes = await getDynamicRoutes();
  allRoutes.push(...dynamicRoutes);
  console.log(`Found ${dynamicRoutes.length} dynamic routes\n`);

  const results: TestResult[] = [];
  const errors: TestResult[] = [];

  console.log('🔍 Testing routes...\n');

  for (const route of allRoutes) {
    const result = await testRoute(route);
    results.push(result);

    const statusIcon = result.success ? '✅' : '❌';
    const statusText = result.error || `${result.status}`;
    
    console.log(`${statusIcon} ${route.description}`);
    console.log(`   ${route.path} → ${statusText}`);

    if (!result.success) {
      errors.push(result);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  console.log(`Total routes tested: ${results.length}`);
  console.log(`Successful: ${results.filter(r => r.success).length}`);
  console.log(`Failed: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\n❌ Failed Routes:');
    errors.forEach(error => {
      console.log(`   ${error.path} → ${error.error || error.status}`);
    });
    process.exit(1);
  } else {
    console.log('\n✅ All routes passed!');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
