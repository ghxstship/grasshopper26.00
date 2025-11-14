'use client';

import { PortalDashboardTemplate } from '@/design-system';
import { CheckCircle } from 'lucide-react';

export default function CheckoutSuccessPage() {
  return (
    <PortalDashboardTemplate
      greeting="Order Complete!"
      userInfo={<span>Thank you for your purchase</span>}
      sections={[
        {
          id: 'success',
          title: 'What\'s Next',
          content: <div>Check your email for order confirmation and tickets</div>,
        },
      ]}
      layout="single-column"
    />
  );
}
