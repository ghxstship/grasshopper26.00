/**
 * News Post Detail Page
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const supabase = await createClient();
  const { slug } = await params;
  
  const { data: post } = await supabase
    .from('content_posts')
    .select('title, content')
    .eq('slug', slug)
    .single();

  if (!post) {
    return {
      title: 'Post Not Found | GVTEWAY',
    };
  }

  return {
    title: `${post.title} | GVTEWAY`,
    description: post.content.substring(0, 160),
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const supabase = await createClient();
  const { slug } = await params;

  const { data: post, error } = await supabase
    .from('content_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <header className="mb-8 pb-8 border-b-3 border-black">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-share-mono text-meta text-grey-600">
              {new Date(post.published_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="font-share-mono text-meta px-3 py-1 border-2 border-black">
              {post.post_type.toUpperCase()}
            </span>
          </div>

          <h1 className="font-anton text-hero uppercase mb-4">
            {post.title}
          </h1>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="font-share-mono text-body text-grey-600"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Featured Image */}
        {post.featured_image_url && (
          <div className="aspect-video relative border-3 border-black shadow-geometric mb-8">
            <Image
              src={post.featured_image_url}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div className="font-share text-body prose prose-lg max-w-none">
          <div className="whitespace-pre-line">
            {post.content}
          </div>
        </div>
      </article>
    </main>
  );
}
