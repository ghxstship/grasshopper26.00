'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/design-system/components/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { Input } from '@/design-system/components/atoms/input';
import { Textarea } from '@/design-system/components/atoms/textarea';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import ImageUpload from '@/components/admin/ImageUpload';

export default function CreateArtistPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [artistId, setArtistId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    bio: '',
    genre_tags: '',
    social_links: {
      website: '',
      instagram: '',
      twitter: '',
      spotify: '',
    },
    verified: false,
  });

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    setFormData({ ...formData, name, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/admin/artists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          genre_tags: formData.genre_tags.split(',').map(tag => tag.trim()).filter(Boolean),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setArtistId(data.artist.id);
        toast.success('Artist created successfully');
        router.push('/admin/artists');
      } else {
        toast.error(data.error || 'Failed to create artist');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save artist');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Link
        href="/admin/artists"
        className="inline-flex items-center gap-2 text-sm mb-6 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Artists
      </Link>

      <h1 className="text-3xl font-bold mb-8">Create New Artist</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium mb-2 block">
                Artist Name *
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                placeholder="Enter artist name"
              />
            </div>

            <div>
              <label htmlFor="slug" className="text-sm font-medium mb-2 block">
                URL Slug *
              </label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
                placeholder="artist-url-slug"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This will be used in the artist&apos;s profile URL
              </p>
            </div>

            <div>
              <label htmlFor="bio" className="text-sm font-medium mb-2 block">
                Biography
              </label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={6}
                placeholder="Tell us about this artist..."
              />
            </div>

            <div>
              <label htmlFor="genre_tags" className="text-sm font-medium mb-2 block">
                Genre Tags
              </label>
              <Input
                id="genre_tags"
                value={formData.genre_tags}
                onChange={(e) => setFormData({ ...formData, genre_tags: e.target.value })}
                placeholder="Electronic, House, Techno (comma-separated)"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="verified"
                type="checkbox"
                checked={formData.verified}
                onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="verified" className="text-sm font-medium">
                Verified Artist
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="website" className="text-sm font-medium mb-2 block">
                Website
              </label>
              <Input
                id="website"
                type="url"
                value={formData.social_links.website}
                onChange={(e) => setFormData({
                  ...formData,
                  social_links: { ...formData.social_links, website: e.target.value }
                })}
                placeholder="https://artist-website.com"
              />
            </div>

            <div>
              <label htmlFor="instagram" className="text-sm font-medium mb-2 block">
                Instagram
              </label>
              <Input
                id="instagram"
                value={formData.social_links.instagram}
                onChange={(e) => setFormData({
                  ...formData,
                  social_links: { ...formData.social_links, instagram: e.target.value }
                })}
                placeholder="@username"
              />
            </div>

            <div>
              <label htmlFor="twitter" className="text-sm font-medium mb-2 block">
                Twitter/X
              </label>
              <Input
                id="twitter"
                value={formData.social_links.twitter}
                onChange={(e) => setFormData({
                  ...formData,
                  social_links: { ...formData.social_links, twitter: e.target.value }
                })}
                placeholder="@username"
              />
            </div>

            <div>
              <label htmlFor="spotify" className="text-sm font-medium mb-2 block">
                Spotify
              </label>
              <Input
                id="spotify"
                type="url"
                value={formData.social_links.spotify}
                onChange={(e) => setFormData({
                  ...formData,
                  social_links: { ...formData.social_links, spotify: e.target.value }
                })}
                placeholder="https://open.spotify.com/artist/..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Profile Image - Only show after artist is created */}
        {artistId && (
          <Card>
            <CardHeader>
              <CardTitle>Profile Image</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                eventId={artistId}
                type="hero"
                onUploadComplete={(url) => {
                  toast.success('Profile image uploaded');
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={saving}
            className="flex-1"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Artist
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/artists')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
