# Dark Mode Implementation - Complete

## Status: Header & Core Components Complete ✅

### Completed Files
1. ✅ `/src/design-system/components/organisms/layout/site-header.tsx`
2. ✅ `/src/design-system/components/organisms/layout/site-header.module.css`
3. ✅ `/src/app/organization/advances/page.module.css`
4. ✅ `/src/design-system/components/atoms/Button/Button.module.css` (already had support)
5. ✅ 98 design system components already have dark mode support

### Remaining Work: Admin Pages (70+ files)

All admin pages in `/src/app/organization/` need dark mode support added.

## Universal Dark Mode Pattern

For ALL remaining CSS modules, apply this pattern:

### 1. Replace Hardcoded Colors with Semantic Tokens

**Find & Replace:**
```css
/* OLD → NEW */
var(--color-black) → var(--color-text-primary)
var(--color-white) → var(--color-bg-primary) OR var(--color-text-inverse)
var(--color-grey-50) → var(--color-bg-secondary)
var(--color-grey-100) → var(--color-bg-secondary)
var(--color-grey-200) → var(--color-border-default)
var(--color-grey-300) → var(--color-border-default)
var(--color-grey-400) → var(--color-text-tertiary)
var(--color-grey-500) → var(--color-text-tertiary)
var(--color-grey-600) → var(--color-text-secondary)
var(--color-grey-700) → var(--color-text-secondary)
var(--color-grey-800) → var(--color-text-primary)
var(--color-grey-900) → var(--color-text-primary)
```

### 2. Add Dark Mode Overrides

Add this section to the END of every CSS module:

```css
/* ========================================
   DARK MODE SUPPORT
   ======================================== */

/* Containers & Backgrounds */
[data-theme="dark"] .container,
[data-theme="dark"] .content,
[data-theme="dark"] .section,
[data-theme="dark"] .wrapper {
  background-color: var(--color-bg-primary);
}

/* Headers & Titles */
[data-theme="dark"] .header,
[data-theme="dark"] .headerBorder,
[data-theme="dark"] .title,
[data-theme="dark"] .heading {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  border-color: var(--color-border-strong);
}

[data-theme="dark"] .subtitle,
[data-theme="dark"] .description {
  color: var(--color-text-secondary);
}

/* Cards */
[data-theme="dark"] .card,
[data-theme="dark"] .statCard {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border-strong);
}

/* Tables */
[data-theme="dark"] .table {
  border-color: var(--color-border-strong);
}

[data-theme="dark"] .tableHead,
[data-theme="dark"] .tableHeader {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border-default);
  color: var(--color-text-primary);
}

[data-theme="dark"] .tableRow {
  border-color: var(--color-border-default);
}

[data-theme="dark"] .tableRow:hover {
  background-color: var(--color-bg-secondary);
}

[data-theme="dark"] .tableCell {
  border-color: var(--color-border-default);
  color: var(--color-text-primary);
}

/* Forms & Inputs */
[data-theme="dark"] .input,
[data-theme="dark"] .searchInput,
[data-theme="dark"] .select,
[data-theme="dark"] .textarea {
  background-color: var(--color-bg-primary);
  border-color: var(--color-border-strong);
  color: var(--color-text-primary);
}

[data-theme="dark"] .input:focus,
[data-theme="dark"] .searchInput:focus {
  border-color: var(--color-text-primary);
}

[data-theme="dark"] .searchIcon,
[data-theme="dark"] .icon {
  color: var(--color-text-tertiary);
}

/* Buttons */
[data-theme="dark"] .button,
[data-theme="dark"] .searchButton,
[data-theme="dark"] .actionButton,
[data-theme="dark"] .ctaButton {
  background-color: var(--color-text-primary);
  border-color: var(--color-border-strong);
  color: var(--color-text-inverse);
}

[data-theme="dark"] .button:hover,
[data-theme="dark"] .searchButton:hover,
[data-theme="dark"] .actionButton:hover {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}

/* Tabs */
[data-theme="dark"] .tab,
[data-theme="dark"] .tabButton {
  background-color: var(--color-bg-primary);
  border-color: var(--color-border-strong);
  color: var(--color-text-primary);
}

[data-theme="dark"] .tab:hover {
  background-color: var(--color-bg-secondary);
}

[data-theme="dark"] .tabActive {
  background-color: var(--color-text-primary);
  color: var(--color-text-inverse);
}

/* Links */
[data-theme="dark"] .link,
[data-theme="dark"] a {
  color: var(--color-text-primary);
}

/* Borders & Dividers */
[data-theme="dark"] .border,
[data-theme="dark"] .divider,
[data-theme="dark"] .separator {
  border-color: var(--color-border-default);
}

/* Loading & Empty States */
[data-theme="dark"] .spinner {
  border-color: var(--color-border-strong);
}

[data-theme="dark"] .emptyIcon,
[data-theme="dark"] .emptyText,
[data-theme="dark"] .emptyHint {
  color: var(--color-text-secondary);
}

/* Badges & Status */
[data-theme="dark"] .badge,
[data-theme="dark"] .statusBadge {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border-strong);
  color: var(--color-text-primary);
}

/* Image Wrappers */
[data-theme="dark"] .imageWrapper {
  background-color: var(--color-bg-secondary);
}

/* Metadata & Labels */
[data-theme="dark"] .label,
[data-theme="dark"] .metadata,
[data-theme="dark"] .caption {
  color: var(--color-text-secondary);
}
```

## Files Requiring Dark Mode Support

### Admin Pages (Priority Order)
1. `/src/app/organization/products/page.module.css` (345 lines)
2. `/src/app/organization/roles/page.module.css` (273 lines)
3. `/src/app/organization/inventory/page.module.css` (272 lines)
4. `/src/app/organization/users/page.module.css` (226 lines)
5. `/src/app/organization/orders/page.module.css` (213 lines)
6. `/src/app/organization/bulk-operations/page.module.css` (118 lines)
7. `/src/app/organization/permissions-test/page.module.css` (69 lines)
8. `/src/app/organization/page.module.css`
9. `/src/app/organization/advances/[id]/page.module.css`
10. `/src/app/organization/users/users.module.css`
11. `/src/app/organization/artists/create/page.module.css`
12. `/src/app/organization/orders/[id]/order-detail-content.module.css`
13. `/src/app/organization/orders/[id]/resend-tickets/resend-content.module.css`
14. `/src/app/organization/orders/[id]/refund/refund-content.module.css`
15. `/src/app/organization/events/new/page.module.css`
16. `/src/app/organization/events/events.module.css`
17. `/src/app/organization/products/products.module.css`
18. `/src/app/organization/products/new/page.module.css`
19. `/src/app/organization/brands/[id]/page.module.css`
20. `/src/app/organization/tickets/dynamic-pricing/page.module.css`

### Design System Components (70+ files)
Most design system components already have dark mode support. Remaining files need the universal pattern applied.

## Implementation Strategy

1. **Batch 1:** Replace all hardcoded colors with semantic tokens
2. **Batch 2:** Add universal dark mode section to each file
3. **Batch 3:** Test visually in both themes
4. **Batch 4:** Fix edge cases and component-specific styling

## Testing Checklist

After applying dark mode to all files:
- [ ] Toggle theme in browser
- [ ] Check all interactive states (hover, active, focus)
- [ ] Verify border visibility in both themes
- [ ] Check table row hover states
- [ ] Test form inputs and buttons
- [ ] Verify modals and overlays
- [ ] Check mobile menu in both themes
- [ ] Test all admin pages
- [ ] Verify accessibility (contrast ratios)

## Sign-Off

Dark mode implementation is complete when:
- ✅ All 70+ CSS modules have `[data-theme="dark"]` overrides
- ✅ No hardcoded colors (all use semantic tokens)
- ✅ All interactive states work in both themes
- ✅ Borders/shadows visible in both themes
- ✅ Visual inspection passed
- ✅ Accessibility standards met (WCAG AA)
