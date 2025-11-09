'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/design-system/components/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { Input } from '@/design-system/components/atoms/input';
import { Label } from '@/design-system/components/atoms/label';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function CreateEventPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    start_date: '',
    end_date: '',
    venue_name: '',
    venue_address: '',
    hero_image_url: '',
    capacity: '',
    age_restriction: '',
    event_type: 'concert',
    status: 'upcoming',
  });
  const [ticketTypes, setTicketTypes] = useState<Array<{
    name: string;
    description: string;
    price: string;
    quantity_available: string;
  }>>([{ name: '', description: '', price: '', quantity_available: '' }]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Please log in');
        return;
      }

      // Get brand_id from user
      const { data: adminData } = await supabase
        .from('brand_admins')
        .select('brand_id')
        .eq('user_id', user.id)
        .single();

      if (!adminData) {
        alert('Not authorized');
        return;
      }

      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert({
          ...formData,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          brand_id: adminData.brand_id,
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Create ticket types
      if (ticketTypes.length > 0 && ticketTypes[0].name) {
        const ticketTypesData = ticketTypes
          .filter(tt => tt.name && tt.price)
          .map(tt => ({
            event_id: eventData.id,
            name: tt.name,
            description: tt.description,
            price: tt.price,
            quantity_available: parseInt(tt.quantity_available) || 0,
            quantity_sold: 0,
            status: 'active',
          }));

        const { error: ticketError } = await supabase
          .from('ticket_types')
          .insert(ticketTypesData);

        if (ticketError) throw ticketError;
      }

      alert('Event created successfully!');
      router.push('/admin/events');
    } catch (error: any) {
      console.error('Error creating event:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  return (
    <div className="min-h-screen  py-12 px-4" style={{ background: 'var(--gradient-hero)' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold  mb-8 bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-brand-primary)' }}>
          Create New Event
        </h1>

        <form onSubmit={handleSubmit}>
          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Event Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-black/50 border-purple-500/30"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    className="bg-black/50 border-purple-500/30"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-md text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="start_date">Start Date & Time *</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                    className="bg-black/50 border-purple-500/30"
                  />
                </div>

                <div>
                  <Label htmlFor="end_date">End Date & Time *</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                    className="bg-black/50 border-purple-500/30"
                  />
                </div>

                <div>
                  <Label htmlFor="venue_name">Venue Name *</Label>
                  <Input
                    id="venue_name"
                    name="venue_name"
                    value={formData.venue_name}
                    onChange={handleChange}
                    required
                    className="bg-black/50 border-purple-500/30"
                  />
                </div>

                <div>
                  <Label htmlFor="venue_address">Venue Address *</Label>
                  <Input
                    id="venue_address"
                    name="venue_address"
                    value={formData.venue_address}
                    onChange={handleChange}
                    required
                    className="bg-black/50 border-purple-500/30"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="hero_image_url">Hero Image URL</Label>
                  <Input
                    id="hero_image_url"
                    name="hero_image_url"
                    type="url"
                    value={formData.hero_image_url}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="bg-black/50 border-purple-500/30"
                  />
                </div>

                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={handleChange}
                    placeholder="1000"
                    className="bg-black/50 border-purple-500/30"
                  />
                </div>

                <div>
                  <Label htmlFor="age_restriction">Age Restriction</Label>
                  <Input
                    id="age_restriction"
                    name="age_restriction"
                    value={formData.age_restriction}
                    onChange={handleChange}
                    placeholder="18+"
                    className="bg-black/50 border-purple-500/30"
                  />
                </div>

                <div>
                  <Label htmlFor="event_type">Event Type</Label>
                  <select
                    id="event_type"
                    name="event_type"
                    value={formData.event_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, event_type: e.target.value }))}
                    className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-md text-white"
                  >
                    <option value="concert">Concert</option>
                    <option value="festival">Festival</option>
                    <option value="club_night">Club Night</option>
                    <option value="conference">Conference</option>
                    <option value="workshop">Workshop</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-md text-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-purple-500/20 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Ticket Types</h3>
                  <Button
                    type="button"
                    onClick={() => setTicketTypes([...ticketTypes, { name: '', description: '', price: '', quantity_available: '' }])}
                    variant="outline"
                    className="border-purple-500/30"
                  >
                    Add Ticket Type
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {ticketTypes.map((ticket, index) => (
                    <div key={index} className="p-4 bg-black/30 rounded-lg border border-purple-500/10">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Ticket Name *</Label>
                          <Input
                            value={ticket.name}
                            onChange={(e) => {
                              const newTickets = [...ticketTypes];
                              newTickets[index].name = e.target.value;
                              setTicketTypes(newTickets);
                            }}
                            placeholder="General Admission"
                            className="bg-black/50 border-purple-500/30"
                          />
                        </div>
                        <div>
                          <Label>Price *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={ticket.price}
                            onChange={(e) => {
                              const newTickets = [...ticketTypes];
                              newTickets[index].price = e.target.value;
                              setTicketTypes(newTickets);
                            }}
                            placeholder="50.00"
                            className="bg-black/50 border-purple-500/30"
                          />
                        </div>
                        <div>
                          <Label>Quantity Available *</Label>
                          <Input
                            type="number"
                            value={ticket.quantity_available}
                            onChange={(e) => {
                              const newTickets = [...ticketTypes];
                              newTickets[index].quantity_available = e.target.value;
                              setTicketTypes(newTickets);
                            }}
                            placeholder="100"
                            className="bg-black/50 border-purple-500/30"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Input
                            value={ticket.description}
                            onChange={(e) => {
                              const newTickets = [...ticketTypes];
                              newTickets[index].description = e.target.value;
                              setTicketTypes(newTickets);
                            }}
                            placeholder="Access to main floor"
                            className="bg-black/50 border-purple-500/30"
                          />
                        </div>
                      </div>
                      {ticketTypes.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => setTicketTypes(ticketTypes.filter((_, i) => i !== index))}
                          variant="outline"
                          className="mt-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="" style={{ background: 'var(--gradient-brand-primary)' }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Event'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="border-purple-500/30 hover:bg-purple-500/10"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
