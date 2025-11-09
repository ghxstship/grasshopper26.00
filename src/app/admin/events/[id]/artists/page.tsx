/**
 * Admin Event Artists Management Page
 * Assign and manage artists for an event
 */

'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/design-system/components/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { Input } from '@/design-system/components/atoms/input';
import { Badge } from '@/design-system/components/atoms/badge';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Music,
  Search,
  Loader2,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import Image from 'next/image';

interface Artist {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  genre_tags?: string[];
  profile_image_url?: string;
  verified: boolean;
}

interface AssignedArtist extends Artist {
  event_artist_id: string;
  billing_order?: number;
  is_headliner: boolean;
}

export default function EventArtistsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [assignedArtists, setAssignedArtists] = useState<AssignedArtist[]>([]);
  const [availableArtists, setAvailableArtists] = useState<Artist[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedArtistId, setSelectedArtistId] = useState('');
  const [isHeadliner, setIsHeadliner] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch event details
      const eventRes = await fetch(`/api/admin/events/${id}`);
      const eventData = await eventRes.json();
      setEvent(eventData.event);

      // Fetch assigned artists
      const assignedRes = await fetch(`/api/admin/events/${id}/artists`);
      const assignedData = await assignedRes.json();
      setAssignedArtists(assignedData.artists || []);

      // Fetch all artists
      const artistsRes = await fetch('/api/admin/artists');
      const artistsData = await artistsRes.json();
      
      // Filter out already assigned artists
      const assignedIds = new Set((assignedData.artists || []).map((a: AssignedArtist) => a.id));
      const available = (artistsData.artists || []).filter((a: Artist) => !assignedIds.has(a.id));
      setAvailableArtists(available);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load event data');
    } finally {
      setLoading(false);
    }
  }

  async function handleAssignArtist(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedArtistId) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/events/${id}/artists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artist_id: selectedArtistId,
          is_headliner: isHeadliner,
          billing_order: assignedArtists.length + 1,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchData(); // Refresh data
        setSelectedArtistId('');
        setIsHeadliner(false);
        setShowAddForm(false);
        toast.success('Artist assigned successfully');
      } else {
        toast.error(data.error || 'Failed to assign artist');
      }
    } catch (error) {
      console.error('Error assigning artist:', error);
      toast.error('Failed to assign artist');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveArtist(eventArtistId: string) {
    if (!confirm('Are you sure you want to remove this artist from the event?')) return;

    try {
      const response = await fetch(`/api/admin/event-artists/${eventArtistId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchData(); // Refresh data
        toast.success('Artist removed from event');
      } else {
        toast.error('Failed to remove artist');
      }
    } catch (error) {
      toast.error('Failed to remove artist');
    }
  }

  async function handleToggleHeadliner(eventArtistId: string, currentStatus: boolean) {
    try {
      const response = await fetch(`/api/admin/event-artists/${eventArtistId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_headliner: !currentStatus }),
      });

      if (response.ok) {
        await fetchData(); // Refresh data
        toast.success(`Artist ${!currentStatus ? 'marked' : 'unmarked'} as headliner`);
      } else {
        toast.error('Failed to update artist');
      }
    } catch (error) {
      toast.error('Failed to update artist');
    }
  }

  const filteredAvailableArtists = availableArtists.filter(artist =>
    artist.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-black" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b-3 border-black py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <Link
            href={`/admin/events/${id}`}
            className="inline-flex items-center gap-2 font-bebas text-body uppercase mb-6 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Event
          </Link>
          <h1 className="font-anton text-hero uppercase mb-2">
            Event Artists
          </h1>
          <p className="font-share text-body text-grey-700">
            {event?.name} - Manage artist lineup and billing
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Assigned Artists */}
            <div>
              <Card className="border-3 border-black shadow-geometric">
                <CardHeader className="border-b-3 border-black">
                  <CardTitle className="font-bebas text-h3 uppercase flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Assigned Artists ({assignedArtists.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {assignedArtists.length === 0 ? (
                    <p className="text-center py-8 text-grey-600 font-share">
                      No artists assigned yet. Add artists from the available list.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {assignedArtists
                        .sort((a, b) => (a.billing_order || 0) - (b.billing_order || 0))
                        .map((artist) => (
                          <div
                            key={artist.event_artist_id}
                            className="border-3 border-black p-4 bg-white hover:bg-grey-50 transition-colors"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-16 h-16 border-3 border-black bg-grey-200 flex-shrink-0 overflow-hidden">
                                {artist.profile_image_url ? (
                                  <Image
                                    src={artist.profile_image_url}
                                    alt={artist.name}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Music className="h-6 w-6 text-grey-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-bebas text-h4 uppercase">{artist.name}</h4>
                                  {artist.is_headliner && (
                                    <Badge className="bg-yellow-400 text-black border-3 border-black">
                                      Headliner
                                    </Badge>
                                  )}
                                  {artist.verified && (
                                    <Badge className="bg-blue-500 text-white border-3 border-black">
                                      <Check className="h-3 w-3" />
                                    </Badge>
                                  )}
                                </div>
                                {artist.genre_tags && artist.genre_tags.length > 0 && (
                                  <p className="font-share text-small text-grey-600">
                                    {artist.genre_tags.slice(0, 3).join(', ')}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleToggleHeadliner(artist.event_artist_id, artist.is_headliner)}
                                  variant="outline"
                                  size="sm"
                                  className="border-3 border-black"
                                >
                                  {artist.is_headliner ? 'Unmark' : 'Mark'} Headliner
                                </Button>
                                <Button
                                  onClick={() => handleRemoveArtist(artist.event_artist_id)}
                                  variant="outline"
                                  size="sm"
                                  className="border-3 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Available Artists */}
            <div>
              <Card className="border-3 border-black shadow-geometric">
                <CardHeader className="border-b-3 border-black">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-bebas text-h3 uppercase flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Available Artists
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Search */}
                  <div className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-grey-400" />
                      <Input
                        placeholder="Search artists..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-3 border-black"
                      />
                    </div>
                  </div>

                  {/* Add Form */}
                  {showAddForm && (
                    <form onSubmit={handleAssignArtist} className="mb-6 p-4 border-3 border-black bg-grey-100">
                      <h3 className="font-bebas text-h4 uppercase mb-4">Assign Artist</h3>
                      <div className="space-y-4">
                        <div>
                          <select
                            value={selectedArtistId}
                            onChange={(e) => setSelectedArtistId(e.target.value)}
                            required
                            className="w-full px-4 py-3 border-3 border-black font-share"
                          >
                            <option value="">Select Artist</option>
                            {filteredAvailableArtists.map((artist) => (
                              <option key={artist.id} value={artist.id}>
                                {artist.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="headliner"
                            checked={isHeadliner}
                            onChange={(e) => setIsHeadliner(e.target.checked)}
                            className="w-5 h-5 border-3 border-black"
                          />
                          <label htmlFor="headliner" className="font-bebas uppercase">
                            Mark as Headliner
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            disabled={saving || !selectedArtistId}
                            className="flex-1 bg-black text-white hover:bg-white hover:text-black border-3 border-black font-bebas uppercase"
                          >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Assign Artist'}
                          </Button>
                          <Button
                            type="button"
                            onClick={() => {
                              setShowAddForm(false);
                              setSelectedArtistId('');
                              setIsHeadliner(false);
                            }}
                            className="bg-white text-black hover:bg-black hover:text-white border-3 border-black font-bebas uppercase"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </form>
                  )}

                  {!showAddForm && (
                    <Button
                      onClick={() => setShowAddForm(true)}
                      disabled={availableArtists.length === 0}
                      className="w-full mb-6 bg-black text-white hover:bg-white hover:text-black border-3 border-black font-bebas uppercase"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Assign Artist to Event
                    </Button>
                  )}

                  {/* Available Artists List */}
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {filteredAvailableArtists.length === 0 ? (
                      <p className="text-center py-8 text-grey-600 font-share">
                        {availableArtists.length === 0 
                          ? 'All artists have been assigned to this event.'
                          : 'No artists found matching your search.'
                        }
                      </p>
                    ) : (
                      filteredAvailableArtists.map((artist) => (
                        <div
                          key={artist.id}
                          className="border-3 border-black p-4 bg-white hover:bg-grey-50 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 border-3 border-black bg-grey-200 flex-shrink-0 overflow-hidden">
                              {artist.profile_image_url ? (
                                <Image
                                  src={artist.profile_image_url}
                                  alt={artist.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Music className="h-5 w-5 text-grey-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bebas text-body uppercase">{artist.name}</h4>
                                {artist.verified && (
                                  <Badge className="bg-blue-500 text-white border-2 border-black text-xs">
                                    <Check className="h-3 w-3" />
                                  </Badge>
                                )}
                              </div>
                              {artist.genre_tags && artist.genre_tags.length > 0 && (
                                <p className="font-share text-small text-grey-600">
                                  {artist.genre_tags.slice(0, 3).join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
