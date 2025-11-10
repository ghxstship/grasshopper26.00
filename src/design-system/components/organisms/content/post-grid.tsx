/**
 * Post Grid Component
 * Displays blog posts in a grid
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './post-grid.module.css';

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
    <div className={styles.grid}>
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/news/${post.slug}`}
          className="group"
        >
          <article className={styles.section}>
            {/* Featured Image */}
            {post.featured_image_url && (
              <div className={styles.card}>
                <Image
                  src={post.featured_image_url}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Post Content */}
            <div className={styles.section}>
              {/* Meta */}
              <div className={styles.row}>
                <span className={styles.card}>
                  {new Date(post.published_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span className={styles.card}>
                  {post.post_type.toUpperCase()}
                </span>
              </div>

              {/* Title */}
              <h3 className={styles.card}>
                {post.title}
              </h3>

              {/* Excerpt */}
              <p className={styles.card}>
                {post.content.substring(0, 150)}...
              </p>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className={styles.card}>
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className={styles.card}
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
