'use client';

import styles from './page.module.css';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { requireAdmin } from '@/lib/api/middleware';
import { useSearchParams } from 'next/navigation';

interface PricingTier {
  id: string;
  name: string;
  base_price: number;
  capacity_threshold: number;
  time_threshold_days: number;
  is_active: boolean;
}

interface DynamicPricingConfig {
  event_id: string;
  enabled: boolean;
  pricing_strategy: 'demand_based' | 'time_based' | 'hybrid';
  min_price: number;
  max_price: number;
  tiers: PricingTier[];
}

export default function DynamicPricingPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  
  const [config, setConfig] = useState<DynamicPricingConfig>({
    event_id: eventId || '',
    enabled: false,
    pricing_strategy: 'hybrid',
    min_price: 0,
    max_price: 0,
    tiers: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (eventId) {
      loadConfig();
    }
  }, [eventId]);

  async function loadConfig() {
    try {
      const supabase = createClient();
      
      // Load existing config or create default
      const { data, error } = await supabase
        .from('dynamic_pricing_configs')
        .select('*')
        .eq('event_id', eventId)
        .single();

      if (data) {
        setConfig(data);
      } else {
        // Create default tiers
        setConfig(prev => ({
          ...prev,
          tiers: [
            {
              id: crypto.randomUUID(),
              name: 'Early Bird',
              base_price: 50,
              capacity_threshold: 25,
              time_threshold_days: 30,
              is_active: true,
            },
            {
              id: crypto.randomUUID(),
              name: 'Regular',
              base_price: 75,
              capacity_threshold: 75,
              time_threshold_days: 7,
              is_active: true,
            },
            {
              id: crypto.randomUUID(),
              name: 'Last Minute',
              base_price: 100,
              capacity_threshold: 100,
              time_threshold_days: 0,
              is_active: true,
            },
          ],
        }));
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('dynamic_pricing_configs')
        .upsert({
          event_id: eventId,
          enabled: config.enabled,
          pricing_strategy: config.pricing_strategy,
          min_price: config.min_price,
          max_price: config.max_price,
          tiers: config.tiers,
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Dynamic pricing configuration saved' });
    } catch (error: any) {
      console.error('Error saving config:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to save configuration' });
    } finally {
      setSaving(false);
    }
  }

  function addTier() {
    setConfig({
      ...config,
      tiers: [
        ...config.tiers,
        {
          id: crypto.randomUUID(),
          name: `Tier ${config.tiers.length + 1}`,
          base_price: 0,
          capacity_threshold: 0,
          time_threshold_days: 0,
          is_active: true,
        },
      ],
    });
  }

  function removeTier(id: string) {
    setConfig({
      ...config,
      tiers: config.tiers.filter(t => t.id !== id),
    });
  }

  function updateTier(id: string, updates: Partial<PricingTier>) {
    setConfig({
      ...config,
      tiers: config.tiers.map(t => t.id === id ? { ...t, ...updates } : t),
    });
  }

  if (!eventId) {
    return (
      <div className={styles.card}>
        <p className={styles.emptyState}>No event selected</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.row}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Dynamic Pricing</h1>
          <p className={styles.subtitle}>Configure automatic price adjustments based on demand and time</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={styles.button}
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className={`${styles.message} ${
          message.type === 'success' ? styles.messageSuccess : styles.messageError
        }`}>
          {message.text}
        </div>
      )}

      {/* Enable Toggle */}
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h2 className={styles.headerTitle}>Enable Dynamic Pricing</h2>
            <p className={styles.headerSubtitle}>Automatically adjust prices based on demand and time</p>
          </div>
          <button
            onClick={() => setConfig({ ...config, enabled: !config.enabled })}
            className={`${styles.toggle} ${
              config.enabled ? styles.toggleEnabled : styles.toggleDisabled
            }`}
          >
            <span
              className={`${styles.toggleThumb} ${
                config.enabled ? styles.toggleThumbEnabled : styles.toggleThumbDisabled
              }`}
            />
          </button>
        </div>
      </div>

      {/* Strategy Selection */}
      <div className={styles.card}>
        <h2 className={styles.headerTitle}>Pricing Strategy</h2>
        
        <div className={styles.grid}>
          <button
            onClick={() => setConfig({ ...config, pricing_strategy: 'demand_based' })}
            className={`${styles.strategyButton} ${
              config.pricing_strategy === 'demand_based' ? styles.strategyButtonActive : ''
            }`}
          >
            <h3 className={`${styles.strategyTitle} ${
              config.pricing_strategy === 'demand_based' ? styles.strategyTitleActive : ''
            }`}>Demand Based</h3>
            <p className={`${styles.strategySubtitle} ${
              config.pricing_strategy === 'demand_based' ? styles.strategySubtitleActive : ''
            }`}>Price increases as capacity fills</p>
          </button>

          <button
            onClick={() => setConfig({ ...config, pricing_strategy: 'time_based' })}
            className={`${styles.strategyButton} ${
              config.pricing_strategy === 'time_based' ? styles.strategyButtonActive : ''
            }`}
          >
            <h3 className={`${styles.strategyTitle} ${
              config.pricing_strategy === 'time_based' ? styles.strategyTitleActive : ''
            }`}>Time Based</h3>
            <p className={`${styles.strategySubtitle} ${
              config.pricing_strategy === 'time_based' ? styles.strategySubtitleActive : ''
            }`}>Price increases as event approaches</p>
          </button>

          <button
            onClick={() => setConfig({ ...config, pricing_strategy: 'hybrid' })}
            className={`${styles.strategyButton} ${
              config.pricing_strategy === 'hybrid' ? styles.strategyButtonActive : ''
            }`}
          >
            <h3 className={`${styles.strategyTitle} ${
              config.pricing_strategy === 'hybrid' ? styles.strategyTitleActive : ''
            }`}>Hybrid</h3>
            <p className={`${styles.strategySubtitle} ${
              config.pricing_strategy === 'hybrid' ? styles.strategySubtitleActive : ''
            }`}>Combines demand and time factors</p>
          </button>
        </div>
      </div>

      {/* Price Bounds */}
      <div className={styles.card}>
        <h2 className={styles.headerTitle}>Price Bounds</h2>
        
        <div className={styles.grid}>
          <div>
            <label htmlFor="min-price" className={styles.label}>
              Minimum Price ($)
            </label>
            <input
              id="min-price"
              type="number"
              value={config.min_price}
              onChange={(e) => setConfig({ ...config, min_price: parseFloat(e.target.value) })}
              min="0"
              step="0.01"
              className={styles.input}
            />
          </div>

          <div>
            <label htmlFor="max-price" className={styles.label}>
              Maximum Price ($)
            </label>
            <input
              id="max-price"
              type="number"
              value={config.max_price}
              onChange={(e) => setConfig({ ...config, max_price: parseFloat(e.target.value) })}
              min="0"
              step="0.01"
              className={styles.input}
            />
          </div>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className={styles.card}>
        <div className={styles.headerRow}>
          <h2 className={styles.headerTitle}>Pricing Tiers</h2>
          <button
            onClick={addTier}
            className={styles.button}
          >
            + Add Tier
          </button>
        </div>

        <div className={styles.section}>
          {config.tiers.map((tier, index) => (
            <div key={tier.id} className={styles.tierCard}>
              <div className={styles.tierHeader}>
                <h3 className={styles.tierTitle}>Tier {index + 1}</h3>
                <button
                  onClick={() => removeTier(tier.id)}
                  className={styles.tierRemove}
                >
                  Remove
                </button>
              </div>

              <div className={styles.grid}>
                <div>
                  <label htmlFor={`tier-name-${tier.id}`} className={styles.label}>
                    Name
                  </label>
                  <input
                    id={`tier-name-${tier.id}`}
                    type="text"
                    value={tier.name}
                    onChange={(e) => updateTier(tier.id, { name: e.target.value })}
                    className={styles.tierInput}
                  />
                </div>

                <div>
                  <label htmlFor={`tier-price-${tier.id}`} className={styles.label}>
                    Price ($)
                  </label>
                  <input
                    id={`tier-price-${tier.id}`}
                    type="number"
                    value={tier.base_price}
                    onChange={(e) => updateTier(tier.id, { base_price: parseFloat(e.target.value) })}
                    min="0"
                    step="0.01"
                    className={styles.tierInput}
                  />
                </div>

                <div>
                  <label htmlFor={`tier-capacity-${tier.id}`} className={styles.label}>
                    Capacity % Threshold
                  </label>
                  <input
                    id={`tier-capacity-${tier.id}`}
                    type="number"
                    value={tier.capacity_threshold}
                    onChange={(e) => updateTier(tier.id, { capacity_threshold: parseInt(e.target.value) })}
                    min="0"
                    max="100"
                    className={styles.tierInput}
                  />
                </div>

                <div>
                  <label htmlFor={`tier-days-${tier.id}`} className={styles.label}>
                    Days Before Event
                  </label>
                  <input
                    id={`tier-days-${tier.id}`}
                    type="number"
                    value={tier.time_threshold_days}
                    onChange={(e) => updateTier(tier.id, { time_threshold_days: parseInt(e.target.value) })}
                    min="0"
                    className={styles.tierInput}
                  />
                </div>
              </div>
            </div>
          ))}

          {config.tiers.length === 0 && (
            <div className={styles.emptyState}>
              <p>No pricing tiers configured</p>
              <p className={styles.emptyStateText}>Click &quot;Add Tier&quot; to create your first pricing tier</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className={styles.infoCard}>
        <h3 className={styles.infoTitle}>How It Works</h3>
        <ul className={styles.infoList}>
          <li>• Prices automatically adjust based on your selected strategy</li>
          <li>• Tiers activate when capacity or time thresholds are met</li>
          <li>• Prices will never go below minimum or above maximum bounds</li>
          <li>• Customers see current price at time of purchase</li>
          <li>• Price changes are logged for analytics and reporting</li>
        </ul>
      </div>
    </div>
  );
}
