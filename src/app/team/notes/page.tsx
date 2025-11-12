'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { EventStaffGate } from '@/lib/rbac';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import styles from './page.module.css';

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
          <p className={styles.loadingText}>Loading notes...</p>
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
          <h1 className={styles.title}>Quick Notes</h1>
          <p className={styles.subtitle}>Share updates with your team in real-time</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Type your note here..."
            className={styles.textarea}
            rows={3}
            disabled={submitting}
          />
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={submitting || !newNote.trim()}
          >
            {submitting ? 'Posting...' : 'Post Note'}
          </button>
        </form>

        <div className={styles.notesList}>
          {notes.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>No notes yet</p>
              <p className={styles.emptySubtext}>Be the first to share an update</p>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className={styles.noteCard}>
                <div className={styles.noteHeader}>
                  <span className={styles.noteAuthor}>
                    {note.user_profiles?.display_name || 'Staff Member'}
                  </span>
                  <span className={styles.noteTime}>
                    {new Date(note.created_at).toLocaleString()}
                  </span>
                </div>
                <p className={styles.noteContent}>{note.content}</p>
              </div>
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
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading...</p>
        </div>
      </div>
    }>
      <NotesContent />
    </Suspense>
  );
}
