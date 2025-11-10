# Repo-Wide Design System Compliance Audit

**Date:** 2025-11-10  
**Scope:** All 90 pages in src/app  
**Goal:** 100% atomic design system compliance with zero tolerance for violations

---

## Executive Summary

### Current State

**Total Pages:** 90  
**Using Templates:** 59 (66%)  
**Custom CSS Modules:** 60 files (17,539 lines)  
**Without Templates:** 31 pages (34%)

### Violations Found

**Inline Styles:** 17 instances  
**Tailwind Utilities:** ~1 instance  
**Custom CSS:** 17,539 lines (need audit for compliance)  
**Hardcoded Colors:** TBD  
**Directional Properties:** TBD  

---

## Pages by Category

### ✅ Fully Compliant (10 pages - migrated to ContextualPageTemplate)

1. `/admin/events/[id]/artists` - Split-pane
2. `/admin/events/[id]/check-in` - Content zones
3. `/admin/events/[id]/schedule` - Content zones
4. `/admin/events/[id]/credentials` - Full-width + metadata
5. `/admin/events/[id]/tickets` - Grid cards
6. `/admin/events/[id]/vendors` - Grid cards
7. `/admin/events/[id]/team` - Grid cards
8. `/admin/events/[id]/edit` - Form layout
9. `/admin/reports` - Grid-sidebar
10. `/admin/bulk-operations` - AdminListTemplate

### ✅ Using Templates (49 additional pages)

**Auth Pages (6):**
- `/auth/login`, `/auth/signup`, `/auth/reset-password`
- `/auth/forgot-password`, `/auth/verify-email`, `/auth/profile`

**Portal Pages (16):**
- `/portal/dashboard`, `/portal/orders`, `/portal/credits`
- `/portal/advances`, `/portal/advances/[id]`, `/portal/advances/checkout`
- `/portal/analytics/kpi`, `/portal/analytics/reports`
- `/portal/referrals`, `/portal/vouchers`
- And 6 more...

**Admin Pages (20):**
- `/admin/dashboard`, `/admin/events`, `/admin/artists`
- `/admin/users`, `/admin/orders`, `/admin/products`
- `/admin/inventory`, `/admin/roles`, `/admin/brands`
- And 11 more...

**Public Pages (7):**
- `/`, `/events`, `/artists`, `/shop`, `/news`
- `/legal/privacy`, `/legal/terms`

### ⚠️ Pages WITHOUT Templates (31 pages - NEED MIGRATION)

**Admin Event Sub-Pages (3):**
1. `/admin/events/[id]/credentials/[credentialId]` - Credential detail
2. `/admin/events/[id]/credentials/[credentialId]/badge` - Badge print
3. `/admin/events/[id]/credentials/issue` - Issue form

**Admin Order Pages (3):**
4. `/admin/orders/[id]` - Order detail
5. `/admin/orders/[id]/refund` - Refund form
6. `/admin/orders/[id]/resend-tickets` - Resend form

**Admin Other (7):**
7. `/admin/page.tsx` - Admin home
8. `/admin/tickets/dynamic-pricing` - Pricing config
9. `/admin/products/new` - Product creation
10. `/admin/permissions-test` - Test page
11. `/admin/analytics/ai-insights` - AI insights (has template but custom CSS)
12. `/admin/analytics/sponsors` - Sponsors analytics (has template but custom CSS)
13. `/admin/analytics/investors` - Investors analytics (has template but custom CSS)

**Portal Pages (6):**
14. `/portal/advances/page.tsx` - Advances list (has template but custom CSS)
15. `/portal/advances/[id]/confirmation` - Confirmation page
16. `/portal/advances/catalog/[id]` - Catalog detail
17. `/portal/orders/[id]` - Order detail
18. `/portal/orders/[id]/tickets` - Tickets view
19. `/portal/orders/[id]/transfer` - Transfer tickets

**Public Pages (6):**
20. `/` - Homepage (has custom layout)
21. `/artists` - Artists browse (has template)
22. `/artists/[slug]` - Artist detail
23. `/shop` - Shop browse
24. `/shop/[slug]` - Product detail
25. `/news` - News browse
26. `/news/[slug]` - News detail

**Other (9):**
27. `/events/[id]` - Event detail
28. `/staff/dashboard` - Staff dashboard
29. `/staff/scanner` - QR scanner
30. `/profile/orders` - Profile orders
31. `/schedule`, `/privacy`, `/terms`, `/favorites` - Utility pages

---

## Custom CSS Modules Analysis

**Total:** 60 files, 17,539 lines

**By Section:**
- Admin: ~30 files, ~10,000 lines
- Portal: ~12 files, ~3,500 lines  
- Public: ~8 files, ~2,000 lines
- Other: ~10 files, ~2,039 lines

**Compliance Status:**
- ✅ Compliant (9 files): 949 lines (new -content.module.css files)
- ⚠️ Need Audit (51 files): 16,590 lines

---

## Violations Breakdown

### Inline Styles (17 instances)
- Location: Various page.tsx files
- Impact: Medium
- Fix: Create CSS modules, use design tokens

### Tailwind Utilities (~1 instance)
- Location: TBD
- Impact: Low
- Fix: Replace with CSS modules

### Custom CSS Compliance (16,590 lines to audit)
**Need to check for:**
- Hardcoded colors (should use `var(--color-*)`)
- Directional properties (should use logical properties)
- Non-token spacing (should use `var(--spacing-*)`)
- Non-token typography (should use `var(--font-*)`)

---

## Remediation Plan

### Phase 1: Critical Admin Pages (COMPLETED ✅)
- ✅ Event management pages (10 pages)
- ✅ Reports page
- **Result:** 2,844 lines eliminated, 949 compliant lines created

### Phase 2: Remaining Admin Pages (13 pages)
**Priority: HIGH**
1. Order detail pages (3)
2. Credential sub-pages (3)
3. Analytics pages with custom CSS (3)
4. Product/pricing pages (2)
5. Admin home + permissions test (2)

**Estimated Impact:** ~3,000 lines to audit/migrate

### Phase 3: Portal Pages (6 pages)
**Priority: MEDIUM**
1. Advances pages (3)
2. Order detail pages (3)

**Estimated Impact:** ~2,000 lines to audit/migrate

### Phase 4: Public Pages (6 pages)
**Priority: MEDIUM**
1. Artist/Shop/News detail pages (3)
2. Browse pages (3)

**Estimated Impact:** ~1,500 lines to audit/migrate

### Phase 5: Utility & Staff Pages (9 pages)
**Priority: LOW**
1. Staff pages (2)
2. Utility pages (4)
3. Event detail, profile (3)

**Estimated Impact:** ~1,000 lines to audit/migrate

---

## Success Metrics

### Target State
- ✅ 100% template usage (90/90 pages)
- ✅ Zero inline styles
- ✅ Zero Tailwind utilities
- ✅ 100% design token usage
- ✅ 100% logical properties
- ✅ All CSS modules compliant

### Current Progress
- **Template Usage:** 66% (59/90)
- **Inline Styles:** 17 violations
- **Tailwind Utilities:** ~1 violation
- **Custom CSS Audit:** 0% (0/16,590 lines)

### Estimated Effort
- **Pages to migrate:** 31
- **CSS to audit:** 16,590 lines
- **CSS to create:** ~2,000 lines (compliant)
- **CSS to eliminate:** ~14,590 lines

---

## Next Actions

1. **Audit existing custom CSS** for compliance violations
2. **Migrate remaining admin pages** (Phase 2)
3. **Migrate portal pages** (Phase 3)
4. **Migrate public pages** (Phase 4)
5. **Clean up utility pages** (Phase 5)
6. **Run final compliance scan** across entire repo

---

## Compliance Checklist

Per page, verify:
- [ ] Uses template (Contextual/Admin/Public/Auth/etc.)
- [ ] No inline styles
- [ ] No Tailwind utilities
- [ ] CSS module uses design tokens only
- [ ] CSS module uses logical properties only
- [ ] No hardcoded colors
- [ ] No directional properties
- [ ] Responsive breakpoints defined
- [ ] Accessible markup

---

**Status:** Phase 1 Complete (10 pages), 80 pages remaining  
**Next:** Phase 2 - Remaining Admin Pages
