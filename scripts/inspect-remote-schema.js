const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nhceygmzwmhuyqsjxquk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oY2V5Z216d21odXlxc2p4cXVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE5NzQyMCwiZXhwIjoyMDc1NzczNDIwfQ.72QruToRImmiDiWoy5-OcuC_pBkFF54ENytHuEGSzMI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
  console.log('Fetching table list from remote database...\n');
  
  // Query to get all tables in the public schema
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `
  });

  if (error) {
    console.error('Error fetching tables:', error);
    
    // Try alternative approach using PostgREST
    console.log('\nTrying alternative approach...\n');
    
    const tables = [
      // Grasshopper tables
      'brands', 'brand_admins', 'events', 'event_stages', 'artists', 
      'event_schedule', 'event_artists', 'ticket_types', 'orders', 
      'tickets', 'products', 'product_variants', 'content_posts', 
      'media_gallery', 'user_profiles', 'user_favorite_artists', 
      'user_event_schedules', 'brand_integrations',
      // Possible Dragonfly tables
      'users', 'profiles', 'posts', 'comments', 'likes', 'follows',
      'notifications', 'messages', 'chat_rooms', 'chat_messages'
    ];
    
    console.log('Checking which tables exist in remote database:\n');
    
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(0);
      if (!error) {
        console.log(`✓ ${table} - EXISTS`);
      } else if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log(`✗ ${table} - DOES NOT EXIST`);
      } else {
        console.log(`? ${table} - ${error.message}`);
      }
    }
  } else {
    console.log('Tables in remote database:');
    console.log(data);
  }
}

inspectSchema().catch(console.error);
