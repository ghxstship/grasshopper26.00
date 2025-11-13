/**
 * Email Design Tokens
 * Consistent styling for all email templates
 * Uses design system tokens for consistency
 */

import { primitives } from '@/design-system/tokens/primitives';
import { semantic } from '@/design-system/tokens/semantic';

export const emailTokens = {
  colors: {
    // Brand colors - monochromatic
    brandPrimary: primitives.color.black,
    brandSecondary: primitives.color.white,
    
    // Text colors
    textPrimary: primitives.color.black,
    textSecondary: primitives.color.grey[600],
    textTertiary: primitives.color.grey[500],
    textInverse: primitives.color.white,
    
    // Background colors
    bgPrimary: primitives.color.white,
    bgSecondary: primitives.color.grey[50],
    bgTertiary: primitives.color.grey[100],
    
    // Border colors
    borderDefault: primitives.color.grey[200],
    borderStrong: primitives.color.black,
    
    // Status colors - monochromatic
    success: primitives.color.black,
    error: primitives.color.black,
    warning: primitives.color.grey[600],
    info: primitives.color.grey[600],
  },
  
  spacing: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '20px',
    xl: '24px',
    '2xl': '30px',
    '3xl': '40px',
  },
  
  borderRadius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
  },
  
  typography: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.6',
    },
  },
} as const;

/**
 * Generate email styles object for inline styling
 */
export const emailStyles = {
  body: `
    font-family: ${emailTokens.typography.fontFamily};
    line-height: ${emailTokens.typography.lineHeight.relaxed};
    color: ${emailTokens.colors.textPrimary};
    margin: 0;
    padding: 0;
  `,
  
  container: `
    max-width: 600px;
    margin: 0 auto;
    padding: ${emailTokens.spacing.lg};
  `,
  
  header: `
    background: ${emailTokens.colors.brandPrimary};
    color: ${emailTokens.colors.textInverse};
    padding: ${emailTokens.spacing['2xl']};
    text-align: center;
    border-radius: 0;
  `,
  
  content: `
    background: ${emailTokens.colors.bgSecondary};
    padding: ${emailTokens.spacing['2xl']};
    border-radius: 0 0 ${emailTokens.borderRadius.lg} ${emailTokens.borderRadius.lg};
  `,
  
  card: `
    background: ${emailTokens.colors.bgPrimary};
    padding: ${emailTokens.spacing.lg};
    border-radius: ${emailTokens.borderRadius.lg};
    margin: ${emailTokens.spacing.lg} 0;
    border: 1px solid ${emailTokens.colors.borderDefault};
  `,
  
  button: `
    display: inline-block;
    background: ${emailTokens.colors.brandPrimary};
    color: ${emailTokens.colors.textInverse};
    padding: ${emailTokens.spacing.sm} ${emailTokens.spacing['2xl']};
    text-decoration: none;
    border-radius: 0;
    border: 2px solid ${emailTokens.colors.borderStrong};
    margin: ${emailTokens.spacing.lg} 0;
    font-weight: 600;
  `,
  
  footer: `
    text-align: center;
    margin-top: ${emailTokens.spacing['2xl']};
    color: ${emailTokens.colors.textSecondary};
    font-size: ${emailTokens.typography.fontSize.sm};
  `,
  
  heading1: `
    font-size: ${emailTokens.typography.fontSize['2xl']};
    font-weight: bold;
    margin: 0 0 ${emailTokens.spacing.md} 0;
  `,
  
  heading2: `
    font-size: ${emailTokens.typography.fontSize.xl};
    font-weight: bold;
    margin: 0 0 ${emailTokens.spacing.sm} 0;
  `,
  
  paragraph: `
    margin: 0 0 ${emailTokens.spacing.md} 0;
    line-height: ${emailTokens.typography.lineHeight.relaxed};
  `,
} as const;
