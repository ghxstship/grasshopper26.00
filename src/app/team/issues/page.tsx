'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { EventStaffGate } from '@/lib/rbac';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import styles from './page.module.css';

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
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No event selected</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading issues...</p>
        </div>
      </div>
    );
  }

  return (
    <EventStaffGate eventId={eventId} fallback={
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>Access Denied: Event staff access required</p>
        </div>
      </div>
    }>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Report Issues</h1>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className={styles.primaryButton}
          >
            {showForm ? 'Cancel' : '+ New Issue'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="title" className={styles.label}>Issue Title</label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.label}>Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={styles.textarea}
                rows={4}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="priority" className={styles.label}>Priority</label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className={styles.select}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <button type="submit" className={styles.submitButton}>
              Submit Issue
            </button>
          </form>
        )}

        <div className={styles.issuesList}>
          {issues.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>No issues reported</p>
              <p className={styles.emptySubtext}>Click &quot;New Issue&quot; to report a problem</p>
            </div>
          ) : (
            issues.map((issue) => (
              <div key={issue.id} className={styles.issueCard}>
                <div className={styles.issueHeader}>
                  <h3 className={styles.issueTitle}>{issue.title}</h3>
                  <span className={`${styles.badge} ${styles[`priority-${issue.priority}`]}`}>
                    {issue.priority}
                  </span>
                </div>
                <p className={styles.issueDescription}>{issue.description}</p>
                <div className={styles.issueFooter}>
                  <span className={`${styles.statusBadge} ${styles[`status-${issue.status}`]}`}>
                    {issue.status}
                  </span>
                  <span className={styles.issueDate}>
                    {new Date(issue.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
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
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading...</p>
        </div>
      </div>
    }>
      <IssuesContent />
    </Suspense>
  );
}
