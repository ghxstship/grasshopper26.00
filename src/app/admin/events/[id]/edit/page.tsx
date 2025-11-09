/**
 * Admin Event Edit Page
 * Edit existing event details, venue information, and settings
 */

'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/design-system/components/atoms/button';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    venue_name: '',
    venue_address: '',
    capacity: '',
    status: 'draft',
    age_restriction: '',
    event_type: '',
  });

  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await fetch(`/api/admin/events/${id}`);
        const data = await response.json();
        
        if (data.event) {
          setEvent(data.event);
          setFormData({
            name: data.event.name || '',
            description: data.event.description || '',
            start_date: data.event.start_date?.slice(0, 16) || '',
            end_date: data.event.end_date?.slice(0, 16) || '',
            venue_name: data.event.venue_name || '',
            venue_address: data.event.venue_address || '',
            capacity: data.event.capacity?.toString() || '',
            status: data.event.status || 'draft',
            age_restriction: data.event.age_restriction || '',
            event_type: data.event.event_type || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch event:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/admin/events/${id}`);
      } else {
        alert(data.error || 'Failed to update event');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-black" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b-3 border-black py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link
            href={`/admin/events/${id}`}
            className="inline-flex items-center gap-2 font-bebas text-body uppercase mb-6 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Event
          </Link>
          <h1 className="font-anton text-hero uppercase mb-2">
            Edit Event
          </h1>
          <p className="font-share text-body text-grey-700">
            Update event details, venue information, and settings
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Details Card */}
            <div className="border-3 border-black bg-white p-6 shadow-geometric">
              <h2 className="font-bebas text-h3 uppercase mb-6 pb-4 border-b-3 border-black">
                Event Details
              </h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block font-bebas text-body uppercase mb-2">
                    Event Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-3 border-black font-share text-body focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block font-bebas text-body uppercase mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border-3 border-black font-share text-body focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="event_type" className="block font-bebas text-body uppercase mb-2">
                      Event Type
                    </label>
                    <select
                      id="event_type"
                      value={formData.event_type}
                      onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                      className="w-full px-4 py-3 border-3 border-black font-share text-body focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="">Select Type</option>
                      <option value="festival">Festival</option>
                      <option value="concert">Concert</option>
                      <option value="club_night">Club Night</option>
                      <option value="warehouse">Warehouse</option>
                      <option value="outdoor">Outdoor</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="age_restriction" className="block font-bebas text-body uppercase mb-2">
                      Age Restriction
                    </label>
                    <select
                      id="age_restriction"
                      value={formData.age_restriction}
                      onChange={(e) => setFormData({ ...formData, age_restriction: e.target.value })}
                      className="w-full px-4 py-3 border-3 border-black font-share text-body focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="">Select Age Restriction</option>
                      <option value="All Ages">All Ages</option>
                      <option value="18+">18+</option>
                      <option value="21+">21+</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="start_date" className="block font-bebas text-body uppercase mb-2">
                      Start Date & Time *
                    </label>
                    <input
                      id="start_date"
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                      className="w-full px-4 py-3 border-3 border-black font-share text-body focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label htmlFor="end_date" className="block font-bebas text-body uppercase mb-2">
                      End Date & Time
                    </label>
                    <input
                      id="end_date"
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-4 py-3 border-3 border-black font-share text-body focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Venue Information Card */}
            <div className="border-3 border-black bg-white p-6 shadow-geometric">
              <h2 className="font-bebas text-h3 uppercase mb-6 pb-4 border-b-3 border-black">
                Venue Information
              </h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="venue_name" className="block font-bebas text-body uppercase mb-2">
                    Venue Name
                  </label>
                  <input
                    id="venue_name"
                    type="text"
                    value={formData.venue_name}
                    onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                    className="w-full px-4 py-3 border-3 border-black font-share text-body focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label htmlFor="venue_address" className="block font-bebas text-body uppercase mb-2">
                    Venue Address
                  </label>
                  <input
                    id="venue_address"
                    type="text"
                    value={formData.venue_address}
                    onChange={(e) => setFormData({ ...formData, venue_address: e.target.value })}
                    className="w-full px-4 py-3 border-3 border-black font-share text-body focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label htmlFor="capacity" className="block font-bebas text-body uppercase mb-2">
                    Capacity
                  </label>
                  <input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    min="0"
                    className="w-full px-4 py-3 border-3 border-black font-share text-body focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            </div>

            {/* Media Management Card */}
            <div className="border-3 border-black bg-white p-6 shadow-geometric">
              <h2 className="font-bebas text-h3 uppercase mb-6 pb-4 border-b-3 border-black">
                Event Images
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <ImageUpload
                  eventId={id}
                  type="hero"
                  currentImage={event?.hero_image}
                  onUploadComplete={(url) => setEvent({ ...event, hero_image: url })}
                />
                <ImageUpload
                  eventId={id}
                  type="gallery"
                  onUploadComplete={(url) => {
                    const galleryImages = event?.gallery_images || [];
                    setEvent({ ...event, gallery_images: [...galleryImages, url] });
                  }}
                />
              </div>
            </div>

            {/* Status Card */}
            <div className="border-3 border-black bg-white p-6 shadow-geometric">
              <h2 className="font-bebas text-h3 uppercase mb-6 pb-4 border-b-3 border-black">
                Status
              </h2>
              <div>
                <label htmlFor="status" className="block font-bebas text-body uppercase mb-2">
                  Event Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 border-3 border-black font-share text-body focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="on_sale">On Sale</option>
                  <option value="sold_out">Sold Out</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 h-14 bg-black text-white hover:bg-white hover:text-black border-3 border-black font-bebas text-body uppercase"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={() => router.push(`/admin/events/${id}`)}
                className="h-14 bg-white text-black hover:bg-black hover:text-white border-3 border-black font-bebas text-body uppercase px-8"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
