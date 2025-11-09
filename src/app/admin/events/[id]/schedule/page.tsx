/**
 * Admin Event Schedule & Stages Management Page
 * Manage event stages, build performance schedules, and assign artists
 */

'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/design-system/components/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { Input } from '@/design-system/components/atoms/input';
import { Label } from '@/design-system/components/atoms/label';
import { Badge } from '@/design-system/components/atoms/badge';
import { 
  ArrowLeft, 
  Plus, 
  Save, 
  Trash2, 
  Clock, 
  MapPin,
  Music,
  Calendar,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

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
  const router = useRouter();
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
      // Fetch event details
      const eventRes = await fetch(`/api/admin/events/${id}`);
      const eventData = await eventRes.json();
      setEvent(eventData.event);

      // Fetch stages
      const stagesRes = await fetch(`/api/admin/events/${id}/stages`);
      const stagesData = await stagesRes.json();
      setStages(stagesData.stages || []);

      // Fetch schedule
      const scheduleRes = await fetch(`/api/admin/events/${id}/schedule`);
      const scheduleData = await scheduleRes.json();
      setSchedule(scheduleData.schedule || []);

      // Fetch available artists
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

  async function handleAddStage(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/events/${id}/stages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...stageForm,
          capacity: stageForm.capacity ? parseInt(stageForm.capacity) : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStages([...stages, data.stage]);
        setStageForm({ name: '', capacity: '', location: '' });
        setShowStageForm(false);
        toast.success('Stage added successfully');
      } else {
        toast.error(data.error || 'Failed to add stage');
      }
    } catch (error) {
      console.error('Error adding stage:', error);
      toast.error('Failed to add stage');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteStage(stageId: string) {
    if (!confirm('Are you sure you want to delete this stage?')) return;

    try {
      const response = await fetch(`/api/admin/stages/${stageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setStages(stages.filter(s => s.id !== stageId));
        toast.success('Stage deleted');
      } else {
        toast.error('Failed to delete stage');
      }
    } catch (error) {
      toast.error('Failed to delete stage');
    }
  }

  async function handleAddScheduleItem(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/events/${id}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleForm),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchData(); // Refresh to get updated schedule with names
        setScheduleForm({ stage_id: '', artist_id: '', start_time: '', end_time: '' });
        setShowScheduleForm(false);
        toast.success('Performance scheduled successfully');
      } else {
        toast.error(data.error || 'Failed to schedule performance');
      }
    } catch (error) {
      console.error('Error scheduling performance:', error);
      toast.error('Failed to schedule performance');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteScheduleItem(scheduleId: string) {
    if (!confirm('Are you sure you want to remove this from the schedule?')) return;

    try {
      const response = await fetch(`/api/admin/schedule/${scheduleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSchedule(schedule.filter(s => s.id !== scheduleId));
        toast.success('Schedule item removed');
      } else {
        toast.error('Failed to remove schedule item');
      }
    } catch (error) {
      toast.error('Failed to remove schedule item');
    }
  }

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
            Event Schedule & Stages
          </h1>
          <p className="font-share text-body text-grey-700">
            {event?.name} - Manage stages and build performance schedule
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Stages Management */}
            <div>
              <Card className="border-3 border-black shadow-geometric">
                <CardHeader className="border-b-3 border-black">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-bebas text-h3 uppercase flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Stages
                    </CardTitle>
                    <Button
                      onClick={() => setShowStageForm(!showStageForm)}
                      className="h-10 bg-black text-white hover:bg-white hover:text-black border-3 border-black font-bebas uppercase"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Stage
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {showStageForm && (
                    <form onSubmit={handleAddStage} className="mb-6 p-4 border-3 border-black bg-grey-100">
                      <h3 className="font-bebas text-h4 uppercase mb-4">New Stage</h3>
                      <div className="space-y-4">
                        <div>
                          <Label className="font-bebas uppercase">Stage Name *</Label>
                          <Input
                            value={stageForm.name}
                            onChange={(e) => setStageForm({ ...stageForm, name: e.target.value })}
                            placeholder="Main Stage"
                            required
                            className="border-3 border-black"
                          />
                        </div>
                        <div>
                          <Label className="font-bebas uppercase">Location</Label>
                          <Input
                            value={stageForm.location}
                            onChange={(e) => setStageForm({ ...stageForm, location: e.target.value })}
                            placeholder="North Field"
                            className="border-3 border-black"
                          />
                        </div>
                        <div>
                          <Label className="font-bebas uppercase">Capacity</Label>
                          <Input
                            type="number"
                            value={stageForm.capacity}
                            onChange={(e) => setStageForm({ ...stageForm, capacity: e.target.value })}
                            placeholder="5000"
                            className="border-3 border-black"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-black text-white hover:bg-white hover:text-black border-3 border-black font-bebas uppercase"
                          >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Stage'}
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setShowStageForm(false)}
                            className="bg-white text-black hover:bg-black hover:text-white border-3 border-black font-bebas uppercase"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </form>
                  )}

                  <div className="space-y-3">
                    {stages.length === 0 ? (
                      <p className="text-center py-8 text-grey-600 font-share">
                        No stages added yet. Click &quot;Add Stage&quot; to create one.
                      </p>
                    ) : (
                      stages.map((stage) => (
                        <div
                          key={stage.id}
                          className="border-3 border-black p-4 bg-white hover:bg-grey-50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-bebas text-h4 uppercase">{stage.name}</h4>
                              {stage.location && (
                                <p className="font-share text-small text-grey-600 flex items-center gap-1 mt-1">
                                  <MapPin className="h-3 w-3" />
                                  {stage.location}
                                </p>
                              )}
                              {stage.capacity && (
                                <p className="font-share text-small text-grey-600 mt-1">
                                  Capacity: {stage.capacity.toLocaleString()}
                                </p>
                              )}
                            </div>
                            <Button
                              onClick={() => handleDeleteStage(stage.id)}
                              variant="outline"
                              size="sm"
                              className="border-3 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Schedule Management */}
            <div>
              <Card className="border-3 border-black shadow-geometric">
                <CardHeader className="border-b-3 border-black">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-bebas text-h3 uppercase flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Performance Schedule
                    </CardTitle>
                    <Button
                      onClick={() => setShowScheduleForm(!showScheduleForm)}
                      disabled={stages.length === 0}
                      className="h-10 bg-black text-white hover:bg-white hover:text-black border-3 border-black font-bebas uppercase"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Performance
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {showScheduleForm && (
                    <form onSubmit={handleAddScheduleItem} className="mb-6 p-4 border-3 border-black bg-grey-100">
                      <h3 className="font-bebas text-h4 uppercase mb-4">Schedule Performance</h3>
                      <div className="space-y-4">
                        <div>
                          <Label className="font-bebas uppercase">Artist *</Label>
                          <select
                            value={scheduleForm.artist_id}
                            onChange={(e) => setScheduleForm({ ...scheduleForm, artist_id: e.target.value })}
                            required
                            className="w-full px-4 py-3 border-3 border-black font-share"
                          >
                            <option value="">Select Artist</option>
                            {artists.map((artist) => (
                              <option key={artist.id} value={artist.id}>
                                {artist.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label className="font-bebas uppercase">Stage *</Label>
                          <select
                            value={scheduleForm.stage_id}
                            onChange={(e) => setScheduleForm({ ...scheduleForm, stage_id: e.target.value })}
                            required
                            className="w-full px-4 py-3 border-3 border-black font-share"
                          >
                            <option value="">Select Stage</option>
                            {stages.map((stage) => (
                              <option key={stage.id} value={stage.id}>
                                {stage.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="font-bebas uppercase">Start Time *</Label>
                            <Input
                              type="datetime-local"
                              value={scheduleForm.start_time}
                              onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })}
                              required
                              className="border-3 border-black"
                            />
                          </div>
                          <div>
                            <Label className="font-bebas uppercase">End Time *</Label>
                            <Input
                              type="datetime-local"
                              value={scheduleForm.end_time}
                              onChange={(e) => setScheduleForm({ ...scheduleForm, end_time: e.target.value })}
                              required
                              className="border-3 border-black"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-black text-white hover:bg-white hover:text-black border-3 border-black font-bebas uppercase"
                          >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Schedule'}
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setShowScheduleForm(false)}
                            className="bg-white text-black hover:bg-black hover:text-white border-3 border-black font-bebas uppercase"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </form>
                  )}

                  <div className="space-y-3">
                    {schedule.length === 0 ? (
                      <p className="text-center py-8 text-grey-600 font-share">
                        {stages.length === 0 
                          ? 'Add stages first before scheduling performances.'
                          : 'No performances scheduled yet. Click &quot;Add Performance&quot; to create one.'
                        }
                      </p>
                    ) : (
                      schedule
                        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                        .map((item) => (
                          <div
                            key={item.id}
                            className="border-3 border-black p-4 bg-white hover:bg-grey-50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Music className="h-4 w-4" />
                                  <h4 className="font-bebas text-h4 uppercase">{item.artist_name}</h4>
                                </div>
                                <div className="space-y-1">
                                  <p className="font-share text-small text-grey-600 flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {item.stage_name}
                                  </p>
                                  <p className="font-share text-small text-grey-600 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(item.start_time).toLocaleString()} - {new Date(item.end_time).toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                              <Button
                                onClick={() => item.id && handleDeleteScheduleItem(item.id)}
                                variant="outline"
                                size="sm"
                                className="border-3 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
