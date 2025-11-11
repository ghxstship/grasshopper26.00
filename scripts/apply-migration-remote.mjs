#!/usr/bin/env node

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zunesxhsexrqjrroeass.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1bmVzeGhzZXhycWpycm9lYXNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjcyNjE5NSwiZXhwIjoyMDc4MzAyMTk1fQ.qm9nFdzR4whVYlIpwSBxEAFc-MUjrOR4TryI5qJqzig';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const migrationSQL = readFileSync('supabase/migrations/00054_update_membership_pricing_and_companion_passes.sql', 'utf8');

console.log('Applying membership pricing and companion pass migration to remote database...');

try {
  const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
  
  if (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
  
  console.log('✅ Migration applied successfully!');
  console.log('Updated pricing:');
  console.log('- Basic: $19.99/mo, $199.99/yr');
  console.log('- Main: $39.99/mo, $399.99/yr');
  console.log('- Extra: $79.99/mo, $799.99/yr');
  console.log('- First Class: $199.99/mo, $1,999.99/yr');
  console.log('- Business: $499.99/mo, $4,999.99/yr (Tier 6)');
  console.log('');
  console.log('Companion passes created for all non-business tiers');
} catch (err) {
  console.error('Error:', err);
  process.exit(1);
}
