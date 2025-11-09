# Build-Time Secrets Validation Fix

## Problem

The application was failing to build on Vercel with the following error:

```
Error: Secret validation failed:
Missing required secret: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Missing required secret: CSRF_SECRET
Missing required secret: CRON_SECRET
```

This occurred during the "Collecting page data" phase of the Next.js build process.

## Root Cause

The `SecretsManager` singleton was being instantiated immediately when the module was imported:

```typescript
// Old code - eager instantiation
export const secretsManager = SecretsManager.getInstance();
```

When Next.js builds the application, it imports all route handlers to analyze them. This caused:

1. The `secrets-manager.ts` module to load
2. The singleton to be created immediately
3. Secret validation to run during build time
4. Build failure when required secrets weren't available

## Solution

Implemented **lazy initialization** with two key changes:

### 1. Lazy Singleton Instantiation

Changed from eager to lazy instantiation:

```typescript
// New code - lazy instantiation
export function getSecretsManager(): SecretsManager {
  return SecretsManager.getInstance();
}
```

### 2. Deferred Validation

Moved validation from constructor to first use:

```typescript
private validated: boolean = false;

private constructor() {
  // Don't validate on construction - validate lazily when needed
}

private ensureValidated(): void {
  if (!this.validated) {
    this.validateSecrets();
    this.validated = true;
  }
}
```

### 3. Build-Safe Error Handling

Updated validation to only throw errors in production runtime, not during build:

```typescript
const isProductionRuntime = process.env.NODE_ENV === 'production' && 
                           process.env.VERCEL_ENV && 
                           typeof process.env.VERCEL !== 'undefined';

if (isProductionRuntime) {
  throw new Error(`Secret validation failed:\n${errors.join('\n')}`);
} else {
  logger.warn('Running with invalid secrets (development/build mode)');
}
```

## Benefits

1. **Build succeeds** - Secrets are not validated during build time
2. **Runtime safety** - Secrets are still validated when actually used
3. **Production protection** - Missing secrets still cause failures in production runtime
4. **Development flexibility** - Developers can work without all secrets configured

## Testing

To verify the fix:

1. Build should succeed even without all secrets in environment
2. Runtime API calls should validate secrets on first use
3. Production deployments should still fail fast on missing secrets

## Related Files

- `/src/lib/security/secrets-manager.ts` - Core fix implementation
- `/src/app/api/admin/security/stats/route.ts` - Route that triggered the issue
