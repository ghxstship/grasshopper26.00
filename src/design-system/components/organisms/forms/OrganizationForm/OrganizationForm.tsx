'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { createOrganization, updateOrganization } from '@/lib/actions/organizations';
import styles from './OrganizationForm.module.css';
import type { Organization } from '@/types/super-expansion';

export interface OrganizationFormProps {
  organization?: Organization;
  mode: 'create' | 'edit';
}

export const OrganizationForm: React.FC<OrganizationFormProps> = ({
  organization,
  mode,
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
      
      if (mode === 'create') {
        await createOrganization(formData);
        router.push('/portal/organizations');
      } else if (organization) {
        await updateOrganization(organization.id, formData);
        router.push(`/portal/organizations/${organization.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>BASIC INFORMATION</h2>
        
        <div className={styles.field}>
          <label htmlFor="organization_name" className={styles.label}>
            ORGANIZATION NAME *
          </label>
          <input
            type="text"
            id="organization_name"
            name="organization_name"
            defaultValue={organization?.organization_name}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="organization_type" className={styles.label}>
            TYPE *
          </label>
          <select
            id="organization_type"
            name="organization_type"
            defaultValue={organization?.organization_type || ''}
            required
            className={styles.select}
          >
            <option value="">SELECT TYPE</option>
            <option value="production_company">PRODUCTION COMPANY</option>
            <option value="venue">VENUE</option>
            <option value="promoter">PROMOTER</option>
            <option value="artist_management">ARTIST MANAGEMENT</option>
            <option value="vendor">VENDOR</option>
          </select>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>CONTACT INFORMATION</h2>
        
        <div className={styles.field}>
          <label htmlFor="primary_email" className={styles.label}>
            EMAIL *
          </label>
          <input
            type="email"
            id="primary_email"
            name="primary_email"
            defaultValue={organization?.primary_email || ''}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="primary_phone" className={styles.label}>
            PHONE
          </label>
          <input
            type="tel"
            id="primary_phone"
            name="primary_phone"
            defaultValue={organization?.primary_phone || ''}
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>ADDRESS</h2>
        
        <div className={styles.field}>
          <label htmlFor="address_line1" className={styles.label}>
            ADDRESS LINE 1
          </label>
          <input
            type="text"
            id="address_line1"
            name="address_line1"
            className={styles.input}
          />
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label htmlFor="city" className={styles.label}>
              CITY
            </label>
            <input
              type="text"
              id="city"
              name="city"
              defaultValue={organization?.city || ''}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="state" className={styles.label}>
              STATE
            </label>
            <input
              type="text"
              id="state"
              name="state"
              defaultValue={organization?.state || ''}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="postal_code" className={styles.label}>
              ZIP
            </label>
            <input
              type="text"
              id="postal_code"
              name="postal_code"
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="country" className={styles.label}>
            COUNTRY
          </label>
          <input
            type="text"
            id="country"
            name="country"
            defaultValue="US"
            className={styles.input}
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
          {isSubmitting ? 'SAVING...' : mode === 'create' ? 'CREATE ORGANIZATION' : 'UPDATE ORGANIZATION'}
        </button>
      </div>
    </form>
  );
};

OrganizationForm.displayName = 'OrganizationForm';
