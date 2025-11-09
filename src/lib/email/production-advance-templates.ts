import { ProductionAdvance } from '@/lib/types/production-advances';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://gvteway.com';
const SUPPORT_EMAIL = 'support@gvteway.com';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const baseStyles = `
  body { 
    font-family: 'Arial', sans-serif; 
    background: #FFFFFF; 
    color: #000000; 
    margin: 0;
    padding: 0;
  }
  .container { 
    max-width: 600px; 
    margin: 0 auto; 
    padding: 40px 20px; 
  }
  .header { 
    border-bottom: 3px solid #000000; 
    padding-bottom: 20px; 
    margin-bottom: 30px;
  }
  .title { 
    font-size: 36px; 
    font-weight: bold; 
    text-transform: uppercase; 
    margin: 0;
  }
  .content { 
    padding: 30px 0; 
  }
  .advance-number { 
    background: #000000; 
    color: #FFFFFF; 
    padding: 20px; 
    margin: 20px 0; 
    text-align: center;
  }
  .info-block {
    margin: 15px 0;
    padding: 15px;
    background: #F5F5F5;
    border-left: 3px solid #000000;
  }
  .info-label {
    font-size: 12px;
    text-transform: uppercase;
    color: #666666;
    margin-bottom: 5px;
  }
  .info-value {
    font-size: 14px;
    color: #000000;
  }
  .button { 
    display: inline-block; 
    background: #000000; 
    color: #FFFFFF; 
    padding: 15px 30px; 
    text-decoration: none; 
    text-transform: uppercase; 
    font-weight: bold; 
    border: 3px solid #000000; 
    margin: 20px 0;
  }
  .button:hover { 
    background: #FFFFFF; 
    color: #000000; 
  }
  .footer { 
    border-top: 3px solid #000000; 
    padding-top: 20px; 
    margin-top: 40px; 
    color: #666666; 
    font-size: 12px; 
  }
  .steps {
    margin: 20px 0;
  }
  .step {
    display: flex;
    gap: 15px;
    margin: 15px 0;
    padding: 15px;
    background: #F5F5F5;
  }
  .step-number {
    width: 40px;
    height: 40px;
    background: #000000;
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: bold;
    flex-shrink: 0;
  }
  .step-content {
    flex: 1;
  }
  .step-title {
    font-weight: bold;
    text-transform: uppercase;
    margin-bottom: 5px;
  }
`;

export const advanceSubmittedEmail = (advance: ProductionAdvance) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">ADVANCE SUBMITTED</h1>
    </div>
    
    <div class="content">
      <p>Your production advance request has been successfully submitted.</p>
      
      <div class="advance-number">
        <strong>ADVANCE NUMBER:</strong><br>
        <span style="font-size: 24px;">${advance.advance_number}</span>
      </div>
      
      <div class="info-block">
        <div class="info-label">Event</div>
        <div class="info-value">${advance.event_name}</div>
      </div>

      <div class="info-block">
        <div class="info-label">Company</div>
        <div class="info-value">${advance.company_name}</div>
      </div>

      <div class="info-block">
        <div class="info-label">Service Period</div>
        <div class="info-value">
          ${formatDate(advance.service_start_date)} - ${formatDate(advance.service_end_date)}
          (${advance.duration_days} days)
        </div>
      </div>

      <div class="info-block">
        <div class="info-label">Items Requested</div>
        <div class="info-value">${advance.total_items}</div>
      </div>
      
      <div class="steps">
        <h3 style="text-transform: uppercase; margin-bottom: 15px;">What's Next?</h3>
        
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <div class="step-title">Review</div>
            <div>Our team will review your request within 24 hours</div>
          </div>
        </div>

        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <div class="step-title">Notification</div>
            <div>You'll receive email notifications on approval status</div>
          </div>
        </div>

        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <div class="step-title">Tracking</div>
            <div>Track your advance in the "My Advances" section</div>
          </div>
        </div>
      </div>
      
      <a href="${APP_URL}/advances/${advance.id}" class="button">
        VIEW ADVANCE
      </a>
    </div>
    
    <div class="footer">
      <p>This is an automated message from GVTEWAY production management system.</p>
      <p>Questions? Contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
    </div>
  </div>
</body>
</html>
`;

export const advanceApprovedEmail = (advance: ProductionAdvance) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">ADVANCE APPROVED</h1>
    </div>
    
    <div class="content">
      <p style="font-size: 18px; margin-bottom: 20px;">
        <strong>Great news!</strong> Your production advance request has been approved.
      </p>
      
      <div class="advance-number">
        <strong>ADVANCE NUMBER:</strong><br>
        <span style="font-size: 24px;">${advance.advance_number}</span>
      </div>
      
      <div class="info-block">
        <div class="info-label">Event</div>
        <div class="info-value">${advance.event_name}</div>
      </div>

      <div class="info-block">
        <div class="info-label">Service Period</div>
        <div class="info-value">
          ${formatDate(advance.service_start_date)} - ${formatDate(advance.service_end_date)}
        </div>
      </div>
      
      <p>Our team is now working on fulfilling your request. You can track the status in your dashboard.</p>
      
      <a href="${APP_URL}/advances/${advance.id}" class="button">
        VIEW ADVANCE DETAILS
      </a>
    </div>
    
    <div class="footer">
      <p>Questions? Reply to this email or contact your production coordinator.</p>
      <p>GVTEWAY Production Management | <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
    </div>
  </div>
</body>
</html>
`;

export const advanceRejectedEmail = (advance: ProductionAdvance) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">ADVANCE UPDATE</h1>
    </div>
    
    <div class="content">
      <p>Your production advance request has been reviewed.</p>
      
      <div class="advance-number">
        <strong>ADVANCE NUMBER:</strong><br>
        <span style="font-size: 24px;">${advance.advance_number}</span>
      </div>
      
      <div class="info-block">
        <div class="info-label">Event</div>
        <div class="info-value">${advance.event_name}</div>
      </div>

      ${advance.rejection_reason ? `
      <div class="info-block" style="border-left-color: #CC0000;">
        <div class="info-label">Reason</div>
        <div class="info-value">${advance.rejection_reason}</div>
      </div>
      ` : ''}
      
      <p>Please review the feedback and feel free to submit a revised request or contact us for more information.</p>
      
      <a href="${APP_URL}/advances/${advance.id}" class="button">
        VIEW ADVANCE DETAILS
      </a>
    </div>
    
    <div class="footer">
      <p>Questions? Reply to this email or contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
      <p>GVTEWAY Production Management</p>
    </div>
  </div>
</body>
</html>
`;

export const advanceCommentNotificationEmail = (
  advance: ProductionAdvance,
  commentText: string,
  commenterName: string
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">NEW COMMENT</h1>
    </div>
    
    <div class="content">
      <p>A new comment has been added to your production advance request.</p>
      
      <div class="advance-number">
        <strong>ADVANCE NUMBER:</strong><br>
        <span style="font-size: 24px;">${advance.advance_number}</span>
      </div>
      
      <div class="info-block">
        <div class="info-label">From</div>
        <div class="info-value">${commenterName}</div>
      </div>

      <div class="info-block">
        <div class="info-label">Comment</div>
        <div class="info-value">${commentText}</div>
      </div>
      
      <a href="${APP_URL}/advances/${advance.id}" class="button">
        VIEW ADVANCE & REPLY
      </a>
    </div>
    
    <div class="footer">
      <p>GVTEWAY Production Management | <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
    </div>
  </div>
</body>
</html>
`;
