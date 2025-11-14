import { Card, Heading, Text } from '../../atoms';
export function MembershipCard({ membership, profile }: { membership: any; profile?: any }) {
  return (
    <Card>
      <Heading level={3}>
        {membership?.membership_tiers?.display_name || membership?.name || 'Membership'}
      </Heading>
      <Text>{profile?.display_name || membership?.type || 'Member'}</Text>
      {membership?.start_date && <Text size="sm">Since: {new Date(membership.start_date).toLocaleDateString()}</Text>}
    </Card>
  );
}
