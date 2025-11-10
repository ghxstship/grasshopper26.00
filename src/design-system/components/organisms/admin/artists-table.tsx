import * as React from 'react';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';

export interface ArtistsTableProps {
  artists: any[];
}

export const ArtistsTable: React.FC<ArtistsTableProps> = ({ artists }) => {
  return (
    <div>
      {artists.map((artist: any) => (
        <div key={artist.id}>
          <Typography variant="body" as="div">{artist.name}</Typography>
        </div>
      ))}
    </div>
  );
};
