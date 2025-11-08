import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

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

export async function generateTicketPDF(ticket: TicketData): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Set up colors
  const primaryColor: [number, number, number] = [147, 51, 234]; // Purple
  const secondaryColor: [number, number, number] = [236, 72, 153]; // Pink
  const textColor: [number, number, number] = [255, 255, 255]; // White
  const bgColor: [number, number, number] = [0, 0, 0]; // Black

  // Background
  doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
  doc.rect(0, 0, 210, 297, 'F');

  // Header gradient effect (simulated with rectangles)
  for (let i = 0; i < 50; i++) {
    const alpha = i / 50;
    const r = primaryColor[0] + (secondaryColor[0] - primaryColor[0]) * alpha;
    const g = primaryColor[1] + (secondaryColor[1] - primaryColor[1]) * alpha;
    const b = primaryColor[2] + (secondaryColor[2] - primaryColor[2]) * alpha;
    doc.setFillColor(r, g, b);
    doc.rect(0, i, 210, 1, 'F');
  }

  // Logo/Brand
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('GRASSHOPPER', 105, 25, { align: 'center' });

  // Ticket Type Badge
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
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
  doc.setTextColor(...textColor);
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
  doc.setTextColor(...textColor);
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
  doc.setTextColor(...textColor);
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

    // Set up colors
    const primaryColor: [number, number, number] = [147, 51, 234];
    const secondaryColor: [number, number, number] = [236, 72, 153];
    const textColor: [number, number, number] = [255, 255, 255];
    const bgColor: [number, number, number] = [0, 0, 0];

    // Background
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.rect(0, 0, 210, 297, 'F');

    // Header gradient
    for (let j = 0; j < 50; j++) {
      const alpha = j / 50;
      const r = primaryColor[0] + (secondaryColor[0] - primaryColor[0]) * alpha;
      const g = primaryColor[1] + (secondaryColor[1] - primaryColor[1]) * alpha;
      const b = primaryColor[2] + (secondaryColor[2] - primaryColor[2]) * alpha;
      doc.setFillColor(r, g, b);
      doc.rect(0, j, 210, 1, 'F');
    }

    // Logo
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text('GRASSHOPPER', 105, 25, { align: 'center' });

    // Ticket number indicator
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Ticket ${i + 1} of ${tickets.length}`, 105, 35, { align: 'center' });

    // Ticket Type Badge
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
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
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
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
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
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
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
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
