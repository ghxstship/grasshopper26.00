import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('📝 Applying SQL migration...\n');
  
  const sql = readFileSync('supabase/migrations/00056_create_remaining_tables.sql', 'utf-8');
  
  // Split by semicolons and execute each statement
  const statements = sql.split(';').filter(s => s.trim());
  
  for (const statement of statements) {
    if (!statement.trim()) continue;
    
    console.log(`Executing: ${statement.trim().substring(0, 50)}...`);
    const { error } = await supabase.rpc('query', { query_text: statement });
    
    if (error) {
      console.error('❌ Error:', error.message);
    } else {
      console.log('✓ Success');
    }
  }
  
  console.log('\n✅ Migration applied! Run: npm run seed:florida');
}

main().catch(console.error);
