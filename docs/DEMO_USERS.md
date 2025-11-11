# Demo Users Guide

This document describes the demo users available for testing role-based access control and authenticated pages.

## Quick Start

```bash
# Seed all demo users
npm run seed:users
```

## Universal Password

All demo users use the same password for easy testing:

```
Password: Demo123!@#
```

## Team Roles (Internal/Staff)

These users have team member access with various permission levels:

| Role | Email | Description | Department |
|------|-------|-------------|------------|
| **Legend** | `legend@gvteway.demo` | Platform owner with god mode access | Executive |
| **Super Admin** | `superadmin@gvteway.demo` | Organization level administrator | Administration |
| **Admin** | `admin@gvteway.demo` | Event level administrator | Events |
| **Lead** | `lead@gvteway.demo` | Department level lead | Marketing |
| **Team** | `team@gvteway.demo` | Event level team member | Operations |
| **Collaborator** | `collaborator@gvteway.demo` | Limited access collaborator | Content |
| **Partner** | `partner@gvteway.demo` | Read-only stakeholder | Partnerships |
| **Ambassador** | `ambassador@gvteway.demo` | Brand representative | Marketing |

### Team Role Hierarchy

```
Legend (God Mode)
  └── Super Admin (Organization)
      └── Admin (Event Level)
          ├── Lead (Department)
          │   └── Team (Event Access)
          │       └── Collaborator (Limited)
          ├── Partner (Read-Only)
          └── Ambassador (Brand Rep)
```

## Member Roles (Customer-facing)

These users represent different customer access levels:

| Role | Email | Description | Loyalty Points |
|------|-------|-------------|----------------|
| **Member** | `member@gvteway.demo` | Subscribed member with full access | 1,500 |
| **Trial Member** | `trial@gvteway.demo` | Trial member with limited features | 100 |
| **Attendee** | `attendee@gvteway.demo` | Single event ticket holder | 250 |
| **Guest** | `guest@gvteway.demo` | Guest list access only | 0 |

### Member Role Capabilities

- **Member**: Full platform access, all features, content creation
- **Trial Member**: Read-only access, limited features, no purchases
- **Attendee**: Single event access, basic features
- **Guest**: Guest list access, minimal features

## Testing Scenarios

### Admin Dashboard Access

```bash
# Test with different admin levels
legend@gvteway.demo      # Full access
superadmin@gvteway.demo  # Organization management
admin@gvteway.demo       # Event management
lead@gvteway.demo        # Department features
```

### Member Portal Access

```bash
# Test member features
member@gvteway.demo      # Full member experience
trial@gvteway.demo       # Limited trial experience
attendee@gvteway.demo    # Event-specific access
guest@gvteway.demo       # Minimal guest access
```

### Permission Testing

1. **Create Event**: Test with `admin@gvteway.demo` (should work) vs `partner@gvteway.demo` (should fail)
2. **View Analytics**: Test with `superadmin@gvteway.demo` (full) vs `collaborator@gvteway.demo` (limited)
3. **Content Creation**: Test with `member@gvteway.demo` (allowed) vs `trial@gvteway.demo` (restricted)
4. **User Management**: Test with `legend@gvteway.demo` (full) vs `lead@gvteway.demo` (department only)

## Database Schema

Demo users are created in:
- `auth.users` - Authentication records
- `user_profiles` - Extended profile data with role assignments

### Profile Fields

**Team Members:**
- `team_role`: One of the team role enums
- `is_team_member`: true
- `department`: Department assignment
- `job_title`: Job title/position

**Members:**
- `member_role`: One of the member role enums
- `is_team_member`: false
- `favorite_genres`: Array of music genres
- `loyalty_points`: Point balance

## Re-seeding

To reset and re-create all demo users:

```bash
# Delete existing demo users (manual via Supabase dashboard)
# Then re-seed
npm run seed:users
```

## Security Notes

⚠️ **Important**: These are demo accounts for testing only.

- Never use these credentials in production
- Demo accounts should be deleted before production deployment
- All demo emails use `@gvteway.demo` domain
- Passwords are intentionally simple for testing

## Troubleshooting

### User Already Exists

If you see "User already exists" errors, the script will skip those users. To recreate:

1. Go to Supabase Dashboard → Authentication → Users
2. Delete the existing demo users
3. Run `npm run seed:users` again

### Missing Environment Variables

Ensure your `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://zunesxhsexrqjrroeass.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Profile Not Created

If auth user is created but profile fails:
1. Check that migrations are applied: `npm run db:migrate`
2. Verify `user_profiles` table has role columns
3. Check RLS policies allow profile creation

## Related Documentation

- [RBAC System](./architecture/RBAC_SYSTEM.md)
- [Authentication Flow](./architecture/AUTHENTICATION.md)
- [Role Permissions](./architecture/PERMISSIONS.md)
