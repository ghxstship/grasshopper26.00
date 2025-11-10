/**
 * Email Helper Utilities
 * GHXSTSHIP Entertainment Platform Email Management (Resend)
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

/**
 * Validate email address
 */
export function validateEmailAddress(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format email recipient
 */
export function formatEmailRecipient(recipient: EmailRecipient): string {
  return recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email;
}

/**
 * Generate ticket confirmation email
 */
export function generateTicketConfirmationEmail(data: {
  recipientName: string;
  eventName: string;
  eventDate: string;
  ticketType: string;
  quantity: number;
  orderNumber: string;
  qrCodeUrl: string;
}): EmailTemplate {
  const subject = `TICKET CONFIRMATION - ${data.eventName.toUpperCase()}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Share Tech', monospace; background: #FFFFFF; color: #000000; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { font-family: 'Anton', sans-serif; font-size: 48px; text-transform: uppercase; margin-bottom: 20px; border-bottom: 3px solid #000000; padding-bottom: 20px; }
    .section { margin: 30px 0; }
    .label { font-family: 'Bebas Neue', sans-serif; font-size: 18px; text-transform: uppercase; margin-bottom: 10px; }
    .value { font-size: 16px; margin-bottom: 20px; }
    .qr-code { text-align: center; margin: 40px 0; }
    .qr-code img { max-width: 300px; border: 3px solid #000000; }
    .footer { border-top: 3px solid #000000; padding-top: 20px; margin-top: 40px; font-size: 12px; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">TICKET CONFIRMED</div>
    
    <div class="section">
      <div class="label">Hello ${data.recipientName.toUpperCase()}</div>
      <div class="value">Your tickets for ${data.eventName.toUpperCase()} have been confirmed.</div>
    </div>

    <div class="section">
      <div class="label">Event</div>
      <div class="value">${data.eventName.toUpperCase()}</div>
      
      <div class="label">Date</div>
      <div class="value">${data.eventDate.toUpperCase()}</div>
      
      <div class="label">Ticket Type</div>
      <div class="value">${data.ticketType.toUpperCase()} x ${data.quantity}</div>
      
      <div class="label">Order Number</div>
      <div class="value">${data.orderNumber}</div>
    </div>

    <div class="qr-code">
      <div class="label">Your Ticket QR Code</div>
      <img src="${data.qrCodeUrl}" alt="Ticket QR Code" />
    </div>

    <div class="footer">
      GVTEWAY // SUPPORT@GVTEWAY.COM
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
TICKET CONFIRMED

Hello ${data.recipientName.toUpperCase()},

Your tickets for ${data.eventName.toUpperCase()} have been confirmed.

EVENT: ${data.eventName.toUpperCase()}
DATE: ${data.eventDate.toUpperCase()}
TICKET TYPE: ${data.ticketType.toUpperCase()} x ${data.quantity}
ORDER NUMBER: ${data.orderNumber}

GVTEWAY // SUPPORT@GVTEWAY.COM
  `.trim();

  return { subject, html, text };
}

/**
 * Generate event reminder email
 */
export function generateEventReminderEmail(data: {
  recipientName: string;
  eventName: string;
  eventDate: string;
  venueName: string;
  venueAddress: string;
}): EmailTemplate {
  const subject = `REMINDER - ${data.eventName.toUpperCase()} IS COMING UP`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Share Tech', monospace; background: #FFFFFF; color: #000000; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { font-family: 'Anton', sans-serif; font-size: 48px; text-transform: uppercase; margin-bottom: 20px; border-bottom: 3px solid #000000; padding-bottom: 20px; }
    .section { margin: 30px 0; }
    .label { font-family: 'Bebas Neue', sans-serif; font-size: 18px; text-transform: uppercase; margin-bottom: 10px; }
    .value { font-size: 16px; margin-bottom: 20px; }
    .cta { background: #000000; color: #FFFFFF; padding: 15px 30px; text-decoration: none; display: inline-block; font-family: 'Bebas Neue', sans-serif; font-size: 20px; text-transform: uppercase; margin: 20px 0; }
    .footer { border-top: 3px solid #000000; padding-top: 20px; margin-top: 40px; font-size: 12px; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">EVENT REMINDER</div>
    
    <div class="section">
      <div class="label">Hello ${data.recipientName.toUpperCase()}</div>
      <div class="value">${data.eventName.toUpperCase()} is coming up soon!</div>
    </div>

    <div class="section">
      <div class="label">Event</div>
      <div class="value">${data.eventName.toUpperCase()}</div>
      
      <div class="label">Date</div>
      <div class="value">${data.eventDate.toUpperCase()}</div>
      
      <div class="label">Venue</div>
      <div class="value">${data.venueName.toUpperCase()}<br>${data.venueAddress.toUpperCase()}</div>
    </div>

    <a href="#" class="cta">VIEW YOUR TICKETS</a>

    <div class="footer">
      GVTEWAY // SUPPORT@GVTEWAY.COM
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
EVENT REMINDER

Hello ${data.recipientName.toUpperCase()},

${data.eventName.toUpperCase()} is coming up soon!

EVENT: ${data.eventName.toUpperCase()}
DATE: ${data.eventDate.toUpperCase()}
VENUE: ${data.venueName.toUpperCase()}
${data.venueAddress.toUpperCase()}

GVTEWAY // SUPPORT@GVTEWAY.COM
  `.trim();

  return { subject, html, text };
}

/**
 * Generate newsletter email
 */
export function generateNewsletterEmail(data: {
  recipientName?: string;
  subject: string;
  content: string;
  ctaText?: string;
  ctaUrl?: string;
}): EmailTemplate {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Share Tech', monospace; background: #FFFFFF; color: #000000; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { font-family: 'Anton', sans-serif; font-size: 48px; text-transform: uppercase; margin-bottom: 20px; border-bottom: 3px solid #000000; padding-bottom: 20px; }
    .content { font-size: 16px; line-height: 1.6; margin: 30px 0; }
    .cta { background: #000000; color: #FFFFFF; padding: 15px 30px; text-decoration: none; display: inline-block; font-family: 'Bebas Neue', sans-serif; font-size: 20px; text-transform: uppercase; margin: 20px 0; }
    .footer { border-top: 3px solid #000000; padding-top: 20px; margin-top: 40px; font-size: 12px; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">GVTEWAY</div>
    
    ${data.recipientName ? `<div style="margin-bottom: 20px;">Hello ${data.recipientName.toUpperCase()},</div>` : ''}
    
    <div class="content">${data.content}</div>

    ${data.ctaText && data.ctaUrl ? `<a href="${data.ctaUrl}" class="cta">${data.ctaText.toUpperCase()}</a>` : ''}

    <div class="footer">
      GVTEWAY // SUPPORT@GVTEWAY.COM<br>
      <a href="#" style="color: #000000;">UNSUBSCRIBE</a>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
GVTEWAY

${data.recipientName ? `Hello ${data.recipientName.toUpperCase()},\n\n` : ''}

${data.content}

${data.ctaText && data.ctaUrl ? `${data.ctaText.toUpperCase()}: ${data.ctaUrl}\n\n` : ''}

GVTEWAY // SUPPORT@GVTEWAY.COM
UNSUBSCRIBE: [link]
  `.trim();

  return { subject: data.subject.toUpperCase(), html, text };
}

/**
 * Sanitize email content
 */
export function sanitizeEmailContent(content: string): string {
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .trim();
}

/**
 * Extract email domain
 */
export function extractEmailDomain(email: string): string {
  return email.split('@')[1] || '';
}

/**
 * Check if email is disposable
 */
export function isDisposableEmail(email: string): boolean {
  const disposableDomains = [
    'tempmail.com',
    'guerrillamail.com',
    '10minutemail.com',
    'mailinator.com',
  ];

  const domain = extractEmailDomain(email);
  return disposableDomains.includes(domain);
}

/**
 * Format email list
 */
export function formatEmailList(emails: string[]): string {
  return emails.join(', ');
}

/**
 * Parse email list
 */
export function parseEmailList(emailString: string): string[] {
  return emailString
    .split(/[,;\s]+/)
    .map(email => email.trim())
    .filter(email => validateEmailAddress(email));
}

/**
 * Generate unsubscribe link
 */
export function generateUnsubscribeLink(userId: string, token: string, baseUrl: string): string {
  return `${baseUrl}/unsubscribe?user=${userId}&token=${token}`;
}

/**
 * Create email tracking pixel
 */
export function createTrackingPixel(emailId: string, baseUrl: string): string {
  return `<img src="${baseUrl}/track/open/${emailId}" width="1" height="1" alt="" style="display:none;" />`;
}

/**
 * Wrap links for tracking
 */
export function wrapLinksForTracking(html: string, emailId: string, baseUrl: string): string {
  return html.replace(
    /href="([^"]+)"/g,
    `href="${baseUrl}/track/click/${emailId}?url=$1"`
  );
}
