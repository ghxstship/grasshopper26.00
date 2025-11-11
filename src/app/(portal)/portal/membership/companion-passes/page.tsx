'use client';

import { useState, useEffect } from 'react';
import { Typography } from '@/design-system/components/atoms/Typography/Typography';
import { Button } from '@/design-system/components/atoms/Button/Button';
import { Input } from '@/design-system/components/atoms/Input/Input';
import { Select } from '@/design-system/components/atoms/Select/Select';
import { Plus, UserPlus, Mail, Phone, Users } from 'lucide-react';
import styles from './companion-passes.module.css';

interface CompanionPass {
  id: string;
  companions_registered: number;
  max_companions: number;
  status: string;
  companion_pass: {
    pass_name: string;
    monthly_price: number;
    annual_price: number;
  };
}

interface Companion {
  id: string;
  companion_name: string;
  companion_email: string;
  companion_phone?: string;
  relationship?: string;
  status: string;
  invitation_accepted_at?: string;
}

export default function CompanionPassesPage() {
  const [passes, setPasses] = useState<CompanionPass[]>([]);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    companion_name: '',
    companion_email: '',
    companion_phone: '',
    relationship: 'friend',
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Fetch user's companion passes
      const passesRes = await fetch('/api/portal/companion-passes');
      const passesData = await passesRes.json();
      setPasses(passesData.passes || []);

      // Fetch companions for each pass
      if (passesData.passes?.length > 0) {
        const companionsRes = await fetch(
          `/api/memberships/companion-passes/${passesData.passes[0].id}/companions`
        );
        const companionsData = await companionsRes.json();
        setCompanions(companionsData.companions || []);
      }
    } catch (error) {
      console.error('Failed to fetch companion passes:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCompanion(e: React.FormEvent) {
    e.preventDefault();
    if (!passes[0]) return;

    try {
      const res = await fetch(
        `/api/memberships/companion-passes/${passes[0].id}/companions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      );

      if (res.ok) {
        setFormData({
          companion_name: '',
          companion_email: '',
          companion_phone: '',
          relationship: 'friend',
        });
        setShowAddForm(false);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to add companion:', error);
    }
  }

  const relationshipOptions = [
    { value: 'partner', label: 'Partner' },
    { value: 'friend', label: 'Friend' },
    { value: 'family', label: 'Family' },
    { value: 'colleague', label: 'Colleague' },
  ];

  if (loading) {
    return (
      <div className={styles.container}>
        <Typography variant="body" as="p">Loading...</Typography>
      </div>
    );
  }

  if (passes.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <Users className={styles.emptyIcon} />
          <Typography variant="h2" as="h2">No Companion Pass</Typography>
          <Typography variant="body" as="p">
            Add a Companion Pass to your membership to share benefits with a guest
          </Typography>
          <Button variant="filled" onClick={() => window.location.href = '/membership'}>
            View Membership Options
          </Button>
        </div>
      </div>
    );
  }

  const activePass = passes[0];
  const canAddMore = activePass.companions_registered < activePass.max_companions;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Typography variant="h1" as="h1">Companion Passes</Typography>
          <Typography variant="body" as="p" className={styles.subtitle}>
            Manage your companion pass and guest access
          </Typography>
        </div>
        {canAddMore && !showAddForm && (
          <Button
            variant="filled"
            onClick={() => setShowAddForm(true)}
          >
            Add Companion
          </Button>
        )}
      </div>

      <div className={styles.passCard}>
        <div className={styles.passHeader}>
          <Typography variant="h3" as="h3">
            {activePass.companion_pass.pass_name}
          </Typography>
          <div className={styles.passStatus}>
            <Typography variant="meta" as="span">
              {activePass.companions_registered} / {activePass.max_companions} companions
            </Typography>
          </div>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddCompanion} className={styles.addForm}>
          <Typography variant="h3" as="h3">Add New Companion</Typography>
          
          <Input
            label="Full Name"
            value={formData.companion_name}
            onChange={(e) => setFormData({ ...formData, companion_name: e.target.value })}
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={formData.companion_email}
            onChange={(e) => setFormData({ ...formData, companion_email: e.target.value })}
            required
          />

          <Input
            label="Phone Number (Optional)"
            type="tel"
            value={formData.companion_phone}
            onChange={(e) => setFormData({ ...formData, companion_phone: e.target.value })}
          />

          <Select
            label="Relationship"
            options={relationshipOptions}
            value={formData.relationship}
            onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
          />

          <div className={styles.formActions}>
            <Button type="button" variant="outlined" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="filled">
              Add Companion
            </Button>
          </div>
        </form>
      )}

      <div className={styles.companionsList}>
        <Typography variant="h3" as="h3">Your Companions</Typography>
        
        {companions.length === 0 ? (
          <div className={styles.emptyCompanions}>
            <Typography variant="body" as="p">
              No companions added yet
            </Typography>
          </div>
        ) : (
          <div className={styles.companionsGrid}>
            {companions.map((companion) => (
              <div key={companion.id} className={styles.companionCard}>
                <div className={styles.companionInfo}>
                  <Typography variant="h4" as="h4">
                    {companion.companion_name}
                  </Typography>
                  <Typography variant="meta" as="p">
                    {companion.companion_email}
                  </Typography>
                  {companion.companion_phone && (
                    <Typography variant="meta" as="p">
                      {companion.companion_phone}
                    </Typography>
                  )}
                  {companion.relationship && (
                    <span className={styles.relationshipBadge}>
                      {companion.relationship}
                    </span>
                  )}
                </div>
                <div className={styles.companionStatus}>
                  {companion.invitation_accepted_at ? (
                    <span className={styles.statusActive}>Active</span>
                  ) : (
                    <span className={styles.statusPending}>Invitation Sent</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
