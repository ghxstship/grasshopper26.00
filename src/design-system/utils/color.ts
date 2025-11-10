/**
 * Color Utilities
 * GHXSTSHIP Contemporary Minimal Pop Art Color System
 * MONOCHROMATIC ONLY - Black, White, Greyscale
 */

export type MonochromaticColor = 
  | 'black'
  | 'white'
  | 'grey-100'
  | 'grey-200'
  | 'grey-300'
  | 'grey-400'
  | 'grey-500'
  | 'grey-600'
  | 'grey-700'
  | 'grey-800'
  | 'grey-900';

/**
 * GHXSTSHIP Color Palette (MONOCHROMATIC ONLY)
 */
export const GHXSTSHIP_COLORS: Record<MonochromaticColor, string> = {
  black: '#000000',
  white: '#FFFFFF',
  'grey-100': '#F5F5F5',
  'grey-200': '#E5E5E5',
  'grey-300': '#D4D4D4',
  'grey-400': '#A3A3A3',
  'grey-500': '#737373',
  'grey-600': '#525252',
  'grey-700': '#404040',
  'grey-800': '#262626',
  'grey-900': '#171717',
} as const;

/**
 * Color usage rules for GHXSTSHIP
 */
export const COLOR_USAGE = {
  backgrounds: {
    primary: GHXSTSHIP_COLORS.white,
    secondary: GHXSTSHIP_COLORS.black,
    subtle: GHXSTSHIP_COLORS['grey-100'],
    elevated: GHXSTSHIP_COLORS.white,
  },
  text: {
    primary: GHXSTSHIP_COLORS.black,
    secondary: GHXSTSHIP_COLORS['grey-600'],
    tertiary: GHXSTSHIP_COLORS['grey-500'],
    inverse: GHXSTSHIP_COLORS.white,
  },
  borders: {
    default: GHXSTSHIP_COLORS['grey-200'],
    strong: GHXSTSHIP_COLORS.black,
    subtle: GHXSTSHIP_COLORS['grey-100'],
  },
  interactive: {
    default: GHXSTSHIP_COLORS.black,
    hover: GHXSTSHIP_COLORS['grey-800'],
    active: GHXSTSHIP_COLORS.black,
    disabled: GHXSTSHIP_COLORS['grey-300'],
  },
} as const;

/**
 * Get color value by name
 */
export function getColor(color: MonochromaticColor): string {
  return GHXSTSHIP_COLORS[color];
}

/**
 * Invert color (GHXSTSHIP signature effect)
 */
export function invertColor(color: MonochromaticColor): MonochromaticColor {
  if (color === 'black') return 'white';
  if (color === 'white') return 'black';
  
  // Invert grey scale
  const greyMap: Record<string, MonochromaticColor> = {
    'grey-100': 'grey-900',
    'grey-200': 'grey-800',
    'grey-300': 'grey-700',
    'grey-400': 'grey-600',
    'grey-500': 'grey-500',
    'grey-600': 'grey-400',
    'grey-700': 'grey-300',
    'grey-800': 'grey-200',
    'grey-900': 'grey-100',
  };
  
  return greyMap[color] || color;
}

/**
 * Get contrasting color for text
 */
export function getContrastColor(backgroundColor: MonochromaticColor): MonochromaticColor {
  const lightColors: MonochromaticColor[] = ['white', 'grey-100', 'grey-200', 'grey-300'];
  
  return lightColors.includes(backgroundColor) ? 'black' : 'white';
}

/**
 * Convert hex to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

/**
 * Get opacity variant of color
 */
export function withOpacity(color: MonochromaticColor, opacity: number): string {
  const hex = GHXSTSHIP_COLORS[color];
  const rgb = hexToRgb(hex);
  
  if (!rgb) return hex;
  
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

/**
 * Create gradient (monochromatic only)
 */
export function createMonochromaticGradient(
  from: MonochromaticColor,
  to: MonochromaticColor,
  angle: number = 180
): string {
  return `linear-gradient(${angle}deg, ${GHXSTSHIP_COLORS[from]}, ${GHXSTSHIP_COLORS[to]})`;
}

/**
 * Validate color is monochromatic
 */
export function isMonochromaticColor(color: string): boolean {
  const rgb = hexToRgb(color);
  if (!rgb) return false;
  
  // Check if R, G, B values are equal (true greyscale)
  return rgb.r === rgb.g && rgb.g === rgb.b;
}

/**
 * Convert any color to greyscale
 */
export function toGreyscale(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  // Calculate luminance
  const grey = Math.round(0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
  
  return rgbToHex(grey, grey, grey);
}

/**
 * Get nearest GHXSTSHIP color
 */
export function getNearestGHXSTSHIPColor(hex: string): MonochromaticColor {
  const rgb = hexToRgb(hex);
  if (!rgb) return 'black';
  
  const grey = Math.round(0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
  
  if (grey < 10) return 'black';
  if (grey > 245) return 'white';
  if (grey < 30) return 'grey-900';
  if (grey < 50) return 'grey-800';
  if (grey < 80) return 'grey-700';
  if (grey < 110) return 'grey-600';
  if (grey < 140) return 'grey-500';
  if (grey < 180) return 'grey-400';
  if (grey < 210) return 'grey-300';
  if (grey < 235) return 'grey-200';
  
  return 'grey-100';
}

/**
 * Create duotone color scheme
 */
export function createDuotone(
  darkColor: MonochromaticColor = 'black',
  lightColor: MonochromaticColor = 'white'
): {
  dark: string;
  light: string;
  filter: string;
} {
  return {
    dark: GHXSTSHIP_COLORS[darkColor],
    light: GHXSTSHIP_COLORS[lightColor],
    filter: `grayscale(1) contrast(1.5)`,
  };
}

/**
 * Get color for state
 */
export function getStateColor(state: 'default' | 'hover' | 'active' | 'disabled'): string {
  const stateColors = {
    default: GHXSTSHIP_COLORS.black,
    hover: GHXSTSHIP_COLORS['grey-800'],
    active: GHXSTSHIP_COLORS.black,
    disabled: GHXSTSHIP_COLORS['grey-300'],
  };
  
  return stateColors[state];
}

/**
 * Create overlay color
 */
export function createOverlay(
  baseColor: MonochromaticColor = 'black',
  opacity: number = 0.5
): string {
  return withOpacity(baseColor, opacity);
}

/**
 * Get shadow color
 */
export function getShadowColor(intensity: 'light' | 'medium' | 'strong' = 'medium'): string {
  const intensities = {
    light: withOpacity('black', 0.1),
    medium: withOpacity('black', 0.25),
    strong: withOpacity('black', 0.5),
  };
  
  return intensities[intensity];
}

/**
 * Color accessibility checker
 */
export function checkColorAccessibility(
  foreground: MonochromaticColor,
  background: MonochromaticColor
): {
  ratio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
} {
  const fgHex = GHXSTSHIP_COLORS[foreground];
  const bgHex = GHXSTSHIP_COLORS[background];
  
  const fgRgb = hexToRgb(fgHex);
  const bgRgb = hexToRgb(bgHex);
  
  if (!fgRgb || !bgRgb) {
    return { ratio: 0, wcagAA: false, wcagAAA: false };
  }
  
  // Calculate relative luminance
  const getLuminance = (rgb: { r: number; g: number; b: number }) => {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
      const v = val / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const fgLuminance = getLuminance(fgRgb);
  const bgLuminance = getLuminance(bgRgb);
  
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);
  
  const ratio = (lighter + 0.05) / (darker + 0.05);
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    wcagAA: ratio >= 4.5,
    wcagAAA: ratio >= 7,
  };
}

/**
 * Generate color palette variations
 */
export function generatePaletteVariations(
  baseColor: MonochromaticColor
): Record<string, string> {
  const base = GHXSTSHIP_COLORS[baseColor];
  
  return {
    base,
    lighter: withOpacity(baseColor, 0.7),
    lightest: withOpacity(baseColor, 0.4),
    darker: withOpacity(baseColor, 0.9),
    darkest: baseColor === 'black' ? base : GHXSTSHIP_COLORS.black,
  };
}

/**
 * Get CSS custom property name
 */
export function getColorVariable(color: MonochromaticColor): string {
  return `var(--color-${color})`;
}

/**
 * Validate GHXSTSHIP color compliance
 */
export function validateGHXSTSHIPCompliance(hex: string): {
  isCompliant: boolean;
  nearestColor: MonochromaticColor;
  suggestion: string;
} {
  const isCompliant = isMonochromaticColor(hex);
  const nearestColor = getNearestGHXSTSHIPColor(hex);
  
  return {
    isCompliant,
    nearestColor,
    suggestion: isCompliant 
      ? 'Color is GHXSTSHIP compliant' 
      : `Use ${nearestColor} (${GHXSTSHIP_COLORS[nearestColor]}) instead`,
  };
}

/**
 * Create halftone color effect
 */
export function createHalftoneEffect(
  baseColor: MonochromaticColor = 'black',
  density: number = 0.5
): string {
  return withOpacity(baseColor, density);
}

/**
 * Get border color for component state
 */
export function getBorderColor(
  state: 'default' | 'hover' | 'focus' | 'error' | 'disabled' = 'default'
): string {
  const borderColors = {
    default: GHXSTSHIP_COLORS['grey-200'],
    hover: GHXSTSHIP_COLORS.black,
    focus: GHXSTSHIP_COLORS.black,
    error: GHXSTSHIP_COLORS.black,
    disabled: GHXSTSHIP_COLORS['grey-300'],
  };
  
  return borderColors[state];
}
