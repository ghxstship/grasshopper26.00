/**
 * Email Template Design Tokens
 * Consistent styling for email templates
 * Note: Email clients have limited CSS support, so we use inline styles
 */

export const emailTokens = {
  colors: {
    // Brand colors
    brandPrimary: '#9333EA',
    brandSecondary: '#EC4899',
    
    // Text colors
    textPrimary: '#111827',
    textSecondary: '#4B5563',
    textTertiary: '#6B7280',
    textInverse: '#FFFFFF',
    
    // Background colors
    bgPrimary: '#FFFFFF',
    bgSecondary: '#F9FAFB',
    bgTertiary: '#F3F4F6',
    
    // Border colors
    borderDefault: '#E5E7EB',
    borderStrong: '#D1D5DB',
    
    // Status colors
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  
  gradients: {
    brandPrimary: 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)',
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
    background: ${emailTokens.gradients.brandPrimary};
    color: ${emailTokens.colors.textInverse};
    padding: ${emailTokens.spacing['2xl']};
    text-align: center;
    border-radius: ${emailTokens.borderRadius.lg} ${emailTokens.borderRadius.lg} 0 0;
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
    background: ${emailTokens.gradients.brandPrimary};
    color: ${emailTokens.colors.textInverse};
    padding: ${emailTokens.spacing.sm} ${emailTokens.spacing['2xl']};
    text-decoration: none;
    border-radius: ${emailTokens.borderRadius.md};
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
