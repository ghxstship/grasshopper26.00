#!/usr/bin/env tsx
/**
 * Seed Demo Users Script
 * Creates test users for each role type to test authenticated pages
 * 
 * Usage: npm run seed:users
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Demo user configurations
const DEMO_USERS = [
  // TEAM ROLES (Internal/Staff)
  {
    email: 'legend@gvteway.demo',
    password: 'Demo123!@#',
    display_name: 'Legend User',
    username: 'legend_demo',
    member_role: null,
    team_role: 'legend',
    is_team_member: true,
    department: 'Executive',
    job_title: 'Platform Owner',
    bio: 'Platform owner with god mode access',
  },
  {
    email: 'superadmin@gvteway.demo',
    password: 'Demo123!@#',
    display_name: 'Super Admin',
    username: 'superadmin_demo',
    member_role: null,
    team_role: 'super_admin',
    is_team_member: true,
    department: 'Administration',
    job_title: 'Organization Admin',
    bio: 'Organization level administrator',
  },
  {
    email: 'admin@gvteway.demo',
    password: 'Demo123!@#',
    display_name: 'Event Admin',
    username: 'admin_demo',
    member_role: null,
    team_role: 'admin',
    is_team_member: true,
    department: 'Events',
    job_title: 'Event Administrator',
    bio: 'Event level administrator',
  },
  {
    email: 'lead@gvteway.demo',
    password: 'Demo123!@#',
    display_name: 'Department Lead',
    username: 'lead_demo',
    member_role: null,
    team_role: 'lead',
    is_team_member: true,
    department: 'Marketing',
    job_title: 'Marketing Lead',
    bio: 'Department level lead',
  },
  {
    email: 'team@gvteway.demo',
    password: 'Demo123!@#',
    display_name: 'Team Member',
    username: 'team_demo',
    member_role: null,
    team_role: 'team',
    is_team_member: true,
    department: 'Operations',
    job_title: 'Event Coordinator',
    bio: 'Event level team member',
  },
  {
    email: 'collaborator@gvteway.demo',
    password: 'Demo123!@#',
    display_name: 'Collaborator',
    username: 'collaborator_demo',
    member_role: null,
    team_role: 'collaborator',
    is_team_member: true,
    department: 'Content',
    job_title: 'Content Creator',
    bio: 'Limited access collaborator',
  },
  {
    email: 'partner@gvteway.demo',
    password: 'Demo123!@#',
    display_name: 'Partner',
    username: 'partner_demo',
    member_role: null,
    team_role: 'partner',
    is_team_member: true,
    department: 'Partnerships',
    job_title: 'Strategic Partner',
    bio: 'Read-only stakeholder',
  },
  {
    email: 'ambassador@gvteway.demo',
    password: 'Demo123!@#',
    display_name: 'Brand Ambassador',
    username: 'ambassador_demo',
    member_role: null,
    team_role: 'ambassador',
    is_team_member: true,
    department: 'Marketing',
    job_title: 'Brand Ambassador',
    bio: 'Brand representative',
  },

  // MEMBER ROLES (Customer-facing)
  {
    email: 'member@gvteway.demo',
    password: 'Demo123!@#',
    display_name: 'Full Member',
    username: 'member_demo',
    member_role: 'member',
    team_role: null,
    is_team_member: false,
    bio: 'Subscribed member with full access',
    favorite_genres: ['Electronic', 'House', 'Techno'],
    loyalty_points: 1500,
  },
  {
    email: 'trial@gvteway.demo',
    password: 'Demo123!@#',
    display_name: 'Trial Member',
    username: 'trial_demo',
    member_role: 'trial_member',
    team_role: null,
    is_team_member: false,
    bio: 'Trial member with limited access',
    favorite_genres: ['Hip Hop', 'R&B'],
    loyalty_points: 100,
  },
  {
    email: 'attendee@gvteway.demo',
    password: 'Demo123!@#',
    display_name: 'Event Attendee',
    username: 'attendee_demo',
    member_role: 'attendee',
    team_role: null,
    is_team_member: false,
    bio: 'Single event ticket holder',
    favorite_genres: ['Rock', 'Alternative'],
    loyalty_points: 250,
  },
  {
    email: 'guest@gvteway.demo',
    password: 'Demo123!@#',
    display_name: 'Guest User',
    username: 'guest_demo',
    member_role: 'guest',
    team_role: null,
    is_team_member: false,
    bio: 'Guest list access',
    favorite_genres: ['Pop', 'Indie'],
    loyalty_points: 0,
  },
];

async function seedDemoUsers() {
  console.log('🌱 Starting demo user seeding...\n');

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const userData of DEMO_USERS) {
    try {
      console.log(`📧 Processing: ${userData.email}`);

      // Check if user already exists
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const userExists = existingUser?.users.some(u => u.email === userData.email);

      if (userExists) {
        console.log(`   ⏭️  User already exists, skipping...\n`);
        skipCount++;
        continue;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          display_name: userData.display_name,
          username: userData.username,
        },
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('User creation returned no user data');
      }

      console.log(`   ✅ Auth user created: ${authData.user.id}`);

      // Update user profile with role information
      const profileData: any = {
        id: authData.user.id,
        username: userData.username,
        display_name: userData.display_name,
        bio: userData.bio,
        member_role: userData.member_role,
        team_role: userData.team_role,
        is_team_member: userData.is_team_member,
      };

      // Add team-specific fields
      if (userData.is_team_member) {
        profileData.department = userData.department;
        profileData.job_title = userData.job_title;
      }

      // Add member-specific fields
      if (!userData.is_team_member) {
        profileData.favorite_genres = userData.favorite_genres;
        profileData.loyalty_points = userData.loyalty_points;
      }

      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (profileError) {
        throw profileError;
      }

      console.log(`   ✅ Profile updated with role: ${userData.team_role || userData.member_role}`);
      console.log(`   🎭 Role Type: ${userData.is_team_member ? 'TEAM' : 'MEMBER'}\n`);

      successCount++;
    } catch (error: any) {
      console.error(`   ❌ Error: ${error.message}\n`);
      errorCount++;
    }
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 SEEDING SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`✅ Successfully created: ${successCount} users`);
  console.log(`⏭️  Skipped (existing):  ${skipCount} users`);
  console.log(`❌ Errors:              ${errorCount} users`);
  console.log(`📝 Total processed:     ${DEMO_USERS.length} users`);
  console.log('═══════════════════════════════════════════════════════════\n');

  if (successCount > 0) {
    console.log('🔐 LOGIN CREDENTIALS (All users):');
    console.log('   Password: Demo123!@#\n');
    
    console.log('👥 TEAM ROLES:');
    DEMO_USERS.filter(u => u.is_team_member).forEach(u => {
      console.log(`   ${u.team_role?.toUpperCase().padEnd(15)} → ${u.email}`);
    });
    
    console.log('\n🎫 MEMBER ROLES:');
    DEMO_USERS.filter(u => !u.is_team_member).forEach(u => {
      console.log(`   ${u.member_role?.toUpperCase().padEnd(15)} → ${u.email}`);
    });
    
    console.log('\n💡 TIP: Use these accounts to test role-based access control');
    console.log('   and authenticated page permissions.\n');
  }

  if (errorCount > 0) {
    console.error('⚠️  Some users failed to create. Check errors above.');
    process.exit(1);
  }
}

// Run the seeding
seedDemoUsers()
  .then(() => {
    console.log('✨ Demo user seeding complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
