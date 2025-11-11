'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { createEvent } from '@/lib/actions/events';
import styles from './EventForm.module.css';

export interface EventFormProps {
  organizationId: string;
  venues?: Array<{ id: string; venue_name: string; city: string }>;
}

export const EventForm: React.FC<EventFormProps> = ({
  organizationId,
  venues = [],
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const event = await createEvent(organizationId, formData);
      router.push(`/portal/events/${event.id}/dashboard`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>EVENT DETAILS</h2>
        
        <div className={styles.field}>
          <label htmlFor="event_name" className={styles.label}>
            EVENT NAME *
          </label>
          <input
            type="text"
            id="event_name"
            name="event_name"
            required
            className={styles.input}
            placeholder="e.g., Summer Music Festival 2025"
          />
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label htmlFor="event_start_date" className={styles.label}>
              START DATE *
            </label>
            <input
              type="datetime-local"
              id="event_start_date"
              name="event_start_date"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="event_end_date" className={styles.label}>
              END DATE
            </label>
            <input
              type="datetime-local"
              id="event_end_date"
              name="event_end_date"
              className={styles.input}
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>VENUE & CAPACITY</h2>
        
        <div className={styles.field}>
          <label htmlFor="venue_id" className={styles.label}>
            VENUE
          </label>
          <select
            id="venue_id"
            name="venue_id"
            className={styles.select}
          >
            <option value="">SELECT VENUE</option>
            {venues.map((venue) => (
              <option key={venue.id} value={venue.id}>
                {venue.venue_name} - {venue.city}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="total_capacity" className={styles.label}>
            TOTAL CAPACITY *
          </label>
          <input
            type="number"
            id="total_capacity"
            name="total_capacity"
            min="1"
            required
            className={styles.input}
            placeholder="0"
          />
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          onClick={() => router.back()}
          className={styles.buttonSecondary}
          disabled={isSubmitting}
        >
          CANCEL
        </button>
        <button
          type="submit"
          className={styles.buttonPrimary}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'CREATING...' : 'CREATE EVENT'}
        </button>
      </div>
    </form>
  );
};

EventForm.displayName = 'EventForm';
