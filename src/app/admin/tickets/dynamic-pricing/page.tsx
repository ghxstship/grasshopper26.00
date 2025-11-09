'use client';

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
      <div className="p-8">
        <p className="text-red-600">No event selected</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dynamic Pricing</h1>
          <p className="text-gray-600 mt-1">Configure automatic price adjustments based on demand and time</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Enable Toggle */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Enable Dynamic Pricing</h2>
            <p className="text-sm text-gray-600 mt-1">Automatically adjust prices based on demand and time</p>
          </div>
          <button
            onClick={() => setConfig({ ...config, enabled: !config.enabled })}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              config.enabled ? 'bg-green-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                config.enabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Strategy Selection */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing Strategy</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setConfig({ ...config, pricing_strategy: 'demand_based' })}
            className={`p-4 border-2 rounded-lg text-left transition-colors ${
              config.pricing_strategy === 'demand_based'
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h3 className="font-semibold text-gray-900 mb-1">Demand Based</h3>
            <p className="text-sm text-gray-600">Price increases as capacity fills</p>
          </button>

          <button
            onClick={() => setConfig({ ...config, pricing_strategy: 'time_based' })}
            className={`p-4 border-2 rounded-lg text-left transition-colors ${
              config.pricing_strategy === 'time_based'
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h3 className="font-semibold text-gray-900 mb-1">Time Based</h3>
            <p className="text-sm text-gray-600">Price increases as event approaches</p>
          </button>

          <button
            onClick={() => setConfig({ ...config, pricing_strategy: 'hybrid' })}
            className={`p-4 border-2 rounded-lg text-left transition-colors ${
              config.pricing_strategy === 'hybrid'
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h3 className="font-semibold text-gray-900 mb-1">Hybrid</h3>
            <p className="text-sm text-gray-600">Combines demand and time factors</p>
          </button>
        </div>
      </div>

      {/* Price Bounds */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Price Bounds</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="min-price" className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Price ($)
            </label>
            <input
              id="min-price"
              type="number"
              value={config.min_price}
              onChange={(e) => setConfig({ ...config, min_price: parseFloat(e.target.value) })}
              min="0"
              step="0.01"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label htmlFor="max-price" className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Price ($)
            </label>
            <input
              id="max-price"
              type="number"
              value={config.max_price}
              onChange={(e) => setConfig({ ...config, max_price: parseFloat(e.target.value) })}
              min="0"
              step="0.01"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Pricing Tiers</h2>
          <button
            onClick={addTier}
            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
          >
            + Add Tier
          </button>
        </div>

        <div className="space-y-4">
          {config.tiers.map((tier, index) => (
            <div key={tier.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-gray-900">Tier {index + 1}</h3>
                <button
                  onClick={() => removeTier(tier.id)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor={`tier-name-${tier.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    id={`tier-name-${tier.id}`}
                    type="text"
                    value={tier.name}
                    onChange={(e) => updateTier(tier.id, { name: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label htmlFor={`tier-price-${tier.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($)
                  </label>
                  <input
                    id={`tier-price-${tier.id}`}
                    type="number"
                    value={tier.base_price}
                    onChange={(e) => updateTier(tier.id, { base_price: parseFloat(e.target.value) })}
                    min="0"
                    step="0.01"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label htmlFor={`tier-capacity-${tier.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity % Threshold
                  </label>
                  <input
                    id={`tier-capacity-${tier.id}`}
                    type="number"
                    value={tier.capacity_threshold}
                    onChange={(e) => updateTier(tier.id, { capacity_threshold: parseInt(e.target.value) })}
                    min="0"
                    max="100"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label htmlFor={`tier-days-${tier.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                    Days Before Event
                  </label>
                  <input
                    id={`tier-days-${tier.id}`}
                    type="number"
                    value={tier.time_threshold_days}
                    onChange={(e) => updateTier(tier.id, { time_threshold_days: parseInt(e.target.value) })}
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          ))}

          {config.tiers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No pricing tiers configured</p>
              <p className="text-sm">Click &quot;Add Tier&quot; to create your first pricing tier</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">How It Works</h3>
        <ul className="space-y-2 text-sm text-gray-700">
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
