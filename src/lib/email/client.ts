import { Resend } from 'resend';

// Allow missing API key in development
const apiKey = process.env.RESEND_API_KEY || 'test_key';

if (!process.env.RESEND_API_KEY && process.env.NODE_ENV === 'production') {
  console.warn('RESEND_API_KEY is not defined - emails will not be sent');
}

export const resend = new Resend(apiKey);

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@gvteway.com';

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[DEV] Email would be sent:', params);
    return { success: true, id: 'dev-email-id' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    if (error) {
      throw error;
    }

    return { success: true, id: data?.id || 'unknown' };
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}
