/**
 * Halftone Pattern Generator
 * Creates Ben-Day dots (pop art style) for GHXSTSHIP design system
 */

/**
 * Generate SVG halftone pattern
 */
export function generateHalftonePattern(
  dotSize: number = 4,
  spacing: number = 8,
  color: string = '#000000'
): string {
  const patternId = `halftone-${dotSize}-${spacing}`;
  
  return `
    <pattern id="${patternId}" x="0" y="0" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse">
      <circle cx="${spacing / 2}" cy="${spacing / 2}" r="${dotSize / 2}" fill="${color}" />
    </pattern>
  `;
}

/**
 * Generate CSS for halftone background
 */
export function generateHalftoneCSS(
  dotSize: number = 4,
  spacing: number = 8,
  color: string = '#000000'
): string {
  return `
    background-image: radial-gradient(circle, ${color} ${dotSize}px, transparent ${dotSize}px);
    background-size: ${spacing}px ${spacing}px;
    background-position: 0 0, ${spacing / 2}px ${spacing / 2}px;
  `;
}

/**
 * Halftone pattern configurations
 */
export const HALFTONE_PRESETS = {
  fine: {
    dotSize: 2,
    spacing: 6,
    density: 'high',
  },
  medium: {
    dotSize: 4,
    spacing: 8,
    density: 'medium',
  },
  coarse: {
    dotSize: 6,
    spacing: 12,
    density: 'low',
  },
  popArt: {
    dotSize: 8,
    spacing: 16,
    density: 'very-low',
  },
} as const;

/**
 * Apply halftone overlay to image element
 */
export function applyHalftoneOverlay(
  imageElement: HTMLImageElement | HTMLCanvasElement,
  preset: keyof typeof HALFTONE_PRESETS = 'medium'
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Set canvas size to match image
  canvas.width = imageElement.width;
  canvas.height = imageElement.height;

  // Draw original image
  ctx.drawImage(imageElement, 0, 0);

  // Get preset configuration
  const config = HALFTONE_PRESETS[preset];
  const { dotSize, spacing } = config;

  // Create halftone pattern
  ctx.globalCompositeOperation = 'multiply';
  
  for (let y = 0; y < canvas.height; y += spacing) {
    for (let x = 0; x < canvas.width; x += spacing) {
      // Get pixel brightness at this position
      const imageData = ctx.getImageData(x, y, 1, 1);
      const brightness = (imageData.data[0] + imageData.data[1] + imageData.data[2]) / 3;
      
      // Calculate dot size based on brightness (darker = larger dots)
      const adjustedDotSize = dotSize * (1 - brightness / 255);
      
      // Draw halftone dot
      ctx.beginPath();
      ctx.arc(x + spacing / 2, y + spacing / 2, adjustedDotSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();
    }
  }

  return canvas;
}

/**
 * Convert image to halftone using canvas
 */
export async function imageToHalftone(
  imageUrl: string,
  preset: keyof typeof HALFTONE_PRESETS = 'medium'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = applyHalftoneOverlay(img, preset);
        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
}

/**
 * Generate diagonal stripe pattern (alternative to halftone)
 */
export function generateStripePattern(
  stripeWidth: number = 2,
  spacing: number = 10,
  angle: number = 45,
  color: string = '#000000'
): string {
  const patternId = `stripes-${stripeWidth}-${spacing}-${angle}`;
  
  return `
    <pattern id="${patternId}" x="0" y="0" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle})">
      <rect x="0" y="0" width="${stripeWidth}" height="${spacing}" fill="${color}" />
    </pattern>
  `;
}

/**
 * Generate grid overlay pattern
 */
export function generateGridPattern(
  lineWidth: number = 1,
  spacing: number = 20,
  color: string = '#000000'
): string {
  const patternId = `grid-${lineWidth}-${spacing}`;
  
  return `
    <pattern id="${patternId}" x="0" y="0" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2="${spacing}" stroke="${color}" stroke-width="${lineWidth}" />
      <line x1="0" y1="0" x2="${spacing}" y2="0" stroke="${color}" stroke-width="${lineWidth}" />
    </pattern>
  `;
}

/**
 * React component helper: Halftone overlay div
 */
export interface HalftoneOverlayProps {
  preset?: keyof typeof HALFTONE_PRESETS;
  color?: string;
  opacity?: number;
  className?: string;
}

export function getHalftoneStyles({
  preset = 'medium',
  color = '#000000',
  opacity = 0.3,
}: HalftoneOverlayProps): React.CSSProperties {
  const config = HALFTONE_PRESETS[preset];
  
  return {
    backgroundImage: `radial-gradient(circle, ${color} ${config.dotSize}px, transparent ${config.dotSize}px)`,
    backgroundSize: `${config.spacing}px ${config.spacing}px`,
    backgroundPosition: '0 0',
    opacity,
    pointerEvents: 'none' as const,
  };
}
