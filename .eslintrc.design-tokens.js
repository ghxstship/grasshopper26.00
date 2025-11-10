/**
 * ESLint Rules for Design Token Enforcement
 * Zero tolerance for hardcoded design values
 * 
 * Add to your .eslintrc.json:
 * "extends": ["./.eslintrc.design-tokens.js"]
 */

module.exports = {
  rules: {
    // Prohibit hardcoded hex colors
    'no-restricted-syntax': [
      'error',
      {
        selector: "Literal[value=/#[0-9A-Fa-f]{3,8}/]",
        message: '❌ Hardcoded hex colors are forbidden. Use CSS variables (var(--color-*)) or semantic color tokens from the design system.',
      },
      {
        selector: "CallExpression[callee.name='rgb']",
        message: '❌ RGB colors are forbidden. Use CSS variables (var(--color-*)) or semantic color tokens.',
      },
      {
        selector: "CallExpression[callee.name='rgba']",
        message: '❌ RGBA colors are forbidden. Use CSS variables with opacity or semantic color tokens.',
      },
      {
        selector: "Literal[value=/^\\d+px$/]",
        message: '❌ Hardcoded pixel values are forbidden. Use spacing tokens (var(--space-*)) or rem units.',
      },
    ],
    
    // Accessibility requirements
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/role-supports-aria-props': 'error',
    'jsx-a11y/interactive-supports-focus': 'error',
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/no-static-element-interactions': 'warn',
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/img-redundant-alt': 'error',
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/heading-has-content': 'error',
    'jsx-a11y/label-has-associated-control': 'warn',
    
    // Keyboard accessibility
    'jsx-a11y/no-autofocus': 'warn',
    'jsx-a11y/no-access-key': 'error',
    'jsx-a11y/tabindex-no-positive': 'error',
    
    // Media accessibility
    'jsx-a11y/media-has-caption': 'warn',
    'jsx-a11y/iframe-has-title': 'error',
    
    // Form accessibility
    'jsx-a11y/autocomplete-valid': 'error',
    'jsx-a11y/no-redundant-roles': 'warn',
  },
  
  overrides: [
    {
      // Allow hardcoded colors in design token definition files
      files: [
        '**/design-system/tokens/**/*.ts',
        '**/design-system/tokens/**/*.js',
      ],
      rules: {
        'no-restricted-syntax': 'off',
      },
    },
    {
      // Allow hardcoded colors in image processing and technical utilities
      files: [
        '**/lib/imageProcessing/**/*.ts',
        '**/lib/ticketing/qr-codes.ts',
        '**/lib/tickets/qr-generator.ts',
        '**/lib/tickets/pdf-generator.ts',
        '**/lib/email/**/*.ts',
        '**/app/manifest.ts',
      ],
      rules: {
        'no-restricted-syntax': 'off',
      },
    },
    {
      // Stricter rules for component files
      files: [
        '**/components/**/*.tsx',
        '**/components/**/*.ts',
      ],
      rules: {
        'jsx-a11y/no-static-element-interactions': 'error',
        'jsx-a11y/label-has-associated-control': 'error',
      },
    },
    {
      // Allow test files to have magic numbers and hardcoded values for testing
      files: [
        '**/tests/**/*.ts',
        '**/tests/**/*.tsx',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
      ],
      rules: {
        'no-magic-numbers': 'off',
        'no-restricted-syntax': 'off',
      },
    },
    {
      // Allow documentation examples and instrumentation files
      files: [
        '**/docs/**/*.ts',
        '**/docs/**/*.tsx',
        'instrumentation-*.ts',
        'next.config.js',
        'tailwind.config.ts',
        'public/sw.js',
      ],
      rules: {
        'no-magic-numbers': 'off',
        'no-restricted-syntax': 'off',
      },
    },
  ],
};
