/**
 * Typography Tokens - Entertainment Platform
 * ANTON (hero), BEBAS NEUE (headings), SHARE TECH (body), SHARE TECH MONO (meta)
 */

export const typography = {
  fontFamily: {
    anton: "'Anton', 'Impact', 'Arial Black', sans-serif",
    bebas: "'Bebas Neue', 'Arial Narrow', 'Arial', sans-serif",
    share: "'Share Tech', 'Monaco', 'Consolas', monospace",
    shareMono: "'Share Tech Mono', 'Courier New', 'Courier', monospace",
    
    // Semantic aliases
    hero: "'Anton', 'Impact', 'Arial Black', sans-serif",
    heading: "'Bebas Neue', 'Arial Narrow', 'Arial', sans-serif",
    body: "'Share Tech', 'Monaco', 'Consolas', monospace",
    mono: "'Share Tech Mono', 'Courier New', 'Courier', monospace",
    meta: "'Share Tech Mono', 'Courier New', 'Courier', monospace",
  },
  
  fontSize: {
    // Entertainment Platform responsive scale
    hero: 'clamp(48px, 10vw, 120px)',    // ANTON - Main heroes
    h1: 'clamp(36px, 8vw, 80px)',        // ANTON - Page titles
    h2: 'clamp(28px, 5vw, 56px)',        // BEBAS NEUE - Section headers
    h3: 'clamp(24px, 4vw, 40px)',        // BEBAS NEUE - Subsections
    h4: 'clamp(20px, 3vw, 32px)',        // BEBAS NEUE - Categories
    h5: 'clamp(18px, 2.5vw, 24px)',      // BEBAS NEUE - Labels
    h6: 'clamp(16px, 2vw, 20px)',        // BEBAS NEUE - Small headers
    body: 'clamp(15px, 1.5vw, 18px)',    // SHARE TECH - Body copy
    meta: 'clamp(11px, 1.2vw, 14px)',    // SHARE TECH MONO - Metadata
    
    // Standard sizes
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
    '7xl': '4.5rem',    // 72px
    '8xl': '6rem',      // 96px
    '9xl': '8rem',      // 128px
  },
  
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  lineHeight: {
    none: '1',
    hero: '0.9',        // ANTON - tight for impact
    tight: '1.1',       // ANTON/BEBAS - headlines
    snug: '1.2',        // BEBAS - headings
    normal: '1.5',      // SHARE TECH - body
    body: '1.7',        // SHARE TECH - comfortable reading
    relaxed: '1.625',
    loose: '2',
  },
  
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.02em',   // ANTON - tight impact
    normal: '0',
    wide: '0.02em',     // BEBAS NEUE - H2-H3
    wider: '0.04em',    // BEBAS NEUE - H4-H6
    widest: '0.1em',    // SHARE TECH MONO - metadata
    meta: '0.05em',     // SHARE TECH MONO - labels
  },
} as const;

export type Typography = typeof typography;
