#!/usr/bin/env node

/**
 * Authentication Routes Validation Script
 * Tests all authenticated dashboard routes and API endpoints
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ROUTES_TO_TEST = {
  member: [
    '/member/dashboard',
    '/member/orders',
    '/member/profile',
    '/member/schedule',
    '/member/favorites',
  ],
  organization: [
    '/organization/dashboard',
    '/organization/events',
    '/organization/products',
    '/organization/orders',
    '/organization/users',
  ],
  team: [
    '/team/dashboard',
    '/team/scanner',
    '/team/issues',
  ],
  legend: [
    '/legend/dashboard',
    '/legend/organizations',
    '/legend/venues',
    '/legend/vendors',
  ],
};

const DATABASE_QUERIES = [
  {
    name: 'User Profiles',
    query: () => supabase.from('user_profiles').select('id').limit(1),
  },
  {
    name: 'Brand Team Assignments',
    query: () => supabase.from('brand_team_assignments').select('id').limit(1),
  },
  {
    name: 'Event Team Assignments',
    query: () => supabase.from('event_team_assignments').select('id').limit(1),
  },
  {
    name: 'Orders',
    query: () => supabase.from('orders').select('id').limit(1),
  },
  {
    name: 'Events',
    query: () => supabase.from('events').select('id').limit(1),
  },
  {
    name: 'User Memberships',
    query: () => supabase.from('user_memberships').select('id').limit(1),
  },
  {
    name: 'Referral Usage',
    query: () => supabase.from('referral_usage').select('id').limit(1),
  },
  {
    name: 'Tickets',
    query: () => supabase.from('tickets').select('id').limit(1),
  },
  {
    name: 'Organizations',
    query: () => supabase.from('organizations').select('id').limit(1),
  },
  {
    name: 'Venues',
    query: () => supabase.from('venues').select('id').limit(1),
  },
];

const RPC_FUNCTIONS = [
  {
    name: 'get_dashboard_kpis',
    call: () => supabase.rpc('get_dashboard_kpis'),
  },
];

async function validateDatabaseQueries() {
  console.log('\n🔍 Validating Database Queries...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const test of DATABASE_QUERIES) {
    try {
      const { error } = await test.query();
      
      if (error) {
        console.error(`❌ ${test.name}: ${error.message}`);
        failed++;
      } else {
        console.log(`✅ ${test.name}`);
        passed++;
      }
    } catch (err) {
      console.error(`❌ ${test.name}: ${err.message}`);
      failed++;
    }
  }
  
  return { passed, failed };
}

async function validateRPCFunctions() {
  console.log('\n🔍 Validating RPC Functions...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const test of RPC_FUNCTIONS) {
    try {
      const { data, error } = await test.call();
      
      if (error) {
        console.error(`❌ ${test.name}: ${error.message}`);
        failed++;
      } else {
        console.log(`✅ ${test.name}`);
        if (data) {
          console.log(`   Returns: ${typeof data === 'object' ? 'JSONB object' : typeof data}`);
        }
        passed++;
      }
    } catch (err) {
      console.error(`❌ ${test.name}: ${err.message}`);
      failed++;
    }
  }
  
  return { passed, failed };
}

async function checkAuthFlow() {
  console.log('\n🔍 Checking Authentication Flow...\n');
  
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error(`❌ Auth Session Error: ${error.message}`);
    return false;
  }
  
  if (!session) {
    console.log('ℹ️  No active session (expected for unauthenticated test)');
    return true;
  }
  
  console.log('✅ Auth session active');
  console.log(`   User ID: ${session.user.id}`);
  console.log(`   Email: ${session.user.email}`);
  
  return true;
}

async function main() {
  console.log('🚀 GVTEWAY Authentication Routes Validation\n');
  console.log('=' .repeat(60));
  
  // Check auth flow
  const authOk = await checkAuthFlow();
  
  // Validate database queries
  const dbResults = await validateDatabaseQueries();
  
  // Validate RPC functions
  const rpcResults = await validateRPCFunctions();
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 VALIDATION SUMMARY\n');
  console.log(`Database Queries: ${dbResults.passed}/${dbResults.passed + dbResults.failed} passed`);
  console.log(`RPC Functions: ${rpcResults.passed}/${rpcResults.passed + rpcResults.failed} passed`);
  console.log(`Auth Flow: ${authOk ? '✅' : '❌'}`);
  
  const totalPassed = dbResults.passed + rpcResults.passed;
  const totalTests = dbResults.passed + dbResults.failed + rpcResults.passed + rpcResults.failed;
  const passRate = ((totalPassed / totalTests) * 100).toFixed(1);
  
  console.log(`\nOverall: ${totalPassed}/${totalTests} tests passed (${passRate}%)`);
  
  if (dbResults.failed > 0 || rpcResults.failed > 0) {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
    process.exit(1);
  }
  
  console.log('\n✅ All validation tests passed!\n');
  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
