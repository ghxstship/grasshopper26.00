const fs = require('fs');
const path = require('path');

console.log('=== GVTEWAY Migration Compatibility Analysis ===\n');
console.log('Context: ATLVS (B2B) and GVTEWAY (B2C) share the same Supabase database\n');

// Read all migration files
const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
const migrationFiles = fs.readdirSync(migrationsDir).sort();

console.log(`Found ${migrationFiles.length} local migration files:\n`);

// Analyze each migration
const analysis = {
  createTables: [],
  alterTables: [],
  createIndexes: [],
  createPolicies: [],
  createFunctions: [],
  potentialConflicts: []
};

migrationFiles.forEach(file => {
  const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
  const lowerContent = content.toLowerCase();
  
  console.log(`📄 ${file}`);
  
  // Extract table creations
  const createTableMatches = content.match(/create table(?:\s+if not exists)?\s+(\w+)/gi);
  if (createTableMatches) {
    createTableMatches.forEach(match => {
      const tableName = match.match(/create table(?:\s+if not exists)?\s+(\w+)/i)[1];
      analysis.createTables.push({ file, table: tableName, hasIfNotExists: match.includes('if not exists') });
      console.log(`  ✓ Creates table: ${tableName}${match.includes('if not exists') ? ' (IF NOT EXISTS)' : ' (NO SAFETY CHECK!)'}`);
      
      if (!match.includes('if not exists')) {
        analysis.potentialConflicts.push({
          file,
          issue: `Table "${tableName}" created without IF NOT EXISTS - will fail if table exists`,
          severity: 'HIGH',
          recommendation: `Add "IF NOT EXISTS" to CREATE TABLE statement`
        });
      }
    });
  }
  
  // Extract index creations
  const createIndexMatches = content.match(/create(?:\s+unique)?\s+index(?:\s+if not exists)?\s+(\w+)/gi);
  if (createIndexMatches) {
    createIndexMatches.forEach(match => {
      const indexName = match.match(/create(?:\s+unique)?\s+index(?:\s+if not exists)?\s+(\w+)/i)[1];
      analysis.createIndexes.push({ file, index: indexName, hasIfNotExists: match.includes('if not exists') });
      
      if (!match.includes('if not exists')) {
        analysis.potentialConflicts.push({
          file,
          issue: `Index "${indexName}" created without IF NOT EXISTS`,
          severity: 'MEDIUM',
          recommendation: `Add "IF NOT EXISTS" to CREATE INDEX statement`
        });
      }
    });
  }
  
  // Extract policy creations
  const createPolicyMatches = content.match(/create policy\s+"([^"]+)"/gi);
  if (createPolicyMatches) {
    createPolicyMatches.forEach(match => {
      const policyName = match.match(/create policy\s+"([^"]+)"/i)[1];
      analysis.createPolicies.push({ file, policy: policyName });
      analysis.potentialConflicts.push({
        file,
        issue: `Policy "${policyName}" has no IF NOT EXISTS option - will fail if exists`,
        severity: 'HIGH',
        recommendation: `Use DROP POLICY IF EXISTS before CREATE POLICY, or check if policy exists first`
      });
    });
  }
  
  console.log('');
});

console.log('\n=== SUMMARY ===\n');
console.log(`Tables to create: ${analysis.createTables.length}`);
console.log(`Indexes to create: ${analysis.createIndexes.length}`);
console.log(`Policies to create: ${analysis.createPolicies.length}`);
console.log(`Potential conflicts: ${analysis.potentialConflicts.length}\n`);

if (analysis.potentialConflicts.length > 0) {
  console.log('=== POTENTIAL CONFLICTS ===\n');
  
  const highSeverity = analysis.potentialConflicts.filter(c => c.severity === 'HIGH');
  const mediumSeverity = analysis.potentialConflicts.filter(c => c.severity === 'MEDIUM');
  
  if (highSeverity.length > 0) {
    console.log('🔴 HIGH SEVERITY ISSUES:\n');
    highSeverity.forEach(conflict => {
      console.log(`File: ${conflict.file}`);
      console.log(`Issue: ${conflict.issue}`);
      console.log(`Fix: ${conflict.recommendation}\n`);
    });
  }
  
  if (mediumSeverity.length > 0) {
    console.log('🟡 MEDIUM SEVERITY ISSUES:\n');
    mediumSeverity.forEach(conflict => {
      console.log(`File: ${conflict.file}`);
      console.log(`Issue: ${conflict.issue}`);
      console.log(`Fix: ${conflict.recommendation}\n`);
    });
  }
}

console.log('\n=== RECOMMENDATIONS ===\n');
console.log('1. Add "IF NOT EXISTS" to all CREATE TABLE statements');
console.log('2. Add "IF NOT EXISTS" to all CREATE INDEX statements');
console.log('3. For policies, use "DROP POLICY IF EXISTS" before "CREATE POLICY"');
console.log('4. Test migrations on a local Supabase instance first');
console.log('5. Consider creating a new migration file that consolidates all changes with proper safety checks');
console.log('\n=== NEXT STEPS ===\n');
console.log('Run: npx supabase db diff --linked --schema public');
console.log('This will show what SQL is needed to make remote DB match your local migrations');
