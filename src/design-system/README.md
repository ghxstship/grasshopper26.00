# GVTEWAY Design System

## Overview
The GVTEWAY Design System is a comprehensive, token-based design system built on atomic design principles. It provides a complete foundation for building accessible, responsive, and internationally-ready user interfaces.

## Quick Start

### Using Design Tokens

#### In CSS Modules
```css
/* component.module.css */
.button {
  /* Use CSS variables */
  padding: var(--space-4);
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  
  /* Transitions */
  transition: all var(--duration-fast) var(--easing-out);
}

.button:hover {
  background-color: var(--color-primary-hover);
  box-shadow: var(--shadow-md);
}
```

#### In TypeScript/JavaScript
```typescript
import { tokens } from '@/design-system/tokens';

// Access tokens programmatically
const spacing = tokens.spacing[4]; // '1rem'
const color = tokens.semanticColors.interactive.primary.default;
```

#### Using Utility Classes
```tsx
// Import utility classes in your component
import '@/design-system/tokens/utility-classes.css';

function MyComponent() {
  return (
    <div className="flex items-center gap-4 p-6 bg-primary rounded-lg">
      <span className="text-lg font-semibold text-primary">Hello</span>
    </div>
  );
}
```

## Design Tokens

### Color Tokens
```css
/* Interactive Colors */
var(--color-primary)
var(--color-primary-hover)
var(--color-primary-active)
var(--color-secondary)
var(--color-accent)

/* Text Colors */
var(--color-text-primary)
var(--color-text-secondary)
var(--color-text-tertiary)
var(--color-text-inverse)

/* Background Colors */
var(--color-bg-primary)
var(--color-bg-secondary)
var(--color-bg-tertiary)

/* Status Colors */
var(--color-success)
var(--color-error)
var(--color-warning)
var(--color-info)

/* Border Colors */
var(--color-border-default)
var(--color-border-strong)
var(--color-border-focus)
```

### Spacing Tokens
```css
/* Based on 4px grid system */
var(--space-0)    /* 0 */
var(--space-1)    /* 4px */
var(--space-2)    /* 8px */
var(--space-3)    /* 12px */
var(--space-4)    /* 16px */
var(--space-6)    /* 24px */
var(--space-8)    /* 32px */
var(--space-12)   /* 48px */
var(--space-16)   /* 64px */
```

### Typography Tokens
```css
/* Font Sizes */
var(--font-size-xs)    /* 12px */
var(--font-size-sm)    /* 14px */
var(--font-size-base)  /* 16px */
var(--font-size-lg)    /* 18px */
var(--font-size-xl)    /* 20px */
var(--font-size-2xl)   /* 24px */
var(--font-size-3xl)   /* 30px */

/* Font Weights */
var(--font-weight-normal)    /* 400 */
var(--font-weight-medium)    /* 500 */
var(--font-weight-semibold)  /* 600 */
var(--font-weight-bold)      /* 700 */

/* Line Heights */
var(--line-height-tight)   /* 1.25 */
var(--line-height-normal)  /* 1.5 */
var(--line-height-relaxed) /* 1.625 */
```

### Other Tokens
```css
/* Border Radius */
var(--radius-sm)    /* 2px */
var(--radius-md)    /* 6px */
var(--radius-lg)    /* 8px */
var(--radius-xl)    /* 12px */
var(--radius-full)  /* 9999px */

/* Shadows */
var(--shadow-sm)
var(--shadow-md)
var(--shadow-lg)
var(--shadow-xl)

/* Transitions */
var(--duration-fast)  /* 150ms */
var(--duration-base)  /* 250ms */
var(--duration-slow)  /* 350ms */

var(--easing-in)
var(--easing-out)
var(--easing-in-out)
```

## Accessibility Utilities

### Focus Management
```typescript
import { focusManager } from '@/design-system/utils/focus-management';

// Trap focus in a modal
const cleanup = focusManager.trapFocus(modalElement);

// Save and restore focus
focusManager.saveFocus();
// ... do something ...
focusManager.restoreFocus();

// Announce to screen readers
focusManager.announce('Item added to cart', 'polite');
```

### ARIA Helpers
```typescript
import { ariaHelpers } from '@/design-system/utils/aria-helpers';

// Generate unique IDs for ARIA relationships
const id = ariaHelpers.generateId('dialog');

// Manage ARIA states
ariaHelpers.setExpanded(element, true);
ariaHelpers.setSelected(element, true);
```

### Keyboard Navigation
```typescript
import { keyboardNavigation } from '@/design-system/utils/keyboard-navigation';

// Handle arrow key navigation
keyboardNavigation.handleArrowKeys(event, items, currentIndex);

// Handle tab navigation
keyboardNavigation.handleTabKey(event, container);
```

## Internationalization

### RTL Support
Always use logical properties for RTL compatibility:

```css
/* ❌ Don't use directional properties */
margin-left: 16px;
padding-right: 24px;
text-align: left;

/* ✅ Use logical properties */
margin-inline-start: var(--space-4);
padding-inline-end: var(--space-6);
text-align: start;
```

### Formatters
```typescript
import { Formatters } from '@/lib/i18n/formatters';

const formatters = new Formatters('en-US');

// Format dates
formatters.formatDate(new Date()); // "Jan 15, 2025"

// Format currency
formatters.formatCurrency(1234.56); // "$1,234.56"

// Format relative time
formatters.formatRelativeTime(-2, 'hours'); // "2 hours ago"
```

## Component Development

### Creating a New Component

1. **Create component directory**
```bash
mkdir -p src/design-system/components/atoms/MyComponent
```

2. **Create component files**
```
MyComponent/
├── MyComponent.tsx
├── MyComponent.module.css
├── MyComponent.test.tsx
└── index.ts
```

3. **Component template**
```typescript
// MyComponent.tsx
import styles from './MyComponent.module.css';

export interface MyComponentProps {
  /** Component variant */
  variant?: 'primary' | 'secondary';
  /** Component size */
  size?: 'sm' | 'md' | 'lg';
  /** Children content */
  children: React.ReactNode;
}

export function MyComponent({ 
  variant = 'primary',
  size = 'md',
  children 
}: MyComponentProps) {
  return (
    <div 
      className={styles.container}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </div>
  );
}
```

4. **CSS module template**
```css
/* MyComponent.module.css */
.container {
  /* Use design tokens exclusively */
  padding: var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  transition: all var(--duration-fast) var(--easing-out);
}

/* Variants */
.container[data-variant="primary"] {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.container[data-variant="secondary"] {
  background-color: var(--color-secondary);
  color: var(--color-text-primary);
}

/* Sizes */
.container[data-size="sm"] {
  padding: var(--space-2);
  font-size: var(--font-size-sm);
}

.container[data-size="lg"] {
  padding: var(--space-6);
  font-size: var(--font-size-lg);
}

/* Responsive */
@media (min-width: 768px) {
  .container {
    padding: var(--space-6);
  }
}
```

5. **Export from index**
```typescript
// index.ts
export { MyComponent } from './MyComponent';
export type { MyComponentProps } from './MyComponent';
```

## Testing

### Accessibility Testing
```typescript
import { testAccessibility } from '@/tests/accessibility/a11y-test-utils';
import { render } from '@testing-library/react';

test('MyComponent is accessible', async () => {
  const { container } = render(<MyComponent>Test</MyComponent>);
  await testAccessibility(container);
});
```

### Keyboard Navigation Testing
```typescript
import { testKeyboardNavigation } from '@/tests/accessibility/a11y-test-utils';

test('MyComponent supports keyboard navigation', () => {
  const { container } = render(<MyComponent>Test</MyComponent>);
  const keyboard = testKeyboardNavigation(container);
  
  expect(keyboard.focusableCount).toBeGreaterThan(0);
  keyboard.pressTab();
  keyboard.pressEnter();
});
```

## Validation

### Run Design Token Validation
```bash
npm run validate:tokens
```

### Run ESLint with Design Token Rules
```bash
npm run lint:tokens
```

### Run Accessibility Tests
```bash
npm run test:a11y
```

### Run All Validations
```bash
npm run validate:all
```

## Best Practices

### ✅ Do's
- Use design tokens for all styling
- Use CSS modules for component styles
- Use logical properties for RTL support
- Add proper ARIA attributes
- Test keyboard navigation
- Test with screen readers
- Support dark mode
- Make components responsive
- Document component props
- Write accessibility tests

### ❌ Don'ts
- Don't use hardcoded colors
- Don't use hardcoded spacing values
- Don't use directional properties (left/right)
- Don't skip accessibility testing
- Don't forget focus indicators
- Don't use inline styles
- Don't hardcode text (use i18n)
- Don't skip responsive design
- Don't ignore touch targets (44x44px minimum)

## Resources

### Documentation
- [Atomic Design Structure](../../../ATOMIC_DESIGN_STRUCTURE.md)
- [Remediation Complete](../../../ATOMIC_DESIGN_REMEDIATION_COMPLETE.md)
- [ESLint Rules](../../../.eslintrc.design-tokens.js)

### Commands
```bash
# Development
npm run dev

# Build
npm run build

# Testing
npm test
npm run test:a11y
npm run test:e2e

# Validation
npm run validate:tokens
npm run lint:tokens
npm run validate:all

# Type checking
npm run type-check
```

## Support

For questions or issues with the design system:
1. Check the documentation in `/docs/`
2. Review example components in `/src/design-system/components/`
3. Run validation scripts to catch issues
4. Contact: support@gvteway.com

---

**Version**: 26.0.0  
**Last Updated**: November 9, 2025  
**Status**: Production Ready ✅
