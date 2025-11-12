#!/usr/bin/env node

/**
 * Debug the /organization page 500 error
 */

const BASE_URL = 'http://localhost:3008';

async function debugPage() {
  console.log('🔍 Debugging /organization page...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/organization`, {
      redirect: 'manual',
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);
    console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.status === 500) {
      const text = await response.text();
      console.log('\n📄 Response Body (first 2000 chars):');
      console.log(text.substring(0, 2000));
      
      // Try to extract error message
      const errorMatch = text.match(/<pre[^>]*>(.*?)<\/pre>/s);
      if (errorMatch) {
        console.log('\n❌ Error Details:');
        console.log(errorMatch[1]);
      }
    } else if (response.status === 307) {
      const location = response.headers.get('location');
      console.log(`\n↪️  Redirecting to: ${location}`);
    }
  } catch (error) {
    console.error('❌ Fetch error:', error);
  }
}

debugPage();
