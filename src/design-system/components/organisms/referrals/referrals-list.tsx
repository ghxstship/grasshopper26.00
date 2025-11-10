import * as React from 'react';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';

export interface ReferralsListProps {
  referrals: any[];
}

export const ReferralsList: React.FC<ReferralsListProps> = ({ referrals }) => {
  return (
    <div>
      {referrals.map((referral: any) => (
        <div key={referral.id}>
          <Typography variant="body" as="div">{referral.email}</Typography>
        </div>
      ))}
    </div>
  );
};
