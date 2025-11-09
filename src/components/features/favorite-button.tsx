'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
  eventId?: string;
  artistId?: string;
  size?: 'sm' | 'default' | 'lg';
}

export function FavoriteButton({ eventId, artistId, size = 'default' }: FavoriteButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  async function checkFavoriteStatus() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq(eventId ? 'event_id' : 'artist_id', eventId || artistId)
        .single();

      setIsFavorited(!!data);
    } catch (error) {
      // Not favorited
    }
  }

  useEffect(() => {
    checkFavoriteStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, artistId]);

  async function toggleFavorite() {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, artistId }),
      });

      const data = await response.json();
      setIsFavorited(data.favorited);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size={size}
      onClick={toggleFavorite}
      disabled={loading}
      className={`border-purple-500/30 ${
        isFavorited ? 'bg-purple-500/20 hover:bg-purple-500/30' : 'hover:bg-purple-500/10'
      }`}
    >
      <Heart
        className={`h-4 w-4 ${isFavorited ? 'fill-pink-500 text-pink-500' : ''}`}
      />
    </Button>
  );
}
