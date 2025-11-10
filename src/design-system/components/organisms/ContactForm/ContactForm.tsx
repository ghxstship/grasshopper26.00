'use client';

import React, { useState } from 'react';
import styles from './ContactForm.module.css';

export interface ContactFormProps {
  /** Form submission handler */
  onSubmit: (data: ContactFormData) => Promise<void>;
  /** Show success message */
  showSuccessMessage?: boolean;
  /** Success message text */
  successMessage?: string;
  /** Additional CSS class */
  className?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  subscribe?: boolean;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  onSubmit,
  showSuccessMessage = false,
  successMessage = 'MESSAGE SENT SUCCESSFULLY!',
  className = '',
}) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    subscribe: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'NAME IS REQUIRED';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'EMAIL IS REQUIRED';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'INVALID EMAIL ADDRESS';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'SUBJECT IS REQUIRED';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'MESSAGE IS REQUIRED';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        subscribe: false,
      });
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  if (submitted && showSuccessMessage) {
    return (
      <div className={`${styles.form} ${className}`}>
        <div className={styles.successMessage}>{successMessage}</div>
        <button
          className={styles.submitButton}
          onClick={() => setSubmitted(false)}
        >
          SEND ANOTHER MESSAGE
        </button>
      </div>
    );
  }

  return (
    <form className={`${styles.form} ${className}`} onSubmit={handleSubmit}>
      <div className={styles.fieldGroup}>
        <div className={styles.field}>
          <label htmlFor="name" className={styles.label}>
            NAME <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`${styles.input} ${errors.name ? styles.hasError : ''}`}
            placeholder="YOUR NAME"
            disabled={isSubmitting}
          />
          {errors.name && <div className={styles.error}>{errors.name}</div>}
        </div>

        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>
            EMAIL <span className={styles.required}>*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`${styles.input} ${errors.email ? styles.hasError : ''}`}
            placeholder="YOUR@EMAIL.COM"
            disabled={isSubmitting}
          />
          {errors.email && <div className={styles.error}>{errors.email}</div>}
        </div>

        <div className={styles.field}>
          <label htmlFor="subject" className={styles.label}>
            SUBJECT <span className={styles.required}>*</span>
          </label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={`${styles.select} ${errors.subject ? styles.hasError : ''}`}
            disabled={isSubmitting}
          >
            <option value="">SELECT A SUBJECT</option>
            <option value="general">GENERAL INQUIRY</option>
            <option value="tickets">TICKET SUPPORT</option>
            <option value="events">EVENT INFORMATION</option>
            <option value="partnership">PARTNERSHIP</option>
            <option value="press">PRESS INQUIRY</option>
            <option value="other">OTHER</option>
          </select>
          {errors.subject && <div className={styles.error}>{errors.subject}</div>}
        </div>

        <div className={styles.field}>
          <label htmlFor="message" className={styles.label}>
            MESSAGE <span className={styles.required}>*</span>
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            className={`${styles.textarea} ${errors.message ? styles.hasError : ''}`}
            placeholder="YOUR MESSAGE..."
            disabled={isSubmitting}
          />
          {errors.message && <div className={styles.error}>{errors.message}</div>}
        </div>

        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="subscribe"
              checked={formData.subscribe}
              onChange={handleChange}
              className={styles.checkbox}
              disabled={isSubmitting}
            />
            <span>SUBSCRIBE TO NEWSLETTER</span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'SENDING...' : 'SEND MESSAGE'}
      </button>
    </form>
  );
};

ContactForm.displayName = 'ContactForm';
