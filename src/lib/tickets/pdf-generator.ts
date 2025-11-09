/* eslint-disable no-magic-numbers */
// PDF positioning coordinates are required for jsPDF layout and cannot be tokenized
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { primitiveColors } from '@/design-system/tokens/primitives/colors';

interface TicketData {
  id: string;
  eventName: string;
  eventDate: string;
  venue: string;
  ticketType: string;
  attendeeName: string;
  orderNumber: string;
  qrCode: string;
  price: number;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    // Fallback to black if hex is invalid
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  };
}

export async function generateTicketPDF(ticket: TicketData): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Set up colors from design tokens
  const primaryRgb = hexToRgb(primitiveColors.brand[600]);
  const secondaryRgb = hexToRgb(primitiveColors.accent[500]);
  const textColorRgb = hexToRgb(primitiveColors.neutral[0]);
  const bgColorRgb = hexToRgb(primitiveColors.neutral[900]);

  // Background
  doc.setFillColor(bgColorRgb.r, bgColorRgb.g, bgColorRgb.b);
  doc.rect(0, 0, 210, 297, 'F');

  // Header gradient effect (simulated with rectangles)
  for (let i = 0; i < 50; i++) {
    const alpha = i / 50;
    const r = primaryRgb.r + (secondaryRgb.r - primaryRgb.r) * alpha;
    const g = primaryRgb.g + (secondaryRgb.g - primaryRgb.g) * alpha;
    const b = primaryRgb.b + (secondaryRgb.b - primaryRgb.b) * alpha;
    doc.setFillColor(r, g, b);
    doc.rect(0, i, 210, 1, 'F');
  }

  // Logo/Brand
  doc.setTextColor(textColorRgb.r, textColorRgb.g, textColorRgb.b);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('GVTEWAY', 105, 25, { align: 'center' });

  // Ticket Type Badge
  doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.roundedRect(15, 60, 180, 15, 3, 3, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(ticket.ticketType.toUpperCase(), 105, 69, { align: 'center' });

  // Event Name
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  const eventNameLines = doc.splitTextToSize(ticket.eventName, 180);
  doc.text(eventNameLines, 105, 90, { align: 'center' });

  // Event Details Box
  doc.setFillColor(20, 20, 20);
  doc.roundedRect(15, 110, 180, 60, 3, 3, 'F');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);

  // Date
  doc.text('DATE & TIME', 25, 125);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textColorRgb.r, textColorRgb.g, textColorRgb.b);
  const eventDate = new Date(ticket.eventDate);
  doc.text(
    eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    25,
    133
  );
  doc.text(
    eventDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    25,
    140
  );

  // Venue
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text('VENUE', 25, 155);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textColorRgb.r, textColorRgb.g, textColorRgb.b);
  const venueLines = doc.splitTextToSize(ticket.venue, 160);
  doc.text(venueLines, 25, 163);

  // QR Code
  const qrCodeDataUrl = await QRCode.toDataURL(ticket.qrCode, {
    width: 400,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });

  doc.addImage(qrCodeDataUrl, 'PNG', 70, 185, 70, 70);

  // QR Code Label
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text('SCAN AT ENTRANCE', 105, 262, { align: 'center' });

  // Attendee Info
  doc.setFillColor(20, 20, 20);
  doc.roundedRect(15, 270, 180, 15, 3, 3, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textColorRgb.r, textColorRgb.g, textColorRgb.b);
  doc.text(`ATTENDEE: ${ticket.attendeeName}`, 25, 279);

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text(`Order #${ticket.orderNumber}`, 15, 290);
  doc.text(`Ticket ID: ${ticket.id.slice(0, 8).toUpperCase()}`, 15, 294);
  doc.text(`Price: $${ticket.price.toFixed(2)}`, 195, 290, { align: 'right' });

  // Terms
  doc.setFontSize(6);
  doc.text(
    'This ticket is non-transferable and non-refundable. Valid ID required at entrance.',
    105,
    294,
    { align: 'center' }
  );

  return doc.output('blob');
}

export async function generateMultipleTicketsPDF(tickets: TicketData[]): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  for (let i = 0; i < tickets.length; i++) {
    if (i > 0) {
      doc.addPage();
    }

    const ticket = tickets[i];

    // Set up colors from design tokens
    const primaryRgb = hexToRgb(primitiveColors.brand[600]);
    const secondaryRgb = hexToRgb(primitiveColors.accent[500]);
    const textColorRgb = hexToRgb(primitiveColors.neutral[0]);
    const bgColorRgb = hexToRgb(primitiveColors.neutral[900]);

    // Background
    doc.setFillColor(bgColorRgb.r, bgColorRgb.g, bgColorRgb.b);
    doc.rect(0, 0, 210, 297, 'F');

    // Header gradient
    for (let j = 0; j < 50; j++) {
      const alpha = j / 50;
      const r = primaryRgb.r + (secondaryRgb.r - primaryRgb.r) * alpha;
      const g = primaryRgb.g + (secondaryRgb.g - primaryRgb.g) * alpha;
      const b = primaryRgb.b + (secondaryRgb.b - primaryRgb.b) * alpha;
      doc.setFillColor(r, g, b);
      doc.rect(0, j, 210, 1, 'F');
    }

    // Logo
    doc.setTextColor(textColorRgb.r, textColorRgb.g, textColorRgb.b);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text('GVTEWAY', 105, 25, { align: 'center' });

    // Ticket number indicator
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Ticket ${i + 1} of ${tickets.length}`, 105, 35, { align: 'center' });

    // Ticket Type Badge
    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.roundedRect(15, 60, 180, 15, 3, 3, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(ticket.ticketType.toUpperCase(), 105, 69, { align: 'center' });

    // Event Name
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    const eventNameLines = doc.splitTextToSize(ticket.eventName, 180);
    doc.text(eventNameLines, 105, 90, { align: 'center' });

    // Event Details
    doc.setFillColor(20, 20, 20);
    doc.roundedRect(15, 110, 180, 60, 3, 3, 'F');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);

    doc.text('DATE & TIME', 25, 125);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColorRgb.r, textColorRgb.g, textColorRgb.b);
    const eventDate = new Date(ticket.eventDate);
    doc.text(
      eventDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      25,
      133
    );

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    doc.text('VENUE', 25, 155);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColorRgb.r, textColorRgb.g, textColorRgb.b);
    const venueLines = doc.splitTextToSize(ticket.venue, 160);
    doc.text(venueLines, 25, 163);

    // QR Code
    const qrCodeDataUrl = await QRCode.toDataURL(ticket.qrCode, {
      width: 400,
      margin: 2,
    });

    doc.addImage(qrCodeDataUrl, 'PNG', 70, 185, 70, 70);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    doc.text('SCAN AT ENTRANCE', 105, 262, { align: 'center' });

    // Attendee
    doc.setFillColor(20, 20, 20);
    doc.roundedRect(15, 270, 180, 15, 3, 3, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColorRgb.r, textColorRgb.g, textColorRgb.b);
    doc.text(`ATTENDEE: ${ticket.attendeeName}`, 25, 279);

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(`Order #${ticket.orderNumber}`, 15, 290);
    doc.text(`Ticket ID: ${ticket.id.slice(0, 8).toUpperCase()}`, 15, 294);
  }

  return doc.output('blob');
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
