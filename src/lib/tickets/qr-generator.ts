import QRCode from 'qrcode';

/**
 * Generate QR Code
 * Note: QR codes require pure black (#000000) and white (#FFFFFF) for optimal scanning reliability
 * These are the only acceptable hardcoded colors as they are industry standards for QR codes
 */
export async function generateQRCode(data: string): Promise<string> {
  try {
    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#000000', // Pure black required for QR code scanning
        light: '#FFFFFF', // Pure white required for QR code scanning
      },
    });

    return qrCodeDataURL;
  } catch (error) {
    console.error('QR code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
}

export async function generateTicketQRCode(ticketId: string): Promise<string> {
  const ticketData = {
    id: ticketId,
    timestamp: Date.now(),
    version: '1.0',
  };

  const dataString = JSON.stringify(ticketData);
  return generateQRCode(dataString);
}

export function verifyTicketQRCode(qrData: string): { valid: boolean; ticketId?: string } {
  try {
    const data = JSON.parse(qrData);
    
    if (data.id && data.version === '1.0') {
      return {
        valid: true,
        ticketId: data.id,
      };
    }
    
    return { valid: false };
  } catch (error) {
    return { valid: false };
  }
}
