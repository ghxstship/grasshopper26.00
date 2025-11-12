# Theme Implementation Audit Checklist

**Purpose:** Ensure complete dark/light/system theme support across all UI components and states.

## Phase 1: Token-Level Setup
- [ ] Define all color tokens in `:root` (light mode defaults)
- [ ] Define all color token overrides in `[data-theme="dark"]`
- [ ] Verify semantic token naming (e.g., `--color-text-primary` not `--color-black`)
- [ ] Test token swapping with theme toggle
- [ ] Ensure all tokens use monochromatic palette (GHXSTSHIP: black/white/grey only)

## Phase 2: Component-Level Audit

### Interactive Elements
For EACH interactive component (buttons, links, inputs, toggles):
- [ ] Default state: both themes
- [ ] Hover state: both themes
- [ ] Active/pressed state: both themes
- [ ] Focus state: both themes
- [ ] Disabled state: both themes
- [ ] Loading state: both themes

### Visual Properties to Verify
- [ ] **Background colors** invert correctly
- [ ] **Text colors** maintain readability (contrast ratio ≥4.5:1)
- [ ] **Border colors** remain visible in both modes
- [ ] **Shadow colors** visible in both modes (GHXSTSHIP: hard geometric shadows)
- [ ] **Icon colors** invert with background
- [ ] **Badge/pill colors** invert correctly
- [ ] **Overlay/backdrop colors** work in both modes

### Specific Component Categories

#### Navigation
- [ ] Header/navbar background
- [ ] Nav links (default, hover, active)
- [ ] Mobile menu overlay
- [ ] Mobile menu drawer background
- [ ] Hamburger icon lines
- [ ] Breadcrumbs
- [ ] Pagination controls

#### Forms
- [ ] Input backgrounds and borders
- [ ] Input text and placeholder colors
- [ ] Select dropdowns
- [ ] Checkboxes and radio buttons
- [ ] Toggle switches
- [ ] Form validation states (error, success, warning)
- [ ] Field labels and helper text

#### Buttons & Actions
- [ ] Primary buttons (all states)
- [ ] Secondary buttons (all states)
- [ ] Ghost/text buttons (all states)
- [ ] Icon-only buttons (all states)
- [ ] Button groups
- [ ] Floating action buttons

#### Content
- [ ] Card backgrounds and borders
- [ ] Modal/dialog backgrounds
- [ ] Tooltip backgrounds and text
- [ ] Alert/notification banners
- [ ] Code blocks
- [ ] Blockquotes
- [ ] Tables (headers, rows, borders)
- [ ] Dividers/separators

#### Media
- [ ] Image borders/frames
- [ ] Video player controls
- [ ] Audio player controls
- [ ] Gallery thumbnails
- [ ] Avatar borders

## Phase 3: Responsive Breakpoint Testing

Test EACH breakpoint in BOTH themes:
- [ ] Mobile (<768px)
- [ ] Tablet (768px-1023px)
- [ ] Desktop (1024px-1439px)
- [ ] Large desktop (≥1440px)

### Breakpoint-Specific Elements
- [ ] Mobile menu (hamburger, drawer, overlay)
- [ ] Responsive navigation collapse
- [ ] Stacked vs. horizontal layouts
- [ ] Touch target sizes (min 44x44px)

## Phase 4: Animation & Transition Testing

- [ ] Hover transitions smooth in both themes
- [ ] Focus ring animations
- [ ] Loading spinners/skeletons
- [ ] Modal open/close animations
- [ ] Drawer slide animations
- [ ] Tooltip fade-in/out
- [ ] Toast notifications

## Phase 5: Edge Cases

- [ ] Empty states (no data)
- [ ] Error states (404, 500, etc.)
- [ ] Loading states (skeleton screens)
- [ ] Disabled/read-only states
- [ ] Selected/checked states
- [ ] Expanded/collapsed states (accordions, dropdowns)
- [ ] Drag-and-drop states
- [ ] Multi-select states

## Phase 6: Accessibility Verification

- [ ] Color contrast ratios meet WCAG AA (4.5:1 text, 3:1 UI)
- [ ] Focus indicators visible in both themes
- [ ] Keyboard navigation works in both themes
- [ ] Screen reader announcements (theme change)
- [ ] High contrast mode compatibility
- [ ] Reduced motion preferences respected

## Phase 7: System Theme Integration

- [ ] System theme detection works
- [ ] Theme persists across page reloads
- [ ] Theme syncs across tabs/windows
- [ ] OS theme change triggers update
- [ ] Manual override persists

## Phase 8: Visual Regression Testing

### Manual Visual Inspection
- [ ] Screenshot comparison: light vs. dark
- [ ] Print/export views
- [ ] Embedded iframes
- [ ] Third-party widgets (maps, embeds)

### Automated Testing
- [ ] Playwright visual regression tests
- [ ] Storybook theme toggle stories
- [ ] Percy/Chromatic snapshots

## Phase 9: Performance

- [ ] Theme switch is instant (<100ms)
- [ ] No flash of unstyled content (FOUC)
- [ ] No flash of wrong theme
- [ ] CSS custom properties update efficiently
- [ ] No layout shift on theme change

## Phase 10: Documentation

- [ ] Theme implementation guide
- [ ] Component theme examples
- [ ] Design token reference
- [ ] Dark mode design guidelines
- [ ] Troubleshooting common issues

---

## Quick Audit Script

Run this for rapid component auditing:

```bash
# Check for hardcoded colors (should use tokens)
grep -r "color: #" src/components --exclude-dir=node_modules

# Check for missing dark mode overrides
grep -r "\.iconButton" src --exclude-dir=node_modules | grep -v "data-theme"

# Find components without theme support
find src/components -name "*.module.css" -exec grep -L "data-theme" {} \;
```

## Common Pitfalls

1. **Forgetting hover states** - Most common miss
2. **Border visibility** - Black borders invisible on black backgrounds
3. **Shadow visibility** - Hard geometric shadows need color inversion
4. **Badge/overlay colors** - Often hardcoded
5. **Mobile-specific elements** - Hamburger menus, drawers
6. **Third-party components** - May not support theming
7. **SVG fill colors** - Need `currentColor` or theme-aware fills
8. **Pseudo-elements** - `::before`, `::after` need theme support

## Sign-Off Criteria

Theme implementation is complete when:
- ✅ All checklist items verified
- ✅ Visual inspection in both themes across all breakpoints
- ✅ No hardcoded colors in components (use tokens only)
- ✅ All interactive states work in both themes
- ✅ Accessibility standards met
- ✅ No visual regressions
- ✅ Performance benchmarks met
