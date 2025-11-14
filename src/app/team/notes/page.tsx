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
  Textarea,
  Heading,
  Text,
  Stack,
  Spinner
} from '@/design-system';
import styles from './notes.module.css';

interface Note {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
  user_profiles?: {
    display_name: string;
  };
}

function NotesContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  const { user } = useAuth();
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (eventId) {
      loadNotes();
      
      // Set up real-time subscription
      const supabase = createClient();
      const channel = supabase
        .channel(`event_notes:${eventId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'event_notes',
            filter: `event_id=eq.${eventId}`,
          },
          () => {
            loadNotes();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [eventId]);

  async function loadNotes() {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('event_notes')
        .select(`
          id,
          content,
          created_at,
          created_by,
          user_profiles(display_name)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotes(data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!eventId || !user || !newNote.trim()) return;

    setSubmitting(true);

    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('event_notes')
        .insert({
          event_id: eventId,
          content: newNote.trim(),
          created_by: user.id,
        });

      if (error) throw error;

      setNewNote('');
      loadNotes();
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Failed to create note');
    } finally {
      setSubmitting(false);
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
          <Text color="secondary">Loading notes...</Text>
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
          <Stack gap={2}>
            <Heading level={1}>Quick Notes</Heading>
            <Text color="secondary">Share updates with your team in real-time</Text>
          </Stack>
        </div>

        <Card className={styles.form}>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Stack gap={3}>
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Type your note here..."
                  rows={3}
                  disabled={submitting}
                />
                <Button 
                  type="submit" 
                  variant="primary"
                  fullWidth
                  disabled={submitting || !newNote.trim()}
                >
                  {submitting ? 'Posting...' : 'Post Note'}
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>

        <div className={styles.notesList}>
          {notes.length === 0 ? (
            <div className={styles.emptyState}>
              <Stack gap={2} align="center">
                <Text size="lg" weight="bold">No notes yet</Text>
                <Text color="secondary">Be the first to share an update</Text>
              </Stack>
            </div>
          ) : (
            notes.map((note) => (
              <Card key={note.id} className={styles.noteCard}>
                <CardContent>
                  <div className={styles.noteHeader}>
                    <Text weight="bold">
                      {note.user_profiles?.display_name || 'Staff Member'}
                    </Text>
                    <Text size="sm" color="secondary">
                      {new Date(note.created_at).toLocaleString()}
                    </Text>
                  </div>
                  <Text>{note.content}</Text>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </EventStaffGate>
  );
}

export default function StaffNotesPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <Spinner size="lg" />
          <Text color="secondary">Loading...</Text>
        </div>
      </div>
    }>
      <NotesContent />
    </Suspense>
  );
}
