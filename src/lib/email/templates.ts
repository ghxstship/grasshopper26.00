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
                <p style="${emailStyles.paragraph}">Questions? Contact us at support@gvteway.com</p>
                <p style="${emailStyles.paragraph}">&copy; ${new Date().getFullYear()} GVTEWAY. All rights reserved.</p>
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

  welcomeMember: (data: {
    memberName: string;
    tierName: string;
    tierLevel: number;
    benefits: string[];
    creditsAllocated?: number;
    vipVouchers?: number;
  }) => ({
    subject: `Welcome to GVTEWAY ${data.tierName} Membership!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to GVTEWAY</title>
        </head>
        <body style="${emailStyles.body}">
          <div style="${emailStyles.container}">
            <div style="${emailStyles.header}">
              <h1 style="${emailStyles.heading1}">WELCOME TO GVTEWAY</h1>
              <p style="${emailStyles.paragraph}">${data.tierName} Member</p>
            </div>
            <div style="${emailStyles.content}">
              <p style="${emailStyles.paragraph}">Hi ${data.memberName},</p>
              <p style="${emailStyles.paragraph}">Welcome to GVTEWAY ${data.tierName} membership! You now have access to exclusive benefits and experiences.</p>
              
              <div style="${emailStyles.card}">
                <h2 style="${emailStyles.heading2}">Your Membership Benefits</h2>
                <ul>
                  ${data.benefits.map(benefit => `<li style="${emailStyles.paragraph}">${benefit}</li>`).join('')}
                </ul>
                ${data.creditsAllocated ? `<p style="${emailStyles.paragraph}"><strong>Ticket Credits:</strong> ${data.creditsAllocated} credits allocated</p>` : ''}
                ${data.vipVouchers ? `<p style="${emailStyles.paragraph}"><strong>VIP Upgrades:</strong> ${data.vipVouchers} vouchers available</p>` : ''}
              </div>

              <p style="${emailStyles.paragraph}">Visit your member portal to explore all your benefits and start using your perks.</p>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal" style="${emailStyles.button}">Go to Member Portal</a>

              <div style="${emailStyles.footer}">
                <p style="${emailStyles.paragraph}">Questions? Contact us at support@gvteway.com</p>
                <p style="${emailStyles.paragraph}">&copy; ${new Date().getFullYear()} GVTEWAY. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  creditAllocation: (data: {
    memberName: string;
    tierName: string;
    creditsAdded: number;
    totalCredits: number;
    expirationDate: string;
  }) => ({
    subject: `${data.creditsAdded} Ticket Credits Added to Your Account`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Credits Allocated</title>
        </head>
        <body style="${emailStyles.body}">
          <div style="${emailStyles.container}">
            <div style="${emailStyles.header}">
              <h1 style="${emailStyles.heading1}">CREDITS ALLOCATED</h1>
            </div>
            <div style="${emailStyles.content}">
              <p style="${emailStyles.paragraph}">Hi ${data.memberName},</p>
              <p style="${emailStyles.paragraph}">Your quarterly ticket credits have been added to your ${data.tierName} membership!</p>
              
              <div style="${emailStyles.card}">
                <h2 style="${emailStyles.heading2}">${data.creditsAdded} Credits Added</h2>
                <p style="${emailStyles.paragraph}"><strong>Total Available:</strong> ${data.totalCredits} credits</p>
                <p style="${emailStyles.paragraph}"><strong>Expires:</strong> ${data.expirationDate}</p>
              </div>

              <p style="${emailStyles.paragraph}">Use your credits to get free tickets to upcoming events. Browse events and redeem your credits at checkout.</p>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/events" style="${emailStyles.button}">Browse Events</a>

              <div style="${emailStyles.footer}">
                <p style="${emailStyles.paragraph}">&copy; ${new Date().getFullYear()} GVTEWAY. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  membershipUpgrade: (data: {
    memberName: string;
    oldTier: string;
    newTier: string;
    newBenefits: string[];
    effectiveDate: string;
  }) => ({
    subject: `Membership Upgraded to ${data.newTier}!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Membership Upgraded</title>
        </head>
        <body style="${emailStyles.body}">
          <div style="${emailStyles.container}">
            <div style="${emailStyles.header}">
              <h1 style="${emailStyles.heading1}">MEMBERSHIP UPGRADED</h1>
              <p style="${emailStyles.paragraph}">${data.oldTier} → ${data.newTier}</p>
            </div>
            <div style="${emailStyles.content}">
              <p style="${emailStyles.paragraph}">Hi ${data.memberName},</p>
              <p style="${emailStyles.paragraph}">Congratulations! Your membership has been upgraded to ${data.newTier}.</p>
              
              <div style="${emailStyles.card}">
                <h2 style="${emailStyles.heading2}">New Benefits</h2>
                <ul>
                  ${data.newBenefits.map(benefit => `<li style="${emailStyles.paragraph}">${benefit}</li>`).join('')}
                </ul>
                <p style="${emailStyles.paragraph}"><strong>Effective:</strong> ${data.effectiveDate}</p>
              </div>

              <p style="${emailStyles.paragraph}">Your new benefits are now active. Visit your member portal to explore everything available to you.</p>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal" style="${emailStyles.button}">View My Benefits</a>

              <div style="${emailStyles.footer}">
                <p style="${emailStyles.paragraph}">&copy; ${new Date().getFullYear()} GVTEWAY. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  renewalReminder: (data: {
    memberName: string;
    tierName: string;
    renewalDate: string;
    amount: number;
    daysUntilRenewal: number;
  }) => ({
    subject: `Your ${data.tierName} Membership Renews in ${data.daysUntilRenewal} Days`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Renewal Reminder</title>
        </head>
        <body style="${emailStyles.body}">
          <div style="${emailStyles.container}">
            <div style="${emailStyles.header}">
              <h1 style="${emailStyles.heading1}">RENEWAL REMINDER</h1>
            </div>
            <div style="${emailStyles.content}">
              <p style="${emailStyles.paragraph}">Hi ${data.memberName},</p>
              <p style="${emailStyles.paragraph}">Your ${data.tierName} membership will automatically renew in ${data.daysUntilRenewal} days.</p>
              
              <div style="${emailStyles.card}">
                <p style="${emailStyles.paragraph}"><strong>Renewal Date:</strong> ${data.renewalDate}</p>
                <p style="${emailStyles.paragraph}"><strong>Amount:</strong> $${data.amount.toFixed(2)}</p>
              </div>

              <p style="${emailStyles.paragraph}">No action is needed - your membership will continue automatically. If you need to update your payment method or make changes, visit your account settings.</p>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/membership" style="${emailStyles.button}">Manage Membership</a>

              <div style="${emailStyles.footer}">
                <p style="${emailStyles.paragraph}">&copy; ${new Date().getFullYear()} GVTEWAY. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  vipVoucherAllocated: (data: {
    memberName: string;
    voucherCode: string;
    voucherCount: number;
    expirationDate: string;
  }) => ({
    subject: `${data.voucherCount} VIP Upgrade Voucher${data.voucherCount > 1 ? 's' : ''} Available`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>VIP Vouchers Available</title>
        </head>
        <body style="${emailStyles.body}">
          <div style="${emailStyles.container}">
            <div style="${emailStyles.header}">
              <h1 style="${emailStyles.heading1}">VIP UPGRADE VOUCHERS</h1>
            </div>
            <div style="${emailStyles.content}">
              <p style="${emailStyles.paragraph}">Hi ${data.memberName},</p>
              <p style="${emailStyles.paragraph}">You have ${data.voucherCount} VIP upgrade voucher${data.voucherCount > 1 ? 's' : ''} available!</p>
              
              <div style="${emailStyles.card}">
                <h2 style="${emailStyles.heading2}">Voucher Code</h2>
                <p style="${emailStyles.paragraph}; font-size: 24px; font-weight: bold; letter-spacing: 2px;">${data.voucherCode}</p>
                <p style="${emailStyles.paragraph}"><strong>Expires:</strong> ${data.expirationDate}</p>
              </div>

              <p style="${emailStyles.paragraph}">Use your voucher to upgrade any ticket to VIP at checkout. Enjoy premium viewing areas, exclusive lounges, and more.</p>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/benefits" style="${emailStyles.button}">View All Vouchers</a>

              <div style="${emailStyles.footer}">
                <p style="${emailStyles.paragraph}">&copy; ${new Date().getFullYear()} GVTEWAY. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};
