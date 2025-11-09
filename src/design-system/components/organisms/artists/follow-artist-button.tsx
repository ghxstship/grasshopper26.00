/**
 * Follow Artist Button
 * Toggle following/unfollowing artists
 */

'use client';

import { useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';

interface FollowArtistButtonProps {
  artistId: string;
  artistName: string;
  initialFollowing: boolean;
}

export function FollowArtistButton({
  artistId,
  artistName,
  initialFollowing,
}: FollowArtistButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

  const handleToggleFollow = async () => {
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    startTransition(async () => {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('user_favorite_artists')
          .delete()
          .eq('user_id', user.id)
          .eq('artist_id', artistId);

        if (!error) {
          setIsFollowing(false);
        }
      } else {
        // Follow
        const { error } = await supabase
          .from('user_favorite_artists')
          .insert({
            user_id: user.id,
            artist_id: artistId,
          });

        if (!error) {
          setIsFollowing(true);
        }
      }
    });
  };

  return (
    <button
      onClick={handleToggleFollow}
      disabled={isPending}
      className={`
        px-6 py-3 border-3 border-black font-bebas text-h6 uppercase
        transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        ${isFollowing
          ? 'bg-black text-white hover:bg-white hover:text-black'
          : 'bg-white text-black hover:bg-black hover:text-white'
        }
      `}
    >
      {isPending ? 'UPDATING...' : isFollowing ? 'FOLLOWING' : 'FOLLOW'}
    </button>
  );
}
