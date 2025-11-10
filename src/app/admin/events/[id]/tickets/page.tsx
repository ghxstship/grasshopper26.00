'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { ContextualPageTemplate } from '@/design-system/components/templates';
import { Button } from '@/design-system/components/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { Input } from '@/design-system/components/atoms/input';
import { Label } from '@/design-system/components/atoms/label';
import { Badge } from '@/design-system/components/atoms/badge';
import { Plus, Edit, Trash2, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import styles from './tickets-content.module.css';

export default function ManageTicketTypesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
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

  const fetchData = useCallback(async () => {
    try {
      const eventRes = await fetch(`/api/admin/events/${id}`);
      const eventData = await eventRes.json();
      setEvent(eventData.event);

      const response = await fetch(`/api/admin/events/${id}/ticket-types`);
      const data = await response.json();
      setTicketTypes(data.ticketTypes || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load ticket types');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        fetchData();
        toast.success(editingId ? 'Ticket type updated' : 'Ticket type created');
      } else {
        toast.error(data.error || 'Failed to save ticket type');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save ticket type');
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
    if (!confirm('Are you sure you want to delete this ticket type?')) return;

    try {
      const response = await fetch(`/api/admin/ticket-types/${ticketTypeId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchData();
        toast.success('Ticket type deleted');
      } else {
        toast.error(data.error || 'Failed to delete ticket type');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete ticket type');
    }
  };

  return (
    <ContextualPageTemplate
      breadcrumbs={[
        { label: 'Events', href: '/admin/events' },
        { label: event?.name || 'Event', href: `/admin/events/${id}` },
        { label: 'Tickets', href: `/admin/events/${id}/tickets` }
      ]}
      title="Ticket Types"
      subtitle={event?.name ? `${event.name} - Manage ticket types and pricing` : 'Manage ticket types and pricing'}
      primaryAction={{
        label: showForm ? 'Cancel' : 'Add Ticket Type',
        onClick: () => {
          setShowForm(!showForm);
          if (showForm) {
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
          }
        },
        icon: <Plus />
      }}
      loading={loading}
    >
      {showForm && (
        <Card className={styles.formCard}>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Ticket Type' : 'Create Ticket Type'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <Label htmlFor="name">Ticket Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formField}>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formField}>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formField}>
                  <Label htmlFor="max_per_order">Max Per Order</Label>
                  <Input
                    id="max_per_order"
                    type="number"
                    value={formData.max_per_order}
                    onChange={(e) => setFormData({ ...formData, max_per_order: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formField}>
                  <Label htmlFor="sale_start">Sale Start</Label>
                  <Input
                    id="sale_start"
                    type="datetime-local"
                    value={formData.sale_start}
                    onChange={(e) => setFormData({ ...formData, sale_start: e.target.value })}
                  />
                </div>
                <div className={styles.formField}>
                  <Label htmlFor="sale_end">Sale End</Label>
                  <Input
                    id="sale_end"
                    type="datetime-local"
                    value={formData.sale_end}
                    onChange={(e) => setFormData({ ...formData, sale_end: e.target.value })}
                  />
                </div>
                <div className={styles.formFieldFull}>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <div className={styles.formActions}>
                <Button type="submit">{editingId ? 'Update' : 'Create'} Ticket Type</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className={styles.ticketsList}>
        {ticketTypes.map((ticketType) => (
          <Card key={ticketType.id} className={styles.ticketCard}>
            <CardHeader>
              <div className={styles.ticketHeader}>
                <div className={styles.ticketTitleRow}>
                  <Ticket className={styles.iconInline} />
                  <CardTitle>{ticketType.name}</CardTitle>
                </div>
                <div className={styles.ticketActions}>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(ticketType)}>
                    <Edit className={styles.iconSmall} />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(ticketType.id)}>
                    <Trash2 className={styles.iconSmall} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className={styles.ticketDetails}>
                <div className={styles.ticketDetail}>
                  <span className={styles.label}>Price:</span>
                  <span className={styles.value}>${ticketType.price.toFixed(2)}</span>
                </div>
                <div className={styles.ticketDetail}>
                  <span className={styles.label}>Quantity:</span>
                  <span className={styles.value}>{ticketType.quantity}</span>
                </div>
                <div className={styles.ticketDetail}>
                  <span className={styles.label}>Sold:</span>
                  <span className={styles.value}>{ticketType.sold || 0}</span>
                </div>
                <div className={styles.ticketDetail}>
                  <span className={styles.label}>Available:</span>
                  <Badge variant={ticketType.quantity - (ticketType.sold || 0) > 0 ? 'default' : 'destructive'}>
                    {ticketType.quantity - (ticketType.sold || 0)}
                  </Badge>
                </div>
              </div>
              {ticketType.description && (
                <p className={styles.ticketDescription}>{ticketType.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </ContextualPageTemplate>
  );
}
