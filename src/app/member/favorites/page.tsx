'use client';

import { Heart, Loader2 } from 'lucide-react';
import { Card, Stack, Heading, Text } from '@/design-system';
import { PageTemplate } from '@/design-system';
import { useFavorites } from '@/hooks/useFavorites';
import { FavoritesList } from '@/design-system';
import styles from '../member.module.css';

export default function FavoritesPage() {
  const { favorites, loading } = useFavorites();

  return (
    <PageTemplate showHeader showFooter>
      <div className={styles.pageContainer}>
        <div className={styles.narrowPageInner}>
          <Stack gap={6}>
            <Heading level={1} font="anton">
              Favorites
            </Heading>

            {loading ? (
              <Stack align="center" gap={3}>
                <Loader2 size={32} />
                <Text color="secondary">Loading your favorites...</Text>
              </Stack>
            ) : favorites.length === 0 ? (
              <Card variant="outlined" padding={6}>
                <Stack gap={4} align="center">
                  <Heart size={40} />
                  <Heading level={2} font="bebas" align="center">
                    No favorites yet
                  </Heading>
                  <Text align="center" color="secondary">
                    Save events and artists to see them here.
                  </Text>
                </Stack>
              </Card>
            ) : (
              <Card variant="outlined" padding={6}>
                <Stack gap={3}>
                  <Heading level={2} font="bebas">
                    Your Favorites
                  </Heading>
                  <FavoritesList favorites={favorites} />
                </Stack>
              </Card>
            )}
          </Stack>
        </div>
      </div>
    </PageTemplate>
  );
}
