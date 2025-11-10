# Testing Quick Start Guide

## Getting Started

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/api/auth/login.test.ts

# Run tests for specific directory
npm run test:api
npm run test:components
npm run test:integration
```

### Test Structure
```
tests/
├── api/              # API route tests
├── components/       # Component tests
├── hooks/            # React hooks tests
├── lib/              # Library/utility tests
├── services/         # Service layer tests
├── integration/      # Integration tests
├── e2e/              # End-to-end tests
├── helpers/          # Test helpers and mocks
│   └── supabase-mock.ts
└── setup.ts          # Global test setup
```

## Writing Your First Test

### 1. API Route Test

```typescript
// tests/api/example/route.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from '@/app/api/example/route';
import { createMockSupabaseClient, mockSupabaseResponse } from '../../helpers/supabase-mock';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('GET /api/example', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = createMockSupabaseClient();
    const { createClient } = require('@/lib/supabase/server');
    createClient.mockReturnValue(mockSupabase);
  });

  it('should return data successfully', async () => {
    const mockData = { id: '123', name: 'Test' };
    mockSupabase.from().single.mockResolvedValue(
      mockSupabaseResponse(mockData)
    );

    const request = new Request('http://localhost:3000/api/example');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockData);
  });

  it('should require authentication', async () => {
    mockSupabase.auth.getUser.mockResolvedValue(
      mockSupabaseResponse({ user: null })
    );

    const request = new Request('http://localhost:3000/api/example');
    const response = await GET(request);

    expect(response.status).toBe(401);
  });
});
```

### 2. Component Test

```typescript
// tests/components/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });

  it('should apply variant styles', () => {
    render(<Button variant="primary">Click me</Button>);
    const button = screen.getByText('Click me');
    expect(button).toHaveClass('primary');
  });
});
```

### 3. Service/Utility Test

```typescript
// tests/lib/utils/format.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate } from '@/lib/utils/format';

describe('Format Utilities', () => {
  describe('formatCurrency', () => {
    it('should format USD correctly', () => {
      expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0, 'USD')).toBe('$0.00');
    });

    it('should handle negative numbers', () => {
      expect(formatCurrency(-100, 'USD')).toBe('-$100.00');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2025-01-15');
      expect(formatDate(date)).toBe('January 15, 2025');
    });
  });
});
```

### 4. Page Test

```typescript
// tests/app/dashboard-page.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from '@/app/dashboard/page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

describe('Dashboard Page', () => {
  it('should render loading state', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should render dashboard content after loading', async () => {
    render(<DashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
  });

  it('should display user stats', async () => {
    render(<DashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/total orders/i)).toBeInTheDocument();
    });
  });
});
```

## Test Helpers

### Supabase Mock Helper

```typescript
import { createMockSupabaseClient, mockSupabaseResponse, mockSupabaseError } from '../../helpers/supabase-mock';

// Create mock client
const mockSupabase = createMockSupabaseClient({
  queryResponse: { data: [], error: null },
  authUser: { id: 'user-123', email: 'test@example.com' },
  authSession: { access_token: 'token' },
});

// Mock successful response
mockSupabase.from().single.mockResolvedValue(
  mockSupabaseResponse({ id: '123', name: 'Test' })
);

// Mock error response
mockSupabase.from().single.mockResolvedValue(
  mockSupabaseError('Not found', 'PGRST116')
);
```

### Common Patterns

#### Testing Authentication
```typescript
it('should require authentication', async () => {
  mockSupabase.auth.getUser.mockResolvedValue({
    data: { user: null },
    error: null,
  });

  const response = await GET(request);
  expect(response.status).toBe(401);
});
```

#### Testing Authorization
```typescript
it('should check user permissions', async () => {
  mockSupabase.auth.getUser.mockResolvedValue({
    data: { user: { id: 'user-123', role: 'member' } },
    error: null,
  });

  const response = await GET(request);
  expect(response.status).toBe(403);
});
```

#### Testing Database Queries
```typescript
it('should query database correctly', async () => {
  const mockData = [{ id: '1' }, { id: '2' }];
  mockSupabase.from().mockResolvedValue({
    data: mockData,
    error: null,
  });

  // Your test code
  expect(mockSupabase.from).toHaveBeenCalledWith('table_name');
});
```

#### Testing Error Handling
```typescript
it('should handle database errors', async () => {
  mockSupabase.from().mockResolvedValue({
    data: null,
    error: { message: 'Database error' },
  });

  const response = await GET(request);
  expect(response.status).toBe(500);
});
```

## Best Practices

### 1. Test Organization
- One test file per source file
- Group related tests with `describe` blocks
- Use descriptive test names: "should [expected behavior] when [condition]"

### 2. Test Independence
- Each test should be independent
- Use `beforeEach` to reset state
- Don't rely on test execution order

### 3. Mocking
- Mock external dependencies (Supabase, Stripe, etc.)
- Use the provided mock helpers
- Clear mocks between tests

### 4. Assertions
- Test one thing per test
- Use specific assertions
- Test both success and error cases

### 5. Coverage
- Aim for 100% line coverage
- Test edge cases and error paths
- Test all conditional branches

## Common Issues & Solutions

### Issue: "Cannot find module"
```bash
# Solution: Check import paths
# Use relative paths for test helpers
import { helper } from '../../helpers/helper';
```

### Issue: "TypeError: Cannot destructure property"
```typescript
// Solution: Ensure mock returns proper structure
mockSupabase.from().single.mockResolvedValue({
  data: mockData,  // Must have 'data' property
  error: null,     // Must have 'error' property
});
```

### Issue: "Test timeout"
```typescript
// Solution: Increase timeout or fix async issues
it('should complete', async () => {
  // Make sure to await async operations
  await someAsyncFunction();
}, 10000); // Increase timeout if needed
```

### Issue: "Mock not working"
```typescript
// Solution: Mock before importing module
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

// Then import the module
import { myFunction } from '@/lib/myModule';
```

## Coverage Reports

### View Coverage
```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/index.html
```

### Coverage Thresholds
```typescript
// vitest.config.ts
coverage: {
  thresholds: {
    lines: 100,
    functions: 100,
    branches: 95,
    statements: 100,
  }
}
```

## Next Steps

1. **Pick a file to test** from `scripts/find-untested-files.sh`
2. **Generate a test stub** using the templates above
3. **Write meaningful tests** covering all code paths
4. **Run tests** and verify coverage
5. **Commit** and move to the next file

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- Project roadmap: `docs/TEST_COVERAGE_ROADMAP.md`
- Detailed plan: `docs/TEST_COVERAGE_100_PERCENT_PLAN.md`

## Getting Help

- Check existing tests in `tests/` for examples
- Review test helpers in `tests/helpers/`
- Ask team members for code review
- Refer to this guide for patterns

---

**Happy Testing! 🧪**
