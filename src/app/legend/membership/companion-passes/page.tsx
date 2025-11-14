'use client';

import { useState, useEffect } from 'react';
import { Heading, Text, Button, Input, Select, Stack } from '@/design-system';
import { Users } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);
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
      setError(null);
      // Fetch user's companion passes
      const passesRes = await fetch('/api/portal/companion-passes');
      
      if (!passesRes.ok) {
        if (passesRes.status === 401) {
          setError('Please sign in to view companion passes');
        } else {
          const errorData = await passesRes.json();
          setError(errorData.error || 'Failed to load companion passes');
        }
        setLoading(false);
        return;
      }

      const passesData = await passesRes.json();
      setPasses(passesData.passes || []);

      // Fetch companions for each pass
      if (passesData.passes?.length > 0) {
        const companionsRes = await fetch(
          `/api/memberships/companion-passes/${passesData.passes[0].id}/companions`
        );
        
        if (companionsRes.ok) {
          const companionsData = await companionsRes.json();
          setCompanions(companionsData.companions || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch companion passes:', error);
      setError('Network error: Unable to load companion passes');
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
        <Text>Loading...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <Heading level={2}>Error</Heading>
          <Text>{error}</Text>
          <Button variant="primary" onClick={fetchData}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (passes.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <Users className={styles.emptyIcon} />
          <Heading level={2}>No Companion Pass</Heading>
          <Text>
            Add a Companion Pass to your membership to share benefits with a guest
          </Text>
          <Button variant="primary" onClick={() => window.location.href = '/membership'}>
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
          <Heading level={1}>Companion Passes</Heading>
          <Text className={styles.subtitle}>
            Manage your companion pass and guest access
          </Text>
        </div>
        {canAddMore && !showAddForm && (
          <Button
            variant="primary"
            onClick={() => setShowAddForm(true)}
          >
            Add Companion
          </Button>
        )}
      </div>

      <div className={styles.passCard}>
        <div className={styles.passHeader}>
          <Heading level={3}>
            {activePass.companion_pass.pass_name}
          </Heading>
          <div className={styles.passStatus}>
            <Text size="sm">
              {activePass.companions_registered} / {activePass.max_companions} companions
            </Text>
          </div>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddCompanion} className={styles.addForm}>
          <Heading level={3}>Add New Companion</Heading>
          
          <Stack gap={2}>
            <Text size="sm" weight="medium">Full Name</Text>
            <Input
              value={formData.companion_name}
              onChange={(e) => setFormData({ ...formData, companion_name: e.target.value })}
              required
              fullWidth
            />
          </Stack>

          <Stack gap={2}>
            <Text size="sm" weight="medium">Email Address</Text>
            <Input
              type="email"
              value={formData.companion_email}
              onChange={(e) => setFormData({ ...formData, companion_email: e.target.value })}
              required
              fullWidth
            />
          </Stack>

          <Stack gap={2}>
            <Text size="sm" weight="medium">Phone Number (Optional)</Text>
            <Input
              type="tel"
              value={formData.companion_phone}
              onChange={(e) => setFormData({ ...formData, companion_phone: e.target.value })}
              fullWidth
            />
          </Stack>

          <Stack gap={2}>
            <Text size="sm" weight="medium">Relationship</Text>
            <Select
              options={relationshipOptions}
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              fullWidth
            />
          </Stack>

          <div className={styles.formActions}>
            <Button type="button" variant="secondary" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Companion
            </Button>
          </div>
        </form>
      )}

      <div className={styles.companionsList}>
        <Heading level={3}>Your Companions</Heading>
        
        {companions.length === 0 ? (
          <div className={styles.emptyCompanions}>
            <Text>
              No companions added yet
            </Text>
          </div>
        ) : (
          <div className={styles.companionsGrid}>
            {companions.map((companion) => (
              <div key={companion.id} className={styles.companionCard}>
                <div className={styles.companionInfo}>
                  <Heading level={4}>
                    {companion.companion_name}
                  </Heading>
                  <Text size="sm">
                    {companion.companion_email}
                  </Text>
                  {companion.companion_phone && (
                    <Text size="sm">
                      {companion.companion_phone}
                    </Text>
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
