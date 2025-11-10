import * as React from 'react';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';

export interface FavoritesListProps {
  favorites: any[];
}

export const FavoritesList: React.FC<FavoritesListProps> = ({ favorites }) => {
  return (
    <div>
      {favorites.map((item: any) => (
        <div key={item.id}>
          <Typography variant="body" as="div">{item.name || item.title || item.id}</Typography>
        </div>
      ))}
    </div>
  );
};
