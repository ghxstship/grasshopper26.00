'use client';

import { PortalDashboardTemplate } from '@/design-system/components/templates';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { FavoritesList } from '@/design-system/components/organisms/favorites/favorites-list';

export default function FavoritesPage() {
  const { favorites, loading } = useFavorites();

  return (
    <PortalDashboardTemplate
      greeting="Favorites"
      userInfo={<span>Your saved events and artists</span>}
      sections={[
        {
          id: 'favorites',
          title: 'Your Favorites',
          content: <FavoritesList favorites={favorites} />,
          isEmpty: favorites.length === 0,
          emptyState: {
            icon: <Heart />,
            title: 'No favorites yet',
            description: 'Save events and artists to see them here',
          },
        },
      ]}
      layout="single-column"
      loading={loading}
    />
  );
}
