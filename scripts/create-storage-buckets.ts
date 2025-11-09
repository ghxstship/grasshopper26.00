/**
 * Create Storage Buckets Script
 * Run this to create all required storage buckets in the new Supabase project
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface BucketConfig {
  name: string;
  public: boolean;
  fileSizeLimit?: number;
  allowedMimeTypes?: string[];
}

const buckets: BucketConfig[] = [
  {
    name: 'events',
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },
  {
    name: 'artists',
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  {
    name: 'products',
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  {
    name: 'user-content',
    public: false,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'],
  },
  {
    name: 'avatars',
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  {
    name: 'documents',
    public: false,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['application/pdf'],
  },
  {
    name: 'content',
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },
];

async function createBuckets() {
  console.log('🚀 Creating storage buckets...\n');

  for (const bucket of buckets) {
    try {
      const { data, error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes,
      });

      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Bucket "${bucket.name}" already exists`);
        } else {
          console.error(`❌ Error creating bucket "${bucket.name}":`, error.message);
        }
      } else {
        console.log(`✅ Created bucket "${bucket.name}" (${bucket.public ? 'public' : 'private'})`);
      }
    } catch (err) {
      console.error(`❌ Unexpected error creating bucket "${bucket.name}":`, err);
    }
  }

  console.log('\n✨ Storage bucket setup complete!');
  console.log('\n📋 Bucket Summary:');
  console.log('   - events (public) - Event images');
  console.log('   - artists (public) - Artist photos');
  console.log('   - products (public) - Product images');
  console.log('   - user-content (private) - User uploads');
  console.log('   - avatars (public) - User avatars');
  console.log('   - documents (private) - PDF files');
  console.log('   - content (public) - General content');
  console.log('\n🔗 View buckets: ' + supabaseUrl.replace('.supabase.co', '.supabase.co/storage/buckets'));
}

createBuckets().catch(console.error);
