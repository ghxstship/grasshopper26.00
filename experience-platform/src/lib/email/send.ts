import { Resend } from 'resend';
import { emailTemplates } from './templates';

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  eventName: string;
  ticketCount: number;
  totalAmount: number;
  to?: string;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  try {
    const template = emailTemplates.orderConfirmation(data);
    
    const { error } = await resend.emails.send({
      from: 'Grasshopper <orders@grasshopper.com>',
      to: data.to || data.customerEmail,
      subject: template.subject,
      html: template.html,
    });

    if (error) {
      console.error('Email send error:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    throw error;
  }
}

interface TicketTransferEmailData {
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  eventName: string;
  ticketCount: number;
  transferCode: string;
}

export async function sendTicketTransferEmail(data: TicketTransferEmailData) {
  try {
    const template = emailTemplates.ticketTransfer(data);
    
    const { data: emailData, error } = await resend.emails.send({
      from: 'Grasshopper <tickets@grasshopper.com>',
      to: data.recipientEmail,
      subject: template.subject,
      html: template.html,
    });

    if (error) {
      console.error('Email send error:', error);
      throw error;
    }

    return emailData;
  } catch (error) {
    console.error('Failed to send ticket transfer email:', error);
    throw error;
  }
}

interface EventReminderEmailData {
  customerName: string;
  customerEmail: string;
  eventName: string;
  eventDate: string;
  venueName: string;
}

export async function sendEventReminderEmail(data: EventReminderEmailData) {
  try {
    const template = emailTemplates.eventReminder(data);
    
    const { data: emailData, error } = await resend.emails.send({
      from: 'Grasshopper <events@grasshopper.com>',
      to: data.customerEmail,
      subject: template.subject,
      html: template.html,
    });

    if (error) {
      console.error('Email send error:', error);
      throw error;
    }

    return emailData;
  } catch (error) {
    console.error('Failed to send event reminder email:', error);
    throw error;
  }
}

export async function sendBulkEmails(emails: Array<{ to: string; subject: string; html: string }>) {
  try {
    const promises = emails.map(email =>
      resend.emails.send({
        from: 'Grasshopper <noreply@grasshopper.com>',
        ...email,
      })
    );

    const results = await Promise.allSettled(promises);
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return { successful, failed, total: emails.length };
  } catch (error) {
    console.error('Bulk email send error:', error);
    throw error;
  }
}
