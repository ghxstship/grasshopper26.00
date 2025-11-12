# Theme & Responsive Quick Reference

## Theme Toggle

**Location:** Site header (top right)  
**Icon States:**
- ☀ = Light theme active
- ☾ = Dark theme active  
- ◐ = System theme active

**Cycle Order:** Light → Dark → System → Light

## Keyboard Shortcuts

- `Tab` - Navigate to theme toggle
- `Enter/Space` - Activate theme toggle
- `Esc` - Close mobile menu

## Breakpoints

| Device | Width | Layout |
|--------|-------|--------|
| Mobile | < 768px | Single column, hamburger menu |
| Tablet | 768px - 1024px | 2-column grid, hamburger menu |
| Desktop | > 1024px | Multi-column, full navigation |
| Desktop XL | > 1440px | Wide layout, max 1920px container |

## Testing Checklist

### Theme Switching
- [ ] Click theme toggle cycles through themes
- [ ] Theme persists on page reload
- [ ] Theme persists across navigation
- [ ] No layout shift when switching themes
- [ ] All colors update correctly
- [ ] Shadows update correctly (black in light, white in dark)

### Responsive Layout
- [ ] Mobile menu appears < 1024px
- [ ] Desktop nav appears ≥ 1024px
- [ ] No horizontal scroll at any breakpoint
- [ ] Images scale properly
- [ ] Typography is readable at all sizes
- [ ] Touch targets are ≥ 44px on mobile

### Accessibility
- [ ] Focus indicators visible in both themes
- [ ] Sufficient contrast in both themes
- [ ] Keyboard navigation works
- [ ] Screen reader announces theme changes
- [ ] Reduced motion respected

## Common Issues & Fixes

### Theme not persisting
**Fix:** Check localStorage key `gvteway-theme` exists

### Layout shift on theme change
**Fix:** Ensure all color properties use CSS variables

### Mobile menu not closing
**Fix:** Check body overflow is reset

### Responsive breakpoint not working
**Fix:** Verify @media query syntax and min-width values

## Developer Notes

### Adding Dark Mode to New Components

```css
/* 1. Use semantic tokens */
.myComponent {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  border-color: var(--color-border-default);
}

/* 2. Add dark mode section (tokens auto-update) */
[data-theme="dark"] .myComponent {
  /* Usually no overrides needed */
  /* Tokens automatically switch */
}

/* 3. Only override if component-specific */
[data-theme="dark"] .myComponent {
  /* Special case overrides only */
  box-shadow: var(--shadow-lg);
}
```

### Adding Responsive Styles

```css
/* Mobile first approach */
.myComponent {
  /* Mobile styles (default) */
  padding: var(--space-4);
}

/* Tablet and up */
@media (min-width: 768px) {
  .myComponent {
    padding: var(--space-6);
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .myComponent {
    padding: var(--space-8);
  }
}
```

### Using the Theme Hook

```typescript
import { useTheme } from '@/hooks/use-theme';

function MyComponent() {
  const { theme, setTheme, cycleTheme, isDark, isLight, mounted } = useTheme();
  
  // Wait for mount to avoid hydration mismatch
  if (!mounted) return null;
  
  return (
    <button onClick={cycleTheme}>
      {isDark ? '☾' : isLight ? '☀' : '◐'}
    </button>
  );
}
```

## Token Reference

### Most Used Tokens

```css
/* Backgrounds */
--color-bg-primary      /* Main background */
--color-bg-secondary    /* Cards, sections */
--color-bg-tertiary     /* Subtle backgrounds */

/* Text */
--color-text-primary    /* Main text */
--color-text-secondary  /* Secondary text */
--color-text-inverse    /* Text on dark bg */

/* Borders */
--color-border-default  /* Standard borders */
--color-border-strong   /* Emphasized borders */

/* Interactive */
--color-primary         /* Primary actions */
--color-accent          /* Accent elements */

/* Shadows */
--shadow-sm             /* 3px 3px 0 */
--shadow-md             /* 6px 6px 0 */
--shadow-lg             /* 8px 8px 0 */
```

## Browser DevTools

### Inspect Theme
```javascript
// Check current theme
document.documentElement.getAttribute('data-theme')

// Check localStorage
localStorage.getItem('gvteway-theme')

// Get computed token value
getComputedStyle(document.documentElement)
  .getPropertyValue('--color-bg-primary')
```

### Test Breakpoints
```javascript
// Current viewport width
window.innerWidth

// Trigger resize
window.dispatchEvent(new Event('resize'))
```

## Performance Tips

1. **Avoid inline styles** - Use CSS modules
2. **Use CSS variables** - Enables instant theme switching
3. **Minimize transitions** - Only animate necessary properties
4. **Lazy load images** - Especially in galleries
5. **Debounce resize handlers** - Prevent excessive recalculations

## Support

**Documentation:** `/docs/architecture/DESIGN_SYSTEM.md`  
**Validation:** `node scripts/verify-theme-responsive.mjs`  
**Tests:** `npm run test:e2e`  
**Issues:** Check `/THEME_RESPONSIVE_VALIDATION.md`
