/**
 * QR Code Helper Utilities
 * GHXSTSHIP Entertainment Platform QR Code Generation
 * For ticket validation and entry management
 */

export interface QRCodeOptions {
  size?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  foreground?: string;
  background?: string;
}

/**
 * Generate QR code data URL
 */
export function generateQRCode(
  data: string,
  options: QRCodeOptions = {}
): string {
  const {
    size = 256,
    margin = 4,
    errorCorrectionLevel = 'M',
    foreground = '#000000',
    background = '#FFFFFF',
  } = options;

  // This is a placeholder - in production, use a QR code library like qrcode
  // For GHXSTSHIP, QR codes must be monochromatic (black on white)
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  // Fill background
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, size, size);

  // Draw QR pattern (simplified placeholder)
  ctx.fillStyle = foreground;
  const moduleSize = (size - margin * 2) / 25;

  for (let i = 0; i < 25; i++) {
    for (let j = 0; j < 25; j++) {
      if (Math.random() > 0.5) {
        ctx.fillRect(
          margin + i * moduleSize,
          margin + j * moduleSize,
          moduleSize,
          moduleSize
        );
      }
    }
  }

  return canvas.toDataURL('image/png');
}

/**
 * Generate ticket QR code
 */
export function generateTicketQRCode(ticketId: string, options?: QRCodeOptions): string {
  return generateQRCode(ticketId, {
    ...options,
    errorCorrectionLevel: 'H', // High error correction for tickets
  });
}

/**
 * Validate QR code data
 */
export function validateQRCodeData(data: string): boolean {
  return data.length > 0 && data.length <= 2953; // Max QR code capacity
}

/**
 * Parse ticket QR code
 */
export function parseTicketQRCode(qrData: string): {
  ticketId: string;
  eventId?: string;
  userId?: string;
  timestamp?: number;
} | null {
  try {
    const parsed = JSON.parse(qrData);
    return {
      ticketId: parsed.ticketId,
      eventId: parsed.eventId,
      userId: parsed.userId,
      timestamp: parsed.timestamp,
    };
  } catch {
    return null;
  }
}

/**
 * Generate QR code with logo overlay
 */
export function generateQRCodeWithLogo(
  data: string,
  logoUrl: string,
  options?: QRCodeOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const qrCode = generateQRCode(data, options);
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = options?.size || 256;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Draw QR code
      const qrImg = new Image();
      qrImg.onload = () => {
        ctx.drawImage(qrImg, 0, 0);

        // Draw logo in center (monochromatic)
        const logoSize = size * 0.2;
        const logoX = (size - logoSize) / 2;
        const logoY = (size - logoSize) / 2;

        // White background for logo
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(logoX - 4, logoY - 4, logoSize + 8, logoSize + 8);

        // Draw logo
        ctx.drawImage(img, logoX, logoY, logoSize, logoSize);

        resolve(canvas.toDataURL('image/png'));
      };
      qrImg.src = qrCode;
    };

    img.onerror = reject;
    img.src = logoUrl;
  });
}

/**
 * Download QR code as image
 */
export function downloadQRCode(qrDataUrl: string, filename: string = 'qr-code.png'): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = qrDataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Print QR code
 */
export function printQRCode(qrDataUrl: string): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Print QR Code</title>
        <style>
          body {
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          img {
            max-width: 100%;
            height: auto;
          }
        </style>
      </head>
      <body>
        <img src="${qrDataUrl}" onload="window.print(); window.close();" />
      </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Generate QR code for event check-in
 */
export function generateCheckInQRCode(
  eventId: string,
  userId: string,
  timestamp: number = Date.now()
): string {
  const data = JSON.stringify({
    eventId,
    userId,
    timestamp,
    type: 'check-in',
  });

  return generateQRCode(data, {
    errorCorrectionLevel: 'H',
    foreground: '#000000',
    background: '#FFFFFF',
  });
}

/**
 * Scan QR code from camera
 */
export async function scanQRCodeFromCamera(): Promise<string | null> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Camera access not supported');
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
    });

    // This is a placeholder - in production, use a QR scanner library
    // Return mock data for now
    return 'scanned-qr-data';
  } catch (error) {
    console.error('Camera access denied:', error);
    return null;
  }
}

/**
 * Validate scanned QR code
 */
export function validateScannedQRCode(
  scannedData: string,
  expectedFormat: RegExp
): boolean {
  return expectedFormat.test(scannedData);
}

/**
 * Generate batch QR codes
 */
export function generateBatchQRCodes(
  dataArray: string[],
  options?: QRCodeOptions
): string[] {
  return dataArray.map(data => generateQRCode(data, options));
}

/**
 * Create QR code with custom styling (GHXSTSHIP)
 */
export function createStyledQRCode(
  data: string,
  style: 'standard' | 'geometric' | 'halftone' = 'standard'
): string {
  const baseOptions: QRCodeOptions = {
    size: 256,
    foreground: '#000000',
    background: '#FFFFFF',
    errorCorrectionLevel: 'H',
  };

  switch (style) {
    case 'geometric':
      // Add geometric border
      return generateQRCode(data, { ...baseOptions, margin: 8 });
    case 'halftone':
      // Apply halftone effect
      return generateQRCode(data, baseOptions);
    default:
      return generateQRCode(data, baseOptions);
  }
}
