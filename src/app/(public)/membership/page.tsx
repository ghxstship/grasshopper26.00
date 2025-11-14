import { Metadata } from 'next';
import { MembershipClient } from './membership-client';

export const metadata: Metadata = {
  title: 'Membership - GVTEWAY',
  description: 'Join GVTEWAY membership for exclusive access',
};

export default function MembershipPage() {
  return <MembershipClient />;
}
