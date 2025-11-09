
# ATOMIC DESIGN SYSTEM AUDIT REPORT
Generated: 11/9/2025, 12:39:17 AM
Total Files Scanned: 315

## EXECUTIVE SUMMARY

- 🔴 **Errors**: 9
- 🟡 **Warnings**: 551
- 🔵 **Info**: 433
- **Total Violations**: 993

### Violations by Category
- **design-tokens**: 992
- **accessibility**: 1

---

## DETAILED VIOLATIONS


### DESIGN-TOKENS (992 violations)


#### Tailwind spacing utility class (433 occurrences)

**Suggestion**: Use semantic CSS classes with design tokens

🔵 `/src/app/global-error.tsx:27`
```
<div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
```

🔵 `/src/app/global-error.tsx:28`
```
<div className="max-w-md w-full border-3 border-white p-8">
```

🔵 `/src/app/page.tsx:23`
```
Explore Events <ArrowRight className="ml-2 h-5 w-5" />
```

🔵 `/src/app/page.tsx:42`
```
icon={<Calendar className="h-12 w-12" />}
```

🔵 `/src/app/page.tsx:47`
```
icon={<Music className="h-12 w-12" />}
```

🔵 `/src/app/page.tsx:52`
```
icon={<Ticket className="h-12 w-12" />}
```

🔵 `/src/app/page.tsx:57`
```
icon={<ShoppingBag className="h-12 w-12" />}
```

🔵 `/src/app/page.tsx:125`
```
<div className="p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
```

🔵 `/src/components/error-boundary.tsx:78`
```
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-pink-900 p-4">
```

🔵 `/src/components/error-boundary.tsx:82`
```
<AlertTriangle className="h-8 w-8 text-red-500" />
```

_...and 423 more occurrences_


#### Tailwind color utility class (542 occurrences)

**Suggestion**: Use semantic CSS classes or CSS variables

🟡 `/src/app/page.tsx:71`
```
<p className="text-xl text-gray-200 mb-8">
```

🟡 `/src/app/page.tsx:86`
```
<p className="text-gray-400 text-sm">
```

🟡 `/src/app/page.tsx:92`
```
<ul className="space-y-2 text-sm text-gray-400">
```

🟡 `/src/app/page.tsx:100`
```
<ul className="space-y-2 text-sm text-gray-400">
```

🟡 `/src/app/page.tsx:108`
```
<ul className="space-y-2 text-sm text-gray-400">
```

🟡 `/src/app/page.tsx:114`
```
<div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
```

🟡 `/src/app/page.tsx:126`
```
<div className="text-purple-400 mb-4">{icon}</div>
```

🟡 `/src/app/page.tsx:128`
```
<p className="text-gray-400">{description}</p>
```

🟡 `/src/components/error-boundary.tsx:79`
```
<Card className="max-w-2xl w-full bg-black/40 backdrop-blur-lg border-purple-500/20">
```

🟡 `/src/components/error-boundary.tsx:82`
```
<AlertTriangle className="h-8 w-8 text-red-500" />
```

_...and 532 more occurrences_


#### Hardcoded pixel value (9 occurrences)

**Suggestion**: Use spacing tokens (var(--space-*)) or rem units

🟡 `/src/components/ui/alert-dialog.module.css:7`
```
@media (min-width: 640px) { .alertDialogFooter { flex-direction: row; justify-content: flex-end; } }
```

🟡 `/src/components/ui/button.module.css:245`
```
@media (max-width: 768px) {
```

🟡 `/src/components/ui/checkbox.module.css:203`
```
@media (max-width: 768px) {
```

🟡 `/src/components/ui/dialog.module.css:89`
```
@media (min-width: 640px) {
```

🟡 `/src/components/ui/input.module.css:209`
```
@media (max-width: 768px) {
```

🟡 `/src/components/ui/slider.module.css:108`
```
@media (max-width: 768px) {
```

🟡 `/src/components/ui/textarea.module.css:81`
```
@media (max-width: 768px) {
```

🟡 `/src/components/features/content/post-grid.module.css:2`
```
@media (min-width: 768px) { .postGrid { grid-template-columns: repeat(2, 1fr); } }
```

🟡 `/src/components/features/content/post-grid.module.css:3`
```
@media (min-width: 1024px) { .postGrid { grid-template-columns: repeat(3, 1fr); } }
```


#### Hardcoded hex color (8 occurrences)

**Suggestion**: Use CSS variables (var(--color-*)) or semantic color tokens

🔴 `/src/app/(auth)/login/page.tsx:163`
```
fill="#4285F4"
```

🔴 `/src/app/(auth)/login/page.tsx:167`
```
fill="#34A853"
```

🔴 `/src/app/(auth)/login/page.tsx:171`
```
fill="#FBBC05"
```

🔴 `/src/app/(auth)/login/page.tsx:175`
```
fill="#EA4335"
```

🔴 `/src/app/(auth)/signup/page.tsx:100`
```
fill="#4285F4"
```

🔴 `/src/app/(auth)/signup/page.tsx:104`
```
fill="#34A853"
```

🔴 `/src/app/(auth)/signup/page.tsx:108`
```
fill="#FBBC05"
```

🔴 `/src/app/(auth)/signup/page.tsx:112`
```
fill="#EA4335"
```


### ACCESSIBILITY (1 violations)


#### Image without alt attribute (1 occurrences)

**Suggestion**: Add alt="" for decorative images or descriptive alt text

🔴 `/src/lib/email/send.ts:50`
```
<img src="${ticket.qrCode}" alt="Ticket QR code for event admission" style="width: 200px; height: 200px;" />
```


---

## RECOMMENDATIONS

### 🔴 Critical Issues (9 errors)

These violations MUST be fixed before deployment:

1. Replace all hardcoded colors with CSS variables or semantic tokens
2. Use logical properties for RTL support
3. Add alt attributes to all images

### 🟡 Warnings (551 warnings)

These should be addressed to improve code quality:

1. Replace hardcoded pixel values with spacing tokens
2. Add ARIA labels to interactive elements
3. Replace Tailwind utility classes with semantic CSS


## NEXT STEPS

1. Review this report and prioritize fixes
2. Implement design token system comprehensively
3. Add ESLint rules to prevent future violations
4. Set up automated accessibility testing
5. Create component library documentation

