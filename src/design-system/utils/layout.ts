/**
 * Layout Utilities
 * GHXSTSHIP Contemporary Minimal Pop Art Layout System
 * Asymmetric grids, geometric compositions, brutalist spacing
 */

export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 12;
export type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AspectRatio = '1:1' | '4:3' | '16:9' | '21:9' | '3:2' | '2:3';

/**
 * Grid gap sizes (in rem)
 */
export const GRID_GAPS: Record<GridGap, string> = {
  none: '0',
  xs: '0.5rem',
  sm: '1rem',
  md: '1.5rem',
  lg: '2rem',
  xl: '3rem',
  '2xl': '4rem',
} as const;

/**
 * Container max widths
 */
export const CONTAINER_WIDTHS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  '3xl': '1920px',
  full: '100%',
} as const;

/**
 * Aspect ratio values
 */
export const ASPECT_RATIOS: Record<AspectRatio, number> = {
  '1:1': 1,
  '4:3': 4 / 3,
  '16:9': 16 / 9,
  '21:9': 21 / 9,
  '3:2': 3 / 2,
  '2:3': 2 / 3,
} as const;

/**
 * Get CSS Grid template columns
 */
export function getGridColumns(columns: GridColumns): string {
  return `repeat(${columns}, 1fr)`;
}

/**
 * Get CSS Grid gap
 */
export function getGridGap(gap: GridGap): string {
  return GRID_GAPS[gap];
}

/**
 * Create asymmetric grid layout (GHXSTSHIP style)
 */
export function createAsymmetricGrid(
  columns: number[] = [2, 1, 1]
): string {
  return columns.map(col => `${col}fr`).join(' ');
}

/**
 * Get aspect ratio padding
 */
export function getAspectRatioPadding(ratio: AspectRatio): string {
  const value = ASPECT_RATIOS[ratio];
  return `${(1 / value) * 100}%`;
}

/**
 * Create masonry layout configuration
 */
export interface MasonryConfig {
  columns: number;
  gap: GridGap;
  breakpoints?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function getMasonryStyles(config: MasonryConfig): {
  columnCount: number;
  columnGap: string;
  breakAt?: Record<string, number>;
} {
  return {
    columnCount: config.columns,
    columnGap: GRID_GAPS[config.gap],
    breakAt: config.breakpoints,
  };
}

/**
 * Calculate grid item span
 */
export function getGridSpan(span: number, maxColumns: GridColumns = 12): string {
  return `span ${Math.min(span, maxColumns)} / span ${Math.min(span, maxColumns)}`;
}

/**
 * Create full-bleed layout
 */
export function getFullBleedStyles(): {
  width: string;
  marginLeft: string;
  marginRight: string;
} {
  return {
    width: '100vw',
    marginLeft: 'calc(50% - 50vw)',
    marginRight: 'calc(50% - 50vw)',
  };
}

/**
 * Get container padding
 */
export function getContainerPadding(size: 'sm' | 'md' | 'lg' = 'md'): string {
  const paddings = {
    sm: '1rem',
    md: '2rem',
    lg: '3rem',
  };
  
  return paddings[size];
}

/**
 * Create geometric section spacing
 */
export function getSectionSpacing(size: 'sm' | 'md' | 'lg' | 'xl' = 'md'): {
  paddingTop: string;
  paddingBottom: string;
} {
  const spacings = {
    sm: '3rem',
    md: '6rem',
    lg: '9rem',
    xl: '12rem',
  };
  
  return {
    paddingTop: spacings[size],
    paddingBottom: spacings[size],
  };
}

/**
 * Create alternating section backgrounds
 */
export function getAlternatingBackground(index: number): string {
  return index % 2 === 0 ? '#FFFFFF' : '#000000';
}

/**
 * Get alternating text color
 */
export function getAlternatingTextColor(index: number): string {
  return index % 2 === 0 ? '#000000' : '#FFFFFF';
}

/**
 * Create sticky header configuration
 */
export function getStickyHeaderStyles(height: string = '80px'): {
  position: string;
  top: string;
  zIndex: number;
  height: string;
} {
  return {
    position: 'sticky',
    top: '0',
    zIndex: 1000,
    height,
  };
}

/**
 * Create fixed footer configuration
 */
export function getFixedFooterStyles(height: string = '60px'): {
  position: string;
  bottom: string;
  left: string;
  right: string;
  height: string;
} {
  return {
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0',
    height,
  };
}

/**
 * Calculate optimal column width
 */
export function getOptimalColumnWidth(
  containerWidth: number,
  columns: number,
  gap: GridGap
): number {
  const gapValue = parseFloat(GRID_GAPS[gap]) * 16; // Convert rem to px
  const totalGap = gapValue * (columns - 1);
  return (containerWidth - totalGap) / columns;
}

/**
 * Create responsive grid
 */
export interface ResponsiveGridConfig {
  xs?: GridColumns;
  sm?: GridColumns;
  md?: GridColumns;
  lg?: GridColumns;
  xl?: GridColumns;
  gap?: GridGap;
}

export function getResponsiveGridStyles(config: ResponsiveGridConfig): string {
  const { xs = 1, sm = 2, md = 3, lg = 4, xl = 6, gap = 'md' } = config;
  
  return `
    display: grid;
    grid-template-columns: repeat(${xs}, 1fr);
    gap: ${GRID_GAPS[gap]};
    
    @media (min-width: 640px) {
      grid-template-columns: repeat(${sm}, 1fr);
    }
    
    @media (min-width: 768px) {
      grid-template-columns: repeat(${md}, 1fr);
    }
    
    @media (min-width: 1024px) {
      grid-template-columns: repeat(${lg}, 1fr);
    }
    
    @media (min-width: 1280px) {
      grid-template-columns: repeat(${xl}, 1fr);
    }
  `.trim();
}

/**
 * Create flexbox utilities
 */
export function getFlexStyles(
  direction: 'row' | 'column' = 'row',
  justify: 'start' | 'center' | 'end' | 'between' | 'around' = 'start',
  align: 'start' | 'center' | 'end' | 'stretch' = 'start',
  gap?: GridGap
): {
  display: string;
  flexDirection: string;
  justifyContent: string;
  alignItems: string;
  gap?: string;
} {
  const justifyMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
  };
  
  const alignMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
  };
  
  return {
    display: 'flex',
    flexDirection: direction,
    justifyContent: justifyMap[justify],
    alignItems: alignMap[align],
    ...(gap && { gap: GRID_GAPS[gap] }),
  };
}

/**
 * Create centered layout
 */
export function getCenteredLayout(maxWidth?: string): {
  marginLeft: string;
  marginRight: string;
  maxWidth?: string;
} {
  return {
    marginLeft: 'auto',
    marginRight: 'auto',
    ...(maxWidth && { maxWidth }),
  };
}

/**
 * Create split layout (50/50)
 */
export function getSplitLayout(gap: GridGap = 'md'): {
  display: string;
  gridTemplateColumns: string;
  gap: string;
} {
  return {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: GRID_GAPS[gap],
  };
}

/**
 * Create hero section layout
 */
export function getHeroLayout(): {
  minHeight: string;
  display: string;
  alignItems: string;
  justifyContent: string;
} {
  return {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
}

/**
 * Create card grid layout
 */
export function getCardGridLayout(
  columns: GridColumns = 3,
  gap: GridGap = 'lg'
): {
  display: string;
  gridTemplateColumns: string;
  gap: string;
} {
  return {
    display: 'grid',
    gridTemplateColumns: getGridColumns(columns),
    gap: GRID_GAPS[gap],
  };
}

/**
 * Create geometric frame layout
 */
export function getGeometricFrameLayout(
  borderWidth: number = 3,
  padding: string = '2rem'
): {
  border: string;
  padding: string;
  position: string;
} {
  return {
    border: `${borderWidth}px solid #000000`,
    padding,
    position: 'relative',
  };
}

/**
 * Calculate grid auto-fit columns
 */
export function getAutoFitColumns(minWidth: string = '300px', gap: GridGap = 'md'): string {
  return `repeat(auto-fit, minmax(${minWidth}, 1fr))`;
}

/**
 * Calculate grid auto-fill columns
 */
export function getAutoFillColumns(minWidth: string = '300px', gap: GridGap = 'md'): string {
  return `repeat(auto-fill, minmax(${minWidth}, 1fr))`;
}

/**
 * Create overlay layout
 */
export function getOverlayLayout(): {
  position: string;
  inset: string;
  display: string;
  alignItems: string;
  justifyContent: string;
} {
  return {
    position: 'absolute',
    inset: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
}

/**
 * Create z-index layers
 */
export const Z_INDEX = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  notification: 800,
  max: 999,
} as const;

/**
 * Get z-index value
 */
export function getZIndex(layer: keyof typeof Z_INDEX): number {
  return Z_INDEX[layer];
}

/**
 * Create stack layout (vertical spacing)
 */
export function getStackLayout(gap: GridGap = 'md'): {
  display: string;
  flexDirection: string;
  gap: string;
} {
  return {
    display: 'flex',
    flexDirection: 'column',
    gap: GRID_GAPS[gap],
  };
}

/**
 * Create inline layout (horizontal spacing)
 */
export function getInlineLayout(gap: GridGap = 'sm'): {
  display: string;
  flexDirection: string;
  gap: string;
  flexWrap: string;
} {
  return {
    display: 'flex',
    flexDirection: 'row',
    gap: GRID_GAPS[gap],
    flexWrap: 'wrap',
  };
}

/**
 * Create sidebar layout
 */
export function getSidebarLayout(
  sidebarWidth: string = '300px',
  gap: GridGap = 'lg'
): {
  display: string;
  gridTemplateColumns: string;
  gap: string;
} {
  return {
    display: 'grid',
    gridTemplateColumns: `${sidebarWidth} 1fr`,
    gap: GRID_GAPS[gap],
  };
}

/**
 * Create safe area padding (for mobile notches)
 */
export function getSafeAreaPadding(): {
  paddingTop: string;
  paddingRight: string;
  paddingBottom: string;
  paddingLeft: string;
} {
  return {
    paddingTop: 'env(safe-area-inset-top)',
    paddingRight: 'env(safe-area-inset-right)',
    paddingBottom: 'env(safe-area-inset-bottom)',
    paddingLeft: 'env(safe-area-inset-left)',
  };
}
