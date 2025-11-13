# Authentication Routes Fixes - Complete

## Issues Identified and Fixed

### 1. **Organization Dashboard - Incorrect Data Handling**
**File:** `/src/app/organization/dashboard/page.tsx`

**Problem:**
- `get_dashboard_kpis()` RPC function returns a single JSONB object
- Code was treating it as an array with `kpis?.[0]`
- Field names didn't match the function output

**Fix:**
```typescript
// Before:
const { data: kpis } = await supabase.rpc('get_dashboard_kpis');
const dashboardData = kpis?.[0] || {};
const totalEvents = dashboardData.total_events || 0;

// After:
const { data: kpis, error: kpisError } = await supabase.rpc('get_dashboard_kpis');
const dashboardData = kpis || {};
const totalEvents = dashboardData.active_events || 0; // Correct field name
```

### 2. **Member Dashboard - Wrong Table Names**
**File:** `/src/app/member/dashboard/page.tsx`

**Problems:**
- Querying non-existent `user_credits` table (should be `user_memberships`)
- Querying non-existent `referrals` table (should be `referral_usage`)
- Using wrong column name `referrer_id` (should be `referrer_user_id`)

**Fixes:**
```typescript
// Credits - Before:
const { data: credits } = await supabase
  .from('user_credits')
  .select('amount')
  .eq('user_id', user.id);

// Credits - After:
const { data: membership } = await supabase
  .from('user_memberships')
  .select('ticket_credits_remaining')
  .eq('user_id', user.id)
  .eq('status', 'active')
  .maybeSingle();

// Referrals - Before:
const { count: referralsCount } = await supabase
  .from('referrals')
  .select('*', { count: 'exact', head: true })
  .eq('referrer_id', user.id);

// Referrals - After:
const { count: referralsCount } = await supabase
  .from('referral_usage')
  .select('*', { count: 'exact', head: true })
  .eq('referrer_user_id', user.id);
```

### 3. **Missing Error Handling Across All Dashboards**

**Files Fixed:**
- `/src/app/member/dashboard/page.tsx`
- `/src/app/organization/dashboard/page.tsx`
- `/src/app/team/dashboard/page.tsx`
- `/src/app/legend/dashboard/page.tsx`
- `/src/app/portal/page.tsx`

**Pattern Applied:**
```typescript
// Before:
const { data } = await supabase.from('table').select('*');

// After:
const { data, error } = await supabase.from('table').select('*');
if (error) {
  console.error('Error description:', error);
}
```

### 4. **Middleware - Using single() Instead of maybeSingle()**
**File:** `/src/middleware.ts`

**Problem:**
- Using `.single()` throws errors when no rows found
- Causes 500 errors for users without specific roles

**Fix:**
```typescript
// Before:
const { data: profile } = await supabase
  .from('user_profiles')
  .select('is_platform_admin')
  .eq('id', user.id)
  .single(); // Throws error if no row

// After:
const { data: profile, error: profileError } = await supabase
  .from('user_profiles')
  .select('is_platform_admin')
  .eq('id', user.id)
  .maybeSingle(); // Returns null if no row

if (profileError) {
  console.error('Error fetching profile in middleware:', profileError);
}
```

### 5. **Layout Files - Insufficient Error Handling**

**Files Fixed:**
- `/src/app/organization/layout.tsx`
- `/src/app/team/layout.tsx`

**Pattern Applied:**
```typescript
// Before:
if (roleError || !orgAssignment) {
  redirect('/');
}

// After:
if (roleError) {
  console.error('Error checking role:', roleError);
  redirect('/');
}

if (!orgAssignment) {
  redirect('/');
}
```

### 6. **Member Dashboard - Complex Join Query**
**File:** `/src/app/member/dashboard/page.tsx`

**Problem:**
- Complex nested join query for upcoming events could fail due to RLS policies

**Fix:**
- Split into two simpler queries
- First get user's tickets
- Then get orders with events separately

```typescript
// Before:
const { count: eventsCount } = await supabase
  .from('tickets')
  .select('*, orders!inner(event_id, events!inner(start_date))', { count: 'exact', head: true })
  .eq('user_id', user.id)
  .gte('orders.events.start_date', new Date().toISOString());

// After:
const { data: userTickets } = await supabase
  .from('tickets')
  .select('order_id')
  .eq('user_id', user.id);

if (userTickets && userTickets.length > 0) {
  const orderIds = userTickets.map((t: { order_id: string }) => t.order_id);
  const { data: orders } = await supabase
    .from('orders')
    .select('event_id, events!inner(start_date)')
    .in('id', orderIds)
    .gte('events.start_date', new Date().toISOString());
  
  upcomingEventsCount = orders?.length || 0;
}
```

## Database Schema Validation

### Correct Table Names:
- ✅ `user_profiles` (has `is_platform_admin` column)
- ✅ `brand_team_assignments` (has `team_role` column)
- ✅ `event_team_assignments` (has `event_role_type` column)
- ✅ `user_memberships` (has `ticket_credits_remaining` column)
- ✅ `referral_usage` (has `referrer_user_id` column)
- ✅ `orders`, `tickets`, `events`, `organizations`, `venues`

### RPC Functions:
- ✅ `get_dashboard_kpis()` - Returns JSONB object (not array)

## Testing

Run the validation script to test all routes:

```bash
npm run validate:auth-routes
# or
node scripts/validate-auth-routes.mjs
```

## Summary of Changes

| File | Changes | Impact |
|------|---------|--------|
| `organization/dashboard/page.tsx` | Fixed RPC data handling, added error handling | Prevents 500 errors |
| `member/dashboard/page.tsx` | Fixed table names, simplified queries, added error handling | Prevents 500 errors |
| `team/dashboard/page.tsx` | Added error handling | Better error visibility |
| `legend/dashboard/page.tsx` | Added comprehensive error handling | Better error visibility |
| `portal/page.tsx` | Added error handling for all role checks | Better error visibility |
| `middleware.ts` | Changed single() to maybeSingle(), added error handling | Prevents 500 errors |
| `organization/layout.tsx` | Separated error and data checks | Better error visibility |
| `team/layout.tsx` | Separated error and data checks | Better error visibility |

## Result

All authenticated routes now:
1. ✅ Use correct table and column names
2. ✅ Handle errors gracefully with logging
3. ✅ Use `maybeSingle()` instead of `single()` where appropriate
4. ✅ Avoid complex joins that might fail due to RLS
5. ✅ Provide clear console error messages for debugging

**Status:** 100% Complete - All 500 errors should be resolved
