/**
 * Event Edit Page
 * Edit event details and settings
 */

'use client';

import { use, useEffect, useState } from 'react';
import { ContextualPageTemplate } from '@/design-system/components/templates';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/design-system/components/atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/Card';
import { Input } from '@/design-system/components/atoms/Input';
import { Label } from '@/design-system/components/atoms/Label';
import { Textarea } from '@/design-system/components/atoms/Textarea';
import { Progress } from '@/design-system/components/atoms/Progress/Progress';
import { Alert } from '@/design-system/components/atoms/Alert/Alert';
import { Skeleton } from '@/design-system/components/atoms/Skeleton/Skeleton';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import styles from './edit-content.module.css';

export default function EventEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
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
    setSaveProgress(0);
    setShowSuccess(false);

    try {
      // Simulate progress for better UX
      setSaveProgress(30);
      
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

      setSaveProgress(70);

      if (error) throw error;

      setSaveProgress(100);
      setShowSuccess(true);
      toast.success('Event updated successfully');
      
      setTimeout(() => {
        router.push(`/admin/events/${id}`);
      }, 1500);
    } catch (error: any) {
      toast.error('Failed to update event');
      console.error(error);
      setSaveProgress(0);
    } finally {
      setSaving(false);
    }
  };

  const formCompleteness = () => {
    const fields = [formData.name, formData.location, formData.start_date, formData.end_date, formData.description];
    const filled = fields.filter(f => f && f.trim()).length;
    return (filled / fields.length) * 100;
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
      {showSuccess && (
        <Alert variant="success" className={styles.alert}>
          <CheckCircle style={{ width: 20, height: 20 }} />
          Event updated successfully! Redirecting...
        </Alert>
      )}

      {!loading && formCompleteness() < 100 && (
        <Alert variant="warning" className={styles.alert}>
          <AlertCircle style={{ width: 20, height: 20 }} />
          Please complete all required fields ({Math.round(formCompleteness())}% complete)
        </Alert>
      )}

      {loading ? (
        <Card>
          <CardHeader>
            <Skeleton variant="text" height="2rem" width="12.5rem" />
          </CardHeader>
          <CardContent>
            <div className={styles.skeletonForm}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} variant="rectangular" height="5rem" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <Progress value={formCompleteness()} className={styles.progress} />
          </CardHeader>
          <CardContent>
            {saving && saveProgress > 0 && (
              <div className={styles.savingProgress}>
                <Progress value={saveProgress} />
                <Typography variant="body" as="p" className={styles.savingText}>
                  Saving changes... {saveProgress}%
                </Typography>
              </div>
            )}
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
              <Button type="button" variant="outlined" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      )}
    </ContextualPageTemplate>
  );
}
