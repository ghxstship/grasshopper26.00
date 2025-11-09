'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/design-system/components/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { ArrowLeft, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ManageTicketTypesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    max_per_order: '10',
    sale_start: '',
    sale_end: '',
  });

  const fetchTicketTypes = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/events/${id}/ticket-types`);
      const data = await response.json();
      setTicketTypes(data.ticketTypes || []);
    } catch (error) {
      console.error('Failed to fetch ticket types:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTicketTypes();
  }, [fetchTicketTypes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `/api/admin/ticket-types/${editingId}`
        : `/api/admin/events/${id}/ticket-types`;
      
      const method = editingId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          event_id: id,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity),
          max_per_order: parseInt(formData.max_per_order),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowForm(false);
        setEditingId(null);
        setFormData({
          name: '',
          description: '',
          price: '',
          quantity: '',
          max_per_order: '10',
          sale_start: '',
          sale_end: '',
        });
        fetchTicketTypes();
      } else {
        alert(data.error || 'Failed to save ticket type');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save ticket type');
    }
  };

  const handleEdit = (ticketType: any) => {
    setEditingId(ticketType.id);
    setFormData({
      name: ticketType.name,
      description: ticketType.description || '',
      price: ticketType.price.toString(),
      quantity: ticketType.quantity.toString(),
      max_per_order: ticketType.max_per_order?.toString() || '10',
      sale_start: ticketType.sale_start?.slice(0, 16) || '',
      sale_end: ticketType.sale_end?.slice(0, 16) || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (ticketTypeId: string) => {
    if (!confirm('Are you sure you want to delete this ticket type?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/ticket-types/${ticketTypeId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchTicketTypes();
      } else {
        alert(data.error || 'Failed to delete ticket type');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete ticket type');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            href={`/admin/events/${id}`}
            className="text-purple-400 hover:text-purple-300 mb-4 inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Event
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Manage Ticket Types
            </h1>
            <Button
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setFormData({
                  name: '',
                  description: '',
                  price: '',
                  quantity: '',
                  max_per_order: '10',
                  sale_start: '',
                  sale_end: '',
                });
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Ticket Type
            </Button>
          </div>
        </div>

        {showForm && (
          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20 mb-6">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit' : 'Add'} Ticket Type</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Ticket Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="e.g., General Admission, VIP"
                      className="w-full px-4 py-3 bg-black/60 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
                      Price *
                    </label>
                    <input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-black/60 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-300 mb-2">
                      Quantity Available *
                    </label>
                    <input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                      placeholder="100"
                      className="w-full px-4 py-3 bg-black/60 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="max_per_order" className="block text-sm font-medium text-gray-300 mb-2">
                      Max Per Order
                    </label>
                    <input
                      id="max_per_order"
                      type="number"
                      min="1"
                      value={formData.max_per_order}
                      onChange={(e) => setFormData({ ...formData, max_per_order: e.target.value })}
                      className="w-full px-4 py-3 bg-black/60 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="sale_start" className="block text-sm font-medium text-gray-300 mb-2">
                      Sale Start Date
                    </label>
                    <input
                      id="sale_start"
                      type="datetime-local"
                      value={formData.sale_start}
                      onChange={(e) => setFormData({ ...formData, sale_start: e.target.value })}
                      className="w-full px-4 py-3 bg-black/60 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="sale_end" className="block text-sm font-medium text-gray-300 mb-2">
                      Sale End Date
                    </label>
                    <input
                      id="sale_end"
                      type="datetime-local"
                      value={formData.sale_end}
                      onChange={(e) => setFormData({ ...formData, sale_end: e.target.value })}
                      className="w-full px-4 py-3 bg-black/60 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Describe what's included with this ticket..."
                    className="w-full px-4 py-3 bg-black/60 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {editingId ? 'Update' : 'Create'} Ticket Type
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                    className="border-purple-500/30 hover:bg-purple-500/10"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ticketTypes.map((ticketType) => (
            <Card key={ticketType.id} className="bg-black/40 backdrop-blur-lg border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{ticketType.name}</span>
                  <span className="text-purple-400 font-bold">${parseFloat(ticketType.price).toFixed(2)}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ticketType.description && (
                  <p className="text-gray-400 text-sm mb-4">{ticketType.description}</p>
                )}
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Available:</span>
                    <span className="text-white font-semibold">{ticketType.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max per order:</span>
                    <span className="text-white">{ticketType.max_per_order || 'Unlimited'}</span>
                  </div>
                  {ticketType.sale_start && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sale starts:</span>
                      <span className="text-white text-xs">
                        {new Date(ticketType.sale_start).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(ticketType)}
                    className="flex-1 border-purple-500/30 hover:bg-purple-500/10"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(ticketType.id)}
                    className="border-red-500/30 hover:bg-red-500/10 text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {ticketTypes.length === 0 && !showForm && (
          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
            <CardContent className="p-12 text-center">
              <p className="text-gray-400 mb-4">No ticket types yet</p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Ticket Type
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
