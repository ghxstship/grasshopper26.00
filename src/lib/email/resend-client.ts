import { Resend } from 'resend';

// Initialize Resend client with API key (will be undefined during build, which is fine)
const apiKey = process.env.RESEND_API_KEY || 'dummy-key-for-build';
export const resend = new Resend(apiKey);

// Check if Resend is properly configured at runtime
function checkResendConfig() {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not configured - email functionality will not work');
    return false;
  }
  return true;
}

/**
 * Send a transactional email using Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = process.env.RESEND_FROM_EMAIL || 'noreply@gvteway.com',
  replyTo,
  cc,
  bcc,
  attachments,
}: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
  }>;
}) {
  if (!checkResendConfig()) {
    return { success: false, error: 'Resend not configured' };
  }
  
  try {
    const data = await resend.emails.send({
      from,
      to,
      subject,
      html,
      replyTo,
      cc,
      bcc,
      attachments,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

/**
 * Send a batch of emails
 */
export async function sendBatchEmails(
  emails: Array<{
    to: string;
    subject: string;
    html: string;
    from?: string;
  }>
) {
  try {
    const data = await resend.batch.send(
      emails.map((email) => ({
        from: email.from || process.env.RESEND_FROM_EMAIL || 'noreply@gvteway.com',
        to: email.to,
        subject: email.subject,
        html: email.html,
      }))
    );

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send batch emails:', error);
    return { success: false, error };
  }
}

/**
 * Create and send an email with a template
 */
export async function sendTemplateEmail({
  to,
  template,
  data,
  from,
}: {
  to: string | string[];
  template: string;
  data: Record<string, any>;
  from?: string;
}) {
  try {
    const response = await resend.emails.send({
      from: from || process.env.RESEND_FROM_EMAIL || 'noreply@gvteway.com',
      to,
      subject: data.subject || 'Notification',
      react: template as any, // For React Email templates
    });

    return { success: true, data: response };
  } catch (error) {
    console.error('Failed to send template email:', error);
    return { success: false, error };
  }
}

/**
 * Verify domain for sending emails
 */
export async function verifyDomain(domain: string) {
  try {
    const data = await resend.domains.create({ name: domain });
    return { success: true, data };
  } catch (error) {
    console.error('Failed to verify domain:', error);
    return { success: false, error };
  }
}

/**
 * Get domain verification status
 */
export async function getDomainStatus(domainId: string) {
  try {
    const data = await resend.domains.get(domainId);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to get domain status:', error);
    return { success: false, error };
  }
}
