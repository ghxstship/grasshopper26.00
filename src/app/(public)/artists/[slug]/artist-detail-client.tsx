'use client';

import { DetailViewTemplate } from '@/design-system/components/templates';
import { Music, Globe } from 'lucide-react';

export function ArtistDetailClient({ artist }: { artist: any }) {
  return (
    <DetailViewTemplate
      breadcrumbs={[
        { label: 'Artists', href: '/artists' },
        { label: artist.name, href: `/artists/${artist.slug}` },
      ]}
      heroImage={artist.image_url}
      title={artist.name}
      subtitle={artist.genre_tags?.join(', ')}
      primaryAction={{ label: 'View Events', href: `/events?artist=${artist.slug}` }}
      sidebar={
        <div>
          <h3>About</h3>
          {artist.website && <div><Globe /> <a href={artist.website}>Website</a></div>}
          {artist.genre_tags && <div><Music /> {artist.genre_tags.join(', ')}</div>}
        </div>
      }
    >
      <div dangerouslySetInnerHTML={{ __html: artist.bio }} />
    </DetailViewTemplate>
  );
}
