/**
 * Event Edit Page
 * Edit event details and settings
 */

'use client';

import { use, useEffect, useState } from 'react';
import { ContextualPageTemplate } from '@/design-system/components/templates';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/design-system/components/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { Input } from '@/design-system/components/atoms/input';
import { Label } from '@/design-system/components/atoms/label';
import { Textarea } from '@/design-system/components/atoms/textarea';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import styles from './edit-content.module.css';

export default function EventEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    capacity: '',
  });

  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setFormData({
        name: data.name || '',
        description: data.description || '',
        location: data.location || '',
        start_date: data.start_date?.slice(0, 16) || '',
        end_date: data.end_date?.slice(0, 16) || '',
        capacity: data.capacity?.toString() || '',
      });
    } catch (error: any) {
      toast.error('Failed to load event');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('events')
        .update({
          name: formData.name,
          description: formData.description,
          location: formData.location,
          start_date: formData.start_date,
          end_date: formData.end_date,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Event updated successfully');
      router.push(`/admin/events/${id}`);
    } catch (error: any) {
      toast.error('Failed to update event');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ContextualPageTemplate
      breadcrumbs={[
        { label: 'Events', href: '/admin/events' },
        { label: formData.name || 'Event', href: `/admin/events/${id}` },
        { label: 'Edit', href: `/admin/events/${id}/edit` }
      ]}
      title="Edit Event"
      subtitle="Update event details and settings"
      loading={loading}
    >
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <Label htmlFor="name">Event Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formField}>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formField}>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formField}>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formField}>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                />
              </div>
            </div>
            <div className={styles.formField}>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className={styles.formActions}>
              <Button type="submit" disabled={saving}>
                <Save className={styles.iconSmall} />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </ContextualPageTemplate>
  );
}
