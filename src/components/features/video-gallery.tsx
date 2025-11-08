'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, ExternalLink, Calendar, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
  viewCount: string;
  duration: string;
}

interface VideoGalleryProps {
  videos: Video[];
  title?: string;
  columns?: 2 | 3 | 4;
  showChannel?: boolean;
  className?: string;
}

export function VideoGallery({
  videos,
  title = 'Videos',
  columns = 3,
  showChannel = true,
  className,
}: VideoGalleryProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setIsPlayerOpen(true);
  };

  const handleClose = () => {
    setIsPlayerOpen(false);
    setTimeout(() => setSelectedVideo(null), 300);
  };

  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const formatViews = (views: string) => {
    const num = parseInt(views);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className={className}>
      {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}

      <div className={`grid ${gridCols[columns]} gap-6`}>
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group cursor-pointer"
            onClick={() => handleVideoClick(video)}
          >
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-primary rounded-full p-4">
                  <Play className="h-8 w-8 text-primary-foreground fill-current" />
                </div>
              </div>

              {/* Duration Badge */}
              {video.duration && (
                <Badge
                  variant="secondary"
                  className="absolute bottom-2 right-2 bg-black/80 text-white"
                >
                  {video.duration}
                </Badge>
              )}
            </div>

            <div className="mt-3 space-y-1">
              <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                {video.title}
              </h3>
              
              {showChannel && (
                <p className="text-sm text-muted-foreground">{video.channelTitle}</p>
              )}

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {video.viewCount && (
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {formatViews(video.viewCount)} views
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Video Player Modal */}
      <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
        <DialogContent className="max-w-5xl p-0">
          <AnimatePresence>
            {selectedVideo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="relative aspect-video bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold mb-2">{selectedVideo.title}</h2>
                      {showChannel && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {selectedVideo.channelTitle}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {selectedVideo.viewCount && (
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {formatViews(selectedVideo.viewCount)} views
                          </span>
                        )}
                        <span>
                          {formatDistanceToNow(new Date(selectedVideo.publishedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                    >
                      <a
                        href={`https://www.youtube.com/watch?v=${selectedVideo.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Watch on YouTube"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>

                  {selectedVideo.description && (
                    <div className="border-t pt-4">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                        {selectedVideo.description}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
}
