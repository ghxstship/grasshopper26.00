/**
 * Admin Event Schedule & Stages Management Page
 * Manage event stages, build performance schedules, and assign artists
 */

'use client';

import { use, useEffect, useState } from 'react';
import { ContextualPageTemplate } from '@/design-system';
import { Button } from '@/design-system';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system';
import { Input } from '@/design-system';
import { Label } from '@/design-system';
import { Badge } from '@/design-system';
import { Plus, Save, Trash2, Clock, MapPin, Music, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import styles from './schedule-content.module.css';

interface Stage {
  id: string;
  name: string;
  capacity?: number;
  location?: string;
}

interface ScheduleItem {
  id?: string;
  stage_id: string;
  artist_id: string;
  start_time: string;
  end_time: string;
  artist_name?: string;
  stage_name?: string;
}

export default function EventSchedulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [showStageForm, setShowStageForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [stageForm, setStageForm] = useState({ name: '', capacity: '', location: '' });
  const [scheduleForm, setScheduleForm] = useState({
    stage_id: '',
    artist_id: '',
    start_time: '',
    end_time: '',
  });

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

      const stagesRes = await fetch(`/api/admin/events/${id}/stages`);
      const stagesData = await stagesRes.json();
      setStages(stagesData.stages || []);

      const scheduleRes = await fetch(`/api/admin/events/${id}/schedule`);
      const scheduleData = await scheduleRes.json();
      setSchedule(scheduleData.schedule || []);

      const artistsRes = await fetch('/api/admin/artists');
      const artistsData = await artistsRes.json();
      setArtists(artistsData.artists || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load event data');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateStage(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/events/${id}/stages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: stageForm.name,
          capacity: stageForm.capacity ? parseInt(stageForm.capacity) : null,
          location: stageForm.location || null,
        }),
      });

      if (response.ok) {
        await fetchData();
        setStageForm({ name: '', capacity: '', location: '' });
        setShowStageForm(false);
        toast.success('Stage created successfully');
      } else {
        toast.error('Failed to create stage');
      }
    } catch (error) {
      toast.error('Failed to create stage');
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateScheduleItem(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/events/${id}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleForm),
      });

      if (response.ok) {
        await fetchData();
        setScheduleForm({ stage_id: '', artist_id: '', start_time: '', end_time: '' });
        setShowScheduleForm(false);
        toast.success('Schedule item added successfully');
      } else {
        toast.error('Failed to add schedule item');
      }
    } catch (error) {
      toast.error('Failed to add schedule item');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteScheduleItem(itemId: string) {
    if (!confirm('Are you sure you want to delete this schedule item?')) return;

    try {
      const response = await fetch(`/api/admin/schedule/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchData();
        toast.success('Schedule item deleted');
      } else {
        toast.error('Failed to delete schedule item');
      }
    } catch (error) {
      toast.error('Failed to delete schedule item');
    }
  }

  return (
    <ContextualPageTemplate
      breadcrumbs={[
        { label: 'Events', href: '/admin/events' },
        { label: event?.name || 'Event', href: `/admin/events/${id}` },
        { label: 'Schedule', href: `/admin/events/${id}/schedule` }
      ]}
      title="Event Schedule"
      subtitle={event?.name ? `${event.name} - Manage stages and performance schedule` : 'Manage stages and performance schedule'}
      loading={loading}
    >
      <Card>
              <CardHeader>
                <div className={styles.cardHeaderRow}>
                  <CardTitle>
                    <MapPin className={styles.iconInline} />
                    Stages ({stages.length})
                  </CardTitle>
                  <Button onClick={() => setShowStageForm(!showStageForm)} size="sm">
                    <Plus className={styles.iconSmall} />
                    Add Stage
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showStageForm && (
                  <form onSubmit={handleCreateStage} className={styles.form}>
                    <div className={styles.formFields}>
                      <div className={styles.formField}>
                        <Label htmlFor="stage-name">Stage Name</Label>
                        <Input
                          id="stage-name"
                          value={stageForm.name}
                          onChange={(e) => setStageForm({ ...stageForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className={styles.formField}>
                        <Label htmlFor="stage-capacity">Capacity</Label>
                        <Input
                          id="stage-capacity"
                          type="number"
                          value={stageForm.capacity}
                          onChange={(e) => setStageForm({ ...stageForm, capacity: e.target.value })}
                        />
                      </div>
                      <div className={styles.formField}>
                        <Label htmlFor="stage-location">Location</Label>
                        <Input
                          id="stage-location"
                          value={stageForm.location}
                          onChange={(e) => setStageForm({ ...stageForm, location: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className={styles.formActions}>
                      <Button type="submit" disabled={saving}>
                        <Save className={styles.iconSmall} />
                        Save Stage
                      </Button>
                      <Button type="button" variant="outlined" onClick={() => setShowStageForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                <div className={styles.stagesList}>
                  {stages.map((stage) => (
                    <div key={stage.id} className={styles.stageItem}>
                      <div className={styles.stageInfo}>
                        <h4 className={styles.stageName}>{stage.name}</h4>
                        {stage.location && (
                          <p className={styles.stageDetail}>
                            <MapPin className={styles.iconSmall} />
                            {stage.location}
                          </p>
                        )}
                        {stage.capacity && (
                          <p className={styles.stageDetail}>Capacity: {stage.capacity}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

      <Card>
              <CardHeader>
                <div className={styles.cardHeaderRow}>
                  <CardTitle>
                    <Calendar className={styles.iconInline} />
                    Performance Schedule ({schedule.length})
                  </CardTitle>
                  <Button onClick={() => setShowScheduleForm(!showScheduleForm)} size="sm">
                    <Plus className={styles.iconSmall} />
                    Add Performance
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showScheduleForm && (
                  <form onSubmit={handleCreateScheduleItem} className={styles.form}>
                    <div className={styles.formFields}>
                      <div className={styles.formField}>
                        <Label htmlFor="schedule-stage">Stage</Label>
                        <select
                          id="schedule-stage"
                          value={scheduleForm.stage_id}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, stage_id: e.target.value })}
                          required
                          className={styles.select}
                        >
                          <option value="">Select Stage</option>
                          {stages.map((stage) => (
                            <option key={stage.id} value={stage.id}>
                              {stage.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className={styles.formField}>
                        <Label htmlFor="schedule-artist">Artist</Label>
                        <select
                          id="schedule-artist"
                          value={scheduleForm.artist_id}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, artist_id: e.target.value })}
                          required
                          className={styles.select}
                        >
                          <option value="">Select Artist</option>
                          {artists.map((artist) => (
                            <option key={artist.id} value={artist.id}>
                              {artist.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className={styles.formField}>
                        <Label htmlFor="schedule-start">Start Time</Label>
                        <Input
                          id="schedule-start"
                          type="datetime-local"
                          value={scheduleForm.start_time}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })}
                          required
                        />
                      </div>
                      <div className={styles.formField}>
                        <Label htmlFor="schedule-end">End Time</Label>
                        <Input
                          id="schedule-end"
                          type="datetime-local"
                          value={scheduleForm.end_time}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, end_time: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className={styles.formActions}>
                      <Button type="submit" disabled={saving}>
                        <Save className={styles.iconSmall} />
                        Add to Schedule
                      </Button>
                      <Button type="button" variant="outlined" onClick={() => setShowScheduleForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                <div className={styles.scheduleList}>
                  {schedule
                    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                    .map((item) => (
                      <div key={item.id} className={styles.scheduleItem}>
                        <div className={styles.scheduleInfo}>
                          <div className={styles.scheduleHeader}>
                            <Music className={styles.iconSmall} />
                            <h4 className={styles.artistName}>{item.artist_name}</h4>
                            <Badge variant="outline">{item.stage_name}</Badge>
                          </div>
                          <p className={styles.scheduleTime}>
                            <Clock className={styles.iconSmall} />
                            {new Date(item.start_time).toLocaleString()} - {new Date(item.end_time).toLocaleTimeString()}
                          </p>
                        </div>
                        <Button
                          variant="outlined"
                          size="sm"
                          onClick={() => item.id && handleDeleteScheduleItem(item.id)}
                        >
                          <Trash2 className={styles.iconSmall} />
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
    </ContextualPageTemplate>
  );
}
