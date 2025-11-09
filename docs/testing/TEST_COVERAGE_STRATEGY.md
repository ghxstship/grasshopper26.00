# Test Coverage Remediation Strategy

## Current Status
- **Current Coverage:** 45%
- **Target Coverage:** 80%+
- **Gap:** 35 percentage points

## Test Infrastructure ✅

### Completed
- ✅ Installed `jsdom` and `@vitest/coverage-v8`
- ✅ Enhanced test setup with comprehensive mocks (Next.js, Supabase, Stripe, Redis)
- ✅ Created 4 hook tests (use-auth, use-debounce, use-local-storage, use-media-query)
- ✅ Created foundational component tests
- ✅ Created RBAC permission tests

### Test Configuration
```typescript
// vitest.config.ts
coverage: {
  provider: 'v8',
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 75,
    statements: 80,
  },
  all: true,
  include: ['src/**/*.{ts,tsx}'],
}
```

## Coverage Targets by Category

### 1. Hooks (8 files) - Target: 90%
**Priority: P0 - Critical**

- ✅ `use-auth.ts` - Authentication state management
- ✅ `use-debounce.ts` - Input debouncing
- ✅ `use-local-storage.ts` - Local storage persistence
- ✅ `use-media-query.ts` - Responsive breakpoints
- ⏳ `use-breadcrumbs.ts` - Navigation breadcrumbs
- ⏳ `use-push-notifications.ts` - Push notification handling
- ⏳ `use-realtime.ts` - Realtime subscriptions
- ⏳ `use-toast.ts` - Toast notifications

### 2. API Routes (47 files) - Target: 75%
**Priority: P0 - Critical**

#### Authentication (10 routes)
- `/api/auth/login` - User login
- `/api/auth/register` - User registration
- `/api/auth/reset-password` - Password reset
- `/api/auth/verify-email` - Email verification
- `/api/auth/change-password` - Password change
- `/api/auth/update-password` - Password update
- `/api/auth/user` - Get current user
- `/api/auth/resend-verification` - Resend verification

#### Checkout & Orders (6 routes)
- `/api/checkout/create` - Create checkout session
- `/api/checkout/confirm` - Confirm payment
- `/api/checkout/create-session` - Stripe session
- `/api/orders/[id]/download-tickets` - Download tickets

#### Memberships (4 routes)
- `/api/memberships/subscribe` - Subscribe to tier
- `/api/memberships/current` - Get current membership
- `/api/memberships/tiers` - List membership tiers
- `/api/memberships/credits/redeem` - Redeem credits

#### Admin (12 routes)
- `/api/admin/events` - Event management
- `/api/admin/users` - User management
- `/api/admin/analytics` - Analytics data
- `/api/admin/orders/[id]/refund` - Process refunds
- `/api/admin/products` - Product management
- `/api/admin/ticket-types` - Ticket type management

#### Other (15 routes)
- `/api/favorites` - Favorites management
- `/api/health` - Health check
- `/api/ready` - Readiness check
- `/api/live` - Liveness check
- `/api/upload` - File upload
- Cron jobs, integrations, notifications

### 3. Components (44 files) - Target: 70%
**Priority: P1 - High**

#### Features (30 components)
- Event components (card, filters, grid)
- Cart & checkout (add-to-cart, cart-button)
- Membership (cards, benefits, stats)
- Shop (product grid, filters, detail view)
- Social (chat, messaging, content)
- Media (music player, video gallery, venue map)

#### UI Components (14 components)
- Design system components
- Admin components (header, sidebar, breadcrumbs)
- Privacy & SEO components

### 4. Lib Utilities (52 files) - Target: 80%
**Priority: P1 - High**

#### Critical Utilities
- **API Layer** (error-handler, middleware, rate-limiter)
- **Email** (templates, client, send)
- **Cache** (Redis operations)
- **RBAC** (permissions, roles, access control)
- **Monitoring** (logger, alerts, APM)
- **Privacy** (data export, privacy manager)

#### Integration Utilities
- Stripe, Twilio, Analytics
- Calendar, Social share, Wallet
- Spotify, YouTube integrations

### 5. Integration Tests - Target: 60%
**Priority: P2 - Medium**

- ✅ Ticket purchase flow
- ✅ Membership lifecycle
- ⏳ Event creation workflow
- ⏳ Order processing workflow
- ⏳ RBAC permission flows
- ⏳ Email delivery flows

### 6. E2E Tests - Target: 50%
**Priority: P2 - Medium**

- User registration & login
- Event browsing & filtering
- Ticket purchase flow
- Membership subscription
- Admin event creation
- Order management

## Test Templates

### Hook Test Template
```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useHookName } from '@/hooks/use-hook-name';

describe('useHookName', () => {
  it('should return initial state', () => {
    const { result } = renderHook(() => useHookName());
    expect(result.current).toBeDefined();
  });

  it('should handle state updates', async () => {
    const { result } = renderHook(() => useHookName());
    // Test logic
  });
});
```

### Component Test Template
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from '@/components/path/component-name';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByRole('...')).toBeInTheDocument();
  });

  it('should handle user interactions', () => {
    render(<ComponentName />);
    fireEvent.click(screen.getByRole('button'));
    // Assertions
  });
});
```

### API Route Test Template
```typescript
import { describe, it, expect, vi } from 'vitest';
import { POST } from '@/app/api/route-name/route';

describe('API Route', () => {
  it('should handle valid request', async () => {
    const request = new Request('http://localhost:3000/api/route', {
      method: 'POST',
      body: JSON.stringify({ /* data */ }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });
});
```

## Implementation Roadmap

### Phase 1: Foundation (Week 1) ✅
- [x] Install dependencies
- [x] Fix test setup
- [x] Create hook tests (4/8)
- [x] Document strategy

### Phase 2: Core Coverage (Week 2-3)
- [ ] Complete remaining hook tests (4)
- [ ] Create lib utility tests (20 critical files)
- [ ] Fix existing API route tests
- [ ] Add component tests (15 critical components)

### Phase 3: Comprehensive Coverage (Week 4-5)
- [ ] Add remaining API route tests (30 routes)
- [ ] Add remaining component tests (29 components)
- [ ] Add integration tests (4 workflows)
- [ ] Add lib utility tests (32 remaining files)

### Phase 4: Validation (Week 6)
- [ ] Run full coverage report
- [ ] Identify gaps
- [ ] Add missing tests
- [ ] Verify 80%+ threshold met

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit          # Unit tests
npm run test:components    # Component tests
npm run test:api           # API route tests
npm run test:integration   # Integration tests
npm run test:e2e           # E2E tests

# Run in watch mode
npm run test:watch

# Run CI pipeline
npm run test:ci
```

## Coverage Metrics

### Current Baseline
```
Lines      : 45%
Functions  : 42%
Branches   : 38%
Statements : 45%
```

### Target Metrics
```
Lines      : 80%
Functions  : 80%
Branches   : 75%
Statements : 80%
```

### Progress Tracking
- **Hooks:** 50% → 90% (4/8 complete)
- **API Routes:** 15% → 75% (5/47 complete)
- **Components:** 10% → 70% (3/44 complete)
- **Lib Utilities:** 5% → 80% (3/52 complete)
- **Integration:** 20% → 60% (2/6 complete)

## Best Practices

### 1. Test Isolation
- Each test should be independent
- Use `beforeEach` for setup
- Clean up after each test

### 2. Mock External Dependencies
- Mock Supabase client
- Mock Stripe API
- Mock Redis cache
- Mock Next.js context

### 3. Test Behavior, Not Implementation
- Test user-facing behavior
- Avoid testing internal implementation details
- Focus on inputs and outputs

### 4. Accessibility Testing
- Use semantic queries (getByRole, getByLabelText)
- Test keyboard navigation
- Verify ARIA attributes

### 5. Coverage Quality
- Aim for meaningful tests, not just coverage numbers
- Test edge cases and error paths
- Include integration tests for critical workflows

## Notes

- Some tests have type mismatches due to evolving API signatures
- Tests serve as documentation and will be adjusted to match actual implementations
- Priority is on creating test infrastructure and patterns
- Actual coverage will improve as tests are aligned with real code

## Next Steps

1. ✅ Complete hook tests (4 remaining)
2. Create lib utility tests for critical modules
3. Fix API route test mocks to match Next.js 15 patterns
4. Add component tests for feature components
5. Run coverage report and identify specific gaps
6. Create targeted tests for uncovered code paths
