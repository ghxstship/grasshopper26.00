#!/bin/bash

# Apply membership pricing and companion pass migration
# Run this script to update the database with new pricing and companion pass system

echo "Applying membership pricing updates and companion pass system..."

# Option 1: Using Supabase CLI (if local is running)
npx supabase db reset --local

# Option 2: Using Supabase Dashboard
echo ""
echo "If local Supabase is not running, apply migration manually:"
echo "1. Go to https://supabase.com/dashboard/project/zunesxhsexrqjrroeass/sql/new"
echo "2. Copy and paste the contents of:"
echo "   supabase/migrations/00048_update_membership_pricing_and_companion_passes.sql"
echo "3. Click 'Run'"
echo ""
echo "Or use the Supabase CLI with remote database:"
echo "npx supabase db push"
