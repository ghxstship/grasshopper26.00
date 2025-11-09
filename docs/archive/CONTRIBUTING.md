# Contributing to Grasshopper 26.00

Thank you for your interest in contributing to Grasshopper 26.00! This document provides guidelines and best practices for contributing to the project.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Architecture Guidelines](#architecture-guidelines)

---

## 🤝 Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Prioritize code quality and maintainability
- Document your changes thoroughly

---

## 🚀 Getting Started

### **Prerequisites**

- Node.js 18+ and npm
- Git
- Supabase CLI
- Basic knowledge of Next.js, TypeScript, and React

### **Setup Development Environment**

```bash
# Clone the repository
git clone <repository-url>
cd grasshopper26.00

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Configure your environment variables
# Edit .env.local with your API keys

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

Visit `http://localhost:3000` to verify your setup.

---

## 🔄 Development Workflow

### **1. Create a Branch**

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Or a bugfix branch
git checkout -b fix/bug-description
```

### **2. Make Changes**

- Write clean, maintainable code
- Follow existing code patterns
- Add tests for new features
- Update documentation as needed

### **3. Test Your Changes**

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e
```

### **4. Commit Your Changes**

Follow our [commit guidelines](#commit-guidelines) below.

### **5. Push and Create PR**

```bash
# Push your branch
git push origin feature/your-feature-name

# Create a Pull Request on GitHub
```

---

## 📝 Code Standards

### **TypeScript**

- Use TypeScript for all new code
- Define proper types (avoid `any`)
- Use interfaces for object shapes
- Export types from `src/types/`

```typescript
// Good
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

// Avoid
const user: any = { ... };
```

### **React Components**

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop types

```typescript
// Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  // Component logic
}
```

### **File Organization**

```
src/
├── app/              # Next.js pages (App Router)
├── components/       # Reusable React components
│   ├── ui/          # Base UI components (shadcn/ui)
│   └── features/    # Feature-specific components
├── lib/             # Utilities and services
│   ├── api/        # API client functions
│   ├── utils/      # Helper functions
│   └── constants/  # Constants and configs
├── hooks/           # Custom React hooks
└── types/           # TypeScript type definitions
```

### **Naming Conventions**

- **Files**: `kebab-case.tsx` for components, `camelCase.ts` for utilities
- **Components**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`

### **Styling**

- Use Tailwind CSS utility classes
- Follow existing design system patterns
- Use shadcn/ui components when available
- Keep styles co-located with components

```typescript
// Good
<button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
  Click me
</button>
```

---

## 🧪 Testing Requirements

### **Unit Tests**

- Write tests for all utility functions
- Test component logic and edge cases
- Use Vitest and Testing Library

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders with correct label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### **E2E Tests**

- Write E2E tests for critical user flows
- Use Playwright for browser automation
- Test across different browsers

```typescript
import { test, expect } from '@playwright/test';

test('user can purchase ticket', async ({ page }) => {
  await page.goto('/events/123');
  await page.click('text=Buy Tickets');
  // ... test flow
});
```

### **Coverage Requirements**

- Aim for 80%+ coverage on new code
- Critical paths must have tests
- Run coverage report: `npm run test:coverage`

---

## 📝 Commit Guidelines

### **Commit Message Format**

```
<type>(<scope>): <subject>

<body>

<footer>
```

### **Types**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### **Examples**

```bash
# Feature
git commit -m "feat(tickets): add QR code generation"

# Bug fix
git commit -m "fix(auth): resolve session timeout issue"

# Documentation
git commit -m "docs(api): update authentication endpoints"

# Refactor
git commit -m "refactor(components): extract common button logic"
```

### **Best Practices**

- Use present tense ("add" not "added")
- Keep subject line under 50 characters
- Capitalize subject line
- Don't end subject with period
- Use body to explain what and why (not how)

---

## 🔀 Pull Request Process

### **Before Submitting**

1. ✅ All tests pass
2. ✅ Code is linted and formatted
3. ✅ Types are properly defined
4. ✅ Documentation is updated
5. ✅ No console errors or warnings
6. ✅ Tested in development environment

### **PR Title Format**

Follow commit message format:
```
feat(scope): add new feature
fix(scope): resolve bug
```

### **PR Description Template**

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass locally
```

### **Review Process**

1. Submit PR with clear description
2. Address reviewer feedback
3. Ensure CI/CD passes
4. Get approval from maintainer
5. Squash and merge

---

## 🏗️ Architecture Guidelines

### **Component Architecture**

- **Presentation Components**: Pure UI, no business logic
- **Container Components**: Handle data fetching and state
- **Custom Hooks**: Extract reusable logic
- **Services**: API calls and external integrations

### **State Management**

- Use React hooks for local state
- Use Zustand for global state
- Use TanStack Query for server state
- Avoid prop drilling (use context or state management)

### **API Design**

- Use Next.js API routes for backend logic
- Implement proper error handling
- Use TypeScript for request/response types
- Follow RESTful conventions

```typescript
// Good API route structure
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Validate input
    // Process request
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ error: 'Message' }, { status: 500 });
  }
}
```

### **Database Patterns**

- Use Supabase client for database operations
- Implement Row Level Security (RLS)
- Use migrations for schema changes
- Index frequently queried columns

### **Performance Considerations**

- Use Next.js Image component for images
- Implement proper loading states
- Use React.memo for expensive components
- Lazy load heavy components
- Optimize bundle size

---

## 🔒 Security Guidelines

- Never commit sensitive data (API keys, passwords)
- Use environment variables for secrets
- Validate all user inputs
- Implement CSRF protection
- Follow OWASP security practices
- Use parameterized queries

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Project Architecture](./ARCHITECTURE.md)
- [API Documentation](./docs/api/API_DOCUMENTATION.md)

---

## ❓ Questions?

- Check [documentation](./docs/DOCUMENTATION_INDEX.md)
- Review existing code for patterns
- Ask in pull request comments

---

## 🎉 Thank You!

Your contributions help make Grasshopper 26.00 better for everyone. We appreciate your time and effort!

---

**Happy Coding!** 🚀
