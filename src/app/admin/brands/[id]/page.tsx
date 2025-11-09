'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SuperAdminGate } from '@/lib/rbac';
import { useParams, useRouter } from 'next/navigation';

interface BrandConfig {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  custom_domain: string | null;
  theme_config: any;
  email_config: any;
  is_active: boolean;
}

export default function BrandConfigPage() {
  const params = useParams();
  const router = useRouter();
  const brandId = params.id as string;
  
  const [brand, setBrand] = useState<BrandConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadBrand();
  }, [brandId]);

  async function loadBrand() {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('id', brandId)
        .single();

      if (error) throw error;
      setBrand(data);
    } catch (error) {
      console.error('Error loading brand:', error);
      setMessage({ type: 'error', text: 'Failed to load brand' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!brand) return;

    setSaving(true);
    setMessage(null);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('brands')
        .update({
          name: brand.name,
          slug: brand.slug,
          description: brand.description,
          primary_color: brand.primary_color,
          secondary_color: brand.secondary_color,
          custom_domain: brand.custom_domain,
          theme_config: brand.theme_config,
          email_config: brand.email_config,
        })
        .eq('id', brandId);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Brand updated successfully' });
    } catch (error: any) {
      console.error('Error updating brand:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update brand' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading brand...</p>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="p-8">
        <p className="text-red-600">Brand not found</p>
      </div>
    );
  }

  return (
    <SuperAdminGate fallback={
      <div className="p-8">
        <p className="text-red-600">Access Denied: Super Admin Only</p>
      </div>
    }>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <button
              onClick={() => router.push('/admin/brands')}
              className="text-purple-600 hover:text-purple-700 mb-2"
            >
              ← Back to Brands
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{brand.name}</h1>
            <p className="text-gray-600 mt-1">Brand Configuration</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
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

        {/* Configuration Sections */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={brand.name}
                  onChange={(e) => setBrand({ ...brand, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug
                </label>
                <input
                  id="slug"
                  type="text"
                  value={brand.slug}
                  onChange={(e) => setBrand({ ...brand, slug: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={brand.description || ''}
                  onChange={(e) => setBrand({ ...brand, description: e.target.value })}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Branding */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Branding & Theme</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="primary-color" className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex gap-3">
                  <input
                    id="primary-color"
                    type="color"
                    value={brand.primary_color || '#8B5CF6'}
                    onChange={(e) => setBrand({ ...brand, primary_color: e.target.value })}
                    className="h-12 w-20 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brand.primary_color || '#8B5CF6'}
                    onChange={(e) => setBrand({ ...brand, primary_color: e.target.value })}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="secondary-color" className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Color
                </label>
                <div className="flex gap-3">
                  <input
                    id="secondary-color"
                    type="color"
                    value={brand.secondary_color || '#6366F1'}
                    onChange={(e) => setBrand({ ...brand, secondary_color: e.target.value })}
                    className="h-12 w-20 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brand.secondary_color || '#6366F1'}
                    onChange={(e) => setBrand({ ...brand, secondary_color: e.target.value })}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="logo-url" className="block text-sm font-medium text-gray-700 mb-2">
                  Logo URL
                </label>
                <input
                  id="logo-url"
                  type="url"
                  value={brand.logo_url || ''}
                  onChange={(e) => setBrand({ ...brand, logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                {brand.logo_url && (
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <img src={brand.logo_url} alt="Logo preview" className="h-16 object-contain" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Custom Domain */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Custom Domain</h2>
            
            <div>
              <label htmlFor="custom-domain" className="block text-sm font-medium text-gray-700 mb-2">
                Domain
              </label>
              <input
                id="custom-domain"
                type="text"
                value={brand.custom_domain || ''}
                onChange={(e) => setBrand({ ...brand, custom_domain: e.target.value })}
                placeholder="events.yourbrand.com"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-2">
                Configure DNS CNAME record pointing to gvteway.com
              </p>
            </div>
          </div>

          {/* Email Configuration */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="from-email" className="block text-sm font-medium text-gray-700 mb-2">
                  From Email
                </label>
                <input
                  id="from-email"
                  type="email"
                  value={brand.email_config?.from_email || ''}
                  onChange={(e) => setBrand({ 
                    ...brand, 
                    email_config: { ...brand.email_config, from_email: e.target.value }
                  })}
                  placeholder="noreply@yourbrand.com"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label htmlFor="from-name" className="block text-sm font-medium text-gray-700 mb-2">
                  From Name
                </label>
                <input
                  id="from-name"
                  type="text"
                  value={brand.email_config?.from_name || ''}
                  onChange={(e) => setBrand({ 
                    ...brand, 
                    email_config: { ...brand.email_config, from_name: e.target.value }
                  })}
                  placeholder="Your Brand Events"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview</h2>
            
            <div 
              className="p-8 rounded-lg text-white text-center"
              style={{ backgroundColor: brand.primary_color || '#8B5CF6' }}
            >
              {brand.logo_url ? (
                <img src={brand.logo_url} alt={brand.name} className="h-20 mx-auto mb-4 filter brightness-0 invert" />
              ) : (
                <h3 className="text-3xl font-bold mb-4">{brand.name}</h3>
              )}
              <p className="text-lg opacity-90">{brand.description || 'Your brand description here'}</p>
            </div>
          </div>
        </div>

        {/* Save Button (Bottom) */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>
    </SuperAdminGate>
  );
}
