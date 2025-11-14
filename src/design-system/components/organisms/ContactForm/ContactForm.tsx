/**
 * ContactForm - Contact form organism
 * GHXSTSHIP Atomic Design System
 */

'use client';

import { useState } from 'react';
import { Stack, Button } from '../../atoms';
import { FormField } from '../../molecules';
import styles from './ContactForm.module.css';

export interface ContactFormProps {
  /** Submit handler */
  onSubmit?: (data: ContactFormData) => Promise<void>;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function ContactForm({ onSubmit }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Stack gap={4}>
        <FormField
          label="Name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          fullWidth
          placeholder="Your name"
        />

        <FormField
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          fullWidth
          placeholder="your@email.com"
        />

        <FormField
          label="Subject"
          type="text"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          required
          fullWidth
          placeholder="What is this about?"
        />

        <Stack gap={2}>
          <label htmlFor="message" className={styles.label}>
            Message
          </label>
          <textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
            className={styles.textarea}
            placeholder="Your message..."
            rows={6}
          />
        </Stack>

        {success && (
          <div className={styles.success}>
            Message sent successfully! We&apos;ll get back to you soon.
          </div>
        )}

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
          Send Message
        </Button>
      </Stack>
    </form>
  );
}
