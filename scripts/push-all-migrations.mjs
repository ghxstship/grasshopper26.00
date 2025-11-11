#!/usr/bin/env node

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import postgres from 'postgres';

// Direct connection using service role key for auth
const connectionString = `postgresql://postgres.zunesxhsexrqjrroeass:${process.env.DB_PASSWORD || 'REPLACE_WITH_PASSWORD'}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

console.log('Connecting to:', connectionString.replace(/:[^:@]+@/, ':****@'));

const sql = postgres(connectionString, {
  max: 1,
  ssl: 'require'
});

const migrationsDir = 'supabase/migrations';

// Get all migration files sorted by name
const migrationFiles = readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .sort();

console.log(`Found ${migrationFiles.length} migration files\n`);

let successCount = 0;
let failCount = 0;

for (const file of migrationFiles) {
  console.log(`📝 Applying ${file}...`);
  
  try {
    const migrationSQL = readFileSync(join(migrationsDir, file), 'utf8');
    
    // Execute the migration directly
    await sql.unsafe(migrationSQL);
    
    console.log(`✅ Applied ${file}`);
    successCount++;
  } catch (err) {
    console.error(`❌ Error applying ${file}:`, err.message);
    failCount++;
  }
}

console.log(`\n📊 Summary:`);
console.log(`   ✅ Applied: ${successCount}`);
console.log(`   ❌ Failed: ${failCount}`);

await sql.end();

if (failCount > 0) {
  process.exit(1);
}
