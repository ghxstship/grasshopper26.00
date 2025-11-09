'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, ExternalLink } from 'lucide-react';
import { Button } from '@/design-system/components/atoms/button';
import { Slider } from '@/design-system/components/atoms/slider';
import { Card } from '@/design-system/components/atoms/card';
import Image from 'next/image';

interface Track {
  id: string;
  name: string;
  preview_url: string | null;
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
  album: {
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
}

interface MusicPlayerProps {
  tracks: Track[];
  artistName: string;
  autoPlay?: boolean;
  className?: string;
}

export function MusicPlayer({ tracks, artistName, autoPlay = false, className }: MusicPlayerProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = tracks[currentTrackIndex];
  const hasPreview = currentTrack?.preview_url;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handlePlay = () => {
    if (audioRef.current && hasPreview) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (autoPlay && hasPreview) {
      handlePlay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, hasPreview]);

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
      setCurrentTime(0);
      if (isPlaying) {
        setTimeout(handlePlay, 100);
      }
    }
  };

  const handlePrevious = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
      setCurrentTime(0);
      if (isPlaying) {
        setTimeout(handlePlay, 100);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleEnded = () => {
    if (currentTrackIndex < tracks.length - 1) {
      handleNext();
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) {
    return (
      <Card className={`p-6 ${className}`}>
        <p className="text-center text-muted-foreground">No tracks available</p>
      </Card>
    );
  }

  const albumImage = currentTrack.album.images[0]?.url;
  const duration = currentTrack.duration_ms / 1000;

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        {/* Album Art & Track Info */}
        <div className="flex items-center gap-4">
          {albumImage && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={currentTrack.id}
              className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0"
            >
              <Image
                src={albumImage}
                alt={currentTrack.album.name}
                fill
                className="object-cover"
              />
            </motion.div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{currentTrack.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{artistName}</p>
            <p className="text-xs text-muted-foreground truncate">{currentTrack.album.name}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            asChild
          >
            <a
              href={currentTrack.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in Spotify"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration}
            step={0.1}
            onValueChange={handleSeek}
            disabled={!hasPreview}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              disabled={currentTrackIndex === 0}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            {hasPreview ? (
              <Button
                variant="default"
                size="icon"
                onClick={isPlaying ? handlePause : handlePlay}
                className="h-10 w-10"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </Button>
            ) : (
              <Button
                variant="default"
                size="icon"
                disabled
                className="h-10 w-10"
                title="Preview not available"
              >
                <Play className="h-5 w-5 ml-0.5" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              disabled={currentTrackIndex === tracks.length - 1}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 w-32">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={(value) => {
                setVolume(value[0]);
                setIsMuted(false);
              }}
              className="cursor-pointer"
            />
          </div>
        </div>

        {/* Track List */}
        {tracks.length > 1 && (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            <p className="text-sm font-medium mb-2">Top Tracks</p>
            {tracks.map((track, index) => (
              <button
                key={track.id}
                onClick={() => {
                  setCurrentTrackIndex(index);
                  setCurrentTime(0);
                  if (isPlaying) {
                    setTimeout(handlePlay, 100);
                  }
                }}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  index === currentTrackIndex
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-4">{index + 1}</span>
                  <span className="text-sm truncate flex-1">{track.name}</span>
                  {!track.preview_url && (
                    <span className="text-xs text-muted-foreground">No preview</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {!hasPreview && (
          <p className="text-xs text-center text-muted-foreground">
            Preview not available. Listen on Spotify →
          </p>
        )}
      </div>

      {/* Audio Element */}
      {hasPreview && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <audio
          ref={audioRef}
          src={currentTrack.preview_url || ''}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          preload="metadata"
          aria-label={`Now playing: ${currentTrack.name}`}
        />
      )}
    </Card>
  );
}
