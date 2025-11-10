/**
 * Typography Utilities
 * GHXSTSHIP Contemporary Minimal Pop Art Typography System
 * ANTON, BEBAS NEUE, SHARE TECH, SHARE TECH MONO
 */

export type FontFamily = 'anton' | 'bebas' | 'share' | 'share-mono';
export type FontSize = 'hero' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'meta';
export type FontWeight = 400 | 700;
export type TextTransform = 'uppercase' | 'lowercase' | 'capitalize' | 'none';

/**
 * Font family stacks
 */
export const FONT_FAMILIES: Record<FontFamily, string> = {
  anton: "'Anton', Impact, 'Arial Black', sans-serif",
  bebas: "'Bebas Neue', 'Arial Narrow', Arial, sans-serif",
  share: "'Share Tech', Monaco, Consolas, monospace",
  'share-mono': "'Share Tech Mono', 'Courier New', Courier, monospace",
} as const;

/**
 * Font size tokens (using clamp for responsive scaling)
 */
export const FONT_SIZES: Record<FontSize, string> = {
  hero: 'clamp(48px, 10vw, 120px)',
  h1: 'clamp(36px, 8vw, 80px)',
  h2: 'clamp(28px, 5vw, 56px)',
  h3: 'clamp(24px, 4vw, 40px)',
  h4: 'clamp(20px, 3vw, 32px)',
  h5: 'clamp(18px, 2.5vw, 24px)',
  h6: 'clamp(16px, 2vw, 20px)',
  body: 'clamp(15px, 1.5vw, 18px)',
  meta: 'clamp(11px, 1.2vw, 14px)',
} as const;

/**
 * Line height values
 */
export const LINE_HEIGHTS: Record<FontSize, number> = {
  hero: 0.9,
  h1: 1.0,
  h2: 1.1,
  h3: 1.2,
  h4: 1.2,
  h5: 1.3,
  h6: 1.3,
  body: 1.7,
  meta: 1.5,
} as const;

/**
 * Letter spacing values
 */
export const LETTER_SPACING: Record<FontSize, string> = {
  hero: '-0.02em',
  h1: '-0.01em',
  h2: '0.02em',
  h3: '0.02em',
  h4: '0.03em',
  h5: '0.03em',
  h6: '0.04em',
  body: '0',
  meta: '0.08em',
} as const;

/**
 * Typography hierarchy configuration
 */
export interface TypographyConfig {
  fontFamily: FontFamily;
  fontSize: FontSize;
  fontWeight: FontWeight;
  lineHeight: number;
  letterSpacing: string;
  textTransform: TextTransform;
}

/**
 * Predefined typography styles
 */
export const TYPOGRAPHY_STYLES: Record<string, TypographyConfig> = {
  // ANTON - Hero & H1
  eventName: {
    fontFamily: 'anton',
    fontSize: 'hero',
    fontWeight: 400,
    lineHeight: LINE_HEIGHTS.hero,
    letterSpacing: LETTER_SPACING.hero,
    textTransform: 'uppercase',
  },
  pageTitle: {
    fontFamily: 'anton',
    fontSize: 'h1',
    fontWeight: 400,
    lineHeight: LINE_HEIGHTS.h1,
    letterSpacing: LETTER_SPACING.h1,
    textTransform: 'uppercase',
  },
  
  // BEBAS NEUE - Headers
  sectionHeader: {
    fontFamily: 'bebas',
    fontSize: 'h2',
    fontWeight: 700,
    lineHeight: LINE_HEIGHTS.h2,
    letterSpacing: LETTER_SPACING.h2,
    textTransform: 'uppercase',
  },
  subsectionHeader: {
    fontFamily: 'bebas',
    fontSize: 'h3',
    fontWeight: 400,
    lineHeight: LINE_HEIGHTS.h3,
    letterSpacing: LETTER_SPACING.h3,
    textTransform: 'uppercase',
  },
  categoryLabel: {
    fontFamily: 'bebas',
    fontSize: 'h4',
    fontWeight: 400,
    lineHeight: LINE_HEIGHTS.h4,
    letterSpacing: LETTER_SPACING.h4,
    textTransform: 'uppercase',
  },
  navigationItem: {
    fontFamily: 'bebas',
    fontSize: 'h5',
    fontWeight: 400,
    lineHeight: LINE_HEIGHTS.h5,
    letterSpacing: LETTER_SPACING.h5,
    textTransform: 'uppercase',
  },
  buttonText: {
    fontFamily: 'bebas',
    fontSize: 'h5',
    fontWeight: 700,
    lineHeight: LINE_HEIGHTS.h5,
    letterSpacing: LETTER_SPACING.h5,
    textTransform: 'uppercase',
  },
  
  // SHARE TECH - Body
  bodyText: {
    fontFamily: 'share',
    fontSize: 'body',
    fontWeight: 400,
    lineHeight: LINE_HEIGHTS.body,
    letterSpacing: LETTER_SPACING.body,
    textTransform: 'none',
  },
  artistBio: {
    fontFamily: 'share',
    fontSize: 'body',
    fontWeight: 400,
    lineHeight: LINE_HEIGHTS.body,
    letterSpacing: LETTER_SPACING.body,
    textTransform: 'none',
  },
  
  // SHARE TECH MONO - Metadata
  dateTime: {
    fontFamily: 'share-mono',
    fontSize: 'meta',
    fontWeight: 400,
    lineHeight: LINE_HEIGHTS.meta,
    letterSpacing: LETTER_SPACING.meta,
    textTransform: 'uppercase',
  },
  venueInfo: {
    fontFamily: 'share-mono',
    fontSize: 'meta',
    fontWeight: 400,
    lineHeight: LINE_HEIGHTS.meta,
    letterSpacing: LETTER_SPACING.meta,
    textTransform: 'uppercase',
  },
  tag: {
    fontFamily: 'share-mono',
    fontSize: 'meta',
    fontWeight: 400,
    lineHeight: LINE_HEIGHTS.meta,
    letterSpacing: LETTER_SPACING.meta,
    textTransform: 'uppercase',
  },
  caption: {
    fontFamily: 'share-mono',
    fontSize: 'meta',
    fontWeight: 400,
    lineHeight: LINE_HEIGHTS.meta,
    letterSpacing: '0.05em',
    textTransform: 'none',
  },
} as const;

/**
 * Get CSS string for typography style
 */
export function getTypographyStyle(style: keyof typeof TYPOGRAPHY_STYLES): string {
  const config = TYPOGRAPHY_STYLES[style];
  
  return `
    font-family: ${FONT_FAMILIES[config.fontFamily]};
    font-size: ${FONT_SIZES[config.fontSize]};
    font-weight: ${config.fontWeight};
    line-height: ${config.lineHeight};
    letter-spacing: ${config.letterSpacing};
    text-transform: ${config.textTransform};
  `.trim();
}

/**
 * Get CSS object for typography style
 */
export function getTypographyStyleObject(style: keyof typeof TYPOGRAPHY_STYLES): {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: string;
  textTransform: string;
} {
  const config = TYPOGRAPHY_STYLES[style];
  
  return {
    fontFamily: FONT_FAMILIES[config.fontFamily],
    fontSize: FONT_SIZES[config.fontSize],
    fontWeight: config.fontWeight,
    lineHeight: config.lineHeight,
    letterSpacing: config.letterSpacing,
    textTransform: config.textTransform,
  };
}

/**
 * Calculate optimal line length (characters per line)
 */
export function getOptimalLineLength(fontSize: FontSize): number {
  const optimalLengths: Record<FontSize, number> = {
    hero: 20,
    h1: 30,
    h2: 40,
    h3: 50,
    h4: 55,
    h5: 60,
    h6: 65,
    body: 70,
    meta: 80,
  };
  
  return optimalLengths[fontSize];
}

/**
 * Calculate container width for optimal readability
 */
export function getOptimalContainerWidth(fontSize: FontSize): string {
  const lengths = getOptimalLineLength(fontSize);
  // Approximate character width in ch units
  return `${lengths}ch`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Format text for GHXSTSHIP style
 */
export function formatForGHXSTSHIP(
  text: string,
  style: keyof typeof TYPOGRAPHY_STYLES
): string {
  const config = TYPOGRAPHY_STYLES[style];
  
  switch (config.textTransform) {
    case 'uppercase':
      return text.toUpperCase();
    case 'lowercase':
      return text.toLowerCase();
    case 'capitalize':
      return text.replace(/\b\w/g, char => char.toUpperCase());
    default:
      return text;
  }
}

/**
 * Create responsive font size
 */
export function createResponsiveFontSize(
  minSize: number,
  maxSize: number,
  minViewport: number = 320,
  maxViewport: number = 1920
): string {
  return `clamp(${minSize}px, ${minSize}px + (${maxSize} - ${minSize}) * ((100vw - ${minViewport}px) / (${maxViewport} - ${minViewport})), ${maxSize}px)`;
}

/**
 * Get text contrast ratio (for accessibility)
 */
export function getContrastRatio(
  foreground: string,
  background: string
): number {
  // Simplified contrast calculation
  // In production, use a proper color contrast library
  const fgLuminance = foreground === '#000000' ? 0 : 1;
  const bgLuminance = background === '#FFFFFF' ? 1 : 0;
  
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if text meets WCAG contrast requirements
 */
export function meetsContrastRequirements(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  
  if (level === 'AAA') {
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }
  
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Typography scale generator
 */
export function generateTypographyScale(
  baseSize: number = 16,
  ratio: number = 1.25
): Record<string, number> {
  return {
    xs: Math.round(baseSize / (ratio * ratio)),
    sm: Math.round(baseSize / ratio),
    base: baseSize,
    lg: Math.round(baseSize * ratio),
    xl: Math.round(baseSize * ratio * ratio),
    '2xl': Math.round(baseSize * ratio * ratio * ratio),
    '3xl': Math.round(baseSize * ratio * ratio * ratio * ratio),
    '4xl': Math.round(baseSize * ratio * ratio * ratio * ratio * ratio),
  };
}

/**
 * Get font loading CSS
 */
export function getFontLoadingCSS(): string {
  return `
    @font-face {
      font-family: 'Anton';
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: url('/fonts/anton-v25-latin-regular.woff2') format('woff2');
    }
    
    @font-face {
      font-family: 'Bebas Neue';
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: url('/fonts/bebas-neue-v14-latin-regular.woff2') format('woff2');
    }
    
    @font-face {
      font-family: 'Bebas Neue';
      font-style: normal;
      font-weight: 700;
      font-display: swap;
      src: url('/fonts/bebas-neue-v14-latin-700.woff2') format('woff2');
    }
    
    @font-face {
      font-family: 'Share Tech';
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: url('/fonts/share-tech-v21-latin-regular.woff2') format('woff2');
    }
    
    @font-face {
      font-family: 'Share Tech Mono';
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: url('/fonts/share-tech-mono-v15-latin-regular.woff2') format('woff2');
    }
  `.trim();
}

/**
 * Text shadow for impact (GHXSTSHIP style)
 */
export function getTextShadow(
  offsetX: number = 4,
  offsetY: number = 4,
  color: string = '#000000'
): string {
  return `${offsetX}px ${offsetY}px 0 ${color}`;
}

/**
 * Get text outline (for high contrast)
 */
export function getTextOutline(
  width: number = 2,
  color: string = '#000000'
): string {
  return `
    -webkit-text-stroke-width: ${width}px;
    -webkit-text-stroke-color: ${color};
    text-stroke-width: ${width}px;
    text-stroke-color: ${color};
  `.trim();
}

/**
 * Format date/time for GHXSTSHIP style
 */
export function formatDateTime(date: Date): string {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  
  const day = days[date.getDay()];
  const month = months[date.getMonth()];
  const dateNum = date.getDate();
  const year = date.getFullYear();
  
  return `${day}, ${month} ${dateNum}, ${year}`.toUpperCase();
}

/**
 * Format time for GHXSTSHIP style
 */
export function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  return `${displayHours}:${minutes}${ampm}`;
}

/**
 * Format venue info for GHXSTSHIP style
 */
export function formatVenueInfo(venue: string, location: string): string {
  return `${venue.toUpperCase()} // ${location.toUpperCase()}`;
}
