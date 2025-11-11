# Demo Users - Quick Reference Card

**Universal Password:** `Demo123!@#`

## Team Roles (Staff/Internal)

| Email | Role | Access Level |
|-------|------|--------------|
| `legend@gvteway.demo` | Legend | 🔴 God Mode - Full Platform Access |
| `superadmin@gvteway.demo` | Super Admin | 🟠 Organization Level Admin |
| `admin@gvteway.demo` | Admin | 🟡 Event Level Admin |
| `lead@gvteway.demo` | Lead | 🟢 Department Level |
| `team@gvteway.demo` | Team | 🔵 Event Team Member |
| `collaborator@gvteway.demo` | Collaborator | 🟣 Limited Access |
| `partner@gvteway.demo` | Partner | ⚪ Read-Only Stakeholder |
| `ambassador@gvteway.demo` | Ambassador | 🟤 Brand Representative |

## Member Roles (Customer-facing)

| Email | Role | Access Level | Points |
|-------|------|--------------|--------|
| `member@gvteway.demo` | Member | ✅ Full Access | 1,500 |
| `trial@gvteway.demo` | Trial | 🔒 Limited/Read-Only | 100 |
| `attendee@gvteway.demo` | Attendee | 🎫 Single Event | 250 |
| `guest@gvteway.demo` | Guest | 👤 Guest List Only | 0 |

## Quick Commands

```bash
# Seed all users
npm run seed:users

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gvteway.demo","password":"Demo123!@#"}'
```

## Test Scenarios

### Admin Features
- Login as `admin@gvteway.demo` → Access `/admin` dashboard
- Login as `partner@gvteway.demo` → Should see read-only view

### Member Features  
- Login as `member@gvteway.demo` → Full portal access
- Login as `trial@gvteway.demo` → Limited features

### Permission Boundaries
- `legend@gvteway.demo` → Can do everything
- `collaborator@gvteway.demo` → Limited content access
- `guest@gvteway.demo` → Minimal access
