'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Music, Calendar } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

interface FavoriteArtist {
  artist_id: string;
  created_at: string;
  artists: {
    id: string;
    name: string;
    slug: string;
    profile_image_url?: string;
    genre_tags?: string[];
  };
}

export default function FavoritesPage() {
  const supabase = createClient();
  const [favorites, setFavorites] = useState<FavoriteArtist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  async function fetchFavorites() {
    try {
      const response = await fetch('/api/favorites');
      const data = await response.json();
      
      if (response.ok) {
        setFavorites(data.favorites || []);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  }

  async function removeFavorite(artistId: string) {
    try {
      const response = await fetch(`/api/favorites?artistId=${artistId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFavorites(favorites.filter(f => f.artist_id !== artistId));
        toast.success('Removed from favorites');
      } else {
        toast.error('Failed to remove favorite');
      }
    } catch (error) {
      toast.error('Failed to remove favorite');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            My Favorite Artists
          </h1>
          <p className="text-gray-400">
            {favorites.length} {favorites.length === 1 ? 'artist' : 'artists'} saved
          </p>
        </div>

        {favorites.length === 0 ? (
          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 mx-auto mb-4 text-gray-600" />
              <h2 className="text-2xl font-bold text-white mb-2">No favorites yet</h2>
              <p className="text-gray-400 mb-6">
                Start following your favorite artists to see them here
              </p>
              <Button
                asChild
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Link href="/artists">Browse Artists</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <Card
                key={favorite.artist_id}
                className="bg-black/40 backdrop-blur-lg border-purple-500/20 hover:bg-black/60 transition-all group"
              >
                <CardContent className="p-6">
                  <Link href={`/artists/${favorite.artists.slug}`}>
                    <div className="aspect-square rounded-lg overflow-hidden mb-4 bg-gradient-to-br from-purple-900 to-pink-900">
                      {favorite.artists.profile_image_url ? (
                        <Image
                          src={favorite.artists.profile_image_url}
                          alt={favorite.artists.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="h-16 w-16 text-white/20" />
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="space-y-3">
                    <div>
                      <Link href={`/artists/${favorite.artists.slug}`}>
                        <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                          {favorite.artists.name}
                        </h3>
                      </Link>
                      {favorite.artists.genre_tags && favorite.artists.genre_tags.length > 0 && (
                        <p className="text-sm text-gray-400 mt-1">
                          {favorite.artists.genre_tags.slice(0, 3).join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        asChild
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <Link href={`/artists/${favorite.artists.slug}`}>
                          <Calendar className="h-4 w-4 mr-2" />
                          View Events
                        </Link>
                      </Button>
                      <Button
                        onClick={() => removeFavorite(favorite.artist_id)}
                        variant="outline"
                        size="icon"
                        className="border-purple-500/30"
                      >
                        <Heart className="h-4 w-4 fill-current text-pink-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
