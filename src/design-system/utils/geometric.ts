/**
 * Geometric Utilities
 * GHXSTSHIP Contemporary Minimal Pop Art Geometric System
 * Shapes, patterns, and compositions
 */

export type GeometricShape = 'circle' | 'square' | 'triangle' | 'hexagon' | 'diamond';
export type PatternType = 'halftone' | 'diagonal-stripes' | 'grid' | 'dots' | 'screen-print';

/**
 * Generate SVG path for geometric shapes
 */
export function getShapePath(shape: GeometricShape, size: number = 100): string {
  const half = size / 2;
  const third = size / 3;
  
  const paths: Record<GeometricShape, string> = {
    circle: `M ${half} 0 A ${half} ${half} 0 1 1 ${half} ${size} A ${half} ${half} 0 1 1 ${half} 0`,
    square: `M 0 0 L ${size} 0 L ${size} ${size} L 0 ${size} Z`,
    triangle: `M ${half} 0 L ${size} ${size} L 0 ${size} Z`,
    hexagon: `M ${half} 0 L ${size} ${third} L ${size} ${size - third} L ${half} ${size} L 0 ${size - third} L 0 ${third} Z`,
    diamond: `M ${half} 0 L ${size} ${half} L ${half} ${size} L 0 ${half} Z`,
  };
  
  return paths[shape];
}

/**
 * Generate clip-path for geometric masking
 */
export function getClipPath(shape: GeometricShape): string {
  const paths: Record<GeometricShape, string> = {
    circle: 'circle(50% at 50% 50%)',
    square: 'inset(0)',
    triangle: 'polygon(50% 0%, 100% 100%, 0% 100%)',
    hexagon: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
    diamond: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  };
  
  return paths[shape];
}

/**
 * Generate halftone dot pattern SVG
 */
export function generateHalftonePattern(
  dotSize: number = 4,
  spacing: number = 8,
  color: string = 'var(--color-primary)'
): string {
  const pattern = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${spacing}" height="${spacing}">
      <circle cx="${spacing / 2}" cy="${spacing / 2}" r="${dotSize / 2}" fill="${color}"/>
    </svg>
  `;
  
  return `data:image/svg+xml,${encodeURIComponent(pattern)}`;
}

/**
 * Generate diagonal stripe pattern SVG
 */
export function generateDiagonalStripes(
  width: number = 10,
  angle: number = 45,
  color1: string = 'var(--color-primary)',
  color2: string = '#FFFFFF'
): string {
  const pattern = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width * 2}" height="${width * 2}">
      <defs>
        <pattern id="stripes" patternUnits="userSpaceOnUse" width="${width * 2}" height="${width * 2}" patternTransform="rotate(${angle})">
          <rect width="${width}" height="${width * 2}" fill="${color1}"/>
          <rect x="${width}" width="${width}" height="${width * 2}" fill="${color2}"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#stripes)"/>
    </svg>
  `;
  
  return `data:image/svg+xml,${encodeURIComponent(pattern)}`;
}

/**
 * Generate grid pattern SVG
 */
export function generateGridPattern(
  cellSize: number = 20,
  lineWidth: number = 2,
  color: string = 'var(--color-primary)'
): string {
  const pattern = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${cellSize}" height="${cellSize}">
      <rect width="${cellSize}" height="${cellSize}" fill="none"/>
      <path d="M 0 0 L 0 ${cellSize} M 0 0 L ${cellSize} 0" stroke="${color}" stroke-width="${lineWidth}"/>
    </svg>
  `;
  
  return `data:image/svg+xml,${encodeURIComponent(pattern)}`;
}

/**
 * Generate screen print effect overlay
 */
export function generateScreenPrintOverlay(
  intensity: number = 0.3,
  color: string = 'var(--color-primary)'
): string {
  const pattern = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
      <filter id="screenprint">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise"/>
        <feColorMatrix in="noise" type="saturate" values="0"/>
        <feComponentTransfer>
          <feFuncA type="discrete" tableValues="0 ${intensity}"/>
        </feComponentTransfer>
      </filter>
      <rect width="100%" height="100%" fill="${color}" filter="url(#screenprint)"/>
    </svg>
  `;
  
  return `data:image/svg+xml,${encodeURIComponent(pattern)}`;
}

/**
 * Calculate geometric shadow offset
 */
export function getGeometricShadowOffset(
  size: number = 8,
  angle: number = 45
): { x: number; y: number } {
  const radians = (angle * Math.PI) / 180;
  return {
    x: Math.cos(radians) * size,
    y: Math.sin(radians) * size,
  };
}

/**
 * Generate thick border styles
 */
export function getThickBorder(
  width: number = 3,
  color: string = 'var(--color-primary)',
  style: 'solid' | 'dashed' | 'dotted' = 'solid'
): string {
  return `${width}px ${style} ${color}`;
}

/**
 * Generate geometric composition layout
 */
export interface GeometricComposition {
  shapes: Array<{
    type: GeometricShape;
    x: number;
    y: number;
    size: number;
    rotation: number;
    color: string;
  }>;
}

export function generateRandomComposition(
  width: number,
  height: number,
  shapeCount: number = 5,
  colors: string[] = ['var(--color-primary)', 'var(--color-bg-primary)', 'var(--color-text-secondary)']
): GeometricComposition {
  const shapes: GeometricComposition['shapes'] = [];
  const shapeTypes: GeometricShape[] = ['circle', 'square', 'triangle', 'diamond'];
  
  for (let i = 0; i < shapeCount; i++) {
    shapes.push({
      type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
      x: Math.random() * width,
      y: Math.random() * height,
      size: 50 + Math.random() * 150,
      rotation: Math.random() * 360,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
  
  return { shapes };
}

/**
 * Generate abstract geometric background
 */
export function generateAbstractBackground(
  width: number = 1920,
  height: number = 1080,
  complexity: 'simple' | 'medium' | 'complex' = 'medium'
): string {
  const shapeCount = complexity === 'simple' ? 3 : complexity === 'medium' ? 5 : 8;
  const composition = generateRandomComposition(width, height, shapeCount);
  
  const shapeSVGs = composition.shapes.map(shape => {
    const path = getShapePath(shape.type, shape.size);
    return `
      <g transform="translate(${shape.x}, ${shape.y}) rotate(${shape.rotation} ${shape.size / 2} ${shape.size / 2})">
        <path d="${path}" fill="${shape.color}" opacity="0.8"/>
      </g>
    `;
  }).join('');
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      ${shapeSVGs}
    </svg>
  `;
  
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Generate geometric frame border
 */
export function generateGeometricFrame(
  width: number,
  height: number,
  borderWidth: number = 3,
  cornerSize: number = 20,
  color: string = 'var(--color-primary)'
): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect x="${borderWidth / 2}" y="${borderWidth / 2}" 
            width="${width - borderWidth}" height="${height - borderWidth}" 
            fill="none" stroke="${color}" stroke-width="${borderWidth}"/>
      <rect x="0" y="0" width="${cornerSize}" height="${cornerSize}" fill="${color}"/>
      <rect x="${width - cornerSize}" y="0" width="${cornerSize}" height="${cornerSize}" fill="${color}"/>
      <rect x="0" y="${height - cornerSize}" width="${cornerSize}" height="${cornerSize}" fill="${color}"/>
      <rect x="${width - cornerSize}" y="${height - cornerSize}" width="${cornerSize}" height="${cornerSize}" fill="${color}"/>
    </svg>
  `;
  
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Calculate aspect ratio dimensions
 */
export function calculateAspectRatio(
  originalWidth: number,
  originalHeight: number,
  targetWidth?: number,
  targetHeight?: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;
  
  if (targetWidth) {
    return {
      width: targetWidth,
      height: targetWidth / aspectRatio,
    };
  }
  
  if (targetHeight) {
    return {
      width: targetHeight * aspectRatio,
      height: targetHeight,
    };
  }
  
  return { width: originalWidth, height: originalHeight };
}

/**
 * Generate geometric arrow
 */
export function generateGeometricArrow(
  direction: 'up' | 'down' | 'left' | 'right',
  size: number = 24,
  thickness: number = 3,
  color: string = 'var(--color-primary)'
): string {
  const paths: Record<typeof direction, string> = {
    up: `M ${size / 2} 0 L ${size} ${size / 2} L ${size * 0.6} ${size / 2} L ${size * 0.6} ${size} L ${size * 0.4} ${size} L ${size * 0.4} ${size / 2} L 0 ${size / 2} Z`,
    down: `M ${size / 2} ${size} L ${size} ${size / 2} L ${size * 0.6} ${size / 2} L ${size * 0.6} 0 L ${size * 0.4} 0 L ${size * 0.4} ${size / 2} L 0 ${size / 2} Z`,
    left: `M 0 ${size / 2} L ${size / 2} 0 L ${size / 2} ${size * 0.4} L ${size} ${size * 0.4} L ${size} ${size * 0.6} L ${size / 2} ${size * 0.6} L ${size / 2} ${size} Z`,
    right: `M ${size} ${size / 2} L ${size / 2} 0 L ${size / 2} ${size * 0.4} L 0 ${size * 0.4} L 0 ${size * 0.6} L ${size / 2} ${size * 0.6} L ${size / 2} ${size} Z`,
  };
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <path d="${paths[direction]}" fill="${color}"/>
    </svg>
  `;
  
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Generate geometric icon set
 */
export const GEOMETRIC_ICONS = {
  close: (size: number = 24, color: string = 'var(--color-primary)') => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <path d="M 3 3 L ${size - 3} ${size - 3} M ${size - 3} 3 L 3 ${size - 3}" 
              stroke="${color}" stroke-width="3" stroke-linecap="square"/>
      </svg>
    `;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  },
  
  check: (size: number = 24, color: string = 'var(--color-primary)') => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <path d="M 3 ${size / 2} L ${size / 3} ${size - 3} L ${size - 3} 3" 
              stroke="${color}" stroke-width="3" stroke-linecap="square" fill="none"/>
      </svg>
    `;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  },
  
  menu: (size: number = 24, color: string = 'var(--color-primary)') => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <rect x="3" y="5" width="${size - 6}" height="3" fill="${color}"/>
        <rect x="3" y="${size / 2 - 1.5}" width="${size - 6}" height="3" fill="${color}"/>
        <rect x="3" y="${size - 8}" width="${size - 6}" height="3" fill="${color}"/>
      </svg>
    `;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  },
  
  plus: (size: number = 24, color: string = 'var(--color-primary)') => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <rect x="${size / 2 - 1.5}" y="3" width="3" height="${size - 6}" fill="${color}"/>
        <rect x="3" y="${size / 2 - 1.5}" width="${size - 6}" height="3" fill="${color}"/>
      </svg>
    `;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  },
  
  minus: (size: number = 24, color: string = 'var(--color-primary)') => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <rect x="3" y="${size / 2 - 1.5}" width="${size - 6}" height="3" fill="${color}"/>
      </svg>
    `;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  },
} as const;

/**
 * Get pattern as CSS background
 */
export function getPatternBackground(
  pattern: PatternType,
  options?: {
    size?: number;
    color?: string;
    spacing?: number;
  }
): string {
  const { size = 4, color = 'var(--color-primary)', spacing = 8 } = options || {};
  
  switch (pattern) {
    case 'halftone':
      return `url("${generateHalftonePattern(size, spacing, color)}")`;
    case 'diagonal-stripes':
      return `url("${generateDiagonalStripes(spacing, 45, color, '#FFFFFF')}")`;
    case 'grid':
      return `url("${generateGridPattern(spacing, 2, color)}")`;
    case 'dots':
      return `url("${generateHalftonePattern(size, spacing, color)}")`;
    case 'screen-print':
      return `url("${generateScreenPrintOverlay(0.3, color)}")`;
    default:
      return 'none';
  }
}
