/**
 * Admin Event Artists Management Page
 * Assign and manage artists for an event
 */

'use client';

import { use, useEffect, useState } from 'react';
import { SplitLayout } from '@/design-system';
import { Button } from '@/design-system';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system';
import { Input } from '@/design-system';
import { Badge } from '@/design-system';
import { Plus, Trash2, Music, Search, Check } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import styles from './artists-content.module.css';

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
      const eventRes = await fetch(`/api/admin/events/${id}`);
      const eventData = await eventRes.json();
      setEvent(eventData.event);

      const assignedRes = await fetch(`/api/admin/events/${id}/artists`);
      const assignedData = await assignedRes.json();
      setAssignedArtists(assignedData.artists || []);

      const artistsRes = await fetch('/api/admin/artists');
      const artistsData = await artistsRes.json();
      
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
        await fetchData();
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
        await fetchData();
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
        await fetchData();
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

  const assignedArtistsPane = (
    <Card>
      <CardHeader>
        <CardTitle className={styles.cardTitle}>
          <Music className={styles.iconInline} />
          Assigned Artists ({assignedArtists.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {assignedArtists.length === 0 ? (
          <p className={styles.emptyText}>
            No artists assigned yet. Add artists from the available list.
          </p>
        ) : (
          <div className={styles.artistsList}>
            {assignedArtists
              .sort((a, b) => (a.billing_order || 0) - (b.billing_order || 0))
              .map((artist) => (
                <div key={artist.event_artist_id} className={styles.artistItem}>
                  <div className={styles.artistContent}>
                    <div className={styles.artistImageWrapper}>
                      {artist.profile_image_url ? (
                        <Image
                          src={artist.profile_image_url}
                          alt={artist.name}
                          width={64}
                          height={64}
                          className={styles.artistImage}
                        />
                      ) : (
                        <div className={styles.artistImagePlaceholder}>
                          <Music className={styles.iconSmall} />
                        </div>
                      )}
                    </div>
                    <div className={styles.artistInfo}>
                      <div className={styles.artistHeader}>
                        <h4 className={styles.artistName}>{artist.name}</h4>
                        {artist.is_headliner && (
                          <Badge variant="default">Headliner</Badge>
                        )}
                        {artist.verified && (
                          <Badge variant="outline">
                            <Check className={styles.iconSmall} />
                          </Badge>
                        )}
                      </div>
                      {artist.genre_tags && artist.genre_tags.length > 0 && (
                        <p className={styles.genreTags}>
                          {artist.genre_tags.slice(0, 3).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className={styles.artistActions}>
                      <Button
                        onClick={() => handleToggleHeadliner(artist.event_artist_id, artist.is_headliner)}
                        variant="outlined"
                        size="sm"
                      >
                        {artist.is_headliner ? 'Unmark' : 'Mark'} Headliner
                      </Button>
                      <Button
                        onClick={() => handleRemoveArtist(artist.event_artist_id)}
                        variant="outlined"
                        size="sm"
                      >
                        <Trash2 className={styles.iconSmall} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const availableArtistsPane = (
    <Card>
      <CardHeader>
        <CardTitle className={styles.cardTitle}>
          <Plus className={styles.iconInline} />
          Available Artists
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <Input
            placeholder="Search artists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {showAddForm && (
          <form onSubmit={handleAssignArtist} className={styles.addForm}>
            <h3 className={styles.formTitle}>Assign Artist</h3>
            <div className={styles.formFields}>
              <select
                value={selectedArtistId}
                onChange={(e) => setSelectedArtistId(e.target.value)}
                required
                className={styles.select}
              >
                <option value="">Select Artist</option>
                {filteredAvailableArtists.map((artist) => (
                  <option key={artist.id} value={artist.id}>
                    {artist.name}
                  </option>
                ))}
              </select>
              <div className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  id="headliner"
                  checked={isHeadliner}
                  onChange={(e) => setIsHeadliner(e.target.checked)}
                  className={styles.checkbox}
                />
                <label htmlFor="headliner" className={styles.checkboxLabel}>
                  Mark as Headliner
                </label>
              </div>
              <div className={styles.formActions}>
                <Button type="submit" disabled={saving || !selectedArtistId}>
                  {saving ? 'Assigning...' : 'Assign Artist'}
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => {
                    setShowAddForm(false);
                    setSelectedArtistId('');
                    setIsHeadliner(false);
                  }}
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
            className={styles.addButton}
          >
            <Plus className={styles.iconSmall} />
            Assign Artist to Event
          </Button>
        )}

        <div className={styles.artistsList}>
          {filteredAvailableArtists.length === 0 ? (
            <p className={styles.emptyText}>
              {availableArtists.length === 0 
                ? 'All artists have been assigned to this event.'
                : 'No artists found matching your search.'
              }
            </p>
          ) : (
            filteredAvailableArtists.map((artist) => (
              <div key={artist.id} className={styles.artistItem}>
                <div className={styles.artistContent}>
                  <div className={styles.artistImageWrapper}>
                    {artist.profile_image_url ? (
                      <Image
                        src={artist.profile_image_url}
                        alt={artist.name}
                        width={48}
                        height={48}
                        className={styles.artistImage}
                      />
                    ) : (
                      <div className={styles.artistImagePlaceholder}>
                        <Music className={styles.iconSmall} />
                      </div>
                    )}
                  </div>
                  <div className={styles.artistInfo}>
                    <div className={styles.artistHeader}>
                      <h4 className={styles.artistName}>{artist.name}</h4>
                      {artist.verified && (
                        <Badge variant="outline">
                          <Check className={styles.iconSmall} />
                        </Badge>
                      )}
                    </div>
                    {artist.genre_tags && artist.genre_tags.length > 0 && (
                      <p className={styles.genreTags}>
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
  );

  return (
    <SplitLayout
      ratio="50-50"
      left={assignedArtistsPane}
      right={availableArtistsPane}
    />
  );
}
