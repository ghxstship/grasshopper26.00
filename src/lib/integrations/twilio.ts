/**
 * Twilio SMS Integration
 * Handles SMS notifications for events, tickets, and alerts
 */

import twilio from 'twilio';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let client: ReturnType<typeof twilio> | null = null;

if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

/**
 * Check if Twilio is configured
 */
export function isTwilioConfigured(): boolean {
  return !!(accountSid && authToken && twilioPhoneNumber);
}

/**
 * Send SMS message
 */
export async function sendSMS(to: string, message: string) {
  if (!client || !twilioPhoneNumber) {
    throw new Error('Twilio is not configured');
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to,
    });

    return {
      success: true,
      messageId: result.sid,
      status: result.status,
    };
  } catch (error: any) {
    console.error('Twilio SMS error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Send event reminder SMS
 */
export async function sendEventReminderSMS(
  phoneNumber: string,
  eventName: string,
  eventDate: string,
  venueName: string
) {
  const message = `🎉 Reminder: ${eventName} is tomorrow at ${venueName}! Get ready for an amazing time. See you there!`;
  return await sendSMS(phoneNumber, message);
}

/**
 * Send ticket confirmation SMS
 */
export async function sendTicketConfirmationSMS(
  phoneNumber: string,
  eventName: string,
  ticketCount: number,
  orderNumber: string
) {
  const message = `✅ Your ${ticketCount} ticket(s) for ${eventName} have been confirmed! Order #${orderNumber}. Check your email for details.`;
  return await sendSMS(phoneNumber, message);
}

/**
 * Send ticket delivery SMS with QR code link
 */
export async function sendTicketDeliverySMS(
  phoneNumber: string,
  eventName: string,
  ticketLink: string
) {
  const message = `🎟️ Your tickets for ${eventName} are ready! View them here: ${ticketLink}`;
  return await sendSMS(phoneNumber, message);
}

/**
 * Send lineup announcement SMS
 */
export async function sendLineupAnnouncementSMS(
  phoneNumber: string,
  eventName: string,
  artistName: string
) {
  const message = `🎤 Lineup Update! ${artistName} has been added to ${eventName}! Don't miss out - get your tickets now!`;
  return await sendSMS(phoneNumber, message);
}

/**
 * Send ticket on-sale notification
 */
export async function sendTicketOnSaleSMS(
  phoneNumber: string,
  eventName: string,
  saleUrl: string
) {
  const message = `🎟️ Tickets for ${eventName} are NOW ON SALE! Get yours before they sell out: ${saleUrl}`;
  return await sendSMS(phoneNumber, message);
}

/**
 * Send emergency alert SMS
 */
export async function sendEmergencyAlertSMS(
  phoneNumber: string,
  alertTitle: string,
  alertMessage: string
) {
  const message = `🚨 ALERT: ${alertTitle}\n\n${alertMessage}`;
  return await sendSMS(phoneNumber, message);
}

/**
 * Send schedule update SMS
 */
export async function sendScheduleUpdateSMS(
  phoneNumber: string,
  eventName: string,
  updateMessage: string
) {
  const message = `⏰ Schedule Update for ${eventName}: ${updateMessage}`;
  return await sendSMS(phoneNumber, message);
}

/**
 * Send waitlist notification SMS
 */
export async function sendWaitlistNotificationSMS(
  phoneNumber: string,
  eventName: string,
  ticketTypeName: string,
  expiresIn: string
) {
  const message = `🎉 Good news! ${ticketTypeName} tickets for ${eventName} are now available! This offer expires in ${expiresIn}. Act fast!`;
  return await sendSMS(phoneNumber, message);
}

/**
 * Send verification code SMS
 */
export async function sendVerificationCodeSMS(
  phoneNumber: string,
  code: string
) {
  const message = `Your verification code is: ${code}. This code will expire in 10 minutes.`;
  return await sendSMS(phoneNumber, message);
}

/**
 * Send batch SMS messages
 */
export async function sendBatchSMS(
  recipients: Array<{ phoneNumber: string; message: string }>
) {
  if (!client || !twilioPhoneNumber) {
    throw new Error('Twilio is not configured');
  }

  const results = await Promise.allSettled(
    recipients.map(({ phoneNumber, message }) =>
      sendSMS(phoneNumber, message)
    )
  );

  const successful = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  return {
    total: recipients.length,
    successful,
    failed,
    results,
  };
}

/**
 * Get SMS delivery status
 */
export async function getSMSStatus(messageId: string) {
  if (!client) {
    throw new Error('Twilio is not configured');
  }

  try {
    const message = await client.messages(messageId).fetch();
    
    return {
      success: true,
      status: message.status,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage,
      dateSent: message.dateSent,
      price: message.price,
      priceUnit: message.priceUnit,
    };
  } catch (error: any) {
    console.error('Failed to get SMS status:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
