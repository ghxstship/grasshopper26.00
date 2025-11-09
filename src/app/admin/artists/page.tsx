'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/design-system/components/atoms/card';
import { Button } from '@/design-system/components/atoms/button';
import { Input } from '@/design-system/components/atoms/input';
import { Badge } from '@/design-system/components/atoms/badge';
import { Search, Plus, Edit, Trash2, Music } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

interface Artist {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  genre_tags?: string[];
  profile_image_url?: string;
  verified: boolean;
  created_at: string;
}

export default function AdminArtistsPage() {
  const supabase = createClient();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchArtists();
  }, []);

  async function fetchArtists() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/artists');
      const data = await response.json();
      
      if (response.ok) {
        setArtists(data.artists || []);
      }
    } catch (error) {
      console.error('Error fetching artists:', error);
      toast.error('Failed to load artists');
    } finally {
      setLoading(false);
    }
  }

  async function deleteArtist(id: string) {
    if (!confirm('Are you sure you want to delete this artist?')) return;

    try {
      const response = await fetch(`/api/admin/artists?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setArtists(artists.filter(a => a.id !== id));
        toast.success('Artist deleted');
      } else {
        toast.error('Failed to delete artist');
      }
    } catch (error) {
      toast.error('Failed to delete artist');
    }
  }

  const filteredArtists = artists.filter(artist =>
    artist.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen  py-12 px-4" style={{ background: 'var(--gradient-hero)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold  bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-brand-primary)' }}>
              Artist Management
            </h1>
            <p className="text-gray-400 mt-2">Manage artist profiles and information</p>
          </div>
          <Button
            asChild
            className="" style={{ background: 'var(--gradient-brand-primary)' }}
          >
            <Link href="/admin/artists/create">
              <Plus className="h-4 w-4 mr-2" />
              Add Artist
            </Link>
          </Button>
        </div>

        <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20 mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search artists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black/50 border-purple-500/30"
              />
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
            <CardContent className="p-12 text-center">
              <p className="text-gray-400">Loading artists...</p>
            </CardContent>
          </Card>
        ) : filteredArtists.length === 0 ? (
          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
            <CardContent className="p-12 text-center">
              <Music className="h-16 w-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">No artists found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtists.map((artist) => (
              <Card key={artist.id} className="bg-black/40 backdrop-blur-lg border-purple-500/20 hover:bg-black/60 transition-all">
                <CardContent className="p-6">
                  <div className="aspect-square rounded-lg overflow-hidden mb-4 bg-gradient-to-br from-purple-900 to-pink-900">
                    {artist.profile_image_url ? (
                      <Image
                        src={artist.profile_image_url}
                        alt={artist.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="h-16 w-16 text-white/20" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white">{artist.name}</h3>
                        {artist.verified && (
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            Verified
                          </Badge>
                        )}
                      </div>
                      {artist.genre_tags && artist.genre_tags.length > 0 && (
                        <p className="text-sm text-gray-400">
                          {artist.genre_tags.slice(0, 3).join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="flex-1 border-purple-500/30"
                      >
                        <Link href={`/admin/artists/${artist.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        onClick={() => deleteArtist(artist.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
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
