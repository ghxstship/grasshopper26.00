/**
 * News/Blog Page
 * Content posts and updates
 */

import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { PostGrid } from '@/components/features/content/post-grid';

export const metadata: Metadata = {
  title: 'News | GVTEWAY',
  description: 'Latest news, updates, and announcements from GVTEWAY',
};

export default async function NewsPage() {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from('content_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Failed to fetch posts:', error);
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b-3 border-black py-12 md:py-20">
        <div className="container mx-auto px-4">
          <h1 className="font-anton text-hero uppercase mb-4">
            NEWS
          </h1>
          <p className="font-share text-body max-w-2xl">
            Stay updated with the latest news, announcements, and stories from GVTEWAY.
          </p>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {posts && posts.length > 0 ? (
            <PostGrid posts={posts} />
          ) : (
            <div className="text-center py-20">
              <p className="font-bebas text-h3 uppercase mb-4">
                NO POSTS YET
              </p>
              <p className="font-share text-body text-grey-600">
                Check back soon for updates
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
