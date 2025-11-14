/**
 * OrganizationCard - Organization display card molecule
 * GHXSTSHIP Atomic Design System
 */

import { Card, Stack, Heading, Text, Link } from '../../atoms';
import { Building2 } from 'lucide-react';

export interface OrganizationCardProps {
  /** Organization data */
  organization: {
    id: string;
    organization_name: string;
    organization_type?: string | null;
    city?: string | null;
    state?: string | null;
  };
  /** Link href */
  href: string;
}

export function OrganizationCard({ organization, href }: OrganizationCardProps) {
  return (
    <Link href={href}>
      <Card>
        <Stack gap={4}>
          <Building2 size={32} />
          <Stack gap={2}>
            <Heading level={3} font="bebas">
              {organization.organization_name}
            </Heading>
            {organization.organization_type && (
              <Text size="sm" color="secondary" uppercase>
                {organization.organization_type.replace('_', ' ')}
              </Text>
            )}
            {organization.city && organization.state && (
              <Text size="sm" color="tertiary">
                {organization.city}, {organization.state}
              </Text>
            )}
          </Stack>
        </Stack>
      </Card>
    </Link>
  );
}
