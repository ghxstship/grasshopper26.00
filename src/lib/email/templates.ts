// Email templates for Resend integration
import { emailStyles } from './email-tokens';

export const emailTemplates = {
  orderConfirmation: (data: {
    customerName: string;
    orderNumber: string;
    eventName: string;
    ticketCount: number;
    totalAmount: number;
  }) => ({
    subject: `Order Confirmation - ${data.eventName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
        </head>
        <body style="${emailStyles.body}">
          <div style="${emailStyles.container}">
            <div style="${emailStyles.header}">
              <h1 style="${emailStyles.heading1}">Order Confirmed!</h1>
              <p style="${emailStyles.paragraph}">Thank you for your purchase</p>
            </div>
            <div style="${emailStyles.content}">
              <p style="${emailStyles.paragraph}">Hi ${data.customerName},</p>
              <p style="${emailStyles.paragraph}">Your order has been confirmed! We're excited to see you at the event.</p>
              
              <div style="${emailStyles.card}">
                <h2 style="${emailStyles.heading2}">${data.eventName}</h2>
                <p style="${emailStyles.paragraph}"><strong>Order Number:</strong> ${data.orderNumber}</p>
                <p style="${emailStyles.paragraph}"><strong>Tickets:</strong> ${data.ticketCount}</p>
                <p style="${emailStyles.paragraph}"><strong>Total:</strong> $${data.totalAmount.toFixed(2)}</p>
              </div>

              <p style="${emailStyles.paragraph}">Your tickets have been sent to your email. You can also view them in your account dashboard.</p>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile" style="${emailStyles.button}">View My Tickets</a>

              <div style="${emailStyles.footer}">
                <p style="${emailStyles.paragraph}">Questions? Contact us at support@grasshopper.com</p>
                <p style="${emailStyles.paragraph}">&copy; ${new Date().getFullYear()} Grasshopper. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  ticketTransfer: (data: {
    recipientName: string;
    senderName: string;
    eventName: string;
    ticketCount: number;
    transferCode: string;
  }) => ({
    subject: `${data.senderName} transferred tickets to you`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Ticket Transfer</title>
        </head>
        <body style="${emailStyles.body}">
          <div style="${emailStyles.container}">
            <div style="${emailStyles.header}">
              <h1 style="${emailStyles.heading1}">Tickets Transferred!</h1>
            </div>
            <div style="${emailStyles.content}">
              <p style="${emailStyles.paragraph}">Hi ${data.recipientName},</p>
              <p style="${emailStyles.paragraph}">${data.senderName} has transferred ${data.ticketCount} ticket(s) to you for <strong>${data.eventName}</strong>.</p>
              
              <div style="${emailStyles.card}">
                <p style="${emailStyles.paragraph}"><strong>Transfer Code:</strong> ${data.transferCode}</p>
              </div>

              <p style="${emailStyles.paragraph}">Click the button below to accept the transfer:</p>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/transfer/${data.transferCode}" style="${emailStyles.button}">Accept Transfer</a>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  eventReminder: (data: {
    customerName: string;
    eventName: string;
    eventDate: string;
    venueName: string;
  }) => ({
    subject: `Reminder: ${data.eventName} is coming up!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Event Reminder</title>
        </head>
        <body style="${emailStyles.body}">
          <div style="${emailStyles.container}">
            <div style="${emailStyles.header}">
              <h1 style="${emailStyles.heading1}">Event Reminder</h1>
            </div>
            <div style="${emailStyles.content}">
              <p style="${emailStyles.paragraph}">Hi ${data.customerName},</p>
              <p style="${emailStyles.paragraph}">This is a reminder that <strong>${data.eventName}</strong> is coming up soon!</p>
              
              <p style="${emailStyles.paragraph}"><strong>Date:</strong> ${data.eventDate}</p>
              <p style="${emailStyles.paragraph}"><strong>Venue:</strong> ${data.venueName}</p>

              <p style="${emailStyles.paragraph}">Don't forget to bring your tickets and arrive early to avoid lines.</p>

              <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile" style="${emailStyles.button}">View My Tickets</a>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};
