'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SuperAdminGate } from '@/lib/rbac';
import Link from 'next/link';

interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  primary_color: string | null;
  custom_domain: string | null;
  is_active: boolean;
  created_at: string;
  _count?: {
    events: number;
    team_members: number;
  };
}

export default function BrandsManagementPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    primary_color: '#8B5CF6',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadBrands();
  }, []);

  async function loadBrands() {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get counts for each brand
      const brandsWithCounts = await Promise.all(
        (data || []).map(async (brand) => {
          const [eventsCount, teamCount] = await Promise.all([
            supabase.from('events').select('id', { count: 'exact', head: true }).eq('brand_id', brand.id),
            supabase.from('brand_team_assignments').select('id', { count: 'exact', head: true }).eq('brand_id', brand.id).is('removed_at', null),
          ]);

          return {
            ...brand,
            _count: {
              events: eventsCount.count || 0,
              team_members: teamCount.count || 0,
            },
          };
        })
      );

      setBrands(brandsWithCounts);
    } catch (error) {
      console.error('Error loading brands:', error);
      setMessage({ type: 'error', text: 'Failed to load brands' });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBrand() {
    if (!formData.name || !formData.slug) {
      setMessage({ type: 'error', text: 'Name and slug are required' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('brands')
        .insert({
          name: formData.name,
          slug: formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          description: formData.description || null,
          primary_color: formData.primary_color,
          is_active: true,
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Brand created successfully' });
      setShowCreateModal(false);
      setFormData({ name: '', slug: '', description: '', primary_color: '#8B5CF6' });
      await loadBrands();
    } catch (error: any) {
      console.error('Error creating brand:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to create brand' });
    } finally {
      setSaving(false);
    }
  }

  async function toggleBrandStatus(brandId: string, currentStatus: boolean) {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('brands')
        .update({ is_active: !currentStatus })
        .eq('id', brandId);

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: `Brand ${!currentStatus ? 'activated' : 'deactivated'} successfully` 
      });
      await loadBrands();
    } catch (error: any) {
      console.error('Error updating brand:', error);
      setMessage({ type: 'error', text: 'Failed to update brand status' });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading brands...</p>
        </div>
      </div>
    );
  }

  return (
    <SuperAdminGate fallback={
      <div className="p-8">
        <p className="text-red-600">Access Denied: Super Admin Only</p>
      </div>
    }>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Brand Management</h1>
            <p className="text-gray-600 mt-1">Manage multi-brand platform configuration</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            + Create Brand
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

        {/* Brands Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden border-2 ${
                brand.is_active ? 'border-green-200' : 'border-gray-200'
              }`}
            >
              {/* Brand Header */}
              <div
                className="h-24 p-6 flex items-center justify-center"
                style={{ backgroundColor: brand.primary_color || '#8B5CF6' }}
              >
                {brand.logo_url ? (
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className="h-16 object-contain filter brightness-0 invert"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-white">{brand.name}</h2>
                )}
              </div>

              {/* Brand Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{brand.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    brand.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {brand.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-1">/{brand.slug}</p>
                
                {brand.description && (
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">{brand.description}</p>
                )}

                {brand.custom_domain && (
                  <p className="text-sm text-blue-600 mb-4">🌐 {brand.custom_domain}</p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{brand._count?.events || 0}</p>
                    <p className="text-xs text-gray-600">Events</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{brand._count?.team_members || 0}</p>
                    <p className="text-xs text-gray-600">Team Members</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/admin/brands/${brand.id}`}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white text-sm text-center rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Configure
                  </Link>
                  <button
                    onClick={() => toggleBrandStatus(brand.id, brand.is_active)}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                      brand.is_active
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {brand.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {brands.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Brands Yet</h3>
              <p className="text-gray-600 mb-4">Create your first brand to get started with multi-brand management</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create First Brand
              </button>
            </div>
          )}
        </div>

        {/* Create Brand Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Brand</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="brand-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Brand Name *
                  </label>
                  <input
                    id="brand-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      // Auto-generate slug
                      if (!formData.slug || formData.slug === formData.name.toLowerCase().replace(/[^a-z0-9-]/g, '-')) {
                        setFormData(prev => ({
                          ...prev,
                          name: e.target.value,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                        }));
                      }
                    }}
                    placeholder="e.g., GVTEWAY"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label htmlFor="brand-slug" className="block text-sm font-medium text-gray-700 mb-2">
                    URL Slug *
                  </label>
                  <input
                    id="brand-slug"
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g., gvteway"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used in URLs: /brands/{formData.slug || 'slug'}</p>
                </div>

                <div>
                  <label htmlFor="brand-desc" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="brand-desc"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the brand"
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label htmlFor="brand-color" className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      id="brand-color"
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="h-12 w-20 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ name: '', slug: '', description: '', primary_color: '#8B5CF6' });
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBrand}
                  disabled={saving || !formData.name || !formData.slug}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Creating...' : 'Create Brand'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SuperAdminGate>
  );
}
