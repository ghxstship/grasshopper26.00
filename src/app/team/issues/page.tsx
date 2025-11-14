'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { EventStaffGate } from '@/lib/rbac';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Textarea,
  Select,
  Heading,
  Text,
  Stack,
  Spinner,
  Badge
} from '@/design-system';
import styles from './issues.module.css';

interface Issue {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
  reported_by: string;
}

function IssuesContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  const { user } = useAuth();
  
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
  });

  useEffect(() => {
    if (eventId) {
      loadIssues();
    }
  }, [eventId]);

  async function loadIssues() {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('event_issues')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setIssues(data || []);
    } catch (error) {
      console.error('Error loading issues:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!eventId || !user) return;

    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('event_issues')
        .insert({
          event_id: eventId,
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          status: 'open',
          reported_by: user.id,
        });

      if (error) throw error;

      setFormData({ title: '', description: '', priority: 'medium' });
      setShowForm(false);
      loadIssues();
    } catch (error) {
      console.error('Error creating issue:', error);
      alert('Failed to create issue');
    }
  }

  if (!eventId) {
    return (
      <div className={styles.container}>
        <Card>
          <CardContent>
            <Text>No event selected</Text>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <Spinner size="lg" />
          <Text color="secondary">Loading issues...</Text>
        </div>
      </div>
    );
  }

  return (
    <EventStaffGate eventId={eventId} fallback={
      <div className={styles.container}>
        <Card>
          <CardContent>
            <Text>Access Denied: Event staff access required</Text>
          </CardContent>
        </Card>
      </div>
    }>
      <div className={styles.container}>
        <div className={styles.header}>
          <Heading level={1}>Report Issues</Heading>
          <Button 
            variant={showForm ? 'secondary' : 'primary'}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ New Issue'}
          </Button>
        </div>

        {showForm && (
          <Card className={styles.form}>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Stack gap={4}>
                  <div>
                    <Text as="label" weight="bold">Issue Title</Text>
                    <Input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Text as="label" weight="bold">Description</Text>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <Text as="label" weight="bold">Priority</Text>
                    <Select
                      options={[
                        { value: 'low', label: 'Low' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'high', label: 'High' },
                        { value: 'critical', label: 'Critical' }
                      ]}
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    />
                  </div>

                  <Button type="submit" variant="primary" fullWidth>
                    Submit Issue
                  </Button>
                </Stack>
              </form>
            </CardContent>
          </Card>
        )}

        <div className={styles.issuesList}>
          {issues.length === 0 ? (
            <div className={styles.emptyState}>
              <Stack gap={2} align="center">
                <Text size="lg" weight="bold">No issues reported</Text>
                <Text color="secondary">Click &quot;New Issue&quot; to report a problem</Text>
              </Stack>
            </div>
          ) : (
            issues.map((issue) => (
              <Card key={issue.id} className={styles.issueCard}>
                <CardContent>
                  <div className={styles.issueHeader}>
                    <Heading level={3}>{issue.title}</Heading>
                    <Badge variant={issue.priority === 'critical' || issue.priority === 'high' ? 'solid' : 'default'}>
                      {issue.priority}
                    </Badge>
                  </div>
                  <Text>{issue.description}</Text>
                  <div className={styles.issueFooter}>
                    <Badge variant={issue.status === 'resolved' ? 'solid' : 'outline'}>
                      {issue.status.replace('_', ' ')}
                    </Badge>
                    <Text size="sm" color="secondary">
                      {new Date(issue.created_at).toLocaleString()}
                    </Text>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </EventStaffGate>
  );
}

export default function StaffIssuesPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <Spinner size="lg" />
          <Text color="secondary">Loading...</Text>
        </div>
      </div>
    }>
      <IssuesContent />
    </Suspense>
  );
}
