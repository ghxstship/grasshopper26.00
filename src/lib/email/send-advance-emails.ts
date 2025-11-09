import { Resend } from 'resend';
import { ProductionAdvance } from '@/lib/types/production-advances';
import {
  advanceSubmittedEmail,
  advanceApprovedEmail,
  advanceRejectedEmail,
  advanceCommentNotificationEmail,
} from './production-advance-templates';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'GVTEWAY Production <advances@gvteway.com>';

export async function sendAdvanceSubmittedEmail(advance: ProductionAdvance) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: advance.point_of_contact_email,
      subject: `Advance ${advance.advance_number} Submitted - GVTEWAY`,
      html: advanceSubmittedEmail(advance),
    });
  } catch (error) {
    console.error('Error sending advance submitted email:', error);
    throw error;
  }
}

export async function sendAdvanceApprovedEmail(advance: ProductionAdvance) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: advance.point_of_contact_email,
      subject: `Advance ${advance.advance_number} Approved - GVTEWAY`,
      html: advanceApprovedEmail(advance),
    });
  } catch (error) {
    console.error('Error sending advance approved email:', error);
    throw error;
  }
}

export async function sendAdvanceRejectedEmail(advance: ProductionAdvance) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: advance.point_of_contact_email,
      subject: `Advance ${advance.advance_number} Update - GVTEWAY`,
      html: advanceRejectedEmail(advance),
    });
  } catch (error) {
    console.error('Error sending advance rejected email:', error);
    throw error;
  }
}

export async function sendCommentNotificationEmail(
  advance: ProductionAdvance,
  commentText: string,
  commenterName: string,
  recipientEmail: string
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject: `New Comment on Advance ${advance.advance_number} - GVTEWAY`,
      html: advanceCommentNotificationEmail(advance, commentText, commenterName),
    });
  } catch (error) {
    console.error('Error sending comment notification email:', error);
    throw error;
  }
}
