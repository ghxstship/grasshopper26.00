/**
 * Post Grid Component
 * Displays blog posts in a grid
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  post_type: string;
  featured_image_url?: string;
  published_at: string;
  tags?: string[];
}

interface PostGridProps {
  posts: Post[];
}

export function PostGrid({ posts }: PostGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/news/${post.slug}`}
          className="group"
        >
          <article className="border-3 border-black bg-white hover:bg-black hover:text-white transition-colors shadow-geometric h-full flex flex-col">
            {/* Featured Image */}
            {post.featured_image_url && (
              <div className="aspect-video relative overflow-hidden border-b-3 border-black">
                <Image
                  src={post.featured_image_url}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Post Content */}
            <div className="p-6 flex-1 flex flex-col">
              {/* Meta */}
              <div className="flex items-center gap-3 mb-3">
                <span className="font-share-mono text-meta text-grey-600 group-hover:text-grey-400">
                  {new Date(post.published_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span className="font-share-mono text-meta px-2 py-1 border-2 border-black group-hover:border-white">
                  {post.post_type.toUpperCase()}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-bebas text-h4 uppercase mb-3 group-hover:text-white">
                {post.title}
              </h3>

              {/* Excerpt */}
              <p className="font-share text-body line-clamp-3 text-grey-700 group-hover:text-grey-300 mb-4 flex-1">
                {post.content.substring(0, 150)}...
              </p>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="font-share-mono text-meta text-grey-600 group-hover:text-grey-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}
