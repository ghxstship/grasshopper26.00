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
    status: 'upcoming',
  });

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

      const { error } = await supabase
        .from('events')
        .insert({
          ...formData,
          brand_id: adminData.brand_id,
        });

      if (error) throw error;

      alert('Event created successfully!');
      router.push('/admin/dashboard');
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
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-8">
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
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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
