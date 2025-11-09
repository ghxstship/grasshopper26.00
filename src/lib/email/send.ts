// Email sending service integrated with Resend
import { sendEmail as sendResendEmail } from './resend-client';
import { emailTemplates } from './templates';

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(data: {
  to: string;
  customerName: string;
  orderNumber: string;
  eventName: string;
  ticketCount: number;
  totalAmount: number;
}) {
  const template = emailTemplates.orderConfirmation({
    customerName: data.customerName,
    orderNumber: data.orderNumber,
    eventName: data.eventName,
    ticketCount: data.ticketCount,
    totalAmount: data.totalAmount,
  });

  return sendResendEmail({
    to: data.to,
    subject: template.subject,
    html: template.html,
  });
}

/**
 * Send ticket delivery email with QR codes
 */
export async function sendTicketDeliveryEmail(data: {
  to: string;
  customerName: string;
  eventName: string;
  tickets: Array<{
    id: string;
    qrCode: string;
    attendeeName: string;
  }>;
}) {
  const ticketRows = data.tickets
    .map(
      (ticket) => `
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p><strong>Attendee:</strong> ${ticket.attendeeName}</p>
      <img src="${ticket.qrCode}" alt="QR Code" style="width: 200px; height: 200px;" />
      <p style="font-size: 12px; color: #6b7280;">Ticket ID: ${ticket.id}</p>
    </div>
  `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Tickets</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Your Tickets Are Ready!</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p>Hi ${data.customerName},</p>
          <p>Your tickets for <strong>${data.eventName}</strong> are attached below.</p>
          <p>Please save these QR codes to your device or print them out. You'll need to present them at the venue entrance.</p>
          
          ${ticketRows}

          <p style="margin-top: 30px;">See you at the event!</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
            <p>Questions? Contact us at support@gvteway.com</p>
            <p>&copy; ${new Date().getFullYear()} GVTEWAY. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendResendEmail({
    to: data.to,
    subject: `Your Tickets for ${data.eventName}`,
    html,
  });
}

/**
 * Send ticket transfer email
 */
export async function sendTicketTransferEmail(data: {
  to: string;
  recipientName: string;
  senderName: string;
  eventName: string;
  ticketCount: number;
  transferCode: string;
}) {
  const template = emailTemplates.ticketTransfer(data);

  return sendResendEmail({
    to: data.to,
    subject: template.subject,
    html: template.html,
  });
}

/**
 * Send event reminder email
 */
export async function sendEventReminderEmail(data: {
  to: string;
  customerName: string;
  eventName: string;
  eventDate: string;
  venueName: string;
}) {
  const template = emailTemplates.eventReminder(data);

  return sendResendEmail({
    to: data.to,
    subject: template.subject,
    html: template.html,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(data: {
  to: string;
  resetLink: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h1>Reset Your Password</h1>
          <p>You requested to reset your password. Click the button below to create a new password:</p>
          
          <a href="${data.resetLink}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reset Password</a>

          <p>If you didn't request this, you can safely ignore this email.</p>
          <p>This link will expire in 1 hour.</p>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
            <p>&copy; ${new Date().getFullYear()} GVTEWAY. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendResendEmail({
    to: data.to,
    subject: 'Reset Your Password',
    html,
  });
}

/**
 * Send newsletter signup confirmation
 */
export async function sendNewsletterConfirmationEmail(data: {
  to: string;
  name?: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Our Newsletter</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Welcome!</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p>Hi ${data.name || 'there'},</p>
          <p>Thanks for subscribing to our newsletter! You'll be the first to know about:</p>
          <ul>
            <li>New event announcements</li>
            <li>Exclusive presale access</li>
            <li>Artist lineup reveals</li>
            <li>Special promotions and discounts</li>
          </ul>
          <p>Stay tuned for updates!</p>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
            <p>&copy; ${new Date().getFullYear()} GVTEWAY. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendResendEmail({
    to: data.to,
    subject: 'Welcome to Our Newsletter!',
    html,
  });
}

/**
 * Send waitlist notification email
 */
export async function sendWaitlistNotificationEmail(data: {
  to: string;
  customerName: string;
  eventName: string;
  ticketTypeName: string;
  expiresAt: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tickets Available!</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">🎉 Tickets Available!</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p>Hi ${data.customerName},</p>
          <p>Great news! Tickets for <strong>${data.eventName}</strong> are now available.</p>
          <p><strong>Ticket Type:</strong> ${data.ticketTypeName}</p>
          <p style="color: #dc2626;"><strong>⏰ Act fast!</strong> This offer expires at ${data.expiresAt}</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/events" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Get Tickets Now</a>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
            <p>&copy; ${new Date().getFullYear()} GVTEWAY. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendResendEmail({
    to: data.to,
    subject: `🎉 Tickets Available for ${data.eventName}!`,
    html,
  });
}
