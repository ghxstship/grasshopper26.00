const fs = require('fs');
const path = require('path');

console.log('Generating safe, idempotent migration for GVTEWAY...\n');

const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
const migrationFiles = fs.readdirSync(migrationsDir).sort();

let safeMigration = `-- Safe GVTEWAY Migration
-- Generated: ${new Date().toISOString()}
-- Compatible with existing ATLVS database

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for text search

`;

// Process each migration file
migrationFiles.forEach(file => {
  const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
  
  console.log(`Processing: ${file}`);
  
  // Convert CREATE TABLE to CREATE TABLE IF NOT EXISTS (only if not already present)
  let safeContent = content.replace(
    /create table\s+(?!if not exists)(\w+)/gi,
    'CREATE TABLE IF NOT EXISTS $1'
  );
  
  // Convert CREATE INDEX to CREATE INDEX IF NOT EXISTS (only if not already present)
  safeContent = safeContent.replace(
    /create\s+(unique\s+)?index\s+(?!if not exists)(\w+)/gi,
    'CREATE $1INDEX IF NOT EXISTS $2'
  );
  
  // Handle policies - add DROP IF EXISTS before CREATE
  safeContent = safeContent.replace(
    /create policy\s+"([^"]+)"\s+on\s+(\w+)/gi,
    (match, policyName, tableName) => {
      return `DROP POLICY IF EXISTS "${policyName}" ON ${tableName};\nCREATE POLICY "${policyName}" ON ${tableName}`;
    }
  );
  
  // Handle triggers - add DROP IF EXISTS
  safeContent = safeContent.replace(
    /create trigger\s+(\w+)\s+before\s+update\s+on\s+(\w+)/gi,
    (match, triggerName, tableName) => {
      return `DROP TRIGGER IF EXISTS ${triggerName} ON ${tableName};\nCREATE TRIGGER ${triggerName} BEFORE UPDATE ON ${tableName}`;
    }
  );
  
  safeMigration += `\n-- From: ${file}\n`;
  safeMigration += safeContent;
  safeMigration += '\n';
});

// Write the safe migration file
const outputPath = path.join(migrationsDir, `${Date.now()}_safe_gvteway_consolidated.sql`);
fs.writeFileSync(outputPath, safeMigration);

console.log(`\n✅ Safe migration generated: ${path.basename(outputPath)}`);
console.log('\nNext steps:');
console.log('1. Review the generated migration file');
console.log('2. Test it locally: npx supabase db reset');
console.log('3. Apply to remote: npx supabase db push');
