import QRCode from 'qrcode';

export async function generateQRCode(data: string): Promise<string> {
  try {
    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
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
