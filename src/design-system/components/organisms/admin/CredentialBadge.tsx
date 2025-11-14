import { Badge } from '../../atoms';
export function CredentialBadge({ credential }: { credential: any }) {
  return <Badge>{typeof credential === 'string' ? credential : credential?.name || 'Credential'}</Badge>;
}
