# Authentication & Authorization Guide

## Overview

GVTEWAY implements a comprehensive authentication and authorization system with multiple layers of security including:

- **Multi-Factor Authentication (MFA)** with TOTP
- **Account Lockout** and brute force protection
- **Fine-Grained RBAC** (Role-Based Access Control)
- **Multiple OAuth Providers** (Google, GitHub, Microsoft)
- **Row-Level Security** (RLS) at the database level

---

## Table of Contents

1. [Authentication Methods](#authentication-methods)
2. [Multi-Factor Authentication (MFA)](#multi-factor-authentication-mfa)
3. [Account Lockout & Brute Force Protection](#account-lockout--brute-force-protection)
4. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
5. [OAuth Providers](#oauth-providers)
6. [Security Best Practices](#security-best-practices)
7. [API Reference](#api-reference)

---

## Authentication Methods

### Email/Password Authentication

Standard email and password authentication with the following features:

- Password strength validation
- Email verification required
- Password reset via email
- Session management with JWT tokens
- Automatic refresh token rotation

**Usage:**

```typescript
import { authService } from '@/lib/services/auth.service';

// Register
const { user, error } = await authService.register({
  email: 'user@example.com',
  password: 'SecurePassword123!',
  displayName: 'John Doe'
});

// Login
const { user, error, requiresMFA } = await authService.login({
  email: 'user@example.com',
  password: 'SecurePassword123!',
  ipAddress: req.ip,
  userAgent: req.headers['user-agent']
});

// Login with MFA
if (requiresMFA) {
  const { user, error } = await authService.login({
    email: 'user@example.com',
    password: 'SecurePassword123!',
    mfaCode: '123456'
  });
}
```

### OAuth Authentication

Supported OAuth providers:
- **Google** - Recommended for general users
- **GitHub** - For developers and technical users
- **Microsoft (Azure AD)** - For enterprise users

**Usage:**

```typescript
// Sign in with OAuth
const { error } = await authService.signInWithOAuth('google');
const { error } = await authService.signInWithOAuth('github');
const { error } = await authService.signInWithOAuth('azure');
```

---

## Multi-Factor Authentication (MFA)

### TOTP (Time-Based One-Time Password)

MFA adds an extra layer of security using authenticator apps like Google Authenticator, Authy, or 1Password.

#### Setup MFA

```typescript
import { mfaService } from '@/lib/services/mfa.service';

// 1. Generate TOTP secret and QR code
const { secret, qrCode, backupCodes } = await mfaService.setupTOTP(
  userId,
  userEmail
);

// 2. Display QR code to user (they scan with authenticator app)
// 3. User enters verification code from app

// 4. Verify and activate MFA
const isValid = await mfaService.verifyTOTP(userId, verificationCode);
if (isValid) {
  // MFA is now active
  // Show backup codes to user (they should save these securely)
}
```

#### Verify MFA During Login

MFA verification is automatically handled by the `authService.login()` method:

```typescript
const { user, error, requiresMFA } = await authService.login({
  email: 'user@example.com',
  password: 'password',
});

if (requiresMFA) {
  // Prompt user for MFA code
  const { user, error } = await authService.login({
    email: 'user@example.com',
    password: 'password',
    mfaCode: userEnteredCode
  });
}
```

#### Backup Codes

Backup codes allow users to access their account if they lose their authenticator device:

```typescript
// Verify backup code
const isValid = await mfaService.verifyBackupCode(userId, backupCode);

// Regenerate backup codes
const newBackupCodes = await mfaService.regenerateBackupCodes(userId);
```

#### Disable MFA

```typescript
await mfaService.disableMFA(userId);
```

---

## Account Lockout & Brute Force Protection

### Automatic Account Lockout

Accounts are automatically locked after **5 failed login attempts** within **15 minutes**.

**Lockout Duration:** 30 minutes

**Features:**
- Tracks all login attempts (successful and failed)
- IP-based suspicious activity detection
- Admin unlock capability
- Automatic unlock after lockout period

### Check Account Lock Status

```typescript
import { accountLockoutService } from '@/lib/services/account-lockout.service';

// Check if account is locked
const isLocked = await accountLockoutService.isAccountLocked(userId);

// Get lockout details
const lockout = await accountLockoutService.getLockoutDetails(userId);
if (lockout) {
  console.log(`Locked until: ${lockout.locked_until}`);
  console.log(`Failed attempts: ${lockout.failed_attempts}`);
}
```

### Admin Functions

```typescript
// Unlock account (admin only)
await accountLockoutService.unlockAccount(userId, adminUserId);

// Get all locked accounts
const lockedAccounts = await accountLockoutService.getAllLockedAccounts();

// Get recent login attempts
const attempts = await accountLockoutService.getRecentLoginAttempts(userId, 10);

// Check for suspicious IP
const isSuspicious = await accountLockoutService.isSuspiciousIP(ipAddress);
```

---

## Role-Based Access Control (RBAC)

### User Roles

| Role | Description | Typical Use Case |
|------|-------------|------------------|
| `super_admin` | Full system access | Platform administrators |
| `brand_admin` | Manage brand resources | Brand owners/managers |
| `event_manager` | Manage events and orders | Event coordinators |
| `user` | Standard user access | Regular customers |
| `guest` | Limited read-only access | Unauthenticated users |

### Permissions

Permissions follow the format: `resource.action`

**Resources:**
- `events` - Event management
- `products` - Product/merchandise management
- `orders` - Order management
- `users` - User management
- `brands` - Brand management

**Actions:**
- `create` - Create new resources
- `read` - View resources
- `update` - Modify resources
- `delete` - Remove resources
- `manage` - Full control (all actions)

### Check Permissions

```typescript
import { permissionsService } from '@/lib/services/permissions.service';

// Check single permission
const canCreate = await permissionsService.hasPermission(
  userId,
  'events',
  'create'
);

// Check multiple permissions (any)
const hasAny = await permissionsService.hasAnyPermission(userId, [
  { resource: 'events', action: 'create' },
  { resource: 'events', action: 'update' }
]);

// Check multiple permissions (all)
const hasAll = await permissionsService.hasAllPermissions(userId, [
  { resource: 'events', action: 'read' },
  { resource: 'orders', action: 'read' }
]);

// Check if user is admin
const isAdmin = await permissionsService.isAdmin(userId);
const isSuperAdmin = await permissionsService.isSuperAdmin(userId);
```

### Manage Roles & Permissions

```typescript
// Get user role
const role = await permissionsService.getUserRole(userId);

// Update user role (admin only)
await permissionsService.updateUserRole(userId, 'brand_admin');

// Get all permissions
const allPermissions = await permissionsService.getAllPermissions();

// Get permissions for a role
const rolePerms = await permissionsService.getRolePermissions('event_manager');

// Grant permission to user (admin only)
await permissionsService.grantPermission(userId, permissionId, adminUserId);

// Revoke permission from user (admin only)
await permissionsService.revokePermission(userId, permissionId, adminUserId);
```

### Permission Overrides

User-specific permissions override role-based permissions:

```typescript
// Get user permission overrides
const overrides = await permissionsService.getUserPermissionOverrides(userId);

// Remove override (reverts to role-based permission)
await permissionsService.removePermissionOverride(userId, permissionId);
```

---

## OAuth Providers

### Configuration

OAuth providers must be configured in Supabase Dashboard:

1. Navigate to **Authentication > Providers**
2. Enable desired providers
3. Add OAuth credentials (Client ID, Client Secret)
4. Configure redirect URLs

### Google OAuth

**Redirect URL:** `https://nhceygmzwmhuyqsjxquk.supabase.co/auth/v1/callback`

**Scopes:**
- `email`
- `profile`

### GitHub OAuth

**Redirect URL:** `https://nhceygmzwmhuyqsjxquk.supabase.co/auth/v1/callback`

**Scopes:**
- `read:user`
- `user:email`

### Microsoft (Azure AD) OAuth

**Redirect URL:** `https://nhceygmzwmhuyqsjxquk.supabase.co/auth/v1/callback`

**Scopes:**
- `openid`
- `email`
- `profile`

---

## Security Best Practices

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Session Management

- JWT tokens expire after 1 hour
- Refresh tokens expire after 30 days
- Automatic token rotation on refresh
- Secure, httpOnly cookies

### CSRF Protection

- Token-based CSRF protection
- SameSite cookie attribute
- Origin validation

### Rate Limiting

- Login attempts: 5 per 15 minutes
- Password reset: 3 per hour
- API requests: 100 per minute (per user)

### Encryption

- Passwords: bcrypt with salt rounds = 10
- MFA secrets: AES-256-GCM (TODO: implement proper encryption)
- Data in transit: TLS 1.3
- Data at rest: AES-256

---

## API Reference

### AuthService

```typescript
class AuthService {
  register(data: RegisterData): Promise<{ user: User | null; error: Error | null }>;
  login(data: LoginData): Promise<{ user: User | null; error: Error | null; requiresMFA?: boolean }>;
  logout(): Promise<{ error: Error | null }>;
  resetPassword(email: string): Promise<{ error: Error | null }>;
  updatePassword(newPassword: string): Promise<{ error: Error | null }>;
  verifyEmail(token: string): Promise<{ error: Error | null }>;
  resendVerificationEmail(email: string): Promise<{ error: Error | null }>;
  getCurrentUser(): Promise<User | null>;
  signInWithOAuth(provider: 'google' | 'github' | 'azure', redirectTo?: string): Promise<{ error: Error | null }>;
}
```

### MFAService

```typescript
class MFAService {
  setupTOTP(userId: string, email: string): Promise<MFASetupResponse>;
  verifyTOTP(userId: string, code: string): Promise<boolean>;
  verifyBackupCode(userId: string, code: string): Promise<boolean>;
  isMFAEnabled(userId: string): Promise<boolean>;
  disableMFA(userId: string): Promise<void>;
  getMFAFactors(userId: string): Promise<MFAFactor[]>;
  regenerateBackupCodes(userId: string): Promise<string[]>;
}
```

### AccountLockoutService

```typescript
class AccountLockoutService {
  recordLoginAttempt(email: string, success: boolean, options?: RecordOptions): Promise<void>;
  isAccountLocked(userId: string): Promise<boolean>;
  getLockoutDetails(userId: string): Promise<AccountLockout | null>;
  unlockAccount(userId: string, unlockedBy: string): Promise<void>;
  getRecentLoginAttempts(userId: string, limit?: number): Promise<LoginAttempt[]>;
  getFailedAttemptsCount(email: string, minutes?: number): Promise<number>;
  isSuspiciousIP(ipAddress: string, minutes?: number): Promise<boolean>;
  getAllLockedAccounts(): Promise<AccountLockout[]>;
  cleanupOldAttempts(daysOld?: number): Promise<void>;
}
```

### PermissionsService

```typescript
class PermissionsService {
  hasPermission(userId: string, resource: string, action: string): Promise<boolean>;
  hasAnyPermission(userId: string, permissions: Permission[]): Promise<boolean>;
  hasAllPermissions(userId: string, permissions: Permission[]): Promise<boolean>;
  getUserRole(userId: string): Promise<UserRole | null>;
  updateUserRole(userId: string, role: UserRole): Promise<void>;
  getAllPermissions(): Promise<Permission[]>;
  getRolePermissions(role: UserRole): Promise<Permission[]>;
  getUserPermissionOverrides(userId: string): Promise<UserPermission[]>;
  grantPermission(userId: string, permissionId: string, grantedBy: string): Promise<void>;
  revokePermission(userId: string, permissionId: string, revokedBy: string): Promise<void>;
  removePermissionOverride(userId: string, permissionId: string): Promise<void>;
  isAdmin(userId: string): Promise<boolean>;
  isSuperAdmin(userId: string): Promise<boolean>;
  getUsersByRole(role: UserRole): Promise<string[]>;
}
```

---

## Migration Guide

### Running the Migration

```bash
# Run the authentication enhancements migration
supabase db push
```

### Post-Migration Steps

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure OAuth Providers** in Supabase Dashboard

3. **Update Environment Variables:**
   ```env
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```

4. **Test Authentication Flow:**
   - Email/password login
   - OAuth login (all providers)
   - MFA setup and verification
   - Account lockout behavior
   - Permission checks

---

## Troubleshooting

### MFA Issues

**Problem:** QR code not scanning
- Ensure the secret is properly base32 encoded
- Try manual entry of the secret key

**Problem:** TOTP codes not working
- Check system time synchronization
- Verify 30-second time window
- Try backup codes

### Account Lockout Issues

**Problem:** Account locked unexpectedly
- Check recent login attempts
- Verify IP address isn't flagged as suspicious
- Admin can manually unlock

### Permission Issues

**Problem:** User can't access resource
- Verify user role
- Check permission assignments
- Look for permission overrides
- Ensure RLS policies are correct

---

## Support

For security issues or questions:
- Email: support@gvteway.com
- Security issues: security@gvteway.com (private disclosure)

---

**Last Updated:** 2025-01-09
**Version:** 26.0.0
